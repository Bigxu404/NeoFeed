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

export async function updateProfile(data: { full_name?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id);

  if (error) {
    console.error('Error updating profile:', error);
    return { error: error.message }; // 返回具体的错误信息
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  revalidatePath('/profile');
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const file = formData.get('file') as File;
  if (!file) return { error: 'No file' };

  const fileExt = file.name.split('.').pop();
  const filePath = `${user.id}/${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true, // 允许覆盖
      contentType: file.type
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    if (uploadError.message === 'Bucket not found') {
      return { error: '存储空间 avatars 未创建，请联系管理员或在 Supabase 后台创建' };
    }
    return { error: `上传失败: ${uploadError.message}` };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);

  if (updateError) {
    return { error: 'Failed to update profile with new avatar' };
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  revalidatePath('/profile');
  return { success: true, url: publicUrl };
}

export async function testAiConfig(config: AIConfig) {
  const { analyzeContent } = await import('@/lib/ai');
  
  try {
    const testContent = "这是一条测试消息，用于验证 AI 配置是否正确生效。请简要回答 '连接成功'。";
    const result = await analyzeContent(testContent, "test-url", "Test Connection", config);
    
    if (result.tags.includes('error') || result.summary.includes('AI Key Missing')) {
      return { error: result.summary };
    }
    
    return { success: true, message: result.summary };
  } catch (err: any) {
    return { error: err.message || '连接测试失败' };
  }
}
