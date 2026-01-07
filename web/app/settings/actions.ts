'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { AIConfig } from '@/types/index'
import OpenAI from 'openai'

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
    const testContent = "验证连接。请严格只返回一个 JSON 对象，包含字段 'summary'，内容为 '握手成功'。";
    const result = await analyzeContent(testContent, null, "Test", config);
    
    if (result.status === 'failed') {
      return { error: result.summary };
    }
    
    return { success: true, message: result.summary };
  } catch (err: any) {
    console.error("Test Config Action Failed:", err);
    return { error: err.message || '连接测试过程中发生崩溃' };
  }
}

export async function sendTestWeeklyReport(config: AIConfig) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };
  if (!config.notificationEmail) return { error: '请先填写通知邮箱' };

  try {
    // 1. 获取过去一周的数据
    const adminClient = createAdminClient();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const { data: feeds, error: feedsError } = await adminClient
      .from('feeds')
      .select('title, summary, tags, category, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (feedsError) throw feedsError;
    if (!feeds || feeds.length === 0) {
      return { error: '过去一周内没有抓取到任何内容，无法生成周报。' };
    }

    // 2. 调用 AI 生成汇总
    let apiKey = config.apiKey || process.env.SILICONFLOW_API_KEY;
    let rawBaseURL = config.baseURL || 'https://api.siliconflow.cn/v1';
    let model = config.model || "deepseek-ai/DeepSeek-V3"; 
    let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

    if (config.provider === 'openai') {
      if (!config.baseURL) baseURL = 'https://api.openai.com/v1';
      if (!config.model) model = 'gpt-4o-mini';
    } else if (config.provider === 'deepseek') {
      if (!config.baseURL) baseURL = 'https://api.deepseek.com';
      if (!config.model) model = 'deepseek-chat';
    } else if (config.provider === 'siliconflow') {
      if (!config.baseURL) baseURL = 'https://api.siliconflow.cn/v1';
      if (!config.model) model = 'deepseek-ai/DeepSeek-V3';
    }

    if (!apiKey) return { error: '未配置 AI Key' };

    const openai = new OpenAI({ apiKey, baseURL });
    const feedsContext = feeds.map((f: any) => 
      `- [${(f.category || 'OTHER').toUpperCase()}] ${f.title}: ${f.summary} (标签: ${f.tags?.join(', ') || '无'})`
    ).join('\n');

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: config.prompt },
        { role: "user", content: `这是我过去一周的信息消费记录，请为我生成周报：\n\n${feedsContext}` }
      ],
      model: model,
      temperature: 0.7,
    });

    const reportContent = completion.choices[0].message.content || "生成失败。";

    // 3. 发送邮件 (使用 Brevo API，因为 Resend 被封)
    const brevoKey = process.env.BREVO_API_KEY;
    
    // 🔍 Debug Log: 检查环境变量读取情况
    console.log('--- BREVO DEBUG START ---');
    console.log('BREVO_API_KEY exists:', !!brevoKey);
    if (brevoKey) {
      console.log('BREVO_API_KEY length:', brevoKey.length);
      console.log('BREVO_API_KEY prefix:', brevoKey.slice(0, 10) + '...');
    }
    console.log('--- BREVO DEBUG END ---');

    if (!brevoKey) {
      return { error: '系统未配置邮件服务密钥 (BREVO_API_KEY)。请联系管理员或在环境变量中配置。' };
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: "NeoFeed Intelligence", email: "bot@neofeed.cn" },
        to: [{ email: config.notificationEmail }],
        subject: `【测试】您的每周洞察报告已经准备就绪`,
        htmlContent: `
          <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px 20px; border-radius: 24px;">
            <!-- Header -->
            <div style="margin-bottom: 40px; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.2); border-radius: 100px; color: #f97316; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px;">
                Handshake Success: Test Briefing
              </div>
              <h1 style="font-size: 26px; font-weight: 800; margin: 0; color: #ffffff; letter-spacing: -0.5px;">
                神经周报（测试版）
              </h1>
              <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 8px; font-family: ui-monospace, 'Cascadia Code', monospace;">
                MODE: SIMULATION // TEST_DATE: ${new Date().toLocaleDateString('zh-CN')}
              </p>
            </div>

            <!-- Main Content Card -->
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px; margin-bottom: 32px; border-left: 4px solid #f97316;">
              <h2 style="color: #f97316; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">
                ✨ 核心叙事 Core Narrative
              </h2>
              <div style="font-size: 15px; line-height: 1.8; color: rgba(255,255,255,0.85); white-space: pre-wrap;">
                ${reportContent}
              </div>
            </div>

            <!-- Action Section -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="font-size: 12px; color: rgba(255,255,255,0.3); line-height: 1.6; margin-bottom: 24px;">
                如果您收到了这封邮件，说明您的神经核心与通知系统已成功链入。
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://neofeed.cn'}/insight" style="display: inline-block; padding: 14px 32px; background: #ffffff; color: #000000; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px;">
                测试链接成功 / View Live Center
              </a>
            </div>

            <!-- Footer -->
            <div style="margin-top: 48px; text-align: center;">
              <p style="font-size: 10px; color: rgba(255,255,255,0.15); letter-spacing: 0.5px; text-transform: uppercase;">
                Neural Interface Stable // Finalizing Test
              </p>
            </div>
          </div>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: `邮件发送失败 (Brevo): ${errorData.message || response.statusText}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Test Weekly Report failed:', err);
    return { error: err.message || '测试周报生成失败' };
  }
}
