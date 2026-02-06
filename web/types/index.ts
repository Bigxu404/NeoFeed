export interface GalaxyItem {
  id: string;
  position: [number, number, number];
  size: number;
  color: string;
  category: 'tech' | 'life' | 'idea' | 'art' | 'other';
  summary: string; // 一句话总结
  content: string; // 全文内容
  content_original?: string; // ✨ 新增：原始全文
  tags: string[];  // 标签
  date: string;    // 格式化日期 YYYY-MM-DD
  timestamp: number; // 原始时间戳，用于排序
  url?: string;
  shapeId?: number;  // ✨ 新增：语义形状 ID
  opacity?: number;  // ✨ 新增：动态透明度
}

export interface AIConfig {
  provider: 'openai' | 'deepseek' | 'siliconflow' | 'volcengine' | 'custom';
  model: string;
  apiKey?: string;
  baseURL?: string;
  prompt: string;
  insightPrompt?: string;
  rssPrompt?: string;
  notificationEmail?: string;
  insightReportDays?: number[]; 
  insightReportTime?: string;
  rssReportDays?: number[];
  rssReportTime?: string;
  rssPollFrequency?: 'daily' | 'weekly';
  // Legacy fields for backward compatibility
  reportDays?: number[]; 
  reportTime?: string;
}

export interface UserProfile {
  id: string;
  created_at: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  active_days: number;
  api_key: string | null;
  ai_config: AIConfig | null;
  notification_email: string | null;
  bio?: string;
}
