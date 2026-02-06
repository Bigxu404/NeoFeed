const { createClient } = require('@supabase/supabase-js');
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

async function forceRepair() {
  const id = 'dd5bc416-aadb-46b0-a589-ff7c7200fec3';
  console.log(`🚀 [Force Repair] 正在处理文章 ID: ${id}`);
  
  const { data: feed, error: fetchError } = await supabase.from('feeds').select('content_raw').eq('id', id).single();
  if (fetchError) return console.error('Fetch Error:', fetchError);

  let content = feed.content_raw || '';
  console.log('--- 原始数据片段 ---');
  console.log(content.slice(0, 200));

  // 1. 强力剥离 Markdown 代码块
  let clean = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

  // 2. 尝试解析 JSON
  try {
    const json = JSON.parse(clean);
    content = json.formatted_content || json.content || clean;
    console.log('✅ JSON 解析成功');
  } catch (e) {
    console.log('⚠️ JSON 解析失败，尝试正则提取...');
    // 正则方案：匹配 "formatted_content": "..."
    const match = clean.match(/"formatted_content":\s*"([\s\S]*?)"(?=,\s*"|\s*})/);
    if (match) {
      // 处理转义字符
      content = match[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\');
      console.log('✅ 正则提取成功');
    } else {
      console.log('❌ 正则提取也失败了，保持原样');
      content = clean;
    }
  }

  // 3. 写回数据库
  const { error: updateError } = await supabase.from('feeds').update({ content_raw: content }).eq('id', id);
  if (updateError) {
    console.error('Update Error:', updateError);
  } else {
    console.log('--- 修复后数据片段 ---');
    console.log(content.slice(0, 200));
    console.log('🎉 数据库更新成功！');
  }
}

forceRepair();
