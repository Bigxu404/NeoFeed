import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/server";
import { summarizeDiscoveryItems } from "@/lib/ai";
import { AIConfig } from "@/types/index"; // 🚀 引入类型
import Parser from 'rss-parser';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NeoFeed/1.0',
  },
});

// 1. 定时巡逻员：扫描所有活跃订阅
export const subscriptionPoller = inngest.createFunction(
  { id: "subscription-poller" },
  { cron: "*/30 * * * *" }, // 每30分钟运行一次，检查是否命中用户的更新频率
  async ({ step }) => {
    const supabase = createAdminClient();

    const now = new Date();
    // 💡 改进时间判断逻辑：获取当前北京时间的小时和分钟
    // 使用 Intl API 获取，这比手动加 8 小时更稳健，尤其在处理夏令时或不同服务器环境时
    const bjTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" });
    const bjDate = new Date(bjTimeStr);
    
    const day = bjDate.getDay(); // 0 is Sunday, 1 is Monday
    const hour = bjDate.getHours();
    const minute = bjDate.getMinutes();

    console.log(`🕒 [Poller] Current Server Time: ${now.toISOString()}`);
    console.log(`🕒 [Poller] Computed Beijing Time: ${hour}:${minute}, Day: ${day}`);

    // 获取所有订阅
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        id, 
        url, 
        user_id,
        profiles (
          ai_config
        )
      `);

    if (error) {
      console.error("❌ [Poller] Database error:", error);
      return { status: "error", error: error.message };
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("ℹ️ [Poller] No subscriptions found in database.");
      return { status: "no_subscriptions" };
    }

    console.log(`ℹ️ [Poller] Checking ${subscriptions.length} subscriptions...`);

    const filteredSubs = subscriptions.filter(sub => {
      const config = (sub.profiles as any)?.ai_config as AIConfig;
      const freq = config?.rssPollFrequency || 'daily';

      // 💡 更加宽松的判断逻辑：只要在目标小时内运行，且是该小时的第一次尝试（或者简单的 30 分钟窗口）
      if (freq === 'daily') {
        // 每天早上 9 点 (BJ Time)
        const isMatch = hour === 9;
        if (isMatch) console.log(`🎯 [Poller] Match found (Daily 9AM) for sub: ${sub.url}`);
        return isMatch;
      }

      if (freq === 'weekly') {
        // 每周一早上9点
        const isMatch = day === 1 && hour === 9;
        if (isMatch) console.log(`🎯 [Poller] Match found (Weekly Mon 9AM) for sub: ${sub.url}`);
        return isMatch;
      }

      return false;
    });

    const events = filteredSubs.map((sub) => ({
      name: "sub/poll.rss",
      data: {
        subId: sub.id,
        url: sub.url,
        userId: sub.user_id,
      },
    }));

    if (events.length > 0) {
      await inngest.send(events);
      console.log(`📡 [Poller] Dispatched ${events.length} poll events`);
    }

    return { 
      total: subscriptions.length,
      scheduled: events.length,
      time: `${hour}:${minute}`
    };
  }
);

// 2. RSS 处理器：解析、AI 总结并入库
export const rssProcessor = inngest.createFunction(
  { id: "rss-processor" },
  { event: "sub/poll.rss" },
  async ({ event, step }) => {
    const { url, userId } = event.data;
    const supabase = createAdminClient();

    console.log(`🚀 [Inngest] Starting processor for ${url} (User: ${userId})`);

    // 1. 获取 RSS 内容
    const feedItems = await step.run("fetch-rss", async () => {
      try {
        const feed = await parser.parseURL(url);
        console.log(`📡 [Inngest] Fetched ${feed.items?.length || 0} items from ${url}`);
        return (feed.items || []).slice(0, 20).map(item => ({
          title: item.title || "Untitled",
          summary: item.contentSnippet || item.content || "",
          url: item.link || "",
          source_name: feed.title || "Unknown Source"
        }));
      } catch (err: any) {
        console.error(`❌ [Inngest] RSS Fetch failed for ${url}:`, err.message);
        return [];
      }
    });

    if (!feedItems || feedItems.length === 0) {
      console.warn(`⚠️ [Inngest] No items to process for ${url}`);
      return { status: "no_items" };
    }

    // 2. 获取用户 AI 配置
    const profile = await step.run("get-user-config", async () => {
      const { data } = await supabase
        .from('profiles')
        .select('ai_config')
        .eq('id', userId)
        .single();
      return data;
    });

    // 3. AI 结构化总结 (不再筛选 Top 7，全量处理)
    const summarizedResults = await step.run("ai-summarize", async () => {
      console.log(`🤖 [Inngest] Sending to AI summarizer... (Items: ${feedItems.length})`);
      try {
        return await summarizeDiscoveryItems(
          feedItems,
          profile?.ai_config as AIConfig
        );
      } catch (err: any) {
        console.error(`❌ [Inngest] AI Summarize Crashed:`, err.message);
        return [];
      }
    });

    // 4. 更新数据库
    await step.run("update-discovery-stream", async () => {
      // 💡 关键改动：先清空该用户该来源的旧数据，防止重复堆砌
      const sourceName = feedItems[0]?.source_name;
      if (sourceName) {
        await supabase
          .from('discovery_stream')
          .delete()
          .eq('user_id', userId) // 🛡️ 必须同时校验用户ID，防止误删其他用户的数据
          .eq('source_name', sourceName);
      }

      const toInsert = summarizedResults.map(res => {
        const original = feedItems[res.index];
        if (!original) return null;

               // 💡 格式化四段式总结存入 summary
               const structuredSummary = `
研究主题：${res.structured_summary.topic}
研究方法：${res.structured_summary.method}
研究结果：${res.structured_summary.result}
               `.trim();

        return {
          user_id: userId,
          title: original.title,
          url: original.url,
          summary: structuredSummary,
          source_name: original.source_name,
          reason: res.structured_summary.one_sentence, // 一句话总结存入 reason
          category: res.tags?.[0] || "科研情报", // 使用第一个标签作为分类显示
          created_at: new Date().toISOString()
        };
      }).filter(Boolean);

      if (toInsert.length === 0) return;

      console.log(`💾 [Inngest] Saving ${toInsert.length} items to DB for ${sourceName}`);

      // 更新订阅源的 AI 标签 (取所有条目标签的合集)
      if (toInsert.length > 0 && event.data.subId) {
        const allTags = Array.from(new Set(summarizedResults.flatMap(r => r.tags))).slice(0, 5);
        await supabase
          .from('subscriptions')
          .update({ themes: allTags })
          .eq('id', event.data.subId);
      }

      const { error } = await supabase
        .from('discovery_stream')
        .insert(toInsert);

      if (error) {
        console.error("❌ [Inngest] DB Insert Error:", error);
        throw error;
      }
      console.log(`✅ [Inngest] DB Update Successful for ${sourceName}`);
    });

    return { processed: summarizedResults.length };
  }
);

// 3. 自动清理：每7天清空一次发现流
export const discoveryCleanup = inngest.createFunction(
  { id: "discovery-cleanup" },
  { cron: "0 0 * * 0" }, // 每周日凌晨
  async ({ step }) => {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from('discovery_stream')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有

    if (error) throw error;
    return { cleaned: count };
  }
);

