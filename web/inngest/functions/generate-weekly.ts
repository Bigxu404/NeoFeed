import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/server";
import OpenAI from "openai";

export const generateWeeklyReport = inngest.createFunction(
  { id: "generate-weekly-report" },
  [
    { event: "report/generate.weekly" }, // 仅由 scheduler 或手动测试触发
  ],
  async ({ event, step }) => {
    const { userId } = event.data || {};
    if (!userId) {
       console.error("❌ [Inngest] Missing userId in weekly report event.");
       return { status: "error", reason: "userId is required" };
    }

    console.log(`🚀 [Inngest] Generating weekly report for user: ${userId}`);

    const { userConfig, feeds, notificationEmail } = await step.run("fetch-data", async () => {
      const supabase = createAdminClient();
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('ai_config') // 不再查询不存在的列
        .eq('id', userId)
        .single();
        
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      const { data: feedData } = await supabase
        .from('feeds')
        .select('id, title, summary, tags, created_at, category')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      return {
        userConfig: (profile?.ai_config as any) || {},
        notificationEmail: (profile?.ai_config as any)?.notificationEmail,
        feeds: feedData || [],
        range: { start: startDate, end: endDate }
      };
    });

    if (feeds.length === 0) {
      console.warn(`⚠️ [Inngest] No feeds found for user ${userId} in the last 7 days.`);
      return { status: "skipped", reason: "No feeds found." };
    }

    console.log(`📡 [Inngest] Found ${feeds.length} feeds. Starting AI generation...`);

    // 2. AI Generation
    const reportContent = await step.run("ai-generate", async () => {
      // Determine API Key & Base URL
      let apiKey = process.env.SILICONFLOW_API_KEY; // Default system key
      let baseURL = "https://api.siliconflow.cn/v1";
      let model = "deepseek-ai/DeepSeek-V3";

      // Override with user config if present
      if (userConfig.apiKey) apiKey = userConfig.apiKey;
      if (userConfig.baseURL) baseURL = userConfig.baseURL.trim().replace(/\/+$/, '');
      if (userConfig.model) model = userConfig.model;

      if (!apiKey) throw new Error("No API Key available for generation.");

      const openai = new OpenAI({ apiKey, baseURL });
      
      // Construct Context
      const feedsContext = feeds.map((f: any) => 
        `- [${(f.category || 'OTHER').toUpperCase()}] ${f.title}: ${f.summary}`
      ).join('\n');

      const systemPrompt = `${userConfig.prompt || 'You are NeoFeed Intelligence...'}
      请注意：
      1. 严禁在正文中输出 "Subject:" 或 "Body:" 等标签。
      2. 严禁使用一级标题 (#)。
      3. 请使用二、三级标题 (##, ###) 组织结构。
      4. 核心洞察请使用列表格式 (- )。`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `这是用户本周的信息捕获：\n\n${feedsContext}` }
        ],
        model: model,
        temperature: 0.7,
      });

      return completion.choices[0].message.content || "Failed to generate report.";
    });

    // 3. Save Report
    const savedReport = await step.run("save-report", async () => {
      const supabase = createAdminClient();
      
      // Insert Report
      const { data: report, error } = await supabase
        .from('weekly_reports')
        .insert({
          user_id: userId,
          start_date: feeds[0].created_at, // Approximate
          end_date: new Date().toISOString(),
          content: reportContent,
          summary: "Weekly Intelligence Briefing", // Could ask AI to generate this too
          status: 'done'
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Link Items (Batch Insert)
      if (report) {
        const links = feeds.map((f: any) => ({
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
        console.log(`✉️ [Inngest] Sending email to ${notificationEmail}...`);
        if (!brevoKey) {
          console.error("❌ [Inngest] BREVO_API_KEY is missing. Cannot send email.");
          return;
        }
        
        // 💡 辅助函数：将 AI 返回的 Markdown 简单转化为 HTML 结构，避免源码暴露
        const cleanContent = reportContent
          .replace(/##\s?(.*)/g, '<h3 style="color: #f97316; font-size: 14px; text-transform: uppercase; margin: 24px 0 12px 0; border-bottom: 1px solid rgba(249,115,22,0.2); padding-bottom: 4px;">$1</h3>')
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff;">$1</strong>')
          .replace(/-\s(.*)/g, '<div style="margin-bottom: 8px; color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6;">• $1</div>')
          .replace(/\n\n/g, '<br/>');

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: "NeoFeed Intelligence", email: "bot@neofeed.cn" },
            to: [{ email: userConfig.notificationEmail }],
            subject: `Weekly Insight Report: ${new Date().toLocaleDateString('zh-CN')}`,
            htmlContent: `
              <div style="font-family: 'ui-monospace', 'Cascadia Code', monospace; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px 20px; border-radius: 0px; border: 1px solid #1a1a1a;">
                <!-- 🌐 顶部状态栏 -->
                <div style="border-bottom: 1px double rgba(255,255,255,0.1); padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #f97316; font-size: 10px; font-weight: bold; letter-spacing: 2px;">NEURAL-LINK: STABLE</span>
                  <span style="color: rgba(255,255,255,0.3); font-size: 10px;">ID: ${savedReport.id.slice(0, 8).toUpperCase()}</span>
                </div>

                <!-- 🌌 星系快报模块 -->
                <div style="margin-bottom: 40px; background: linear-gradient(180deg, rgba(249,115,22,0.05) 0%, transparent 100%); padding: 20px; border-radius: 12px; border: 1px solid rgba(249,115,22,0.1);">
                  <div style="font-size: 10px; color: rgba(255,255,255,0.4); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Weekly Galaxy Snapshot</div>
                  <div style="display: flex; gap: 20px;">
                    <div style="flex: 1;">
                      <div style="font-size: 24px; font-weight: bold; color: #ffffff;">${feeds.length}</div>
                      <div style="font-size: 9px; color: #f97316; text-transform: uppercase;">星体捕获 New Stars</div>
                    </div>
                    <div style="flex: 1; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 20px;">
                      <div style="font-size: 24px; font-weight: bold; color: #ffffff;">100%</div>
                      <div style="font-size: 9px; color: #f97316; text-transform: uppercase;">同步率 Sync Rate</div>
                    </div>
                  </div>
                </div>

                <!-- 📝 核心报告区 -->
                <h1 style="font-size: 22px; font-weight: 900; margin: 0 0 25px 0; color: #ffffff; text-transform: uppercase; letter-spacing: -0.5px;">
                  神经洞察周报 <span style="color: #f97316;">V3.0</span>
                </h1>

                <div style="background: rgba(255,255,255,0.02); border-radius: 16px; padding: 25px; border-left: 2px solid #f97316; line-height: 1.8;">
                  ${cleanContent}
                </div>

                <!-- 🔗 底部操作 -->
                <div style="margin-top: 40px; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/insight" 
                     style="display: inline-block; padding: 15px 40px; background: #f97316; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 20px rgba(249,115,22,0.3);">
                    进入洞察中心 / Launch Insight
                  </a>
                  <p style="color: rgba(255,255,255,0.2); font-size: 10px; margin-top: 25px;">
                    NEOFEED MATRIX // TRANSMISSION SUCCESS // NO_REPLY
                  </p>
                </div>
              </div>
            `
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ [Inngest] Brevo email failed:", errorData.message);
        }
      });
    }

    return { success: true, reportId: savedReport?.id };
  }
);

