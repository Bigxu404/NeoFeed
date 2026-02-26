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

// RSS 发现流 AI 结构化总结
export async function summarizeDiscoveryItems(
  items: { title: string; summary: string; url: string; source_name: string }[],
  config: any
): Promise<{ index: number; structured_summary: { topic: string; method: string; result: string; one_sentence: string }; tags: string[] }[]> {
  if (!items || items.length === 0) return [];

  let apiKey = config?.apiKey || process.env.SILICONFLOW_API_KEY;
  let rawBaseURL = config?.baseURL || process.env.AI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  let model = config?.model || process.env.AI_MODEL || 'doubao-seed-1-8-251228';
  let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

  if (!apiKey) {
    console.error('❌ [summarizeDiscoveryItems] No API key available');
    return [];
  }

  const openai = new OpenAI({ apiKey, baseURL });

  const systemPrompt = `你是一个专业的信息分析师。用户会给你一批 RSS 文章标题和摘要，请对每篇文章进行结构化总结。

请以 JSON 数组格式输出，每个元素包含：
{
  "index": 文章在列表中的序号(从0开始),
  "structured_summary": {
    "topic": "研究/讨论的核心主题（一句话）",
    "method": "采用的方法或论述角度（一句话，如果不明确可写'综合分析'）",
    "result": "核心结论或发现（一两句话）",
    "one_sentence": "一句话概括这篇文章的价值（用于推荐理由）"
  },
  "tags": ["标签1", "标签2"]
}

要求：
1. 必须输出合法 JSON 数组
2. 每篇文章都要分析，不要遗漏
3. 使用中文输出
4. tags 最多3个，简洁有力`;

  // 构建文章列表
  const articleList = items.map((item, i) => 
    `[${i}] 标题: ${item.title}\n摘要: ${(item.summary || '').slice(0, 500)}`
  ).join('\n\n');

  const userPrompt = `请分析以下 ${items.length} 篇文章：\n\n${articleList}`;

  try {
    console.log(`🤖 [summarizeDiscoveryItems] Sending ${items.length} items to AI...`);
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model,
      temperature: 0.3,
      max_tokens: 8192,
    });

    const raw = completion.choices[0].message.content || '';
    console.log(`🤖 [summarizeDiscoveryItems] AI response length: ${raw.length}`);

    // 解析 JSON
    let results: any[] = [];
    try {
      const jsonMatch = raw.match(/```json\n?([\s\S]*?)```/) || raw.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : raw;
      results = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error('❌ [summarizeDiscoveryItems] JSON parse failed, trying line-by-line');
      // 容错：尝试逐行提取
      try {
        const arrMatch = raw.match(/\[[\s\S]*\]/);
        if (arrMatch) results = JSON.parse(arrMatch[0]);
      } catch (e2) {
        console.error('❌ [summarizeDiscoveryItems] All parse attempts failed');
        return [];
      }
    }

    if (!Array.isArray(results)) {
      console.error('❌ [summarizeDiscoveryItems] Result is not an array');
      return [];
    }

    // 确保每个结果都有正确的结构
    return results.map(r => ({
      index: r.index ?? 0,
      structured_summary: {
        topic: r.structured_summary?.topic || '未知主题',
        method: r.structured_summary?.method || '综合分析',
        result: r.structured_summary?.result || '暂无结论',
        one_sentence: r.structured_summary?.one_sentence || r.structured_summary?.topic || '值得关注'
      },
      tags: r.tags || []
    })).filter(r => r.index >= 0 && r.index < items.length);

  } catch (error: any) {
    console.error('❌ [summarizeDiscoveryItems] API Error:', error.message);
    // 降级：不调用 AI，直接返回基础结构
    return items.map((item, i) => ({
      index: i,
      structured_summary: {
        topic: item.title,
        method: '综合分析',
        result: (item.summary || '').slice(0, 200),
        one_sentence: item.title
      },
      tags: ['RSS']
    }));
  }
}

export async function filterDiscoveryItems(items: any[], config: any) { return items; }

