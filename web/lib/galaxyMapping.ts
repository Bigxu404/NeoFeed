import * as THREE from 'three';
import { GalaxyItem } from '@/types';

export function mapFeedsToGalaxy(feeds: any[]): GalaxyItem[] {
  const items: GalaxyItem[] = [];
  const count = feeds.length;
  
  if (count === 0) return [];

  const colors = {
    tech: '#FF9800', // Orange
    life: '#66BB6A', // Green
    idea: '#E0E0E0', // White
    art: '#E91E63',  // Pink (新增)
    other: '#2196F3' // Blue (默认)
  };

  // 辅助函数：标准化分类
  const normalizeCategory = (cat: string) => {
    const lower = cat?.toLowerCase() || 'other';
    if (['tech', 'life', 'idea', 'art'].includes(lower)) return lower;
    return 'other';
  };

  feeds.forEach((feed, i) => {
    // 1. 核心算法：Radius 由 Index (时间顺序) 决定
    // i=0 (最新) -> radius 最小 (靠近中心)
    // i=count (最旧) -> radius 最大 (边缘)
    
    const minRadius = 6; 
    const maxRadius = 50;
    
    // 如果只有一个点，放在中间稍微偏一点的位置
    const normalizedIndex = count > 1 ? i / (count - 1) : 0;
    
    // r = min + (max - min) * index^0.9
    const radius = minRadius + (maxRadius - minRadius) * Math.pow(normalizedIndex, 0.9);

    // 2. 角度生成：基于半径产生螺旋
    const spiralTightness = 0.25; 
    const spiralAngle = radius * spiralTightness;
    
    // 3. 分类臂偏移 (可选)
    // 让不同分类稍微分开一点，或者随机混合
    const armIndex = i % 3; 
    const armOffset = armIndex * (Math.PI * 2 / 3);
    
    // 最终角度
    const finalAngle = spiralAngle + armOffset + (Math.random() * 0.4 - 0.2);

    const x = Math.cos(finalAngle) * radius;
    const z = Math.sin(finalAngle) * radius;
    
    // Y轴 (厚度)
    const thickness = Math.max(1, 5 - radius * 0.1);
    const y = (Math.random() - 0.5) * thickness * 1.5;

    // 解析分类颜色
    const category = normalizeCategory(feed.category) as any;
    const color = colors[category as keyof typeof colors] || colors.other;

    // 大小
    const size = 0.3 + Math.random() * 0.4;

    items.push({
      id: feed.id,
      position: [x, y, z],
      size: size,
      color: color,
      category: category,
      summary: feed.title || feed.summary || 'Untitled Star',
      content: feed.content_raw || feed.summary || 'No content.',
      tags: feed.tags || [],
      date: new Date(feed.created_at).toLocaleDateString(),
      timestamp: new Date(feed.created_at).getTime()
    });
  });

  return items;
}

