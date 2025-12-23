import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/server";

// This function runs every Monday to schedule reports for all users
export const weeklyReportScheduler = inngest.createFunction(
  { id: "weekly-report-scheduler" },
  { cron: "0 2 * * 1" }, // Every Monday at 10:00 AM CST
  async ({ step }) => {
    const supabase = createAdminClient();

    // 1. Fetch all users who have an AI config (implying they might want reports)
    // Optimally, we should filter by users who have 'notificationEmail' set or a flag
    // For now, let's fetch profiles with non-null ai_config
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, ai_config')
      .not('ai_config', 'is', null);

    if (error || !profiles) {
      return { status: "error", error: error?.message };
    }

    // 2. Fan-out: Trigger generation for each user
    const events = profiles.map((profile) => ({
      name: "report/generate.weekly",
      data: {
        userId: profile.id,
        dateStr: new Date().toISOString()
      },
    }));

    if (events.length > 0) {
      await step.sendEvent("fan-out-reports", events);
    }

    return { scheduled: events.length };
  }
);

