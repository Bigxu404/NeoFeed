import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/inngest/client';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 🚀 [New] Immediately create a record in the database
    // This allows the frontend to show the item instantly
    const { data: initialFeed, error: dbError } = await supabase
      .from('feeds')
      .insert([{
        user_id: user.id,
        url: url,
        title: url, // Temporary title
        content_raw: "", // Satisfy NOT NULL
        summary: "正在初始化神经网络...",
        status: 'processing',
        source_type: 'manual_url'
      }])
      .select()
      .single();

    if (dbError) {
      console.error('❌ [Ingest API] Database Error:', dbError);
      return NextResponse.json({ error: 'Failed to initialize record' }, { status: 500 });
    }

    // 3. Trigger Inngest Event (Pass the existing feedId)
    console.log(`📡 [Ingest API] Handing off to Inngest for ID: ${initialFeed.id}`);
    
    try {
      await inngest.send({
        name: "feed/process.url",
        data: {
          url: url,
          userId: user.id,
          feedId: initialFeed.id, // Pass the ID we just created
        },
      });
    } catch (inngestError: any) {
      console.error(`❌ [Ingest API] Inngest Error:`, inngestError);
      // We don't fail the request here because the record is already in DB, 
      // but in a real scenario, we might want to mark it as failed.
    }

    // 4. Return the initial record immediately
    return NextResponse.json({ 
      success: true, 
      data: initialFeed
    });

  } catch (error: any) {
    console.error('❌ [Ingest] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

