'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

// ... existing code ...

export async function generateApiKey() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // 生成一个 sk_neofeed_ 开头的随机 Key
  const randomBytes = crypto.randomBytes(24).toString('hex')
  const newApiKey = `sk_neofeed_${randomBytes}`

  const { error } = await supabase
    .from('profiles')
    .update({ api_key: newApiKey })
    .eq('id', user.id)

  if (error) {
    console.error('Error generating API key:', error)
    return { error: 'Failed to generate API key' }
  }

  revalidatePath('/settings')
  return { apiKey: newApiKey }
}

export async function getApiKey() {
  const supabase = await createClient()
  const { data: { user } = {} } = await supabase.auth.getUser()

  if (!user) return { apiKey: null }

  const { data, error } = await supabase
    .from('profiles')
    .select('api_key')
    .eq('id', user.id)
    .single()

  if (error) {
    return { apiKey: null }
  }

  return { apiKey: data.api_key }
}

// ✨ 新增：AI 配置相关 Actions

export interface AIConfig {
  provider: 'openai' | 'deepseek' | 'siliconflow';
  model: string;
  apiKey?: string;
  prompt: string;
  notificationEmail?: string; // New field
}

export async function getAiConfig() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { config: null };

  const { data, error } = await supabase
    .from('profiles')
    .select('ai_config')
    .eq('id', user.id)
    .single();

  if (error || !data) return { config: null };

  return { config: data.ai_config as AIConfig };
}

export async function updateAiConfig(config: AIConfig) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  // TODO: Add validation if needed

  const { error } = await supabase
    .from('profiles')
    .update({ ai_config: config })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating AI config:', error);
    return { error: 'Failed to update configuration' };
  }

  revalidatePath('/settings');
  return { success: true };
}
