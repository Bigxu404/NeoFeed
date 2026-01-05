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
    baseURL?: string;
  }
): Promise<AIAnalysisResult> {
  let apiKey = userConfig?.apiKey || process.env.SILICONFLOW_API_KEY;
  let baseURL = userConfig?.baseURL || 'https://api.siliconflow.cn/v1';
  let model = userConfig?.model || "deepseek-ai/DeepSeek-V3"; 

  // 优先级：用户配置的 Provider 预设地址
  if (userConfig?.provider === 'openai') {
    baseURL = userConfig.baseURL || 'https://api.openai.com/v1';
    if (!userConfig.model) model = 'gpt-4o-mini';
  } else if (userConfig?.provider === 'deepseek') {
    baseURL = userConfig.baseURL || 'https://api.deepseek.com';
    if (!userConfig.model) model = 'deepseek-chat';
  } else if (userConfig?.provider === 'siliconflow') {
    baseURL = userConfig.baseURL || 'https://api.siliconflow.cn/v1';
    if (!userConfig.model) model = 'deepseek-ai/DeepSeek-V3';
  } else if (userConfig?.provider === 'custom') {
    baseURL = userConfig.baseURL || baseURL;
  }

  if (!apiKey) {
    console.warn('⚠️ No AI API Key found, using fallback analysis');
    return {
      title: title || 'Untitled Feed',
      summary: 'AI Key 缺失。请在“设置 -> 神经核心”中配置您的 API Key。',
      takeaways: [],
      tags: ['no-key'],
      category: 'other',
      emotion: 'neutral',
      reading_time: 0,
      status: 'failed'
    };
  }

  const openai = new OpenAI({ apiKey, baseURL });

  const systemPrompt = `
    你是一个资深的信息分析专家，擅长从长文本中提取核心价值。
    请分析用户提供的网页内容、标题和 URL，并返回结构化的 JSON 数据。
    
    输出要求：
    1. title: 一个更具吸引力或概括性的标题（如果原标题不佳）。
    2. summary: 一段约 200 字的精华摘要，说明该内容的核心论点。
    3. takeaways: 3-5 条关键洞察或可执行的建议。
    4. tags: 3-5 个相关的标签。
    5. category: 必须是 'tech', 'life', 'idea', 'art', 'other' 之一。
    6. emotion: 简短描述内容的基调（如：积极、批判、冷静、启发）。
    7. reading_time: 预计阅读时间（分钟）。

    注意：必须严格输出 JSON 格式。
  `;

  const userPrompt = `
    URL: ${url || 'N/A'}
    Title: ${title || 'N/A'}
    Content: ${content.slice(0, 15000)}
  `;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: model,
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const resultStr = completion.choices[0].message.content?.replace(/```json\n?|```/g, '').trim() || '{}';
    const parsed = JSON.parse(resultStr);

    return {
      title: parsed.title || title || 'Untitled',
      summary: parsed.summary || 'No summary available.',
      takeaways: Array.isArray(parsed.takeaways) ? parsed.takeaways : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      category: normalizeCategory(parsed.category),
      emotion: parsed.emotion || 'neutral',
      reading_time: parsed.reading_time || Math.ceil(content.length / 500),
      status: 'done'
    };
  } catch (error: any) {
    console.error("AI Analysis Failed:", error);
    
    // 💡 提取具体的错误信息返回给前端
    let errorMessage = "AI 分析过程中出现未知错误。";
    if (error?.status === 401) errorMessage = "API Key 错误或已过期 (401)。";
    else if (error?.status === 402) errorMessage = "账户余额不足 (402)。";
    else if (error?.status === 404) errorMessage = "模型名称或 API 地址错误 (404)。";
    else if (error?.message) errorMessage = `API 报错: ${error.message}`;

    return {
      title: title || 'Analysis Failed',
      summary: errorMessage,
      takeaways: [],
      tags: ['error'],
      category: 'other',
      emotion: 'neutral',
      reading_time: 0,
      status: 'failed'
    };
  }
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
