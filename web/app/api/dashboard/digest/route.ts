import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateKnowledgeDigest, generateDigestCover } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { generateImage = true } = body;

    // 1. 获取用户所有已完成的 feeds
    const { data: feeds, error: feedsError } = await supabase
      .from('feeds')
      .select('title, category, tags, summary, takeaways')
      .eq('user_id', user.id)
      .eq('status', 'done')
      .order('created_at', { ascending: false });

    if (feedsError) {
      console.error('❌ [digest] Feeds query error:', feedsError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!feeds || feeds.length < 3) {
      return NextResponse.json({
        error: 'Not enough content',
        message: '知识库至少需要 3 篇内容才能生成导语',
      }, { status: 400 });
    }

    // 2. 获取用户资料
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, ai_config')
      .eq('id', user.id)
      .single();

    const ownerName = profile?.full_name || profile?.email?.split('@')[0] || 'NeoFeed 用户';
    const aiConfig = (profile?.ai_config as any) || {};

    // 3. 生成知识导语
    console.log(`🧠 [digest] Generating digest for ${ownerName} (${feeds.length} feeds)...`);
    const digest = await generateKnowledgeDigest({
      feeds: feeds.map(f => ({
        title: f.title || '',
        category: f.category || 'other',
        tags: f.tags || [],
        summary: f.summary || undefined,
        takeaways: f.takeaways || undefined,
      })),
      ownerName,
      userConfig: aiConfig,
    });

    if (!digest) {
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
    }

    // 4. 生成封面插图（可选）
    let imageUrl: string | null = null;
    if (generateImage) {
      console.log(`🎨 [digest] Generating cover image...`);
      imageUrl = await generateDigestCover({
        prompt: digest.cover_prompt,
        userConfig: aiConfig,
      });
    }

    console.log(`✅ [digest] Done. Image: ${imageUrl ? 'yes' : 'no'}`);
    return NextResponse.json({ digest, imageUrl });

  } catch (error: any) {
    console.error('❌ [digest] Unhandled error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
