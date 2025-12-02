import OpenAI from 'openai';

// 🔍 Debug Log
console.log('🔑 SILICONFLOW_API_KEY:', process.env.SILICONFLOW_API_KEY ? 'Loaded (starts with ' + process.env.SILICONFLOW_API_KEY.slice(0, 5) + '...)' : 'Missing!');

const openai = new OpenAI({
  apiKey: process.env.SILICONFLOW_API_KEY, // 使用硅基流动 Key
  baseURL: 'https://api.siliconflow.cn/v1', // 硅基流动 API 地址
});

export interface AIAnalysisResult {
  title: string;
  summary: string;
  takeaways: string[];
  tags: string[];
  category: 'tech' | 'life' | 'idea' | 'art' | 'other';
  emotion: string;
  reading_time: number;
}

// Helper to normalize category
function normalizeCategory(cat: string): AIAnalysisResult['category'] {
  const validCategories = ['tech', 'life', 'idea', 'art'];
  const lowerCat = cat?.toLowerCase()?.trim() || 'other';
  
  if (validCategories.includes(lowerCat)) {
    return lowerCat as AIAnalysisResult['category'];
  }
  return 'other';
}

export async function analyzeContent(content: string): Promise<AIAnalysisResult> {
  const systemPrompt = `
    You are NeoFeed's Intelligence Core. Your mission is to analyze the input content and output a structured JSON analysis.
    
    INPUT: A text snippet, idea, or raw content.
    
    OUTPUT FORMAT (JSON only):
    {
      "title": "A short, catchy title (max 10 words)",
      "summary": "A concise summary of the essence (max 100 characters, Chinese if input is Chinese)",
      "takeaways": ["Key point 1", "Key point 2", "Key point 3"],
      "tags": ["tag1", "tag2", "tag3"],
      "category": "One of: tech, life, idea, art, other",
      "emotion": "One of: positive, neutral, negative, inspiring, critical",
      "reading_time": 10 (estimated seconds to read)
    }
    
    RULES:
    1. If the input is a URL, try to infer the topic from the URL structure or title if provided.
    2. "category" mapping: 
       - Coding, AI, Hardware -> tech
       - Daily logs, emotions, food -> life
       - Philosophy, thoughts, methodology -> idea
       - Design, music, visual -> art
    3. Always reply in the same language as the input (English or Chinese).
  `;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content }
      ],
      model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B", // 修正为硅基流动支持的标准 Distill 模型名
      response_format: { type: "json_object" }, // 强制 JSON 输出
    });

    const rawResult = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Ensure category is valid
    const result: AIAnalysisResult = {
      ...rawResult,
      category: normalizeCategory(rawResult.category),
      // Ensure other fields exist
      title: rawResult.title || content.slice(0, 20),
      summary: rawResult.summary || content.slice(0, 50),
      takeaways: rawResult.takeaways || [],
      tags: rawResult.tags || [],
      emotion: rawResult.emotion || 'neutral',
      reading_time: rawResult.reading_time || Math.ceil(content.length / 10),
    };

    return result;
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    // Fallback if AI fails
    return {
      title: content.slice(0, 20) + "...",
      summary: content.slice(0, 50),
      takeaways: [],
      tags: ["raw"],
      category: "other",
      emotion: "neutral",
      reading_time: Math.ceil(content.length / 10),
    };
  }
}
