import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/server";
import { analyzeContent } from "@/lib/ai";
import { AIConfig } from "@/types/index";

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
      // 2. 🚀 升级版抓取引擎：使用 Jina Reader 网关 (处理动态渲染 & 微信反爬 & 视频转录)
      const rawData = await step.run("scrape-url", async () => {
        console.log(`🕵️ [Inngest] Fetching: ${url}`);
        
        const isVideo = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('bilibili.com');
        
        // 尝试使用 Jina Reader (优先)
        try {
          const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
          console.log(`🕵️ [Inngest] Trying Jina Reader: ${jinaUrl} (isVideo: ${isVideo})`);
          
          const response = await fetch(jinaUrl, {
            headers: {
              "Accept": "application/json",
              "X-No-Cache": "true",
              "X-With-Images-Summary": "false", // 🚀 禁用摘要，获取完整内容
              "X-Return-Format": "markdown",    // 🚀 强制要求返回 Markdown 格式
              "X-With-Links-Summary": "false",  // 🚀 禁用链接摘要
              // 如果是视频，告诉 Jina 尝试抓取字幕/转录
              ...(isVideo ? { "X-Target-Selector": "#transcript, .subtitle-item, .video-desc, #video-description" } : {})
            },
          });

          if (response.ok) {
            const result = await response.json();
            // Jina 的 JSON 结构通常是 { code: 200, status: 20000, data: { title, content, ... } }
            const jinaData = result.data || result; 
            
            if (jinaData && jinaData.content && jinaData.content.length > 100) {
              // 🌟 增加微信拦截检测
              const isBlocked = jinaData.content.includes('环境异常') || 
                                jinaData.content.includes('验证后即可继续访问') ||
                                jinaData.title?.includes('Weixin Official Accounts');
              
              if (!isBlocked) {
                console.log(`✅ [Inngest] Jina Reader success: ${jinaData.title}`);
                return {
                  title: jinaData.title || "Untitled",
                  content: jinaData.content,
                  isVideo: isVideo
                };
              }
              console.warn(`⚠️ [Inngest] Jina Reader was blocked by Wechat security.`);
            }
          }
          console.warn(`⚠️ [Inngest] Jina Reader returned status ${response.status} or low quality content.`);
        } catch (e) {
          console.error("❌ [Inngest] Jina Reader request failed:", e);
        }

        // --- 🛡️ 回退逻辑：如果 Jina 失败，使用本地抓取方案 ---
        console.log(`🛡️ [Inngest] Using fallback scraper for: ${url}`);
        const { parseHTML } = await import("linkedom");
        const { Readability } = await import("@mozilla/readability");

        const isWechat = url.includes('mp.weixin.qq.com');
        const userAgent = isWechat 
          ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 NetType/WIFI Language/zh_CN"
          : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NeoFeed/1.0";

        const response = await fetch(url, { 
          headers: { 
            "User-Agent": userAgent,
            ...(isWechat ? {
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
              "Cache-Control": "no-cache",
              "Pragma": "no-cache",
              "Referer": "https://mp.weixin.qq.com/"
            } : {})
          },
          next: { revalidate: 0 } // 禁用缓存
        });
        
        if (!response.ok) {
          throw new Error(`Fallback fetch failed: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        const { document } = parseHTML(html);

        let extractedContent = "";
        let extractedTitle = "";

        // 针对微信公众号的深度优化
        if (isWechat) {
          const contentNode = document.getElementById('js_content');
          if (contentNode) {
            // 移除干扰元素
            contentNode.querySelectorAll('script, style, .mp_profile_owner, .related_article').forEach(el => el.remove());
            extractedContent = contentNode.textContent?.replace(/\s+/g, ' ').trim() || "";
            extractedTitle = document.querySelector('.rich_media_title')?.textContent?.trim() || "";
          }
        }

        const reader = new Readability(document as any);
        const article = reader.parse();

        // 🌟 增强版本地转换：将 HTML 转换为基础 Markdown 格式
        const convertHtmlToMd = (html: string) => {
          if (!html) return "";
          return html
            .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n')
            .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n')
            .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n')
            .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
            .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
            .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
            .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
            .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1\n')
            .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '$1\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)\n\n')
            .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)\n\n')
            .replace(/<[^>]+>/g, '') // 移除剩余标签
            .replace(/&nbsp;/g, ' ')
            .replace(/\n{3,}/g, '\n\n') // 压缩多余换行
            .trim();
        };

        const finalTitle = extractedTitle || article?.title || document.title || "Untitled";
        
        // 优先使用 Readability 提取的带格式 HTML，如果失败则回退到 textContent
        const rawHtml = article?.content || "";
        const formattedContent = rawHtml ? convertHtmlToMd(rawHtml) : (article?.textContent || "");

        const finalContent = (extractedContent && extractedContent.length > 200) 
          ? extractedContent 
          : formattedContent;

        if (!finalContent || finalContent.length < 50) {
          throw new Error("抓取到的内容过短或为空，可能被反爬虫拦截。");
        }

        console.log(`✅ [Inngest] Fallback scrape complete: ${finalTitle} (${finalContent.length} chars, format: ${rawHtml ? 'MD' : 'TEXT'})`);
        return {
          title: finalTitle,
          content: finalContent,
          isVideo: isVideo
        };
      });

      // 3. AI 分析 (仅用于生成摘要和标签，不修改正文)
      const analysis = await step.run("analyze-content", async () => {
        console.log(`🧠 [Inngest] Fetching user AI config...`);
        
        const supabase = createAdminClient();
        const { data: profile } = await supabase
          .from('profiles')
          .select('ai_config')
          .eq('id', userId)
          .single();

        const content = rawData.content || "";
        
        // 仅取前 10000 字用于生成摘要，避免超长文本导致 AI 失败
        const summaryInput = content.slice(0, 10000);

        console.log(`🧠 [Inngest] Generating summary and tags...`);
        return await analyzeContent(
          summaryInput, 
          url, 
          rawData.title, 
          profile?.ai_config as AIConfig,
          (rawData as any).isVideo
        );
      });

      // 4. 更新数据库记录 (100% 还原抓取内容)
      await step.run("update-db-record", async () => {
        const supabase = createAdminClient();
        
        console.log(`📝 [Inngest] Updating DB for feedId: ${feedId}. Content length: ${rawData.content?.length}`);

        const { error } = await supabase
          .from("feeds")
          .update({
            title: analysis.title || rawData.title,
            content_raw: rawData.content || "", // 🌟 直接存入原始抓取内容，不再由 AI 格式化
            summary: analysis.summary,
            takeaways: analysis.takeaways,
            tags: analysis.tags,
            category: analysis.category,
            emotion: analysis.emotion,
            reading_time: analysis.reading_time,
            status: "done",
          })
          .eq("id", feedId);

        if (error) {
          console.error(`❌ [Inngest] DB Update Error:`, error);
          throw new Error(error.message);
        }
      });

      console.log(`✅ [Inngest] Successfully processed URL: ${url}`);
      return { success: true, feedId };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`💥 [Inngest] Error processing URL: ${message}`);
      
      // 更新状态为失败
      await step.run("mark-as-failed", async () => {
        const supabase = createAdminClient();
        await supabase
          .from("feeds")
          .update({ 
            status: "failed",
            summary: `处理失败: ${message}` 
          })
          .eq("id", feedId);
      });

      throw err; // 抛出错误以触发 Inngest 的重试机制
    }
  }
);
