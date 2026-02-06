'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { AIConfig } from '@/types/index'
import OpenAI from 'openai'
import { inngest } from '@/inngest/client'

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
      return { error: '过去一周内没有手动捕捉到任何内容，无法生成测试报告。' };
    }

    // 2. 调用 AI 生成汇总
    let apiKey = config.apiKey || process.env.SILICONFLOW_API_KEY;
    let rawBaseURL = config.baseURL || 'https://api.siliconflow.cn/v1';
    let model = config.model || "deepseek-ai/DeepSeek-V3"; 
    let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

    if (config.provider === 'volcengine') {
      if (!config.baseURL) baseURL = 'https://ark.cn-beijing.volces.com/api/v3';
      if (!config.model) model = 'doubao-seed-1-8-251228';
    } else if (config.provider === 'openai') {
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
    
    const feedsContext = (feeds || []).map((f: any) => 
      `- [手动捕捉][${(f.category || 'OTHER').toUpperCase()}] ${f.title}: ${f.summary}`
    ).join('\n');

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: config.insightPrompt || config.prompt || "你是一个资深情报分析专家..." },
        { role: "user", content: `这是我本周手动捕捉的信息消费记录，请为我生成深度洞察周报：\n\n${feedsContext}` }
      ],
      model: model,
      temperature: 0.7,
    });

    const reportContent = completion.choices[0].message.content || "生成失败。";

    // 💡 辅助函数：将 AI 返回的 Markdown 简单转化为 HTML 结构，避免源码暴露
    const color = '#1ff40a';
    const cleanContent = reportContent
      .replace(/##\s?(.*)/g, `<h3 style="color: ${color}; font-size: 14px; text-transform: uppercase; margin: 24px 0 12px 0; border-bottom: 1px solid ${color}33; padding-bottom: 4px;">$1</h3>`)
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff;">$1</strong>')
      .replace(/-\s(.*)/g, `<div style="margin-bottom: 8px; color: ${color}cc; font-size: 14px; line-height: 1.6;">• $1</div>`)
      .replace(/\n\n/g, '<br/>');

    // 3. 发送邮件 (使用 Brevo API，因为 Resend 被封)
    const brevoKey = process.env.BREVO_API_KEY;
    
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
        subject: `【测试】您的每周洞察报告 (Insight Report)`,
        htmlContent: `
          <div style="font-family: 'ui-monospace', 'Cascadia Code', monospace; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px 20px; border-radius: 0px; border: 1px solid ${color};">
            <!-- 🌐 顶部状态栏 -->
            <div style="border-bottom: 1px double ${color}33; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: ${color}; font-size: 10px; font-weight: bold; letter-spacing: 2px;">NEURAL-LINK: ACTIVE</span>
              <span style="color: ${color}80; font-size: 10px;">TYPE: TEST_INSIGHT</span>
            </div>

            <!-- 📝 核心报告区 -->
            <h1 style="font-size: 22px; font-weight: 900; margin: 0 0 25px 0; color: #ffffff; text-transform: uppercase; letter-spacing: -0.5px;">
              神经周报 <span style="color: ${color};">FALLOUT_PROTOCOL</span>
            </h1>

            <div style="background: ${color}05; border-radius: 4px; padding: 25px; border-left: 2px solid ${color}; line-height: 1.8;">
              ${cleanContent}
            </div>

            <!-- 🔗 底部操作 -->
            <div style="margin-top: 40px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://neofeed.app'}/insight" 
                 style="display: inline-block; padding: 15px 40px; background: ${color}; color: #000000; text-decoration: none; border-radius: 2px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 20px rgba(31,244,10,0.3);">
                进入洞察中心 / Launch Insight
              </a>
              <p style="color: ${color}33; font-size: 10px; margin-top: 25px;">
                NEOFEED MATRIX // PROTOCOL 0.9.4 // END OF TRANSMISSION
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

export async function triggerRssSync() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    console.log('🔄 [RSS Sync] Triggered by user:', user?.id);

    if (!user) {
      console.warn('⚠️ [RSS Sync] Unauthorized attempt');
      return { error: 'Unauthorized' };
    }

    const adminSupabase = createAdminClient();
    const { data: subscriptions, error: subError } = await adminSupabase
      .from('subscriptions')
      .select('id, url')
      .eq('user_id', user.id);

    if (subError) {
      console.error('❌ [RSS Sync] Database query error:', subError);
      throw subError;
    }

    console.log('🔄 [RSS Sync] Found subscriptions:', subscriptions?.length);

    if (!subscriptions || subscriptions.length === 0) {
      console.warn('⚠️ [RSS Sync] No subscriptions found for user');
      return { error: '您尚未添加任何 RSS 订阅。' };
    }

    const events = subscriptions.map(sub => ({
      name: "sub/poll.rss" as const,
      data: {
        subId: sub.id,
        url: sub.url,
        userId: user.id,
        manual: true
      }
    }));

    const sendRes = await inngest.send(events);
    console.log('✅ [RSS Sync] Inngest send result:', sendRes);

    return { success: true };
  } catch (err: any) {
    console.error('❌ [RSS Sync] Fatal error during trigger:', err);
    return { error: err.message || '触发同步过程中发生系统错误' };
  }
}
