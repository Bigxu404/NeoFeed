import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/server";

// This function runs every Monday to schedule reports for all users
export const weeklyReportScheduler = inngest.createFunction(
  { id: "weekly-report-scheduler" },
  { cron: "0 2 * * 1" }, // Every Monday at 10:00 AM CST
  async ({ step }) => {
    const supabase = createAdminClient();

    // 1. 核心修复：只查询存在的列，不再尝试读取不存在的 notification_email
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, ai_config')
      .not('ai_config', 'is', null);

    if (error || !profiles) {
      console.error("❌ [Scheduler] Database error:", error);
      return { status: "error", error: error?.message };
    }

    // 过滤出那些在 ai_config 内部填了邮箱的用户
    const targets = profiles.filter(p => (p.ai_config as any)?.notificationEmail);
    console.log(`📡 [Scheduler] Found ${targets.length} users with valid notification emails.`);

    // 2. Fan-out: Trigger generation for each user
    const events = profiles.map((profile) => ({
      name: "report/generate.weekly" as const,
      data: {
        userId: profile.id,
        dateStr: new Date().toISOString()
      },
    }));

    if (events.length > 0) {
      await step.run("dispatch-events", async () => {
        await inngest.send(events);
      });
      console.log(`✅ [Scheduler] Dispatched ${events.length} report generation events.`);
    }

    return { scheduled: events.length };
  }
);

