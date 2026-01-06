import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/server";
import OpenAI from "openai";

export const generateWeeklyReport = inngest.createFunction(
  { id: "generate-weekly-report" },
  [
    { event: "report/generate.weekly" }, // Manual trigger
    { cron: "0 2 * * 1" } // Every Monday at 10:00 AM CST (02:00 UTC)
  ],
  async ({ event, step }) => {
    // For Cron events, we might need to iterate ALL users who have enabled this
    // But for MVP simplicity, we assume we fetch users here or pass userId in event
    // ⚠️ Real-world: You'd have a separate 'scheduler' function that fans out events for each user.
    // Here, if it's a cron, we might need to find a target user or handle bulk.
    // For now, let's keep the logic simple: manual trigger carries userId.
    // If Cron triggers, we need a way to know WHICH user. 
    
    // ⭐ IMPROVEMENT: Let's split this. 
    // This function handles ONE user. We need a separate 'scheduler' function for the Cron.
    // But for now, if 'event.data.userId' is missing (Cron), we can't run.
    
    const { userId } = event.data || {};
    if (!userId && event.name !== 'report/generate.weekly') {
       // Ideally we fetch all users here and fan-out
       return { status: "skipped", reason: "Cron logic requires fan-out implementation." };
    }

    // ... existing logic ...
    const { userConfig, feeds } = await step.run("fetch-data", async () => {
      const supabase = createAdminClient();
      
      // Get AI Config
      const { data: profile } = await supabase
        .from('profiles')
        .select('ai_config')
        .eq('id', userId)
        .single();
        
      // Calculate date range (Last 7 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      // Fetch Feeds
      const { data: feedData } = await supabase
        .from('feeds')
        .select('id, title, summary, tags, created_at, category')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      return {
        userConfig: profile?.ai_config || {},
        feeds: feedData || [],
        range: { start: startDate, end: endDate }
      };
    });

    if (feeds.length === 0) {
      return { status: "skipped", reason: "No feeds found for this week." };
    }

    // 2. AI Generation
    const reportContent = await step.run("ai-generate", async () => {
      // Determine API Key & Base URL
      let apiKey = process.env.SILICONFLOW_API_KEY; // Default system key
      let baseURL = "https://api.siliconflow.cn/v1";
      let model = "deepseek-ai/DeepSeek-V3";

      // Override with user config if present
      if (userConfig.provider === 'openai') {
        baseURL = "https://api.openai.com/v1";
        if (userConfig.apiKey) apiKey = userConfig.apiKey;
        model = userConfig.model || "gpt-4o";
      } else if (userConfig.provider === 'deepseek') {
        baseURL = "https://api.deepseek.com";
        if (userConfig.apiKey) apiKey = userConfig.apiKey;
        model = userConfig.model || "deepseek-chat";
      } else if (userConfig.provider === 'siliconflow') {
        // SiliconFlow (default)
        if (userConfig.apiKey) apiKey = userConfig.apiKey;
        if (userConfig.model) model = userConfig.model;
      }

      if (!apiKey) throw new Error("No API Key available for generation.");

      const openai = new OpenAI({ apiKey, baseURL });
      
      // Construct Context
      const feedsContext = feeds.map((f: any) => 
        `- [${f.category.toUpperCase()}] ${f.title}: ${f.summary} (Tags: ${f.tags?.join(', ')})`
      ).join('\n');

      const systemPrompt = userConfig.prompt || `You are NeoFeed's Elite Intelligence Analyst...`; // Default fallback

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the user's information diet for the week:\n\n${feedsContext}` }
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
    if (userConfig.notificationEmail && savedReport) {
      await step.run("send-email", async () => {
        const brevoKey = process.env.BREVO_API_KEY;
        if (!brevoKey) {
          console.error("❌ [Inngest] BREVO_API_KEY is missing. Cannot send email.");
          return;
        }
        
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
            subject: `Weekly Insight Report: ${new Date().toLocaleDateString()}`,
            htmlContent: `
              <h1>Your Weekly Intelligence Briefing is Ready</h1>
              <p>NeoFeed has analyzed your information diet for the past week.</p>
              <hr />
              <div style="background: #f4f4f4; padding: 20px; border-radius: 8px;">
                ${reportContent.replace(/\n/g, '<br/>')}
              </div>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/insight">View Full Interactive Report</a></p>
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

