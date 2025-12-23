import { inngest } from "@/inngest/client";
import { createClient } from "@/lib/supabase/client"; // Use server client in real scenario, but here we might need to adjust imports
import { createAdminClient } from "@/lib/supabase/server";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { analyzeContent } from "@/lib/ai";

export const processFeed = inngest.createFunction(
  { id: "process-feed-url" },
  { event: "feed/process.url" },
  async ({ event, step }) => {
    const { url, userId } = event.data;

    // 1. Scrape URL
    const rawData = await step.run("scrape-url", async () => {
      console.log(`🕵️ [Inngest] Fetching: ${url}`);
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NeoFeed/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }

      const html = await response.text();
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (!article || !article.textContent) {
        throw new Error("Failed to parse content with Readability");
      }

      return {
        title: article.title,
        content: article.textContent,
        rawHtml: html, // Optional: store if needed, but heavy
      };
    });

    // 2. Analyze Content (AI)
    const analysis = await step.run("analyze-content", async () => {
      console.log(`🧠 [Inngest] Analyzing: ${rawData.title}`);
      return await analyzeContent(rawData.content, url, rawData.title);
    });

    // 3. Save to Supabase
    const savedFeed = await step.run("save-to-db", async () => {
      const supabase = createAdminClient(); // Use admin client to bypass RLS if needed, or normal client
      
      const insertData = {
        user_id: userId,
        url: url,
        title: analysis.title || rawData.title,
        content_raw: rawData.content,
        summary: analysis.summary,
        takeaways: analysis.takeaways,
        tags: analysis.tags,
        category: analysis.category,
        emotion: analysis.emotion,
        reading_time: analysis.reading_time,
        status: "done",
        source_type: "manual_url",
      };

      const { data, error } = await supabase
        .from("feeds")
        .insert([insertData])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    });

    return { success: true, feedId: savedFeed.id };
  }
);

