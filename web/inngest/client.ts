import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "neofeed-app",
  // 💡 更加稳健的判断：如果环境变量中有 Key，优先使用（说明是在云端环境）
  // 否则才默认为本地开发模式
  eventKey: process.env.INNGEST_EVENT_KEY || undefined,
});
