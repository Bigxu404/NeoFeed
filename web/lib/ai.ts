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
  let rawBaseURL = userConfig?.baseURL || 'https://api.siliconflow.cn/v1';
  let model = userConfig?.model || "deepseek-ai/DeepSeek-V3"; 

  // 1. 自动修正 Base URL 格式 (移除末尾空格和斜杠)
  let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

  // 2. 优先级：根据 Provider 预设地址
  if (userConfig?.provider === 'openai') {
    if (!userConfig.baseURL) baseURL = 'https://api.openai.com/v1';
    if (!userConfig.model) model = 'gpt-4o-mini';
  } else if (userConfig?.provider === 'deepseek') {
    if (!userConfig.baseURL) baseURL = 'https://api.deepseek.com';
    if (!userConfig.model) model = 'deepseek-chat';
  } else if (userConfig?.provider === 'siliconflow') {
    if (!userConfig.baseURL) baseURL = 'https://api.siliconflow.cn/v1';
    if (!userConfig.model) model = 'deepseek-ai/DeepSeek-V3';
  }

  if (!apiKey) {
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
    你是一个资深的信息分析专家。
    请分析用户提供的网页内容，并严格以 JSON 格式返回以下字段：
    {
      "title": "概括性标题",
      "summary": "一段约 300 字的深度精华摘要，要求逻辑清晰，涵盖文章的核心论点、背景和结论。",
      "takeaways": ["关键洞察1", "2", "3"],
      "tags": ["标签1", "2"],
      "category": "tech/life/idea/art/other",
      "emotion": "基调描述",
      "reading_time": 预计分钟数
    }
  `;

  const userPrompt = `
    URL: ${url || 'N/A'}
    Title: ${title || 'N/A'}
    Content: ${content.slice(0, 15000)}
  `;

    try {
    const params: any = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: model,
      temperature: 0.3,
    };

    // 💡 只有官方或明确支持的模型才开启 response_format
    const isOfficialOpenAI = baseURL.includes('api.openai.com');
    const isOfficialDeepSeek = baseURL.includes('api.deepseek.com');
    const isHighEndModel = model.toLowerCase().includes('deepseek-v3') || model.toLowerCase().includes('gpt-4');

    if (isOfficialOpenAI || isOfficialDeepSeek || (baseURL.includes('siliconflow') && isHighEndModel)) {
      params.response_format = { type: "json_object" };
    }

    const completion = await openai.chat.completions.create(params);
    
    // 🛡️ 极其严格的防御性检查
    if (!completion || !completion.choices || completion.choices.length === 0) {
      throw new Error("API 返回了空响应或 choices 字段缺失。这通常是由于模型名称错误或账户权限问题导致的。");
    }

    const firstChoice = completion.choices[0];
    if (!firstChoice.message || !firstChoice.message.content) {
      throw new Error("API 响应中没有内容 (Empty message content)。");
    }

    const resultStr = firstChoice.message.content.replace(/```json\n?|```/g, '').trim() || '{}';
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
    
    let errorMessage = `API 报错: ${error.message || '未知错误'}`;
    if (error?.status === 400) errorMessage = "请求无效 (400)。请检查模型名称是否正确，或尝试更换 API 代理地址。";
    if (error?.status === 401) errorMessage = "API Key 错误 (401)。";
    if (error?.status === 404) errorMessage = "接口地址错误 (404)。请确保 Base URL 以 /v1 结尾。";

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
    baseURL?: string;
  }
): Promise<{ index: number; reason: string }[]> {
  let apiKey = userConfig?.apiKey || process.env.SILICONFLOW_API_KEY;
  let rawBaseURL = userConfig?.baseURL || 'https://api.siliconflow.cn/v1';
  let model = userConfig?.model || "deepseek-ai/DeepSeek-V3"; 

  // 自动修正 Base URL
  let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

  if (userConfig?.provider === 'openai') {
    if (!userConfig.baseURL) baseURL = 'https://api.openai.com/v1';
    model = userConfig.model || 'gpt-4o-mini';
  } else if (userConfig?.provider === 'deepseek') {
    if (!userConfig.baseURL) baseURL = 'https://api.deepseek.com';
    model = userConfig.model || 'deepseek-chat';
  } else if (userConfig?.provider === 'siliconflow') {
    if (!userConfig.baseURL) baseURL = 'https://api.siliconflow.cn/v1';
    if (userConfig.model) model = userConfig.model;
  }

  console.log(`🤖 [AI Filter] Config: Provider=${userConfig?.provider || 'default'}, Model=${model}, HasKey=${!!apiKey}`);

  if (!apiKey) {
    console.error("❌ [AI Filter] No API Key provided for filtering.");
    return [];
  }

  const openai = new OpenAI({ apiKey, baseURL });

  const systemPrompt = `
    你是一个高级情报官。用户当前关注的主题有：[${themes.join(', ')}]。
    请从以下 RSS 简讯列表中，挑选出最符合用户主题的 Top 7 条。
    
    判定准则：
    1. 语义匹配：理解核心概念，并尽可能从提供的内容中寻找与用户主题相关的信号。
    2. 宁缺毋滥，但也不要太吝啬：如果当前文章质量尚可，请尽可能填满 Top 3 到 Top 7。
    3. 排除噪音：过滤广告和单纯的新闻简讯。

    输出格式要求 (JSON Only):
    {
      "items": [
        { "index": 0, "reason": "为什么推荐这条 (请务必使用中文，15字以内)" },
        ...
      ]
    }
  `;

  const userContent = items.map((it, i) => `${i}. 标题: ${it.title}\n摘要: ${it.summary.slice(0, 100)}`).join('\n---\n');

  try {
    const params: any = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      model: model,
      temperature: 0.3,
    };

    // 💡 智能判断是否开启 JSON Mode
    const isOfficialOpenAI = baseURL.includes('api.openai.com');
    const isOfficialDeepSeek = baseURL.includes('api.deepseek.com');
    const isHighEndModel = model.toLowerCase().includes('deepseek-v3') || model.toLowerCase().includes('gpt-4');

    if (isOfficialOpenAI || isOfficialDeepSeek || (baseURL.includes('siliconflow') && isHighEndModel)) {
      params.response_format = { type: "json_object" };
    }

    const completion = await openai.chat.completions.create(params);
    const content = completion.choices[0].message.content?.replace(/```json\n?|```/g, '').trim() || '{"items":[]}';
    
    console.log(`🤖 [AI Filter] Raw Response for ${items.length} items:`, content.slice(0, 100) + '...');
    
    const result = JSON.parse(content);
    return Array.isArray(result.items) ? result.items : [];
  } catch (error: any) {
    console.error("❌ [AI Filter] AI Filtering Failed:", error.message);
    return [];
  }
}
