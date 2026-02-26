'use server';

import { createClient } from '@/lib/supabase/server';
import type { FeedNote } from '@/types/database';
import { summarizeUserNotesForFeed } from '@/lib/ai';

export async function getFeedNotes(feedId: string): Promise<{ data: FeedNote[]; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [], error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('feed_notes')
    .select('*')
    .eq('feed_id', feedId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getFeedNotes error:', error);
    return { data: [], error: error.message };
  }
  return { data: (data || []) as FeedNote[], error: null };
}

/**
 * 根据该 feed 下所有 feed_notes 调用 AI 生成总结，写入 feeds.user_notes
 */
export async function syncFeedNotesSummaryToFeed(feedId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data: feedRow } = await supabase
    .from('feeds')
    .select('title')
    .eq('id', feedId)
    .eq('user_id', user.id)
    .single();

  const { data: notes } = await supabase
    .from('feed_notes')
    .select('content, created_at')
    .eq('feed_id', feedId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const summary =
    notes && notes.length > 0
      ? await summarizeUserNotesForFeed(notes, feedRow?.title ?? null)
      : '';

  const { error: updateError } = await supabase
    .from('feeds')
    .update({ user_notes: summary || null })
    .eq('id', feedId)
    .eq('user_id', user.id);

  if (updateError) {
    console.error('syncFeedNotesSummaryToFeed update error:', updateError);
    return { error: updateError.message };
  }
  return { error: null };
}

export async function createFeedNote(
  feedId: string,
  content: string,
  selectedText?: string | null
): Promise<{ data: FeedNote | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Unauthorized' };

  const { data: feed } = await supabase
    .from('feeds')
    .select('id, title')
    .eq('id', feedId)
    .eq('user_id', user.id)
    .single();

  if (!feed) return { data: null, error: 'Feed not found' };

  const { data: inserted, error: insertError } = await supabase
    .from('feed_notes')
    .insert({
      feed_id: feedId,
      user_id: user.id,
      content: content.trim(),
      selected_text: selectedText || null,
    })
    .select()
    .single();

  if (insertError) {
    console.error('createFeedNote error:', insertError);
    return { data: null, error: insertError.message };
  }

  const syncRes = await syncFeedNotesSummaryToFeed(feedId);
  if (syncRes.error) {
    return { data: inserted as FeedNote, error: null };
  }

  return { data: inserted as FeedNote, error: null };
}

export async function updateFeedNote(noteId: string, content: string): Promise<{ data: FeedNote | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Unauthorized' };

  const { data: existing } = await supabase
    .from('feed_notes')
    .select('feed_id')
    .eq('id', noteId)
    .eq('user_id', user.id)
    .single();

  if (!existing) return { data: null, error: 'Note not found' };

  const { data: updated, error: updateError } = await supabase
    .from('feed_notes')
    .update({ content: content.trim() })
    .eq('id', noteId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateError) {
    console.error('updateFeedNote error:', updateError);
    return { data: null, error: updateError.message };
  }

  await syncFeedNotesSummaryToFeed(existing.feed_id);
  return { data: updated as FeedNote, error: null };
}

export async function deleteFeedNote(noteId: string): Promise<{ feedId: string | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { feedId: null, error: 'Unauthorized' };

  const { data: existing } = await supabase
    .from('feed_notes')
    .select('feed_id')
    .eq('id', noteId)
    .eq('user_id', user.id)
    .single();

  if (!existing) return { feedId: null, error: 'Note not found' };

  const { error: deleteError } = await supabase
    .from('feed_notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('deleteFeedNote error:', deleteError);
    return { feedId: null, error: deleteError.message };
  }

  await syncFeedNotesSummaryToFeed(existing.feed_id);
  return { feedId: existing.feed_id, error: null };
}
