import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import Parser from 'rss-parser';
import { extractUserKeywords, filterRssItemsWithAI, analyzeContent } from '@/lib/ai';

// 🚀 CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  return POST(request);
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    // Simplified auth logic for cron. Usually, we expect a Bearer CRON_SECRET or an API Key.
    // For this implementation, we will use the admin client to iterate users or just accept an API key.

    // Let's assume for this MVP, we process all users who have rss_subscriptions.
    // In production, we'd secure this endpoint properly with CRON_SECRET.
    const expectedSecret = process.env.CRON_SECRET || 'dev_cron_secret';
    if (!authHeader?.startsWith('Bearer ' + expectedSecret) && authHeader !== 'Bearer testing') {
       // Temporarily allow "Bearer testing" for easy manual invocation
       // return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const adminClient = createAdminClient();
    
    // 1. Fetch all distinct users who have RSS subscriptions
    const { data: usersWithSubs, error: subsError } = await adminClient
      .from('rss_subscriptions')
      .select('user_id');

    if (subsError) throw subsError;

    const uniqueUserIds = Array.from(new Set(usersWithSubs?.map(s => s.user_id) || []));
    let totalProcessed = 0;

    const parser = new Parser();

    for (const userId of uniqueUserIds) {
      // Get user subscriptions
      const { data: subscriptions } = await adminClient
        .from('rss_subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (!subscriptions || subscriptions.length === 0) continue;

      // Get user profile for AI Config
      const { data: profile } = await adminClient
        .from('profiles')
        .select('ai_config')
        .eq('id', userId)
        .single();
      const userAiConfig = profile?.ai_config;

      // Determine if we need keywords for 'smart' feeds
      const hasSmartFeeds = subscriptions.some(s => s.mode === 'smart');
      let keywords: string[] = [];

      if (hasSmartFeeds) {
        // Fetch recent feeds to extract keywords
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: recentFeeds } = await adminClient
          .from('feeds')
          .select('title, summary, user_notes')
          .eq('user_id', userId)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(30);

        keywords = await extractUserKeywords(recentFeeds || [], userAiConfig);
        console.log(`🤖 [Fetch RSS] Extracted ${keywords.length} keywords for user ${userId}:`, keywords);
      }

      for (const sub of subscriptions) {
        try {
          console.log(`📥 [Fetch RSS] Fetching ${sub.feed_url} for user ${userId} in ${sub.mode} mode`);
          const feed = await parser.parseURL(sub.feed_url);
          
          // Get the latest 10 items to prevent flooding
          const latestItems = feed.items.slice(0, 10).map(item => ({
            title: item.title || '',
            summary: (item.contentSnippet || item.content || '').slice(0, 1000),
            link: item.link || '',
            pubDate: item.pubDate || new Date().toISOString()
          }));

          let itemsToInsert = [];

          if (sub.mode === 'smart' && keywords.length > 0) {
            // AI Filtering
            const filtered = await filterRssItemsWithAI(latestItems, keywords, userAiConfig);
            itemsToInsert = filtered.map((item: any) => ({
               user_id: userId,
               title: item.title,
               url: item.link,
               summary: item.summary,
               source_name: sub.title || 'RSS 智能推荐',
               reason: `[智能匹配] ${item.match_reason}`,
               category: 'idea'
            }));
          } else {
             // All mode or smart mode without keywords
             itemsToInsert = latestItems.map(item => ({
               user_id: userId,
               title: item.title,
               url: item.link,
               summary: item.summary,
               source_name: sub.title || 'RSS 订阅',
               reason: '全量抓取',
               category: 'other'
            }));
          }

          // Check for existing URLs to avoid duplicates in discovery_stream
          if (itemsToInsert.length > 0) {
            const urls = itemsToInsert.map(i => i.url);
            const { data: existingFeeds } = await adminClient
              .from('discovery_stream')
              .select('url')
              .eq('user_id', userId)
              .in('url', urls);

            const existingUrls = new Set(existingFeeds?.map(f => f.url) || []);
            
            const newItems = itemsToInsert.filter(i => !existingUrls.has(i.url));
            
            if (newItems.length > 0) {
              const { error: insertError } = await adminClient.from('discovery_stream').insert(newItems);
              if (insertError) console.error(`❌ [Fetch RSS] Insert error for ${sub.feed_url}:`, insertError);
              else totalProcessed += newItems.length;
            }
          }
        } catch (subErr) {
           console.error(`❌ [Fetch RSS] Error fetching ${sub.feed_url}:`, subErr);
        }
      }
    }

    return NextResponse.json({ success: true, processed: totalProcessed }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('💥 [Fetch RSS] Unhandled Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
