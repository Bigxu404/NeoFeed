const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// 1. 手动解析 .env.local
const envPath = path.join(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
});

// 配置优先级：环境变量 > .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const AI_KEY = env.SILICONFLOW_API_KEY;
const AI_URL = env.AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
const AI_MODEL = env.AI_MODEL || 'glm-4.5-flash';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !AI_KEY) {
  console.error('❌ 缺失必要配置，请检查 .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: AI_KEY, baseURL: AI_URL });

async function cleanData() {
  console.log('🚀 [Local Clean] 启动本地数据清洗...');
  console.log(`🤖 使用模型: ${AI_MODEL}`);
  console.log(`🔗 使用接口: ${AI_URL}`);

  // 获取需要重构的数据
  const { data: feeds, error } = await supabase
    .from('feeds')
    .select('id, title, content_raw, url')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ 获取数据失败:', error.message);
    return;
  }

  const filtered = feeds.filter(f => {
    const content = f.content_raw || '';
    // 🌟 打印前 5 条的状态
    return true; // 暂时处理所有数据进行测试，或者您可以根据需要修改
  }).slice(0, 5); 

  console.log(`📦 总数据量: ${feeds.length} 条`);
  console.log(`📦 本次尝试处理: ${filtered.length} 条 (测试)`);

  for (const feed of filtered) {
    console.log(`\n📝 正在处理: ${feed.title}`);
    console.log(`   内容预览: ${feed.content_raw.slice(0, 100)}...`);
    
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "你是一个专业的 Markdown 排版专家。请将内容重构为精美的 Markdown，必须包含 # 和 ## 标题。以 JSON 格式返回，字段为 formatted_content。" },
          { role: "user", content: `标题: ${feed.title}\n内容: ${feed.content_raw.slice(0, 6000)}` }
        ],
        model: AI_MODEL,
        temperature: 0.3,
      });

      const raw = completion.choices[0].message.content;
      let formatted = '';
      try {
        const jsonStr = raw.replace(/```json\n?|```/g, '').trim();
        formatted = JSON.parse(jsonStr).formatted_content;
      } catch (e) {
        formatted = raw; // 降级处理
      }

      if (formatted && formatted.length > 20) {
        const { error: updateError } = await supabase
          .from('feeds')
          .update({ content_raw: formatted })
          .eq('id', feed.id);

        if (updateError) throw updateError;
        console.log('✅ 重构成功并已存入数据库');
      } else {
        console.warn('⚠️ AI 返回内容无效，跳过');
      }
    } catch (err) {
      console.error(`❌ 处理失败: ${err.message}`);
    }
    
    // 稍微停顿一下
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n🎉 所有数据清洗完成！');
}

cleanData();