export async function extractUserKeywords(
  feeds: { title: string | null; summary: string | null; user_notes: string | null }[],
  userConfig?: { apiKey?: string; baseURL?: string; model?: string }
): Promise<string[]> {
  let apiKey = userConfig?.apiKey || process.env.SILICONFLOW_API_KEY;
  let rawBaseURL = userConfig?.baseURL || process.env.AI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  let model = userConfig?.model || process.env.AI_MODEL || "doubao-seed-1-8-251228"; 
  let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

  if (!apiKey) {
    console.error('❌ [extractUserKeywords] No API key');
    return [];
  }

  const openai = new OpenAI({ apiKey, baseURL });

  const systemPrompt = `你是一个专业的信息分析师。用户会提供他最近阅读的文章和记录的笔记。
请根据这些内容，提取出代表用户当前兴趣和思考方向的 5 到 10 个核心关键词或短语。
这些关键词将用于在浩瀚的互联网 RSS 抓取中寻找与之产生共鸣的内容。
返回的必须是一个合法的 JSON 数组，例如：["关键词1", "关键词2", "短语3"]。严禁输出其他内容。`;

  const contentsToAnalyze = feeds.map(f => {
    let text = `标题: ${f.title || ''}`;
    if (f.summary) text += `\n摘要: ${f.summary}`;
    if (f.user_notes) text += `\n用户思考: ${f.user_notes}`;
    return text;
  }).join('\n\n---\n\n');

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `以下是用户近期的阅读和思考：\n\n${contentsToAnalyze.slice(0, 8000)}` }
      ],
      model,
      temperature: 0.3,
      max_tokens: 1024,
    });

    const raw = completion.choices[0].message.content || '';
    let keywords: string[] = [];

    try {
      const jsonMatch = raw.match(/```json\n?([\s\S]*?)```/) || raw.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : raw;
      keywords = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error('❌ [Extract Keywords] JSON parse failed:', raw);
    }

    return Array.isArray(keywords) ? keywords : [];
  } catch (error: any) {
    console.error('❌ [Extract Keywords] API Error:', error.message);
    return [];
  }
}

