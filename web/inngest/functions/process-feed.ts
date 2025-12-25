import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/server";
import { analyzeContent } from "@/lib/ai";

export const processFeed = inngest.createFunction(
  { id: "process-feed-url" },
  { event: "feed/process.url" },
  async ({ event, step }) => {
    const { url, userId } = event.data;

    console.log(`🚀 [Inngest] Starting process for URL: ${url} (User: ${userId})`);

    // 1. 初始化数据库记录 (Processing 状态)
    const feedId = await step.run("init-db-record", async () => {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("feeds")
        .insert([{
          user_id: userId,
          url: url,
          title: "正在抓取内容...",
          status: "processing",
          source_type: "manual_url"
        }])
        .select("id")
        .single();

      if (error) {
        console.error("❌ [Inngest] Failed to init record:", error);
        throw new Error(error.message);
      }
      return data.id;
    });

    try {
      // 2. 抓取 URL 内容 (动态加载重型库以提高部署稳定性)
      const rawData = await step.run("scrape-url", async () => {
        console.log(`🕵️ [Inngest] Fetching: ${url}`);
        
        // 动态导入 jsdom 和 readability
        const { JSDOM } = await import("jsdom");
        const { Readability } = await import("@mozilla/readability");

        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NeoFeed/1.0",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        const dom = new JSDOM(html, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        // Fallback: 如果 Readability 解析失败，尝试从 DOM 中提取文字
        if (!article || !article.textContent) {
          console.warn("⚠️ [Inngest] Readability failed, falling back to basic extraction.");
          const title = dom.window.document.title || "Untitled";
          const bodyText = dom.window.document.body.textContent || "";
          return {
            title: title,
            content: bodyText.slice(0, 15000), // 增加截取长度
          };
        }

        return {
          title: article.title,
          content: article.textContent,
        };
      });

      // 3. AI 分析
      const analysis = await step.run("analyze-content", async () => {
        console.log(`🧠 [Inngest] Analyzing content with AI...`);
        return await analyzeContent(rawData.content, url, rawData.title);
      });

      // 4. 更新数据库记录
      await step.run("update-db-record", async () => {
        const supabase = createAdminClient();
        const { error } = await supabase
          .from("feeds")
          .update({
            title: analysis.title || rawData.title,
            content_raw: rawData.content,
            summary: analysis.summary,
            takeaways: analysis.takeaways,
            tags: analysis.tags,
            category: analysis.category,
            emotion: analysis.emotion,
            reading_time: analysis.reading_time,
            status: "done",
          })
          .eq("id", feedId);

        if (error) throw new Error(error.message);
      });

      console.log(`✅ [Inngest] Successfully processed URL: ${url}`);
      return { success: true, feedId };

    } catch (err: any) {
      console.error(`💥 [Inngest] Error processing URL: ${err.message}`);
      
      // 更新状态为失败
      await step.run("mark-as-failed", async () => {
        const supabase = createAdminClient();
        await supabase
          .from("feeds")
          .update({ 
            status: "failed",
            summary: `处理失败: ${err.message}` 
          })
          .eq("id", feedId);
      });

      throw err; // 抛出错误以触发 Inngest 的重试机制
    }
  }
);

