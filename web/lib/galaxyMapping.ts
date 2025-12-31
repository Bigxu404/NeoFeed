import * as THREE from 'three';
import { GalaxyItem } from '@/types';
import { FeedItem } from '@/app/dashboard/actions';

export function mapFeedsToGalaxy(feeds: FeedItem[]): GalaxyItem[] {
  const items: GalaxyItem[] = [];
  const count = feeds.length;
  
  if (count === 0) return [];

  const colors = {
    tech: '#FF9800', // Orange
    life: '#66BB6A', // Green
    idea: '#E0E0E0', // White
    art: '#E91E63',  // Pink
    other: '#2196F3' // Blue
  };

  const normalizeCategory = (cat: string | null) => {
    const lower = cat?.toLowerCase() || 'other';
    if (['tech', 'life', 'idea', 'art'].includes(lower)) return lower as GalaxyItem['category'];
    return 'other' as GalaxyItem['category'];
  };

  feeds.forEach((feed, i) => {
    const minRadius = 6; 
    const maxRadius = 50;
    const normalizedIndex = count > 1 ? i / (count - 1) : 0;
    const radius = minRadius + (maxRadius - minRadius) * Math.pow(normalizedIndex, 0.9);
    const spiralTightness = 0.25; 
    const spiralAngle = radius * spiralTightness;
    const armIndex = i % 3; 
    const armOffset = armIndex * (Math.PI * 2 / 3);
    const finalAngle = spiralAngle + armOffset + (Math.random() * 0.4 - 0.2);

    const x = Math.cos(finalAngle) * radius;
    const z = Math.sin(finalAngle) * radius;
    const thickness = Math.max(1, 5 - radius * 0.1);
    const y = (Math.random() - 0.5) * thickness * 1.5;

    const category = normalizeCategory(feed.category);
    const color = colors[category as keyof typeof colors] || colors.other;
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
      date: new Date(feed.created_at).toISOString().split('T')[0],
      timestamp: new Date(feed.created_at).getTime()
    });
  });

  return items;
}

