const { parseHTML } = require('linkedom');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    env[key] = value;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: env.SILICONFLOW_API_KEY, baseURL: env.AI_BASE_URL });

async function deepClean() {
  const url = 'https://mp.weixin.qq.com/s/gJ9PClGTCGXicRzjRt7zOA';
  const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 NetType/WIFI Language/zh_CN';
  
  console.log('🕵️ 正在进行二次深度抓取...');
  try {
    const response = await fetch(url, { headers: { 'User-Agent': userAgent } });
    const html = await response.text();
    const { document } = parseHTML(html);
    
    const contentNode = document.getElementById('js_content');
    if (!contentNode) return console.error('❌ 抓取失败');

    // 🌟 特别处理：微信图片的占位符替换
    contentNode.querySelectorAll('img').forEach(img => {
      const dataSrc = img.getAttribute('data-src');
      if (dataSrc) {
        const placeholder = document.createTextNode(`\n![image](${dataSrc})\n`);
        img.parentNode.replaceChild(placeholder, img);
      }
    });

    const fullText = contentNode.textContent || '';
    console.log('✅ 抓取成功，长度:', fullText.length);

    console.log('🧠 AI 正在进行终极重构...');
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: '你是一个顶级的 Markdown 编辑。请将内容重构为精美的文档。必须包含 # 标题，## 段落。保留所有的 ![image](url) 链接。输出 JSON 格式，包含 formatted_content 字段。' },
        { role: 'user', content: '内容：' + fullText.slice(0, 15000) }
      ],
      model: env.AI_MODEL || 'glm-4.5-flash',
      temperature: 0.3
    });

    const raw = completion.choices[0].message.content;
    let result = {};
    try {
      const jsonStr = raw.replace(/```json\n?|```/g, '').trim();
      result = JSON.parse(jsonStr);
    } catch (e) {
      result.formatted_content = raw;
    }

    console.log('💾 正在存入数据库...');
    const { error } = await supabase
      .from('feeds')
      .update({
        content_raw: result.formatted_content || raw,
        summary: result.summary,
        tags: result.tags,
        status: 'done'
      })
      .eq('id', 'cbc0b4c6-c7a2-4e5a-b8c5-0586ff035c13');

    if (error) console.error('❌ 存库失败:', error.message);
    else console.log('✨ 深度重洗完成！');
  } catch (err) {
    console.error('❌ 运行出错:', err.message);
  }
}

deepClean();
