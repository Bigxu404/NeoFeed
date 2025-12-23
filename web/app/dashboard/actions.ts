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

export async function processUrl(url: string) {
    // Placeholder for next step
    console.log("Processing URL:", url);
    return { success: true };
}

