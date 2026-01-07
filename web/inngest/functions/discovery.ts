import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/server";
import { filterDiscoveryItems } from "@/lib/ai";
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
  { cron: "0 */4 * * *" }, // 每4小时运行一次
  async ({ step }) => {
    const supabase = createAdminClient();

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('id, url, themes, user_id');

    if (error || !subscriptions) {
      return { status: "error", error: error?.message };
    }

    const events = subscriptions.map((sub) => ({
      name: "sub/poll.rss",
      data: {
        subId: sub.id,
        url: sub.url,
        themes: sub.themes,
        userId: sub.user_id,
      },
    }));

    if (events.length > 0) {
      await step.send("trigger-rss-polling", events);
    }

    return { scheduled: events.length };
  }
);

// 2. RSS 处理器：解析、AI 筛选并入库
export const rssProcessor = inngest.createFunction(
  { id: "rss-processor" },
  { event: "sub/poll.rss" },
  async ({ event, step }) => {
    const { url, themes, userId } = event.data;
    const supabase = createAdminClient();

    // 1. 获取 RSS 内容
    const feedItems = await step.run("fetch-rss", async () => {
      try {
        const feed = await parser.parseURL(url);
        return feed.items.slice(0, 20).map(item => ({
          title: item.title || "Untitled",
          summary: item.contentSnippet || item.content || "",
          url: item.link || "",
          source_name: feed.title || "Unknown Source"
        }));
      } catch (err) {
        console.error(`Failed to parse RSS: ${url}`, err);
        throw err;
      }
    });

    if (!feedItems.length) return { status: "empty" };

    // 2. 获取用户 AI 配置
    const { data: profile } = await supabase
      .from('profiles')
      .select('ai_config')
      .eq('id', userId)
      .single();

    // 3. AI 筛选 (Top 7)
    const selectedIndices = await step.run("ai-filter", async () => {
      return await filterDiscoveryItems(
        feedItems.map(it => ({ title: it.title, summary: it.summary })),
        themes,
        profile?.ai_config as AIConfig // 🚀 强类型
      );
    });

    if (!selectedIndices.length) return { status: "no_matches" };

    // 4. 更新数据库 (清理该来源的旧发现，插入新的)
    await step.run("update-discovery-stream", async () => {
      // 获取选中的完整数据
      const toInsert = selectedIndices.map(sel => {
        const original = feedItems[sel.index];
        if (!original) return null;
        return {
          user_id: userId,
          title: original.title,
          url: original.url,
          summary: original.summary.slice(0, 500),
          source_name: original.source_name,
          reason: sel.reason,
          created_at: new Date().toISOString()
        };
      }).filter(Boolean);

      if (!toInsert.length) return;

      console.log(`🔄 [Inngest] Updating discovery for user ${userId}, source: ${toInsert[0]?.source_name}`);

      // 优化策略：只删除该用户下，且属于该订阅源（通过 source_name 匹配，或更严谨地用 url 匹配的前缀）的旧发现
      // 这里为了简单，我们先按 source_name 删除
      const sourceName = toInsert[0]?.source_name;
      
      if (sourceName) {
        await supabase
          .from('discovery_stream')
          .delete()
          .eq('user_id', userId)
          .eq('source_name', sourceName);
      }

      const { error } = await supabase
        .from('discovery_stream')
        .insert(toInsert);

      if (error) {
        console.error("❌ [Inngest] Insert discovery stream failed:", error);
        throw error;
      }
    });

    return { processed: selectedIndices.length };
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

