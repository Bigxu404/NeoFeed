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
  },
  isVideo?: boolean
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
    你是一个资深的信息分析专家。${isVideo ? '当前处理的内容是一个视频的转录稿或描述。' : ''}
    请分析用户提供的网页内容${isVideo ? '（视频内容）' : ''}，并严格以 JSON 格式返回以下字段：
    {
      "title": "概括性标题",
      "summary": "一段约 300 字的深度精华摘要，要求逻辑清晰，涵盖${isVideo ? '视频的核心观点、背景和结论' : '文章的核心论点、背景和结论'}。",
      "takeaways": ["关键洞察1", "2", "3"],
      "tags": ["标签1", "2"],
      "category": "tech/life/idea/art/other",
      "emotion": "基调描述",
      "reading_time": 10
    }
    注意：
    1. reading_time 请返回一个整数数字。
    ${isVideo ? '2. 如果内容包含时间戳，请在摘要中适当提及关键时间点的突破性观点。' : ''}
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

export async function summarizeDiscoveryItems(
  items: { title: string; summary: string; url: string; source_name: string }[],
  userConfig?: {
    provider?: string;
    model?: string;
    apiKey?: string;
    baseURL?: string;
  }
): Promise<{ 
  index: number; 
  structured_summary: {
    topic: string;
    method: string;
    result: string;
    one_sentence: string;
  };
  tags: string[];
}[]> {
  let apiKey = userConfig?.apiKey || process.env.SILICONFLOW_API_KEY;
  let rawBaseURL = userConfig?.baseURL || 'https://api.siliconflow.cn/v1';
  let model = userConfig?.model || "deepseek-ai/DeepSeek-V3"; 
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

  if (!apiKey || items.length === 0) return [];

  const openai = new OpenAI({ apiKey, baseURL });

  const systemPrompt = `
    你是一个资深科研情报分析官。请对以下 RSS 文章列表进行结构化深度分析。
    
    输出格式要求 (JSON Only):
    {
      "results": [
        {
          "index": 0,
          "structured_summary": {
            "topic": "该论文/文章的研究主题",
            "method": "该研究采用的研究方式/技术路径",
            "result": "该研究得出的主要结果/发现",
            "one_sentence": "一句话总结：[主体]做了[什么事情]，解决了[什么问题]"
          },
          "tags": ["关键词1", "关键词2", "关键词3"]
        }
      ]
    }
    注意：
    1. 请务必使用中文。
    2. 总结要精炼、准确，特别是“一句话总结”要具有闭环逻辑。
    3. tags 请返回 3-5 个反映内容核心的关键词标签。
  `;

  const userContent = items.map((it, i) => `${i}. 标题: ${it.title}\n摘要: ${it.summary.slice(0, 500)}`).join('\n---\n');

  try {
    const params: any = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      model: model,
      temperature: 0.3,
    };

    const isOfficialOpenAI = baseURL.includes('api.openai.com');
    const isOfficialDeepSeek = baseURL.includes('api.deepseek.com');
    const isHighEndModel = model.toLowerCase().includes('deepseek-v3') || model.toLowerCase().includes('gpt-4');

    if (isOfficialOpenAI || isOfficialDeepSeek || (baseURL.includes('siliconflow') && isHighEndModel)) {
      params.response_format = { type: "json_object" };
    }

    const completion = await openai.chat.completions.create(params);
    const resContent = completion.choices[0].message.content?.replace(/```json\n?|```/g, '').trim() || '{"results":[]}';
    const parsed = JSON.parse(resContent);
    
    return Array.isArray(parsed.results) ? parsed.results : [];
  } catch (error: any) {
    console.error("❌ [AI Summarize] Failed:", error.message);
    return [];
  }
}

export async function filterDiscoveryItems(
  items: { title: string; summary: string }[],
  userConfig?: {
    provider?: string;
    model?: string;
    apiKey?: string;
    baseURL?: string;
  }
): Promise<{ index: number; reason: string; category: string }[]> {
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
    你是一个资深情报分析官。请从以下 RSS 简讯列表中，挑选出最具价值、最值得阅读的 Top 7 条内容。
    
    挑选准则：
    1. 洞察力优先：优先选择那些能够提供独特视角、深度分析、行业趋势或跨学科思考的内容。
    2. 质量过滤：剔除纯新闻简报、硬广告、低质量聚合内容或过于碎片化的信息。
    3. 领域覆盖：尽量覆盖技术趋势、商业洞察、生活哲学、设计美学等不同领域。

    输出格式要求 (JSON Only):
    {
      "items": [
        { 
          "index": 0, 
          "reason": "为什么推荐这条 (请务必使用中文，15字以内)",
          "category": "该内容的AI分类 (如：前沿技术、商业洞察、生活哲学、设计美学等，简短，4个字以内)"
        },
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