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
                // 移除 Markdown 中的图片语法（外部图片无法稳定显示，节省存储）
                const cleanContent = jinaData.content
                  .replace(/!\[[^\]]*\]\([^)]+\)\n*/g, '')  // ![alt](url)
                  .replace(/\n{3,}/g, '\n\n');               // 压缩多余空行
                return {
                  title: jinaData.title || "Untitled",
                  content: cleanContent,
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
        
        // 🌟 统一使用桌面 Chrome 完整指纹（微信反爬需要 Sec-* 头才能通过）
        const chromeUA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
        
        const response = await fetch(url, { 
          headers: { 
            "User-Agent": chromeUA,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Cache-Control": "max-age=0",
            "Connection": "keep-alive",
            // 🔑 关键：Sec-* 头是突破微信反爬的核心
            "Sec-Ch-Ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"macOS"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
          },
          next: { revalidate: 0 }
        });
        
        if (!response.ok) {
          throw new Error(`Fallback fetch failed: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        const { document } = parseHTML(html);

        // 🌟 增强版 HTML → Markdown 转换器（适配微信公众号特有 HTML 结构）
        const convertHtmlToMd = (htmlStr: string): string => {
          if (!htmlStr) return "";
          let md = htmlStr;
          
          // 0. 预处理：移除 script/style 标签及内容
          md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
          md = md.replace(/<style[\s\S]*?<\/style>/gi, '');
          
          // 1. 标题：h1-h4
          md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n\n');
          md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n\n');
          md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n\n');
          md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n\n');
          
          // 2. 微信特有：通过 font-size>=20px 的 section/span 作为标题（大字号段落）
          md = md.replace(/<(?:section|p)[^>]*style="[^"]*font-size:\s*(3[0-9]|[4-9][0-9])px[^"]*"[^>]*>([\s\S]*?)<\/(?:section|p)>/gi, '\n## $2\n\n');
          md = md.replace(/<(?:section|p)[^>]*style="[^"]*font-size:\s*(2[0-9])px[^"]*"[^>]*>([\s\S]*?)<\/(?:section|p)>/gi, '\n### $2\n\n');
          
          // 3. 加粗：<strong>、<b>、以及微信的 style="font-weight: bold/700"
          md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
          md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
          md = md.replace(/<span[^>]*style="[^"]*font-weight:\s*(?:bold|[6-9]00)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '**$1**');
          
          // 4. 斜体：<em>、<i>
          md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
          md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
          
          // 5. 引用块
          md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n\n');
          
          // 6. 分隔线
          md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n\n');
          
          // 7. 列表
          md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
          md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '\n$1\n');
          md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '\n$1\n');
          
          // 8. 段落
          md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
          
          // 9. 换行
          md = md.replace(/<br\s*\/?>/gi, '\n');
          
          // 10. 链接
          md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
          
          // 11. 图片 — 直接移除（外部图片无法稳定显示，且节省存储空间）
          md = md.replace(/<img[^>]*>/gi, '');
          
          // 12. 清理：移除剩余 HTML 标签
          md = md.replace(/<[^>]+>/g, '');
          
          // 13. 实体解码
          md = md.replace(/&nbsp;/g, ' ');
          md = md.replace(/&amp;/g, '&');
          md = md.replace(/&lt;/g, '<');
          md = md.replace(/&gt;/g, '>');
          md = md.replace(/&quot;/g, '"');
          md = md.replace(/&#39;/g, "'");
          md = md.replace(/&#x200b;/g, ''); // 零宽空格
          
          // 14. 格式整理：去除多余空白和空行
          md = md.replace(/\*\*\s*\*\*/g, '');      // 移除空的加粗标记
          md = md.replace(/\n{3,}/g, '\n\n');        // 压缩多余换行
          md = md.replace(/^\s+|\s+$/gm, (m) => m.includes('\n') ? '\n' : m); // 保留段落间距
          md = md.trim();
          
          return md;
        };

        let extractedContent = "";
        let extractedTitle = "";

        // 🌟 针对微信公众号：提取 innerHTML 并转为 Markdown（不再用 textContent）
        if (isWechat) {
          const contentNode = document.getElementById('js_content');
          if (contentNode) {
            // 移除干扰元素
            contentNode.querySelectorAll('script, style, .mp_profile_owner, .related_article, .qr_code_pc, .reward_area').forEach((el: any) => el.remove());
            
            // 🔑 核心改动：用 innerHTML 保留格式，再转为 Markdown
            const rawInnerHtml = contentNode.innerHTML || "";
            extractedContent = convertHtmlToMd(rawInnerHtml);
            extractedTitle = document.querySelector('.rich_media_title')?.textContent?.trim() || "";
            
            // 额外尝试从 JS 变量提取标题（更可靠）
            if (!extractedTitle) {
              const titleMatch = html.match(/var msg_title = '([^']*)'/);
              if (titleMatch) extractedTitle = titleMatch[1];
            }
            
            console.log(`✅ [Inngest] WeChat extraction: title="${extractedTitle}", content=${extractedContent.length} chars (from innerHTML→MD)`);
          }
        }

        // 非微信走 Readability
        const reader = new Readability(document as any);
        const article = reader.parse();

        const finalTitle = extractedTitle || article?.title || document.title || "Untitled";
        
        // 内容优先级：微信 Markdown > Readability HTML→Markdown > textContent
        let finalContent = "";
        if (extractedContent && extractedContent.length > 100) {
          finalContent = extractedContent;
        } else if (article?.content) {
          finalContent = convertHtmlToMd(article.content);
        } else {
          finalContent = article?.textContent || "";
        }

        if (!finalContent || finalContent.length < 50) {
          throw new Error("抓取到的内容过短或为空，可能被反爬虫拦截。");
        }

        console.log(`✅ [Inngest] Fallback scrape complete: ${finalTitle} (${finalContent.length} chars)`);
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