export async function filterRssItemsWithAI(
  items: { title: string; summary: string; link: string }[],
  keywords: string[],
  userConfig?: { apiKey?: string; baseURL?: string; model?: string }
): Promise<{ title: string; summary: string; link: string; match_reason: string }[]> {
  if (items.length === 0 || keywords.length === 0) return [];

  let apiKey = userConfig?.apiKey || process.env.SILICONFLOW_API_KEY;
  let rawBaseURL = userConfig?.baseURL || process.env.AI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  let model = userConfig?.model || process.env.AI_MODEL || "doubao-seed-1-8-251228"; 
  let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

  if (!apiKey) {
    console.error('❌ [filterRssItemsWithAI] No API key');
    return [];
  }

  const openai = new OpenAI({ apiKey, baseURL });

  const systemPrompt = `你是一个高级智能过滤助手。
用户当前的核心兴趣关键词为：${JSON.stringify(keywords)}

现在有一批新抓取的 RSS 文章。请根据用户的兴趣关键词，挑选出**最可能与用户产生共鸣或具有互补价值**的文章（通常挑选出 10%-20% 即可，宁缺毋滥）。
对于每一篇你认为值得推荐的文章，请给出一句简短的推荐理由（说明它与哪个关键词相关或为何推荐）。

请严格按照以下 JSON 数组格式返回结果：
[
  {
    "index": 原文章的索引号(从 0 开始),
    "match_reason": "推荐理由"
  }
]
严禁输出任何非 JSON 内容。`;

  const itemsList = items.map((item, i) => 
    `[${i}] 标题: ${item.title}\n摘要: ${(item.summary || '').slice(0, 300)}`
  ).join('\n\n');

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `待筛选文章列表：\n\n${itemsList}` }
      ],
      model,
      temperature: 0.2,
      max_tokens: 2048,
    });

    const raw = completion.choices[0].message.content || '';
    let results: any[] = [];
    try {
      const jsonMatch = raw.match(/```json\n?([\s\S]*?)```/) || raw.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : raw;
      results = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error('❌ [filterRssItemsWithAI] JSON parse failed:', raw);
    }

    if (!Array.isArray(results)) return [];

    const filteredItems = [];
    for (const res of results) {
      if (typeof res.index === 'number' && res.index >= 0 && res.index < items.length) {
        filteredItems.push({
          ...items[res.index],
          match_reason: res.match_reason || 'AI 智能推荐'
        });
      }
    }

    return filteredItems;

  } catch (error: any) {
    console.error('❌ [filterRssItemsWithAI] API Error:', error.message);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// 知识库导语 & 封面生成
// ═══════════════════════════════════════════════════════

export interface KnowledgeDigest {
  focus_areas: string[];
  thoughts: string[];
  viewpoints: string[];
  preferences: string[];
  overview: string;
  cover_prompt: string;
  owner_name: string;
  generated_at: string;
  feed_count: number;
}

/**
 * 分析全部 feed 内容，生成知识库导语（卷首语）和知识画像
 */
export async function generateKnowledgeDigest(params: {
  feeds: { title: string; category: string; tags: string[]; summary?: string; takeaways?: string[] }[];
  ownerName: string;
  userConfig?: { apiKey?: string; baseURL?: string; model?: string };
}): Promise<KnowledgeDigest | null> {
  const { feeds, ownerName, userConfig } = params;

  let apiKey = userConfig?.apiKey || process.env.SILICONFLOW_API_KEY;
  let rawBaseURL = userConfig?.baseURL || process.env.AI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  let model = userConfig?.model || process.env.AI_MODEL || 'glm-4.5-flash';
  let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

  if (!apiKey) {
    console.error('❌ [generateKnowledgeDigest] No API key');
    return null;
  }

  const openai = new OpenAI({ apiKey, baseURL });

  const systemPrompt = `你是一位资深的知识管理专家和杂志主编。你需要分析一个个人知识库（知识星系）的全部内容，为知识库主人生成一份「知识画像」和「卷首语」。

知识库主人：${ownerName}

请基于用户提供的数据进行深度分析，以严格 JSON 格式输出：
{
  "focus_areas": ["关注领域1", "关注领域2", ...],
  "thoughts": ["核心思考方向1", ...],
  "viewpoints": ["鲜明观点或倾向1", ...],
  "preferences": ["内容偏好1", ...],
  "overview": "一段卷首语风格的导语",
  "cover_prompt": "English prompt for cover illustration"
}

严格规则：
1. focus_areas: 3-5个主要关注领域，简洁有力
2. thoughts: 2-3个核心思考方向，反映知识库主人的深度思考
3. viewpoints: 2-3个鲜明观点或倾向，从内容中提炼
4. preferences: 2-3个内容消费偏好特征
    5. overview: 100-150字，卷首语风格，极致精炼，优雅有深度。以第三人称简述知识库主人的核心探索方向，避免冗长。
    6. cover_prompt: 必须英文，用于 AI 生成封面插图。风格要求：现代数字艺术、抽象科技感、杂志封面质感、暗色调背景配以霓虹光效。内容应当反映知识库的核心主题（如 AI/技术则用电路和神经网络意象，如设计则用几何和色彩意象）。不包含任何文字。适合正方形 1024x1024
7. 严格输出合法 JSON，不要添加任何其他文字`;

  // 构建标题列表（全量，轻量级）
  const titlesList = feeds.map((f, i) =>
    `[${i + 1}] ${f.title || '无标题'} | ${f.category} | ${(f.tags || []).join(',')}`
  ).join('\n');

  // 构建摘要列表（取前 30 篇，提供深度信息）
  const summariesList = feeds.slice(0, 30).map((f, i) => {
    let text = `[${i + 1}] ${f.title || '无标题'}`;
    if (f.summary) text += `\n  摘要: ${f.summary.slice(0, 200)}`;
    if (f.takeaways?.length) text += `\n  洞察: ${f.takeaways.slice(0, 2).join('; ')}`;
    return text;
  }).join('\n\n');

  const userPrompt = `该知识星系共收录 ${feeds.length} 篇内容。请综合分析以下所有数据：

═══ 全部内容标题与分类 ═══
${titlesList}

═══ 部分内容的深度摘要与洞察（来自慢思考宇宙的结晶） ═══
${summariesList}`;

  try {
    console.log(`🧠 [generateKnowledgeDigest] Analyzing ${feeds.length} feeds for ${ownerName}...`);
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model,
      temperature: 0.6,
      max_tokens: 2048,
    });

    const raw = completion.choices[0].message.content || '';
    console.log(`🧠 [generateKnowledgeDigest] Response length: ${raw.length}`);

    let result: any = {};
    try {
      const jsonMatch = raw.match(/```json\n?([\s\S]*?)```/) || raw.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : raw;
      result = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error('❌ [generateKnowledgeDigest] JSON parse failed:', raw.slice(0, 200));
      return null;
    }

    return {
      focus_areas: result.focus_areas || [],
      thoughts: result.thoughts || [],
      viewpoints: result.viewpoints || [],
      preferences: result.preferences || [],
      overview: result.overview || '暂无导语',
      cover_prompt: result.cover_prompt || 'A minimalist digital art illustration of a cosmic knowledge network with interconnected nodes, dark navy background, soft cyan and violet neon glow, futuristic magazine cover aesthetic, abstract neural pathways, no text',
      owner_name: ownerName,
      generated_at: new Date().toISOString(),
      feed_count: feeds.length,
    };
  } catch (error: any) {
    console.error('❌ [generateKnowledgeDigest] Error:', error.message);
    return null;
  }
}

