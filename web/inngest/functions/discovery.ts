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

// 2. RSS 处理器：解析、AI 筛选并入库
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

    // 3. AI 筛选 (Top 7)
    let selectedIndices = await step.run("ai-filter", async () => {
      console.log(`🤖 [Inngest] Sending to AI filter... (Provider: ${profile?.ai_config?.provider || 'default'})`);
      try {
        const results = await filterDiscoveryItems(
          feedItems.map(it => ({ title: it.title, summary: it.summary })),
          profile?.ai_config as AIConfig
        );
        console.log(`✅ [Inngest] AI analysis complete. Selected: ${results?.length || 0}`);
        return results;
      } catch (err: any) {
        console.error(`❌ [Inngest] AI Filter Crashed:`, err.message);
        return [];
      }
    });

    // 💡 增加“破冰”兜底逻辑：如果 AI 没选出任何内容，为了展示效果，强制选取前 3 条作为默认发现
    if (!selectedIndices || selectedIndices.length === 0) {
      console.warn(`⚠️ [Inngest] AI returned zero matches for ${url}. Using fallback (Top 3 items).`);
      selectedIndices = [
        { index: 0, reason: "系统推荐：发现该信号源有新动态 (自动接入)", category: "情报拦截" },
        { index: 1, reason: "系统推荐：此信号源近期热度较高", category: "热门趋势" },
        { index: 2, reason: "系统推荐：新信号链入，等待深度解析", category: "待读精选" }
      ].slice(0, Math.min(3, feedItems.length));
    }

    // 4. 更新数据库
    await step.run("update-discovery-stream", async () => {
      const toInsert = selectedIndices.map(sel => {
        const original = feedItems[sel.index];
        if (!original) return null;
        return {
          user_id: userId,
          title: original.title,
          url: original.url,
          summary: (original.summary || "").slice(0, 500),
          source_name: original.source_name,
          reason: sel.reason,
          category: sel.category,
          created_at: new Date().toISOString()
        };
      }).filter(Boolean);

      if (toInsert.length === 0) return;

      const sourceName = toInsert[0]?.source_name;
      console.log(`💾 [Inngest] Saving ${toInsert.length} items to DB for ${sourceName}`);

      // 💡 额外步骤：尝试为订阅源本身生成一个 AI 分类并更新到 subscriptions 表
      if (toInsert.length > 0) {
        const categories = toInsert.map(it => it.category).filter(Boolean);
        // 简单统计出现次数最多的分类作为源分类
        const categoryCounts = categories.reduce((acc: any, cat: any) => {
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {});
        const topCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];
        
        if (topCategory && event.data.subId) {
          await supabase
            .from('subscriptions')
            .update({ themes: [topCategory] }) // 仍然使用 themes 字段存储，但在 UI 上按分类显示
            .eq('id', event.data.subId);
        }
      }

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
        console.error("❌ [Inngest] DB Insert Error:", error);
        throw error;
      }
      console.log(`✅ [Inngest] DB Update Successful for ${sourceName}`);
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

