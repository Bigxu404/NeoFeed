import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "neofeed-app",
  // 💡 改进：本地开发不传 eventKey 自动连 localhost:8288
  // 线上环境必须在 Vercel 配置 INNGEST_EVENT_KEY
  eventKey: process.env.NODE_ENV === 'production' ? process.env.INNGEST_EVENT_KEY : undefined,
});
