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
  streaming: "allow", // 允许流式响应
});

// 💡 增加一个简单的 GET 调试，方便用户手动访问验证
export async function PATCH() {
  return Response.json({ status: "alive", timestamp: new Date().toISOString() });
}

