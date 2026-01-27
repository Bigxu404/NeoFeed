'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { inngest } from '@/inngest/client';

export interface DiscoveryItem {
  id: string;
  title: string;
  url: string;
  summary: string;
  source_name: string;
  reason: string;
  category?: string;
  created_at: string;
}

export async function getDiscoveryItems() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('discovery_stream')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching discovery items:', error);
    return { data: [], error: error.message };
  }

  return { data: data as DiscoveryItem[], error: null };
}

// 订阅源管理
export async function getSubscriptions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, url, themes, created_at')
    .eq('user_id', user.id);

  if (error) return { data: [], error: error.message };
  return { data, error: null };
}

export async function addSubscription(url: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: newSub, error } = await supabase
    .from('subscriptions')
    .insert([{ user_id: user.id, url, themes: [] }])
    .select()
    .single();

  if (error) return { error: error.message };

  // 💡 关键改进：添加新订阅后，立即触发一次 Inngest 抓取任务，避免界面一直为空
  if (newSub) {
    try {
      await inngest.send({
        name: "sub/poll.rss",
        data: {
          subId: newSub.id,
          url: newSub.url,
          userId: user.id,
        },
      });
    } catch (err) {
      console.error('Failed to trigger initial RSS poll:', err);
    }
  }

  revalidatePath('/settings');
  revalidatePath('/insight');
  return { success: true };
}

export async function triggerAllSubscriptionsSync() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  console.log(`🚀 [Inngest] Manually triggering full RSS sync for user: ${user.id}`);
  console.log(`📡 [Inngest] Event Key Present: ${!!process.env.INNGEST_EVENT_KEY}`);

  // 获取该用户所有的订阅
  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('id, url')
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  if (!subs || subs.length === 0) return { success: true, count: 0 };

  // 批量发送同步请求
  const events = subs.map(sub => ({
    name: "sub/poll.rss",
    data: {
      subId: sub.id,
      url: sub.url,
      userId: user.id
    }
  }));

  try {
    const res = await inngest.send(events);
    console.log(`✅ [Inngest] RSS Sync Events sent. IDs:`, res.ids);
    return { success: true, count: subs.length };
  } catch (err: any) {
    console.error(`❌ [Inngest] RSS Sync trigger failed:`, err);
    return { error: err.message };
  }
}

export async function deleteSubscription(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/settings');
  return { success: true };
}
