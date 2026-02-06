import * as THREE from 'three';
import { GalaxyItem } from '@/types';
import { FeedItem } from '@/app/dashboard/actions';

/**
 * 🎨 语义哈希：根据标签生成颜色 (强荧光版)
 */
function getSemanticColor(tags: string[]): string {
  if (!tags || tags.length === 0) return '#ffffff';
  
  const semanticMap: { [key: string]: string } = {
    'ai': '#00ffff', 
    'tech': '#0ea5e9', 
    'design': '#f43f5e', 
    'life': '#10b981', 
    'art': '#ec4899', 
    'idea': '#f59e0b', 
    'crypto': '#facc15', 
    'dev': '#8b5cf6', 
  };

  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    for (const [key, color] of Object.entries(semanticMap)) {
      if (lowerTag.includes(key)) return color;
    }
  }

  const firstTag = tags[0];
  let hash = 0;
  for (let i = 0; i < firstTag.length; i++) {
    hash = firstTag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash % 360)}, 100%, 70%)`;
}

export function mapFeedsToGalaxy(feeds: FeedItem[]): GalaxyItem[] {
  const items: GalaxyItem[] = [];
  const count = feeds.length;
  
  if (count === 0) return [];

  // 🌌 核心重构：全局均匀分布算法 (Balanced Spherical Distribution)
  feeds.forEach((feed, i) => {
    if (!feed) return;

    const category = feed.category?.toLowerCase() || 'other';
    
    // 1. 角度分布：基于索引实现 360 度均匀覆盖，防止偏向一侧
    // 使用黄金角度 (Golden Angle) 确保分布的绝对均匀性
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;

    // 2. 半径控制：围绕核心的紧凑带
    const baseRadius = 18 + Math.random() * 12; 

    // 3. 分类偏置 (Biases)：保留用户喜欢的“错落感”，但不破坏全局平衡
    let heightBias = 0;
    let radiusBias = 0;

    if (category === 'tech') {
      heightBias = 12; // 偏上
      radiusBias = 2;
    } else if (category === 'life') {
      heightBias = -10; // 偏下
      radiusBias = -3;
    } else if (category === 'idea') {
      heightBias = 5; // 略微偏上
      radiusBias = 5;
    } else if (category === 'art') {
      heightBias = -15; // 偏底部
      radiusBias = 0;
    }

    // 计算最终坐标
    const x = (baseRadius + radiusBias) * Math.sin(phi) * Math.cos(theta);
    const z = (baseRadius + radiusBias) * Math.sin(phi) * Math.sin(theta);
    const y = (baseRadius + radiusBias) * Math.cos(phi) + heightBias;

    const tags = Array.isArray(feed.tags) ? feed.tags : [];
    const color = getSemanticColor(tags);
    
    const contentLength = feed.content_raw?.length || 0;
    const size = 2.0 + Math.min(contentLength / 5000, 1.0) * 3.0; 

    let dateStr = '2025-01-01';
    let timestamp = Date.now();
    try {
      if (feed.created_at) {
        const d = new Date(feed.created_at);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split('T')[0];
          timestamp = d.getTime();
        }
      }
    } catch (e) {}

    items.push({
      id: feed.id,
      position: [x, y, z],
      size: size,
      color: color,
      category: category as any,
      summary: feed.title || feed.summary || 'Untitled Star',
      content: feed.content_raw || feed.summary || 'No content.',
      content_original: feed.content_original || undefined,
      tags: tags,
      date: dateStr,
      timestamp: timestamp
    });
  });

  return items;
}