/**
 * 使用豆包 Seedream 生成知识库封面插图
 */
export async function generateDigestCover(params: {
  prompt: string;
  userConfig?: { apiKey?: string; baseURL?: string };
}): Promise<string | null> {
  const { prompt, userConfig } = params;

  let apiKey = userConfig?.apiKey || process.env.SILICONFLOW_API_KEY;
  let rawBaseURL = userConfig?.baseURL || process.env.AI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

  if (!apiKey) {
    console.error('❌ [generateDigestCover] No API key');
    return null;
  }

  const model = 'doubao-seedream-5-0-260128';

  try {
    console.log(`🎨 [generateDigestCover] Generating with ${model}...`);
    const response = await fetch(`${baseURL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        size: '1024x1024',
        n: 1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ [generateDigestCover] ${model} failed (${response.status}): ${errText.slice(0, 300)}`);
      return null;
    }

    const data = await response.json();
    const imageUrl = data?.data?.[0]?.url || data?.data?.[0]?.b64_json || null;

    if (imageUrl) {
      console.log(`🎨 [generateDigestCover] Success!`);
      // 如果返回的是 base64，转为 data URI
      if (!imageUrl.startsWith('http')) {
        return `data:image/png;base64,${imageUrl}`;
      }
      return imageUrl;
    }

    console.error('❌ [generateDigestCover] No image URL in response');
    return null;
  } catch (error: any) {
    console.error(`❌ [generateDigestCover] Error:`, error.message);
    return null;
  }
}

/**
 * 根据用户对某篇文章的多条想法/灵感，生成一段「用户对该文章理解的总结」
 * 用于写入 feeds.user_notes，供 PC/移动端展示为「AI 汇总理解」
 */
export async function summarizeUserNotesForFeed(
  notes: { content: string; created_at?: string }[],
  feedTitle: string | null,
  userConfig?: { apiKey?: string; baseURL?: string; model?: string }
): Promise<string> {
  if (!notes || notes.length === 0) return '';

  let apiKey = userConfig?.apiKey || process.env.SILICONFLOW_API_KEY;
  let rawBaseURL = userConfig?.baseURL || process.env.AI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  let model = userConfig?.model || process.env.AI_MODEL || 'doubao-seed-1-8-251228';
  let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

  if (!apiKey) {
    console.error('❌ [summarizeUserNotesForFeed] No API key');
    return notes.map((n) => n.content).join('\n\n');
  }

  const openai = new OpenAI({ apiKey, baseURL });
  const notesBlock = notes
    .map((n, i) => `[${i + 1}] ${n.content}`)
    .join('\n\n');
  const systemPrompt = `你是一个阅读助手。用户对一篇文章写下了多条零散的想法和灵感，请将这些想法归纳成一段连贯的「用户对这篇文章的理解总结」，用第三人称或概括性语言，200 字以内。只输出这段总结正文，不要标题、不要编号、不要引用原文。`;
  const userPrompt = `文章标题：${feedTitle || '无标题'}\n\n用户的想法与灵感：\n\n${notesBlock}`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model,
      temperature: 0.4,
      max_tokens: 512,
    });
    const raw = completion.choices[0]?.message?.content?.trim() || '';
    return raw || notes.map((n) => n.content).join('\n\n');
  } catch (error: any) {
    console.error('❌ [summarizeUserNotesForFeed] Error:', error.message);
    return notes.map((n) => n.content).join('\n\n');
  }
}

/**
 * 通用单轮对话：用用户配置的 API 发送消息并返回助手回复
 */
export async function chatCompletion(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  userConfig?: { apiKey?: string; baseURL?: string; model?: string }
): Promise<string> {
  let apiKey = userConfig?.apiKey || process.env.SILICONFLOW_API_KEY;
  let rawBaseURL = userConfig?.baseURL || process.env.AI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  let model = userConfig?.model || process.env.AI_MODEL || 'doubao-seed-1-8-251228';
  let baseURL = rawBaseURL.trim().replace(/\/+$/, '');

  if (!apiKey) {
    throw new Error('未配置 AI API，请在设置中填写 API Key');
  }

  const openai = new OpenAI({ apiKey, baseURL });
  const completion = await openai.chat.completions.create({
    messages,
    model,
    temperature: 0.5,
    max_tokens: 2048,
  });
  return completion.choices[0]?.message?.content?.trim() || '';
}
