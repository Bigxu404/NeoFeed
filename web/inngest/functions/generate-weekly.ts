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

    // 2. AI Generation
    const reportContent = await step.run("ai-generate", async () => {
      let apiKey = userConfig.apiKey || process.env.SILICONFLOW_API_KEY;
      let baseURL = userConfig.baseURL?.trim().replace(/\/+$/, '') || "https://api.siliconflow.cn/v1";
      let model = userConfig.model || "deepseek-ai/DeepSeek-V3";

      if (!apiKey) throw new Error("No API Key available for generation.");

      const openai = new OpenAI({ apiKey, baseURL });
      
      const context = reportType === 'insight'
        ? dataItems.map((f: any) => `- [手动捕捉][${(f.category || 'OTHER').toUpperCase()}] ${f.title}: ${f.summary}`).join('\n')
        : dataItems.map((d: any) => `- [RSS订阅][${(d.category || '情报拦截').toUpperCase()}] 来自 ${d.source_name}: ${d.title}\n一句话总结: ${d.reason}\n深度解析: ${d.summary}\n原文链接: ${d.url}`).join('\n');

      const customPrompt = reportType === 'insight' ? userConfig.insightPrompt : userConfig.rssPrompt;
      const systemPrompt = `${customPrompt || userConfig.prompt || 'You are NeoFeed Intelligence...'}
      请注意：
      1. 严禁在正文中输出 "Subject:" 或 "Body:" 等标签。
      2. 严禁使用一级标题 (#)。
      3. 请使用三级标题 (###) 组织每一条情报的标题。
      4. 对于 RSS 订阅情报，请务必保留每一项的结构化分析：
         - **研究主题**
         - **研究方式**
         - **研究结果**
         - **闭环总结**（一句话总结：xx做了xx事情，解决了xx问题）
      5. 必须附带原文 URL 链接。
      6. 当前报告类型：${reportType === 'insight' ? '手动捕捉内容深度洞察' : 'RSS 订阅情报汇总'}。`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `请根据以下内容生成${reportType === 'insight' ? '每周洞察报告' : '每周订阅情报汇总'}：\n\n${context}` }
        ],
        model: model,
        temperature: 0.7,
      });

      return completion.choices[0].message.content || "Failed to generate report.";
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
        
        const color = '#1ff40a';
        // 💡 增强型 Markdown 渲染：支持更复杂的结构化排版
        const cleanContent = reportContent
          .replace(/###\s?(.*)/g, `<h3 style="color: ${color}; font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 32px 0 16px 0; border-left: 4px solid ${color}; padding-left: 12px; letter-spacing: 1px;">$1</h3>`)
          .replace(/\*\*(研究主题|研究方式|研究结果|闭环总结)\*\*/g, `<span style="color: ${color}; font-size: 12px; font-weight: bold; background: ${color}22; padding: 2px 6px; border-radius: 2px; margin-right: 8px; font-family: monospace;">$1</span>`)
          .replace(/\*\*(.*?)\*\*/g, `<strong style="color: #ffffff; border-bottom: 1px dotted ${color}66;">$1</strong>`)
          .replace(/\[原文链接\]\((.*?)\)/g, `<a href="$1" style="color: ${color}; text-decoration: none; font-size: 12px; border: 1px solid ${color}44; padding: 2px 8px; border-radius: 4px; margin-top: 8px; display: inline-block;">查看原文 SOURCE_LINK ↗</a>`)
          .replace(/-\s(.*)/g, `<div style="margin-bottom: 12px; color: #bbbbbb; font-size: 14px; line-height: 1.6; padding-left: 16px; border-left: 1px solid ${color}22;">$1</div>`)
          .replace(/\n/g, '<br/>');

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
            htmlContent: `
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
                      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #050505; border: 1px solid ${color}33; border-top: 4px solid ${color};">
                        <!-- Header Area -->
                        <tr>
                          <td style="padding: 40px 40px 20px 40px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                              <span style="color: ${color}; font-size: 11px; font-weight: bold; letter-spacing: 3px; font-family: monospace;">NEOFEED_INTEL_REPORT</span>
                              <span style="color: ${color}66; font-size: 11px; font-family: monospace;">V3.0_STABLE</span>
                            </div>
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: -1px; line-height: 1.1;">
                              ${reportType === 'insight' ? '神经洞察' : 'RSS 订阅情报'} <br/>
                              <span style="color: ${color};">WEEKLY_DIGEST</span>
                            </h1>
                            <div style="margin-top: 15px; font-size: 11px; color: ${color}88; font-family: monospace;">
                              TIMESTAMP: ${new Date().toISOString()} // STATUS: DECODED
                            </div>
                          </td>
                        </tr>

                        <!-- Content Area -->
                        <tr>
                          <td style="padding: 20px 40px 40px 40px;">
                            <div style="background: linear-gradient(180deg, ${color}08 0%, transparent 100%); border-radius: 8px; padding: 1px;">
                              <div style="background: #080808; border-radius: 8px; padding: 30px; border: 1px solid ${color}11;">
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
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, ${color}33, transparent); margin-bottom: 30px;"></div>
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://neofeed.app'}/insight" 
                               style="display: inline-block; padding: 18px 44px; background: ${color}; color: #000000; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; box-shadow: 0 4px 20px ${color}44;">
                              进入控制塔 ANALYZE_FULL_DATA
                            </a>
                            <p style="margin-top: 30px; color: ${color}44; font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">
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
