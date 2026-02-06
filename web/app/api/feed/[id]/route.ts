import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  // 必须明确声明为 Promise，否则 Vercel (Next.js 15+) TypeScript 检查会失败
  { params }: { params: Promise<{ id: string }> } 
) {
  // 必须 await 
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 精准查询：获取全文和链接
    const { data, error } = await supabase
      .from('feeds')
      .select('content_raw, url')
      .eq('id', id)
      .eq('user_id', user.id) // 安全检查：只能看自己的
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      content: data.content_raw,
      url: data.url
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
