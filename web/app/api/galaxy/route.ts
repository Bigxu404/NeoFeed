import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户所有的 feeds，按时间倒序排列
    // ⚠️ 增加 content_raw 和 url 以便在列表和弹窗中使用最新的排版和跳转链接
    const { data, error } = await supabase
      .from('feeds')
      .select('id, title, summary, category, tags, created_at, content_raw, url, user_id, user_notes, user_tags, user_weight')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1000); 

    if (error) {
      throw error;
    }

    console.log(`📡 [API/Galaxy] Found ${data?.length || 0} items for user: ${user.id}`);
    return NextResponse.json({ data, user_id: user.id });

  } catch (error: any) {
    console.error('Error fetching galaxy data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

