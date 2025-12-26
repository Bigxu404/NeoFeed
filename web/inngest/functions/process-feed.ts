import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/server";
import { analyzeContent } from "@/lib/ai";

export const processFeed = inngest.createFunction(
  { id: "process-feed-url" },
  { event: "feed/process.url" },
  async ({ event, step }) => {
    const { url, userId, feedId: providedFeedId } = event.data;

    console.log(`🚀 [Inngest] Starting process for URL: ${url} (User: ${userId}, FeedID: ${providedFeedId})`);

    // 如果 API 没有提供 ID（兼容旧调用），则在此初始化
    const feedId = providedFeedId || await step.run("init-db-record", async () => {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("feeds")
        .insert([{
          user_id: userId,
          url: url,
          title: "正在抓取内容...",
          content_raw: "", 
          summary: "正在初始化神经网络...",
          status: "processing"
          // source_type: "manual"
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
      // 2. 抓取 URL 内容 (动态加载轻量级 linkedom 以提高部署稳定性)
      const rawData = await step.run("scrape-url", async () => {
        console.log(`🕵️ [Inngest] Fetching: ${url}`);
        
        // 动态导入 linkedom 和 readability
        const { parseHTML } = await import("linkedom");
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
        
        // 使用 linkedom 解析 HTML
        const { document } = parseHTML(html);
        const reader = new Readability(document as any);
        const article = reader.parse();

        // Fallback: 如果 Readability 解析失败，尝试从 DOM 中提取文字
        if (!article || !article.textContent) {
          console.warn("⚠️ [Inngest] Readability failed, falling back to basic extraction.");
          const title = document.title || "Untitled";
          const bodyText = document.body.textContent || "";
          return {
            title: title,
            content: bodyText.slice(0, 15000), 
          };
        }

        return {
          title: article.title,
          content: article.textContent,
        };
      });

      // 3. AI 分析
      const analysis = await step.run("analyze-content", async () => {
        console.log(`🧠 [Inngest] Fetching user AI config...`);
        
        const supabase = createAdminClient();
        const { data: profile } = await supabase
          .from('profiles')
          .select('ai_config')
          .eq('id', userId)
          .single();

        console.log(`🧠 [Inngest] Analyzing content with AI (using user config if available)...`);
        return await analyzeContent(
          rawData.content, 
          url, 
          rawData.title, 
          profile?.ai_config as any
        );
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

