import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/server";

// This function runs every Monday to schedule reports for all users
export const weeklyReportScheduler = inngest.createFunction(
  { id: "weekly-report-scheduler" },
  { cron: "0 2 * * 1" }, // Every Monday at 10:00 AM CST
  async ({ step }) => {
    const supabase = createAdminClient();

    // 1. Fetch all users who have an AI config OR a notification email
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, ai_config, notification_email')
      .or('ai_config.neq.null,notification_email.neq.null');

    if (error || !profiles) {
      console.error("❌ [Scheduler] Failed to fetch target users:", error);
      return { status: "error", error: error?.message };
    }

    console.log(`📡 [Scheduler] Found ${profiles.length} potential users for weekly reports.`);

    // 2. Fan-out: Trigger generation for each user
    const events = profiles.map((profile) => ({
      name: "report/generate.weekly" as const,
      data: {
        userId: profile.id,
        dateStr: new Date().toISOString()
      },
    }));

    if (events.length > 0) {
      await step.send("fan-out-reports", events);
      console.log(`✅ [Scheduler] Dispatched ${events.length} report generation events.`);
    }

    return { scheduled: events.length };
  }
);

