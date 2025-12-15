import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { analyzeContent } from '@/lib/ai';

// 🚀 CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  console.log('🚀 [API] /api/process-feed hit!');

  try {
    // 1. Body Parsing
    let body;
    try {
      body = await request.json();
      console.log('📦 [API] Body received. Keys:', Object.keys(body));
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders });
    }
    
    // 支持旧格式 { content: "..." } 和新格式 { url, title, content: "..." }
    const url = body.url || '';
    const title = body.title || '';
    const content = body.content || ''; // 这是全文或用户笔记

    if (!content && !url) {
      return NextResponse.json({ error: 'Content or URL is required' }, { status: 400, headers: corsHeaders });
    }

    // 2. Auth (省略部分日志以保持简洁)
    let userId: string | null = null;
    let supabaseClient = null;

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        supabaseClient = supabase;
      }
    } catch (e) {}

    if (!userId) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const apiKey = authHeader.split(' ')[1];
        const adminClient = createAdminClient();
        const { data: profile } = await adminClient.from('profiles').select('id').eq('api_key', apiKey).single();
        if (profile) {
          userId = profile.id;
          supabaseClient = adminClient;
        }
      }
    }

    if (!userId || !supabaseClient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // 3. AI Analysis
    console.log('🤖 [API] Analyzing with AI...');
    
    // Pass structured data to AI
    const analysis = await analyzeContent(content, url, title);
    console.log('🧠 [API] Analysis done:', analysis.title);

    // 4. DB Insert
    const insertData = {
      user_id: userId,
      url: url, // 新字段
      content_raw: content, // 存全文
      title: analysis.title || title, // AI 标题优先，没有则用网页标题
      summary: analysis.summary,
      takeaways: analysis.takeaways,
      tags: analysis.tags,
      category: analysis.category || 'other',
      emotion: analysis.emotion,
      reading_time: analysis.reading_time,
      status: 'done'
    };

    const { data, error } = await supabaseClient
      .from('feeds')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('❌ [API] Supabase Insert Error:', error);
      // 如果是因为缺少 url 列报错，我们降级重试（仅用于过渡期）
      if (error.message.includes('column "url" of relation "feeds" does not exist')) {
         console.warn('⚠️ [API] DB schema mismatch: missing "url" column. Retrying without it.');
         delete (insertData as any).url;
         const retry = await supabaseClient.from('feeds').insert([insertData]).select().single();
         return NextResponse.json({ success: true, data: retry.data, warning: 'Schema outdated' }, { headers: corsHeaders });
      }
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, data }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('💥 [API] Unhandled Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
