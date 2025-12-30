'use server'

import { createClient } from '@/lib/supabase/server';

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  tags: string[];
  category: string;
  created_at: string;
  status: string;
  source_type?: string;
}

export async function getFeeds() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized', data: [] };
  }

  const { data, error } = await supabase
    .from('feeds')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching feeds:', error);
    return { error: error.message, data: [] };
  }

  return { data: data as FeedItem[], error: null };
}

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return { data: null, error: error.message };
  }

  // Calculate active days based on created_at
  const createdDate = new Date(data.created_at);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return { 
    data: {
      ...data,
      full_name: data.full_name || user.user_metadata?.full_name || null, // 优先使用 profile 表，其次使用 auth 元数据
      active_days: diffDays,
      email: user.email // Ensure email is from auth user
    }, 
    error: null 
  };
}

export async function getLatestWeeklyReport() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('weekly_reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
    console.error('Error fetching weekly report:', error);
    return { data: null, error: error.message };
  }

  return { data: data || null, error: null };
}

export async function deleteFeed(feedId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('feeds')
    .delete()
    .eq('id', feedId)
    .eq('user_id', user.id); 

  if (error) {
    console.error('Error deleting feed:', error);
    return { error: error.message };
  }

  return { success: true };
}

export async function summarizeFeed(feedId: string) {
  const { createAdminClient } = await import('@/lib/supabase/server');
  const { analyzeContent } = await import('@/lib/ai');
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // 1. Get the feed content and user config
  const adminClient = createAdminClient();
  const [{ data: feed }, { data: profile }] = await Promise.all([
    adminClient.from('feeds').select('*').eq('id', feedId).eq('user_id', user.id).single(),
    adminClient.from('profiles').select('ai_config').eq('id', user.id).single()
  ]);

  if (!feed || !feed.content_raw) {
    return { error: '未找到原始内容，无法总结。' };
  }

  try {
    // 2. Run AI Analysis
    const analysis = await analyzeContent(
      feed.content_raw, 
      feed.url, 
      feed.title, 
      profile?.ai_config as any
    );

    // 3. Update DB
    const { data: updatedFeed, error: updateError } = await adminClient
      .from('feeds')
      .update({
        title: analysis.title || feed.title,
        summary: analysis.summary,
        takeaways: analysis.takeaways,
        tags: analysis.tags,
        category: analysis.category,
        emotion: analysis.emotion,
        reading_time: analysis.reading_time,
        status: 'done'
      })
      .eq('id', feedId)
      .select()
      .single();

    if (updateError) throw updateError;

    return { success: true, data: updatedFeed };
  } catch (err: any) {
    console.error('Manual summary failed:', err);
    return { error: err.message || 'AI 总结失败' };
  }
}

export async function processUrl(url: string) {
    // Placeholder for next step
    console.log("Processing URL:", url);
    return { success: true };
}

