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
  // 1. Determine which API Key and Base URL to use
  let apiKey = userConfig?.apiKey || process.env.SILICONFLOW_API_KEY;
  let baseURL = 'https://api.siliconflow.cn/v1';
  let model = "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B"; // Default

  // If user provided a specific provider, adjust settings
  if (userConfig?.provider === 'openai') {
    baseURL = 'https://api.openai.com/v1';
    model = userConfig.model || 'gpt-4o-mini';
  } else if (userConfig?.provider === 'deepseek') {
    baseURL = 'https://api.deepseek.com';
    model = userConfig.model || 'deepseek-chat';
  } else if (userConfig?.provider === 'siliconflow') {
    if (userConfig.model) model = userConfig.model;
  }
  
  if (!apiKey) {
    console.error('❌ AI Error: No API Key available (Global or User-defined)');
    return {
      title: title || content.slice(0, 20) + "...",
      summary: "AI Key Missing. Please configure your own API Key in Settings -> Intelligence.",
      takeaways: [],
      tags: ["error", "no-key"],
      category: "other",
      emotion: "neutral",
      reading_time: Math.ceil(content.length / 10),
    };
  }

  // Lazy Initialization with dynamic config
  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  // Optimized System Prompt for Quality and Noise Reduction
  const systemPrompt = `
    You are NeoFeed's Elite Intelligence Analyst. Your mission is to filter noise and extract high-value insights from the input.
    
    CONTEXT:
    The input is raw text scraped from a webpage (${url || 'URL Unknown'}). It may contain "noise" like navigation menus, footers, ads, or copyright notices.
    
    YOUR TASKS:
    1. 🛡️ **NOISE FILTER**: Aggressively ignore unrelated text (menus, ads, "subscribe", "read more"). Focus ONLY on the core article or content.
    2. 🧠 **DEEP INSIGHT**: Don't just summarize "what happened". Explain "why it matters" and "what is the underlying principle".
    3. ⚡ **ACTIONABLE INTELLIGENCE**: Extract specific tools, concepts, or actions the user can take.
    
    OUTPUT FORMAT (JSON Only):
    {
      "title": "A clean, concise title (max 10 words). Fix clickbait.",
      "summary": "A high-density summary (approx 150-200 words). Structure: Context -> Core Argument -> Conclusion. Use markdown bolding for key terms.",
      "takeaways": [
        "Actionable item 1 (e.g., 'Try Tool X')",
        "Insight 2 (e.g., 'Concept Y explains Z')",
        "Key Fact 3"
      ],
      "tags": ["precise", "tags", "max-5"],
      "category": "One of: tech (code/AI), life (daily/food), idea (philosophy/strategy), art (design/culture), other",
      "emotion": "One of: exciting, controversial, insightful, neutral, boring",
      "reading_time": 120 (estimated seconds for the CORE content only)
    }
    
    LANGUAGE RULE:
    - If the input is Chinese, output in Chinese (Simplified).
    - If the input is English, output in English.
  `;

  const userContent = `
    ${title ? `Page Title: ${title}\n` : ''}
    ${url ? `Source URL: ${url}\n` : ''}
    ---
    RAW CONTENT:
    ${content.slice(0, 15000)} 
    (Truncated if too long)
  `.trim();

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B", 
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more stable/analytical results
    });

    const cleanContent = completion.choices[0].message.content?.replace(/```json\n?|```/g, '').trim() || '{}';
    
    let rawResult;
    try {
      rawResult = JSON.parse(cleanContent);
    } catch (e) {
      console.error("JSON Parse Failed:", cleanContent);
      throw new Error("Invalid JSON from AI");
    }
    
    // Post-processing & Validation
    const result: AIAnalysisResult = {
      title: rawResult.title || title || "Untitled Analysis",
      summary: rawResult.summary || "Analysis failed to generate summary.",
      takeaways: Array.isArray(rawResult.takeaways) ? rawResult.takeaways.slice(0, 5) : [],
      tags: Array.isArray(rawResult.tags) ? rawResult.tags.slice(0, 5) : [],
      category: normalizeCategory(rawResult.category),
      emotion: rawResult.emotion || 'neutral',
      reading_time: typeof rawResult.reading_time === 'number' ? rawResult.reading_time : 60,
      status: 'done'
    };

    return result;
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    // Fallback
    return {
      title: title || "Content Saved",
      summary: "AI processing encountered an error, but your content is saved safely. [System: failed_analysis]",
      takeaways: [],
      tags: ["error", "raw"],
      category: "other",
      emotion: "neutral",
      reading_time: 60,
      status: 'failed'
    };
  }
}
