import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户所有的 feeds，按时间倒序排列
    // ⚠️ 优化：不返回 content_raw 以节省带宽
    const { data, error } = await supabase
      .from('feeds')
      .select('id, title, summary, category, tags, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });

  } catch (error: any) {
    console.error('Error fetching galaxy data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

