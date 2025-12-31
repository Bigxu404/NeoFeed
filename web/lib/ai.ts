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
  status?: 'done' | 'failed';
}

// Helper to normalize category
function normalizeCategory(cat: string): AIAnalysisResult['category'] {
  const validCategories = ['tech', 'life', 'idea', 'art', 'other'];
  const lowerCat = cat?.toLowerCase()?.trim() || 'other';
  
  if (validCategories.includes(lowerCat)) {
    return lowerCat as AIAnalysisResult['category'];
  }
  return 'other';
}

export async function analyzeContent(
  content: string, 
  url: string | null, 
  title: string | null,
  userConfig?: {
    provider?: string;
    model?: string;
    apiKey?: string;
  }
): Promise<AIAnalysisResult> {
  // ... (keeping existing analyzeContent code)
}

export async function filterDiscoveryItems(
  items: { title: string; summary: string }[],
  themes: string[],
  userConfig?: {
    provider?: string;
    model?: string;
    apiKey?: string;
  }
): Promise<{ index: number; reason: string }[]> {
  let apiKey = userConfig?.apiKey || process.env.SILICONFLOW_API_KEY;
  let baseURL = 'https://api.siliconflow.cn/v1';
  let model = "deepseek-ai/DeepSeek-V3"; 

  if (userConfig?.provider === 'openai') {
    baseURL = 'https://api.openai.com/v1';
    model = userConfig.model || 'gpt-4o-mini';
  } else if (userConfig?.provider === 'deepseek') {
    baseURL = 'https://api.deepseek.com';
    model = userConfig.model || 'deepseek-chat';
  } else if (userConfig?.provider === 'siliconflow') {
    if (userConfig.model) model = userConfig.model;
  }

  if (!apiKey) return [];

  const openai = new OpenAI({ apiKey, baseURL });

  const systemPrompt = `
    你是一个高级情报官。用户当前关注的主题有：[${themes.join(', ')}]。
    请从以下 RSS 简讯列表中，挑选出最符合用户主题的 Top 7 条。
    
    判定准则：
    1. 语义匹配：理解核心概念，而非简单的关键词包含。
    2. 质量优先：即使与主题稍有偏离，但如果是深度好文也请保留。
    3. 排除噪音：过滤广告、推广、单纯的新闻简讯。

    输出格式要求 (JSON Only):
    {
      "items": [
        { "index": 0, "reason": "为什么推荐这条 (15字以内)" },
        ...
      ]
    }
  `;

  const userContent = items.map((it, i) => `${i}. 标题: ${it.title}\n摘要: ${it.summary.slice(0, 100)}`).join('\n---\n');

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      model: model,
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content?.replace(/```json\n?|```/g, '').trim() || '{"items":[]}';
    const result = JSON.parse(content);
    return Array.isArray(result.items) ? result.items : [];
  } catch (error) {
    console.error("AI Filtering Failed:", error);
    return [];
  }
}
