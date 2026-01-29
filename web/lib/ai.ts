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
  raw_response?: string; // 用于调试
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
  let rawBaseURL = userConfig?.baseURL || 'https://api.siliconflow.cn/v1';
  let model = userConfig?.model || "deepseek-ai/DeepSeek-V3"; 
  let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

  if (!apiKey) return { title: title || 'Error', summary: 'Missing API Key', takeaways: [], tags: [], category: 'other', emotion: 'neutral', reading_time: 0, status: 'failed' };

  const openai = new OpenAI({ apiKey, baseURL });

  const systemPrompt = `你是一个资深编辑。请分析内容并返回 JSON。
  必须包含 "formatted_content" 字段，它是重构后的全文 Markdown（包含 # 标题）。
  如果 JSON 构造困难，请确保 "formatted_content" 标记清晰。`;

  const userPrompt = `请分析并重构此内容为 Markdown：\n\n标题: ${title}\n内容: ${content.slice(0, 6000)}`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      model: model,
      temperature: 0.3,
      max_tokens: 4000,
    });

    const raw = completion.choices[0].message.content || '';
    let result: any = { formatted_content: '' };

    try {
      const jsonStr = raw.replace(/```json\n?|```/g, '').trim();
      result = JSON.parse(jsonStr);
    } catch (e) {
      const match = raw.match(/"formatted_content":\s*"([\s\S]*?)"/);
      if (match) {
        result.formatted_content = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      } else if (raw.includes('#')) {
        result.formatted_content = raw;
      }
    }

    return {
      title: result.title || title || 'Untitled',
      summary: result.summary || content.slice(0, 200),
      takeaways: result.takeaways || [],
      tags: result.tags || [],
      category: normalizeCategory(result.category),
      emotion: result.emotion || 'neutral',
      reading_time: result.reading_time || Math.ceil(content.length / 500),
      formatted_content: result.formatted_content || result.content || raw,
      status: 'done',
      raw_response: raw.slice(0, 500) // 增加调试长度
    };
  } catch (error: any) {
    return { title: title || 'Error', summary: error.message, takeaways: [], tags: [], category: 'other', emotion: 'neutral', reading_time: 0, status: 'failed' };
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
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      model: model,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
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
  let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

  if (!apiKey) return [];

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
        }
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
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    const content = completion.choices[0].message.content?.replace(/```json\n?|```/g, '').trim() || '{"items":[]}';
    const result = JSON.parse(content);
    return Array.isArray(result.items) ? result.items : [];
  } catch (error: any) {
    console.error("❌ [AI Filter] AI Filtering Failed:", error.message);
    return [];
  }
}
