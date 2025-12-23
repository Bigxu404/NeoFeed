import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processFeed } from "@/inngest/functions/process-feed";
import { generateWeeklyReport } from "@/inngest/functions/generate-weekly";
import { weeklyReportScheduler } from "@/inngest/functions/scheduler";

// Create an API that serves Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processFeed,
    generateWeeklyReport,
    weeklyReportScheduler, // ✨ Registered
  ],
});

