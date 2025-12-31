import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processFeed } from "@/inngest/functions/process-feed";
import { generateWeeklyReport } from "@/inngest/functions/generate-weekly";
import { weeklyReportScheduler } from "@/inngest/functions/scheduler";
import { subscriptionPoller, rssProcessor, discoveryCleanup } from "@/inngest/functions/discovery";

// Create an API that serves Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processFeed,
    generateWeeklyReport,
    weeklyReportScheduler,
    subscriptionPoller,
    rssProcessor,
    discoveryCleanup,
  ],
});

