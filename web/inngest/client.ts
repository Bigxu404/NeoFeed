import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "neofeed-app",
  // 在本地开发时，如果没有 INNGEST_EVENT_KEY，SDK 会默认尝试连接本地 Dev Server (localhost:8288)
  // 如果提供了 eventKey，SDK 可能会尝试连接 Inngest Cloud，导致 401 错误
  eventKey: process.env.INNGEST_EVENT_KEY
});
