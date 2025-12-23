import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "neofeed-app",
  // 显式指定 Event Key，防止在没有环境变量时报错连接 Cloud
  // 在本地开发时，Inngest Dev Server 会忽略这个 Key
  eventKey: process.env.INNGEST_EVENT_KEY || "local-dev-key"
});
