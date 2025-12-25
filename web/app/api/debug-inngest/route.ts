import { NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const result = await inngest.send({
      name: 'feed/process.url',
      data: {
        url: 'https://example.com',
        userId: user.id
      }
    });

    return NextResponse.json({ 
      message: 'Test event sent', 
      result,
      env: {
        hasInngestKey: !!process.env.INNGEST_EVENT_KEY,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

