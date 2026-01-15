'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
    .order('created_at', { ascending: false })
    .limit(7);

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

  const { error } = await supabase
    .from('subscriptions')
    .insert([{ user_id: user.id, url, themes: [] }]);

  if (error) return { error: error.message };
  revalidatePath('/settings');
  return { success: true };
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

