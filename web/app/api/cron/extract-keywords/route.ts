import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

// 🚀 CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const apiKey = authHeader.split(' ')[1];
    
    // For cron jobs, we usually use a cron secret. Here we assume the api key is the user's API key or a master cron secret.
    // For this implementation, we will use the admin client to find the user by their API key.
    const adminClient = createAdminClient();
    let userId: string | null = null;
    let userAiConfig: any = null;

    // Check if it's a cron secret (if so, we would iterate all users. For now, assume it runs per user with their API key)
    if (apiKey === process.env.CRON_SECRET) {
      // Not implemented: iterate all users. We expect user API key here for MVP.
      return NextResponse.json({ error: 'CRON_SECRET not fully implemented for this route yet' }, { status: 501, headers: corsHeaders });
    } else {
      const { data: profile } = await adminClient.from('profiles').select('id, ai_config').eq('api_key', apiKey).single();
      if (profile) {
        userId = profile.id;
        userAiConfig = profile.ai_config;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized or User not found' }, { status: 401, headers: corsHeaders });
    }

    // Fetch user's feeds from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: feeds, error } = await adminClient
      .from('feeds')
      .select('title, summary, user_notes')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    if (!feeds || feeds.length === 0) {
      return NextResponse.json({ keywords: [] }, { headers: corsHeaders });
    }

    // Extract keywords using AI
    let aiKey = userAiConfig?.apiKey || process.env.SILICONFLOW_API_KEY;
    let rawBaseURL = userAiConfig?.baseURL || process.env.AI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
    let model = userAiConfig?.model || process.env.AI_MODEL || "doubao-seed-1-8-251228"; 
    
    let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

    if (!aiKey) {
      return NextResponse.json({ error: 'Missing AI API Key' }, { status: 500, headers: corsHeaders });
    }

    const openai = new OpenAI({ apiKey: aiKey, baseURL });

    const systemPrompt = `你是一个专业的信息分析师。用户会提供他最近阅读的文章和记录的笔记。
请根据这些内容，提取出代表用户当前兴趣和思考方向的 5 到 10 个核心关键词或短语。
这些关键词将用于在浩瀚的互联网 RSS 抓取中寻找与之产生共鸣的内容。
返回的必须是一个合法的 JSON 数组，例如：["关键词1", "关键词2", "短语3"]。严禁输出其他内容。`;

    const contentsToAnalyze = feeds.map(f => {
      let text = `标题: ${f.title || ''}`;
      if (f.summary) text += `\n摘要: ${f.summary}`;
      if (f.user_notes) text += `\n用户思考: ${f.user_notes}`;
      return text;
    }).join('\n\n---\n\n');

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `以下是用户近期的阅读和思考：\n\n${contentsToAnalyze}` }
      ],
      model,
      temperature: 0.3,
      max_tokens: 1024,
    });

    const raw = completion.choices[0].message.content || '';
    let keywords: string[] = [];

    try {
      const jsonMatch = raw.match(/```json\n?([\s\S]*?)```/) || raw.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : raw;
      keywords = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error('❌ [Extract Keywords] JSON parse failed:', raw);
    }

    if (!Array.isArray(keywords)) {
      keywords = [];
    }

    return NextResponse.json({ keywords }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('💥 [API] Unhandled Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
