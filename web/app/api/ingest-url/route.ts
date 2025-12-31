import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { inngest } from '@/inngest/client';

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
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: corsHeaders });
    }

    // 1. Auth Check (Support Session and API Key)
    let userId: string | null = null;
    let finalSupabase = null;

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        finalSupabase = supabase;
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
          finalSupabase = adminClient;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // 2. 🚀 Create a record
    const adminClient = createAdminClient();
    const { data: initialFeed, error: dbError } = await adminClient
      .from('feeds')
      .insert([{
        user_id: userId,
        url: url,
        title: url, 
        content_raw: "", 
        summary: "正在从移动端链入神经网络...",
        status: 'processing'
      }])
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500, headers: corsHeaders });
    }

    // 3. Trigger Inngest Event
    try {
      await inngest.send({
        name: "feed/process.url",
        data: {
          url: url,
          userId: userId,
          feedId: initialFeed.id,
        },
      });
    } catch (inngestError) {
      console.error(`❌ Inngest Error:`, inngestError);
    }

    return NextResponse.json({ success: true, data: initialFeed }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

