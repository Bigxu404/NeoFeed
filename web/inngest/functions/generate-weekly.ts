import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/server";
import OpenAI from "openai";

export const generateWeeklyReport = inngest.createFunction(
  { id: "generate-weekly-report" },
  [
    { event: "report/generate.insight" },
    { event: "report/generate.rss" },
  ],
  async ({ event, step }) => {
    const { userId } = event.data || {};
    const reportType = event.name.split('.')[1] as 'insight' | 'rss';
    
    if (!userId) {
       console.error(`❌ [Inngest] Missing userId in ${reportType} report event.`);
       return { status: "error", reason: "userId is required" };
    }

    // 💡 关键改进：引入 30s 等待机制
    // 如果是手动触发的 RSS 周报，需要给 RSS 抓取任务留出足够的 AI 处理时间
    if (reportType === 'rss') {
      console.log(`⏳ [Inngest] Waiting 30s for RSS sync to complete before generating report...`);
      await step.sleep("wait-for-rss-sync", "30s");
    }

    console.log(`🚀 [Inngest] Starting ${reportType} report generation for user: ${userId}`);

    const { userConfig, dataItems, notificationEmail } = await step.run("fetch-data", async () => {
      const supabase = createAdminClient();
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('ai_config')
        .eq('id', userId)
        .single();
        
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      let items = [];
      if (reportType === 'insight') {
        const { data: feedData } = await supabase
          .from('feeds')
          .select('id, title, summary, tags, created_at, category')
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: false });
        items = feedData || [];
      } else {
        // 💡 关键改进：RSS 报告直接抓取当前数据库中的全部拦截内容
        // 因为数据库已经实现了“同步即清空”逻辑，所以当前库内存放的就是最新的全量情报
        const { data: discoveryData } = await supabase
          .from('discovery_stream')
          .select('id, title, summary, source_name, created_at, category, reason, url')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        items = discoveryData || [];
      }

      return {
        userConfig: (profile?.ai_config as any) || {},
        notificationEmail: (profile?.ai_config as any)?.notificationEmail,
        dataItems: items,
        range: { start: startDate, end: endDate }
      };
    });

    if (dataItems.length === 0) {
      console.warn(`⚠️ [Inngest] No items found for user ${userId} in the last 7 days for ${reportType} report.`);
      return { status: "skipped", reason: "No content found." };
    }

    console.log(`📡 [Inngest] Found ${dataItems.length} items. Starting AI generation...`);

    // 2. Generation logic
    const reportContent = await step.run("generate-content", async () => {
      if (reportType === 'insight') {
        // [Insight Report] 依然需要 AI 深度总结，因为它是散乱的手动笔记
        let apiKey = userConfig.apiKey || process.env.SILICONFLOW_API_KEY;
        let baseURL = userConfig.baseURL?.trim().replace(/\/+$/, '') || "https://api.siliconflow.cn/v1";
        let model = userConfig.model || "deepseek-ai/DeepSeek-V3";
        if (!apiKey) throw new Error("No API Key available for generation.");
        const openai = new OpenAI({ apiKey, baseURL });
        
        const context = dataItems.map((f: any) => `- [手动捕捉][${(f.category || 'OTHER').toUpperCase()}] ${f.title}: ${f.summary}`).join('\n');
        const customPrompt = userConfig.insightPrompt || userConfig.prompt || 'You are NeoFeed Intelligence...';
        
        const completion = await openai.chat.completions.create({
          messages: [
            { role: "system", content: customPrompt },
            { role: "user", content: `请根据以下手动捕捉内容生成每周洞察报告：\n\n${context}` }
          ],
          model: model,
          temperature: 0.7,
        });
        return completion.choices[0].message.content || "Failed to generate report.";
      } else {
        // [RSS Report] 🚀 简化：直接从数据库构建，不再调用 AI
        // 1. 按 source_name 分组
        const grouped: Record<string, any[]> = {};
        dataItems.forEach((item: any) => {
          if (!grouped[item.source_name]) grouped[item.source_name] = [];
          grouped[item.source_name].push(item);
        });

        // 2. 构建 Markdown 字符串 (作为数据库存档)
        let md = "";
        Object.entries(grouped).forEach(([source, items]) => {
          md += `# ${source}\n\n`;
          items.forEach((it, idx) => {
            md += `### ${idx + 1}. ${it.title}\n`;
            md += `**SUMMARY**: ${it.reason}\n`;
            md += `**DETAIL**:\n${it.summary}\n`;
            md += `[阅读原文](${it.url})\n\n`;
          });
        });
        return md;
      }
    });

    // 3. Save Report
    const savedReport = await step.run("save-report", async () => {
      const supabase = createAdminClient();
      const { data: report, error } = await supabase
        .from('weekly_reports')
        .insert({
          user_id: userId,
          start_date: dataItems[0]?.created_at || new Date().toISOString(), 
          end_date: new Date().toISOString(),
          content: reportContent,
          summary: reportType === 'insight' ? "Weekly Insight Briefing" : "Weekly RSS Intelligence",
          status: 'done'
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // 💡 关键改进：仅保留最近 10 封周报
      const { data: allReports } = await supabase
        .from('weekly_reports')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (allReports && allReports.length > 10) {
        const idsToDelete = allReports.slice(10).map(r => r.id);
        await supabase
          .from('weekly_reports')
          .delete()
          .in('id', idsToDelete);
        console.log(`♻️ [Cleanup] Deleted ${idsToDelete.length} old reports for user ${userId}`);
      }

      if (report && reportType === 'insight') {
        const links = dataItems.map((f: any) => ({
          report_id: report.id,
          feed_id: f.id
        }));
        await supabase.from('weekly_report_items').insert(links);
      }

      return report;
    });

    // 4. Send Email Notification
    if (notificationEmail && savedReport) {
      await step.run("send-email", async () => {
        const brevoKey = process.env.BREVO_API_KEY;
        if (!brevoKey) {
          console.error("❌ [Inngest] Missing BREVO_API_KEY. Cannot send email.");
          return { error: "Missing BREVO_API_KEY" };
        }
        
        const isRss = reportType === 'rss';
        const mainColor = isRss ? '#000000' : '#1ff40a';
        const bgColor = isRss ? '#fbfaf8' : '#050505';
        const accentColor = isRss ? '#cc0000' : '#1ff40a';
        
        // 💡 增强型渲染引擎：根据报告类型切换“纽约客”或“辐射”风格
        let cleanContent = '';
        if (isRss) {
          // 📖 极简直通车渲染逻辑 - 压缩间距、按源分组、移除关键词、专业标签
          cleanContent = reportContent
            // 1. 处理大分类 (源名称 - 期刊名)
            .replace(/^#\s?(.*)/gm, `<h2 style="color: #000000; font-size: 20px; font-weight: bold; margin: 30px 0 15px 0; font-family: 'Times New Roman', serif; border-left: 4px solid #cc0000; padding-left: 12px; text-transform: uppercase; letter-spacing: 1px;">$1</h2>`)
            // 2. 处理文章标题 (去除所有 Markdown 符号)
            .replace(/^###\s?\d+\.\s?(.*)/gm, `<h3 style="color: #000000; font-size: 18px; font-weight: bold; margin: 15px 0 8px 0; font-family: 'Times New Roman', serif; line-height: 1.3;">$1</h3>`)
            // 3. 处理一句话总结 (SUMMARY)
            .replace(/^\*\*SUMMARY\*\*:\s*(.*)/gm, `<div style="margin-bottom: 10px;"><strong style="color: #000000; font-size: 13px; font-family: sans-serif; letter-spacing: 0.5px;">SUMMARY:</strong> <span style="color: #333; font-size: 15px; line-height: 1.5;">$1</span></div>`)
            // 4. 处理深度解析 (标签更名 + 压缩间距)
            .replace(/^\*\*DETAIL\*\*:\s*/gm, `<div style="margin: 10px 0; border-left: 1px solid #ddd; padding-left: 15px; color: #666; font-size: 14px; line-height: 1.6; font-style: italic;">`)
            // 5. 替换旧标签为新专业标签 (处理存量数据)
            .replace(/主题：/g, '研究主题：')
            .replace(/方式：/g, '研究方法：')
            .replace(/结果：/g, '研究结果：')
            // 6. 处理链接 (紧凑排列)
            .replace(/\[阅读原文\]\((https?:\/\/.*?)\)/g, `</div><div style="margin-top: 8px; margin-bottom: 20px;"><a href="$1" style="color: #cc0000; text-decoration: none; font-size: 13px; font-weight: bold; font-family: sans-serif;">READ FULL ARTICLE »</a></div>`)
            .replace(/\n/g, '<br/>');
        } else {
          // ☢️ 辐射风格渲染逻辑 (保留原样)
          cleanContent = reportContent
            .replace(/###\s?(.*)/g, `<h3 style="color: ${mainColor}; font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 32px 0 16px 0; border-left: 4px solid ${mainColor}; padding-left: 12px; letter-spacing: 1px;">$1</h3>`)
            .replace(/\*\*(研究主题|研究方式|研究结果|闭环总结)\*\*/g, `<span style="color: ${mainColor}; font-size: 12px; font-weight: bold; background: ${mainColor}22; padding: 2px 6px; border-radius: 2px; margin-right: 8px; font-family: monospace;">$1</span>`)
            .replace(/\*\*(.*?)\*\*/g, `<strong style="color: #ffffff; border-bottom: 1px dotted ${mainColor}66;">$1</strong>`)
            .replace(/\[查看原文 SOURCE_LINK ↗\]\((.*?)\)/g, `<a href="$1" style="color: ${mainColor}; text-decoration: none; font-size: 12px; border: 1px solid ${mainColor}44; padding: 2px 8px; border-radius: 4px; margin-top: 8px; display: inline-block;">查看原文 SOURCE_LINK ↗</a>`)
            .replace(/-\s(.*)/g, `<div style="margin-bottom: 12px; color: #bbbbbb; font-size: 14px; line-height: 1.6; padding-left: 16px; border-left: 1px solid ${mainColor}22;">$1</div>`)
            .replace(/\n/g, '<br/>');
        }

        console.log(`📧 [Inngest] Sending ${reportType} report to ${notificationEmail}...`);

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: "NeoFeed Intelligence", email: "bot@neofeed.cn" },
            to: [{ email: notificationEmail }],
            subject: reportType === 'insight' ? `Weekly Insight Report: ${new Date().toLocaleDateString('zh-CN')}` : `Weekly RSS Intelligence: ${new Date().toLocaleDateString('zh-CN')}`,
            htmlContent: isRss ? `
              <!DOCTYPE html>
              <html>
              <body style="margin: 0; padding: 0; background-color: #f4f4f0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f0;">
                  <tr>
                    <td align="center" style="padding: 40px 10px;">
                      <table role="presentation" width="750" cellspacing="0" cellpadding="0" border="0" style="background-color: #fbfaf8; border-top: 4px solid #000000; border-bottom: 1px solid #d2d2d2; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                        <!-- Header -->
                        <tr>
                          <td style="padding: 60px 60px 20px 60px; text-align: center;">
                            <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 5px; color: #cc0000; margin-bottom: 25px; text-transform: uppercase;">
                              INSIGHT REPORT
                            </div>
                            <h1 style="font-family: 'Times New Roman', serif; font-size: 52px; font-weight: normal; color: #000000; margin: 0; line-height: 1; letter-spacing: -1px;">
                              NeoFeed
                            </h1>
                            <div style="border-top: 1px solid #000000; border-bottom: 1px solid #000000; margin-top: 30px; padding: 10px 0; display: flex; justify-content: center; font-family: 'Times New Roman', serif; font-style: italic; font-size: 15px; color: #666;">
                              <span>${new Date().toISOString().split('T')[0]}</span>
                            </div>
                          </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                          <td style="padding: 10px 60px 60px 60px;">
                            <div style="font-family: 'Times New Roman', serif; color: #1a1a1a; line-height: 1.8;">
                              ${cleanContent}
                            </div>
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="padding: 40px 60px; text-align: center; border-top: 1px solid #eee;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://neofeed.app'}/insight" 
                               style="display: inline-block; padding: 15px 50px; background: #000000; color: #ffffff; text-decoration: none; font-family: sans-serif; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px;">
                              ENTER NEOFEED
                            </a>
                            <p style="margin-top: 30px; font-family: 'Times New Roman', serif; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">
                              © 2026 NEOFEED NEURAL NETWORK // INTELLIGENCE DECODED
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            ` : `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap');
                </style>
              </head>
              <body style="margin: 0; padding: 0; background-color: #000000;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000; font-family: 'Fira Code', 'Courier New', monospace;">
                  <tr>
                    <td align="center" style="padding: 40px 10px;">
                      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #050505; border: 1px solid ${mainColor}33; border-top: 4px solid ${mainColor};">
                        <!-- Header Area -->
                        <tr>
                          <td style="padding: 40px 40px 20px 40px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                              <span style="color: ${mainColor}; font-size: 11px; font-weight: bold; letter-spacing: 3px; font-family: monospace;">NEOFEED_INTEL_REPORT</span>
                              <span style="color: ${mainColor}66; font-size: 11px; font-family: monospace;">V3.0_STABLE</span>
                            </div>
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: -1px; line-height: 1.1;">
                              神经洞察 <br/>
                              <span style="color: ${mainColor};">WEEKLY_DIGEST</span>
                            </h1>
                            <div style="margin-top: 15px; font-size: 11px; color: ${mainColor}88; font-family: monospace;">
                              TIMESTAMP: ${new Date().toISOString()} // STATUS: DECODED
                            </div>
                          </td>
                        </tr>

                        <!-- Content Area -->
                        <tr>
                          <td style="padding: 20px 40px 40px 40px;">
                            <div style="background: linear-gradient(180deg, ${mainColor}08 0%, transparent 100%); border-radius: 8px; padding: 1px;">
                              <div style="background: #080808; border-radius: 8px; padding: 30px; border: 1px solid ${mainColor}11;">
                                <div style="color: #dddddd; font-size: 15px; line-height: 1.8;">
                                  ${cleanContent}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>

                        <!-- Footer Area -->
                        <tr>
                          <td style="padding: 0 40px 40px 40px; text-align: center;">
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, ${mainColor}33, transparent); margin-bottom: 30px;"></div>
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://neofeed.app'}/insight" 
                               style="display: inline-block; padding: 18px 44px; background: ${mainColor}; color: #000000; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; box-shadow: 0 4px 20px ${mainColor}44;">
                              进入控制塔 ANALYZE_FULL_DATA
                            </a>
                            <p style="margin-top: 30px; color: ${mainColor}44; font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">
                              © 2026 NEOFEED NEURAL NETWORK // ALL DATA ENCRYPTED
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          console.error("❌ [Inngest] Brevo API Error:", errData);
          throw new Error(`Brevo Error: ${errData.message || response.statusText}`);
        }

        console.log("✅ [Inngest] Email sent successfully via Brevo.");
        return { success: true };
      });
    }

    return { success: true, reportId: savedReport?.id };
  }
);
