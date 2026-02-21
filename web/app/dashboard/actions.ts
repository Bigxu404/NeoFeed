'use server'

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';
import { AIConfig } from '@/types/index'; // 🚀 引入类型

export type FeedItem = Database['public']['Tables']['feeds']['Row'];

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
    .limit(100);

  if (error) {
    console.error('Error fetching feeds:', error);
    return { error: error.message, data: [] };
  }

  return { data: data as FeedItem[], error: null };
}

export async function getFeedsCount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: 0, error: 'Unauthorized' };

  const { count, error } = await supabase
    .from('feeds')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error counting feeds:', error);
    return { data: 0, error: error.message };
  }

  return { data: count || 0, error: null };
}

export async function getCategoryDistribution() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Unauthorized' };

  // 使用 RPC 或者复杂的 select 来一次性获取分布，但 Supabase JS SDK 限制较多
  // 这里采用一种更高效的查询方式：只查询 category 字段，不限数量（或者限一个较大的数）
  // 更好的方式是使用 Supabase 的自定义函数 (RPC)，但为了保持代码在 TS 层，我们先尝试 select 关键字段
  const { data, error } = await supabase
    .from('feeds')
    .select('category')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching distribution:', error);
    return { data: null, error: error.message };
  }

  const dist = data.reduce((acc: any, curr: any) => {
    const cat = (curr.category?.toLowerCase() || 'other');
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return { data: dist, error: null };
}

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Unauthorized' };

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return { data: null, error: error.message };
    }

    // 如果 profile 不存在，返回基于 auth user 的默认数据
    if (!data) {
      return {
        data: {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'Neo Walker',
          avatar_url: null,
          active_days: 1,
          api_key: null,
          ai_config: null,
          notification_email: user.email
        },
        error: null
      };
    }

    // Calculate active days based on created_at
    const createdDate = new Date(data.created_at || user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { 
      data: {
        ...data,
        full_name: data.full_name || user.user_metadata?.full_name || 'Neo Walker',
        active_days: diffDays,
        email: user.email || data.email
      }, 
      error: null 
    };
  } catch (err: any) {
    console.error('getUserProfile Critical Error:', err);
    return { data: null, error: err.message };
  }
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
    const isVideo = feed.url?.includes('youtube.com') || feed.url?.includes('youtu.be') || feed.url?.includes('bilibili.com');
    const analysis = await analyzeContent(
      feed.content_raw, 
      feed.url, 
      feed.title, 
      profile?.ai_config as AIConfig, // 🚀 强类型
      isVideo
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

export async function crystallizeFeed(feedId: string, notes: string, tags: string[], weight: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('feeds')
    .update({
      user_notes: notes,
      user_tags: tags,
      user_weight: weight,
    })
    .eq('id', feedId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error crystallizing feed:', error);
    return { error: error.message };
  }

  return { success: true, data };
}

export async function processUrl(url: string) {
    // Placeholder for next step
    console.log("Processing URL:", url);
    return { success: true };
}
