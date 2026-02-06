import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { analyzeContent } from '@/lib/ai';

export async function GET(req: Request) {
  const supabase = createAdminClient();
  
  try {
    const { data: allFeeds, error: debugError } = await supabase
      .from('feeds')
      .select('id, title, content_raw, url, user_id, category')
      .order('created_at', { ascending: true })
      .limit(100);
    
    if (debugError) return NextResponse.json({ error: debugError.message }, { status: 500 });

    const searchParams = new URL(req.url).searchParams;
    const shouldClearMock = searchParams.get('clear_mock') === 'true';
    
    if (shouldClearMock) {
      const { error: deleteError, count: deletedCount } = await supabase
        .from('feeds')
        .delete({ count: 'exact' })
        .eq('category', 'other');
      return NextResponse.json({ message: "Mock 数据清空完成", deleted_count: deletedCount });
    }

    const filteredFeeds = allFeeds?.filter(f => {
      const content = f.content_raw || '';
      // 🌟 修正：忽略 <!-- ref --> 标记，强制重新检查是否真的有 Markdown 标题
      // 这样之前因为 400 错误被跳过的数据可以被重新处理
      return !content.includes('# ') && !content.includes('## ');
    }) || [];

    if (filteredFeeds.length === 0) {
      return NextResponse.json({ message: "所有数据已完成重构" });
    }

    const results = [];
    const batch = filteredFeeds.slice(0, 3); 

    for (const feed of batch) {
      try {
        // 🌟 本地清洗任务优先使用 .env.local 中的配置，忽略用户个人设置
        const config = {
          apiKey: process.env.SILICONFLOW_API_KEY,
          baseURL: process.env.AI_BASE_URL,
          model: process.env.AI_MODEL
        };

        const analysis = await analyzeContent(feed.content_raw || '', feed.url, feed.title, config as any);

        // 🌟 只要 AI 状态是 done，就标记为已处理
        if (analysis.status === 'done') {
          let finalContent = analysis.formatted_content || feed.content_raw;
          
          // 如果 AI 没返回有效排版，我们至少给它打个标记，防止死循环
          if (!finalContent || finalContent.length < 20 || !finalContent.includes('#')) {
             finalContent = (finalContent || feed.content_raw) + '\n<!-- ref -->';
          }

          const { error: updateError } = await supabase
            .from('feeds')
            .update({
              content_raw: finalContent,
              summary: analysis.summary,
              tags: analysis.tags,
              category: analysis.category
            })
            .eq('id', feed.id);

          if (updateError) throw updateError;
          results.push({ title: feed.title, status: 'success' });
        } else {
          results.push({ 
            title: feed.title, 
            status: 'failed', 
            reason: 'AI未返回有效内容',
            ai_status: analysis.status,
            received_len: finalContent?.length || 0,
            ai_preview: analysis.raw_response
          });
        }
      } catch (err: any) {
        results.push({ title: feed.title, status: 'failed', error: err.message });
      }
    }

    return NextResponse.json({ message: "批处理完成", results });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
