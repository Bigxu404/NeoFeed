const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const envPath = path.join(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ 
  apiKey: env.SILICONFLOW_API_KEY, 
  baseURL: env.AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4' 
});

async function reprocessMiniMax() {
  const targetIds = [
    '9a0b0b49-74d9-4eb2-ac76-ad109bf0cfe9',
    'fddd8909-a82e-4d62-b3a3-4335a329226c',
    'dd5bc416-aadb-46b0-a589-ff7c7200fec3',
    'cbc0b4c6-c7a2-4e5a-b8c5-0586ff035c13'
  ];

  for (const id of targetIds) {
    const { data: feed } = await supabase.from('feeds').select('*').eq('id', id).single();
    if (!feed) continue;

    console.log(`\n🚀 正在深度重洗: ${feed.title}`);
    console.log(`🔗 URL: ${feed.url}`);

    try {
      // 1. 重新抓取 (使用 Jina Reader 确保完整性)
      const jinaUrl = 'https://r.jina.ai/' + encodeURIComponent(feed.url);
      console.log('🕵️ 尝试重新抓取 (Jina)...');
      const jinaRes = await fetch(jinaUrl, { 
        headers: { 'Accept': 'application/json', 'X-With-Images-Summary': 'true' } 
      });
      
      let rawContent = '';
      if (jinaRes.ok) {
        const jinaData = await jinaRes.json();
        const data = jinaData.data || jinaData;
        rawContent = data.content || '';
      }

      if (!rawContent || rawContent.length < 500) {
        console.warn('⚠️ Jina 抓取失败或内容过短，使用数据库现有内容重排...');
        rawContent = feed.content_raw;
      }

      console.log(`✅ 抓取完成，长度: ${rawContent.length}`);

      // 2. AI 深度重构 (使用最新的 15000 限制)
      console.log('🧠 AI 正在重构排版...');
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: '你是一个专业的 Markdown 排版专家。请将内容重构为精美的 Markdown，必须包含 # 和 ## 标题。保留图片。以 JSON 格式返回，字段为 formatted_content, summary, tags, category, takeaways。' },
          { role: 'user', content: `标题: ${feed.title}\n内容: ${rawContent.slice(0, 15000)}` }
        ],
        model: env.AI_MODEL || 'glm-4.5-flash',
        temperature: 0.3,
      });

      const raw = completion.choices[0].message.content;
      let result = {};
      try {
        const jsonStr = raw.replace(/```json\n?|```/g, '').trim();
        result = JSON.parse(jsonStr);
      } catch (e) {
        result.formatted_content = raw;
      }

      const finalContent = result.formatted_content || raw;

      // 3. 更新数据库
      const { error: updateError } = await supabase
        .from('feeds')
        .update({
          content_raw: finalContent,
          summary: result.summary || feed.summary,
          tags: result.tags || feed.tags,
          category: result.category || feed.category,
          takeaways: result.takeaways || feed.takeaways,
          status: 'done'
        })
        .eq('id', id);

      if (updateError) throw updateError;
      console.log('✨ 重洗成功！');

    } catch (err) {
      console.error(`❌ 处理失败: ${err.message}`);
    }
  }
}

reprocessMiniMax();
