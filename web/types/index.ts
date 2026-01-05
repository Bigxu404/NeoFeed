export interface GalaxyItem {
  id: string;
  position: [number, number, number];
  size: number;
  color: string;
  category: 'tech' | 'life' | 'idea' | 'art' | 'other';
  summary: string; // 一句话总结
  content: string; // 全文内容
  tags: string[];  // 标签
  date: string;    // 格式化日期 YYYY-MM-DD
  timestamp: number; // 原始时间戳，用于排序
  url?: string;
}

export interface AIConfig {
  provider: 'openai' | 'deepseek' | 'siliconflow' | 'custom';
  model: string;
  apiKey?: string;
  baseURL?: string;
  prompt: string;
  notificationEmail?: string;
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

