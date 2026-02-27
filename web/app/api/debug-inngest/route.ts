import { NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';
import { createClient } from '@/lib/supabase/server';

/** 仅开发环境可用：用于手动触发 Inngest 测试事件，生产环境返回 404。 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }
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
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

