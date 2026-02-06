/**
 * 🧪 NeoFeed AI 连通性测试 (数据库配置版)
 * 
 * 原理：直接使用您在网页设置中保存的 AI 配置进行测试
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

function getEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  });
  return env;
}

async function testWithDatabaseConfig() {
  const env = getEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  console.log('🔍 [Test] 正在从数据库获取您的 AI 配置...');

  // 获取第一个用户的配置 (开发环境通常只有一个用户)
  const { data: profile, error } = await supabase.from('profiles').select('email, ai_config').limit(1).single();

  if (error || !profile?.ai_config) {
    console.error('❌ [Test] 无法从数据库获取配置:', error?.message || '配置为空');
    return;
  }

  const config = profile.ai_config;
  console.log(`👤 [Test] 正在测试用户 [${profile.email}] 的配置...`);
  console.log(`📡 [Test] Provider: ${config.provider}, Model: ${config.model}`);

  const openai = new OpenAI({ 
    apiKey: config.apiKey, 
    baseURL: config.baseURL || 'https://open.bigmodel.cn/api/paas/v4' 
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: "Hi" }],
      model: config.model,
      max_tokens: 10,
    });
    console.log('✅ [Test] 恭喜！使用您网页设置的 Key 连通成功！');
    console.log('🤖 [Test] AI 回复:', completion.choices[0].message.content);
  } catch (err) {
    console.error('❌ [Test] 仍然失败:', err.message);
  }
}

testWithDatabaseConfig();
