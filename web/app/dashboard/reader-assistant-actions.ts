'use server';

import { createClient } from '@/lib/supabase/server';
import { chatCompletion } from '@/lib/ai';
import type { AIConfig } from '@/types/index';

const ARTICLE_CONTEXT_MAX = 6000;

export async function askArticleAssistant(
  feedId: string,
  question: string
): Promise<{ answer?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: '请先登录' };

  const { data: feed, error: feedError } = await supabase
    .from('feeds')
    .select('id, title, content_raw, summary')
    .eq('id', feedId)
    .eq('user_id', user.id)
    .single();

  if (feedError || !feed) return { error: '文章不存在' };

  const { data: notes } = await supabase
    .from('feed_notes')
    .select('content')
    .eq('feed_id', feedId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_config')
    .eq('id', user.id)
    .single();

  const aiConfig = (profile?.ai_config as AIConfig) || null;
  if (!aiConfig?.apiKey) {
    return { error: '未配置 AI API，请在设置中填写 API Key 后使用助手' };
  }

  const articleContent = (feed.content_raw || feed.summary || '').slice(0, ARTICLE_CONTEXT_MAX);
  const userThoughts =
    notes && notes.length > 0
      ? notes.map((n, i) => `[${i + 1}] ${n.content}`).join('\n\n')
      : '（暂无）';

  const systemPrompt = `你是针对当前文章的阅读助手。请根据下面的文章内容与用户已记录的想法，简洁、准确地回答用户问题。若问题与文章关系不大，也可以简短说明并建议用户针对文章内容提问。`;
  const userPrompt = `【文章标题】\n${feed.title || '无标题'}\n\n【文章内容】\n${articleContent}\n\n【用户已记录的想法】\n${userThoughts}\n\n【用户问题】\n${question}`;

  try {
    const answer = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        apiKey: aiConfig.apiKey,
        baseURL: aiConfig.baseURL,
        model: aiConfig.model,
      }
    );
    return { answer: answer || '暂无回复' };
  } catch (e: any) {
    console.error('askArticleAssistant error:', e);
    return { error: e?.message || 'AI 请求失败，请检查设置中的 API 配置' };
  }
}
