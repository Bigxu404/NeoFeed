import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/server";

// This function runs every 30 minutes to check if any user needs a report sent
export const weeklyReportScheduler = inngest.createFunction(
  { id: "weekly-report-scheduler" },
  { cron: "*/30 * * * *" }, // Run every 30 minutes
  async ({ step }) => {
    const supabase = createAdminClient();

    // 1. 获取所有配置了 AI 和邮箱的用户
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, ai_config')
      .not('ai_config', 'is', null);

    if (error || !profiles) {
      console.error("❌ [Scheduler] Database error:", error);
      return { status: "error", error: error?.message };
    }

    const now = new Date();
    // 💡 统一使用北京时间进行判断
    const bjTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" });
    const bjDate = new Date(bjTimeStr);
    
    const currentDay = bjDate.getDay(); // 0 is Sunday
    const currentHour = bjDate.getHours();
    const currentMinute = bjDate.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    console.log(`🕒 [Scheduler] Current Server Time: ${now.toISOString()}`);
    console.log(`🕒 [Scheduler] Computed Beijing Time: ${currentHour}:${currentMinute}, Day: ${currentDay}`);

    const insightEvents: any[] = [];
    const rssEvents: any[] = [];

    profiles.forEach(p => {
      const config = p.ai_config as any;
      if (!config?.notificationEmail) return;

      // --- 检查洞察报告 (Insight) ---
      const insightDays = config.insightReportDays || config.reportDays || [1];
      const insightTime = config.insightReportTime || config.reportTime || "09:00";
      const [iHour, iMinute] = insightTime.split(':').map(Number);
      const insightTotalMinutes = iHour * 60 + iMinute;

      if (insightDays.includes(currentDay)) {
        if (Math.abs(currentTotalMinutes - insightTotalMinutes) < 15) {
          insightEvents.push({
            name: "report/generate.insight",
            data: { userId: p.id, dateStr: now.toISOString() }
          });
        }
      }

      // --- 检查订阅报告 (RSS) ---
      const rssDays = config.rssReportDays || config.reportDays || [1];
      const rssTime = config.rssReportTime || config.reportTime || "09:00";
      const [rHour, rMinute] = rssTime.split(':').map(Number);
      const rssTotalMinutes = rHour * 60 + rMinute;

      if (rssDays.includes(currentDay)) {
        if (Math.abs(currentTotalMinutes - rssTotalMinutes) < 15) {
          rssEvents.push({
            name: "report/generate.rss",
            data: { userId: p.id, dateStr: now.toISOString() }
          });
        }
      }
    });

    const allEvents = [...insightEvents, ...rssEvents];

    if (allEvents.length > 0) {
      await step.run("dispatch-events", async () => {
        await inngest.send(allEvents);
      });
      console.log(`✅ [Scheduler] Dispatched ${insightEvents.length} insight and ${rssEvents.length} rss report events.`);
    }

    return { 
      scheduled: allEvents.length, 
      insight: insightEvents.length, 
      rss: rssEvents.length 
    };
  }
);
