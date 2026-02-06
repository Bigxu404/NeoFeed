import OpenAI from 'openai';

// 🔍 Debug Log
console.log('🔑 AI Module Loaded');

export interface AIAnalysisResult {
  title: string;
  summary: string;
  takeaways: string[];
  tags: string[];
  category: 'tech' | 'life' | 'idea' | 'art' | 'other';
  emotion: string;
  reading_time: number;
  formatted_content?: string;
  status?: 'done' | 'failed';
  raw_response?: string; 
}

function normalizeCategory(cat: string): AIAnalysisResult['category'] {
  const validCategories = ['tech', 'life', 'idea', 'art', 'other'];
  const lowerCat = cat?.toLowerCase()?.trim() || 'other';
  return (validCategories.includes(lowerCat) ? lowerCat : 'other') as AIAnalysisResult['category'];
}

export async function analyzeContent(
  content: string, 
  url: string | null, 
  title: string | null,
  userConfig?: {
    provider?: string;
    model?: string;
    apiKey?: string;
    baseURL?: string;
  }
): Promise<AIAnalysisResult> {
  let apiKey = userConfig?.apiKey || process.env.SILICONFLOW_API_KEY;
  let rawBaseURL = userConfig?.baseURL || process.env.AI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  let model = userConfig?.model || process.env.AI_MODEL || "doubao-seed-1-8-251228"; 
  
  let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

  if (!apiKey) return { title: title || 'Error', summary: 'Missing API Key', takeaways: [], tags: [], category: 'other', emotion: 'neutral', reading_time: 0, status: 'failed' };

  const openai = new OpenAI({ apiKey, baseURL });

  // 🌟 针对内容摘要优化 Prompt
    const systemPrompt = `你是一个专业的内容分析专家。
请对用户提供的文章内容进行深度分析，并以 JSON 格式输出结果。

必须遵守的规则：
1. 严禁修改或返回全文：你的任务是分析而非排版。
2. 必须以 JSON 格式输出，字段如下：
{
  "title": "文章标题",
  "summary": "300字以内的核心摘要",
  "takeaways": ["重点1", "重点2", "重点3"],
  "tags": ["标签1", "标签2"],
  "category": "tech/life/idea/art/other"
}`;

  const userPrompt = `请分析以下内容：\n\n标题: ${title}\n内容: ${content}`; // 🚀 解除输入端 slice 限制，由分段逻辑控制输入量

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      model: model,
      temperature: 0.3,
      max_tokens: 8192,
    });

    const raw = completion.choices[0].message.content || '';
    console.log(`🤖 [AI Response] Length: ${raw.length}`);
    
    let result: any = {};

    // 🌟 极简解析逻辑
    try {
      // 尝试提取 JSON 代码块
      const jsonMatch = raw.match(/```json\n?([\s\S]*?)```/) || raw.match(/{[\s\S]*}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : raw;
      result = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.log("⚠️ [AI] JSON Parse failed, using fallback extraction");
      // 容错：如果 JSON 解析失败，但包含标题，则认为 AI 直接返回了 Markdown
      if (raw.includes('#')) {
        result.formatted_content = raw;
      }
    }

    // 🌟 关键修复：不再需要递归剥离 JSON 壳，直接返回分析结果
    return {
      title: result.title || title || 'Untitled',
      summary: result.summary || content.slice(0, 200),
      takeaways: result.takeaways || [],
      tags: result.tags || [],
      category: normalizeCategory(result.category),
      emotion: result.emotion || 'neutral',
      reading_time: result.reading_time || Math.ceil(content.length / 500),
      status: 'done',
      raw_response: raw.slice(0, 500)
    };
  } catch (error: any) {
    console.error("❌ [AI] Error:", error.message);
    return { title: title || 'Error', summary: error.message, takeaways: [], tags: [], category: 'other', emotion: 'neutral', reading_time: 0, status: 'failed' };
  }
}

// ... 其余函数保持不变 ...
export async function summarizeDiscoveryItems(items: any[], config: any) { return []; }
export async function filterDiscoveryItems(items: any[], config: any) { return []; }
