import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Await params if running on newer Next.js (15+), though here we treat as Promise just in case
  const { id } = await Promise.resolve(params);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 精准查询：只获取这一个 Feed 的全文
    const { data, error } = await supabase
      .from('feeds')
      .select('content_raw')
      .eq('id', id)
      .eq('user_id', user.id) // 安全检查：只能看自己的
      .single();

    if (error) throw error;

    return NextResponse.json({ content: data.content_raw });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
