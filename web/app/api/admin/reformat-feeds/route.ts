import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { analyzeContent } from '@/lib/ai';

export async function GET() {
  const supabase = createAdminClient();
  
  try {
    console.log("🚀 [Admin] Starting reformat process...");
    
    // 1. 获取原始数据 (包含 user_id 以便获取 AI 配置)
    const { data: allFeeds, error: debugError } = await supabase
      .from('feeds')
      .select('id, title, content_raw, url, user_id')
      .order('created_at', { ascending: true })
      .limit(100);
    
    if (debugError) return NextResponse.json({ error: debugError.message }, { status: 500 });

    // 2. 过滤需要处理的数据
    const filteredFeeds = allFeeds?.filter(f => {
      const content = f.content_raw || '';
      return !content.includes('# ') && !content.includes('## ');
    }) || [];

    if (filteredFeeds.length === 0) {
      return NextResponse.json({ message: "所有数据已完成重构" });
    }

    // 3. 执行批处理 (每次 3 条)
    const results = [];
    const batch = filteredFeeds.slice(0, 3); 

    // 缓存用户配置，避免重复查询
    const userConfigs = new Map();

    for (const feed of batch) {
      console.log(`✍️ [Admin] Processing: ${feed.title}`);
      try {
        // 获取该用户的 AI 配置
        let config = userConfigs.get(feed.user_id);
        if (!config) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('ai_config')
            .eq('id', feed.user_id)
            .single();
          config = profile?.ai_config;
          userConfigs.set(feed.user_id, config);
        }

        const analysis = await analyzeContent(feed.content_raw || '', feed.url, feed.title, config);

        if (analysis.status === 'done' && analysis.formatted_content && analysis.formatted_content.length > 50) {
          const { error: updateError } = await supabase
            .from('feeds')
            .update({
              content_raw: analysis.formatted_content,
              summary: analysis.summary,
              tags: analysis.tags
            })
            .eq('id', feed.id);

          if (updateError) throw updateError;
          results.push({ title: feed.title, status: 'success' });
        } else {
          results.push({ 
            title: feed.title, 
            status: 'failed', 
            reason: analysis.status === 'failed' ? 'AI接口报错' : 'AI未返回有效内容',
            error_detail: analysis.summary,
            config_used: !!config
          });
        }
      } catch (err: any) {
        results.push({ title: feed.title, status: 'failed', error: err.message });
      }
    }

    return NextResponse.json({ 
      message: "批处理完成", 
      results 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
