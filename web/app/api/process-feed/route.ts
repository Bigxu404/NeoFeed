import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeContent } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    console.log('📝 Received content:', content.slice(0, 50) + '...');
    
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Auth Error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('👤 User identified:', user.id);

    // 1. AI Analysis
    console.log('🤖 Analyzing with AI...');
    const analysis = await analyzeContent(content);
    console.log('🧠 AI Analysis result:', JSON.stringify(analysis, null, 2));

    // 2. Save to Supabase
    console.log('💾 Saving to Supabase...');
    const insertData = {
      user_id: user.id,
      content_raw: content,
      title: analysis.title,
      summary: analysis.summary,
      takeaways: analysis.takeaways,
      tags: analysis.tags,
      category: analysis.category,
      emotion: analysis.emotion,
      reading_time: analysis.reading_time,
      status: 'done'
    };

    const { data, error } = await supabase
      .from('feeds')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase Insert Error:', error);
      return NextResponse.json({ error: error.message, details: error.details }, { status: 500 });
    }

    console.log('✅ Save successful:', data.id);
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('💥 Processing Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
