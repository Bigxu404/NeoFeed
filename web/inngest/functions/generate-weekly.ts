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
      3. 请使用二、三级标题 (##, ###) 组织结构。
      4. 核心洞察请使用列表格式 (- )。
      5. 当前报告类型：${reportType === 'insight' ? '手动捕捉内容深度洞察' : 'RSS 订阅情报汇总'}。`;

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
        const cleanContent = reportContent
          .replace(/##\s?(.*)/g, `<h3 style="color: ${color}; font-size: 14px; text-transform: uppercase; margin: 24px 0 12px 0; border-bottom: 1px solid ${color}33; padding-bottom: 4px;">$1</h3>`)
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff;">$1</strong>')
          .replace(/-\s(.*)/g, `<div style="margin-bottom: 8px; color: ${color}cc; font-size: 14px; line-height: 1.6;">• $1</div>`)
          .replace(/\n\n/g, '<br/>');

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
              <div style="font-family: 'ui-monospace', 'Cascadia Code', monospace; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px 20px; border: 1px solid ${color};">
                <div style="border-bottom: 1px double ${color}33; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: ${color}; font-size: 10px; font-weight: bold; letter-spacing: 2px;">NEURAL-LINK: STABLE</span>
                  <span style="color: ${color}80; font-size: 10px;">TYPE: ${reportType.toUpperCase()}</span>
                </div>
                <h1 style="font-size: 22px; font-weight: 900; margin: 0 0 25px 0; color: #ffffff; text-transform: uppercase;">
                  ${reportType === 'insight' ? '神经洞察周报' : 'RSS 订阅情报汇总'} <span style="color: ${color};">FALLOUT_PROTOCOL</span>
                </h1>
                <div style="background: ${color}05; border-radius: 4px; padding: 25px; border-left: 2px solid ${color}; line-height: 1.8;">
                  ${cleanContent}
                </div>
                <div style="margin-top: 40px; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://neofeed.app'}/insight" 
                     style="display: inline-block; padding: 15px 40px; background: ${color}; color: #000000; text-decoration: none; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
                    LAUNCH INSIGHT
                  </a>
                </div>
              </div>
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
