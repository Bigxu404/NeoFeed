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

async function repairAllBrokenJson() {
  console.log('🔍 [Repair] 正在扫描并修复数据库中被错误保存为 JSON 的内容...');
  
  const { data: feeds, error } = await supabase.from('feeds').select('id, title, content_raw');
  if (error) return console.error('Error:', error);

  let fixCount = 0;
  for (const feed of feeds) {
    let content = feed.content_raw || '';
    let isBroken = content.trim().startsWith('{') || content.trim().startsWith('```json');
    
    if (isBroken) {
      console.log(`🛠️ [Repair] 修复中: ${feed.title}`);
      let retries = 0;
      while (typeof content === 'string' && (content.trim().startsWith('{') || content.trim().startsWith('```json')) && retries < 3) {
        try {
          const cleanStr = content.replace(/```json\n?|```/g, '').trim();
          const json = JSON.parse(cleanStr);
          content = json.formatted_content || json.content || cleanStr;
          retries++;
        } catch (e) { break; }
      }

      const { error: updateError } = await supabase.from('feeds').update({ content_raw: content }).eq('id', feed.id);
      if (!updateError) fixCount++;
    }
  }

  console.log(`✅ [Repair] 修复完成！共修复 ${fixCount} 条数据。`);
}

repairAllBrokenJson();
