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

    // 2. Trigger Inngest Event (Async Processing)
    console.log(`📡 [Ingest API] Sending event to Inngest for URL: ${url}`);
    
    try {
      await inngest.send({
        name: "feed/process.url",
        data: {
          url: url,
          userId: user.id,
        },
      });
      console.log(`✅ [Ingest API] Event successfully sent to Inngest`);
    } catch (inngestError: any) {
      console.error(`❌ [Ingest API] Failed to send event to Inngest:`, inngestError);
      throw inngestError;
    }

    // 3. Immediate Response
    return NextResponse.json({ 
      success: true, 
      message: "Processing started",
      status: "queued" 
    });

  } catch (error: any) {
    console.error('❌ [Ingest] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

