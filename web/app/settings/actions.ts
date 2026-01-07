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

    // 💡 辅助函数：将 AI 返回的 Markdown 简单转化为 HTML 结构，避免源码暴露
    const cleanContent = reportContent
      .replace(/##\s?(.*)/g, '<h3 style="color: #f97316; font-size: 14px; text-transform: uppercase; margin: 24px 0 12px 0; border-bottom: 1px solid rgba(249,115,22,0.2); padding-bottom: 4px;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff;">$1</strong>')
      .replace(/-\s(.*)/g, '<div style="margin-bottom: 8px; color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6;">• $1</div>')
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
        subject: `【测试】您的每周洞察报告已经准备就绪`,
        htmlContent: `
          <div style="font-family: 'ui-monospace', 'Cascadia Code', monospace; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px 20px; border-radius: 0px; border: 1px solid #1a1a1a;">
            <!-- 🌐 顶部状态栏 -->
            <div style="border-bottom: 1px double rgba(255,255,255,0.1); padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #f97316; font-size: 10px; font-weight: bold; letter-spacing: 2px;">NEURAL-LINK: ACTIVE</span>
              <span style="color: rgba(255,255,255,0.3); font-size: 10px;">ID: ${Math.random().toString(36).slice(2, 10).toUpperCase()}</span>
            </div>

            <!-- 🌌 星系快报模块 -->
            <div style="margin-bottom: 40px; background: linear-gradient(180deg, rgba(249,115,22,0.05) 0%, transparent 100%); padding: 20px; border-radius: 12px; border: 1px solid rgba(249,115,22,0.1);">
              <div style="font-size: 10px; color: rgba(255,255,255,0.4); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Weekly Galaxy Snapshot</div>
              <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                  <div style="font-size: 24px; font-weight: bold; color: #ffffff;">${feeds.length}</div>
                  <div style="font-size: 9px; color: #f97316; text-transform: uppercase;">星体捕获 New Stars</div>
                </div>
                <div style="flex: 1; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 20px;">
                  <div style="font-size: 24px; font-weight: bold; color: #ffffff;">100%</div>
                  <div style="font-size: 9px; color: #f97316; text-transform: uppercase;">同步率 Sync Rate</div>
                </div>
              </div>
            </div>

            <!-- 📝 核心报告区 -->
            <h1 style="font-size: 22px; font-weight: 900; margin: 0 0 25px 0; color: #ffffff; text-transform: uppercase; letter-spacing: -0.5px;">
              神经周报 <span style="color: #f97316;">SIMULATION_MODE</span>
            </h1>

            <div style="background: rgba(255,255,255,0.02); border-radius: 16px; padding: 25px; border-left: 2px solid #f97316; line-height: 1.8;">
              ${cleanContent}
            </div>

            <!-- 🔗 底部操作 -->
            <div style="margin-top: 40px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://neofeed.cn'}/insight" 
                 style="display: inline-block; padding: 15px 40px; background: #f97316; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 20px rgba(249,115,22,0.3);">
                接入知识星系 / ENTER GALAXY
              </a>
              <p style="color: rgba(255,255,255,0.2); font-size: 10px; margin-top: 25px;">
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
  const { createClient } = await import('@/lib/supabase/client');
  const { inngest } = await import('@/inngest/client');
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  try {
    // 获取该用户的所有订阅
    const adminSupabase = (await import('@/lib/supabase/server')).createAdminClient();
    const { data: subscriptions } = await adminSupabase
      .from('subscriptions')
      .select('id, url, themes')
      .eq('user_id', user.id);

    if (!subscriptions || subscriptions.length === 0) {
      return { error: '您尚未添加任何 RSS 订阅。' };
    }

    // 为每个订阅触发一次同步
    const events = subscriptions.map(sub => ({
      name: "sub/poll.rss" as const,
      data: {
        subId: sub.id,
        url: sub.url,
        themes: sub.themes,
        userId: user.id,
        manual: true
      }
    }));

    await inngest.send(events);

    return { success: true };
  } catch (err: any) {
    console.error('RSS Sync Trigger failed:', err);
    return { error: err.message || '触发同步失败' };
  }
}
