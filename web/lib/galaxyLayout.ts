import * as THREE from 'three';

// 定义星系簇的数据结构
export interface ClusterLayout {
  id: string;
  label: string;
  color: string;
  position: [number, number, number];
}

/**
 * 根据标签数量，计算星系簇在 3D 空间中的动态分布
 * 使用斐波那契球 (Fibonacci Sphere) 算法，确保星系均匀分布在空间中
 * @param tags 标签列表
 * @param radius 宇宙半径 (默认 80)
 */
export function calculateGalaxyLayout(tags: { id: string; name: string; color?: string }[], radius: number = 80): ClusterLayout[] {
  const count = tags.length;
  const layouts: ClusterLayout[] = [];
  const defaultColors = ['#00f2ea', '#ff0050', '#ffd700', '#a855f7', '#10b981', '#f97316'];

  if (count === 0) return [];
  if (count === 1) {
    return [{
      id: tags[0].id,
      label: tags[0].name,
      color: tags[0].color || defaultColors[0],
      position: [0, 0, 0],
    }];
  }

  const phi = Math.PI * (3 - Math.sqrt(5)); // 黄金角度

  tags.forEach((tag, i) => {
    // y 从 1 到 -1
    const y = 1 - (i / (count - 1)) * 2; 
    const radiusAtY = Math.sqrt(1 - y * y); // 该高度的半径

    const theta = phi * i; // 角度增量

    const x = Math.cos(theta) * radiusAtY * radius;
    const z = Math.sin(theta) * radiusAtY * radius;
    const yPos = y * radius * 0.6; // 压扁 Y 轴，形成扁平宇宙

    layouts.push({
      id: tag.id,
      label: tag.name,
      color: tag.color || defaultColors[i % defaultColors.length],
      position: [x, yPos, z],
    });
  });

  return layouts;
}

/**
 * 计算知识星球在星系内的位置
 * 核心逻辑：权重越大，离中心越近 (引力越强)
 * @param index 在该星系内的序号
 * @param center 星系中心坐标
 * @param weight 权重 (0.1 - 5.0)
 * @param totalInCluster 该星系内的总星球数
 */
export function calculateStarPosition(
  index: number, 
  center: [number, number, number], 
  weight: number = 1.0,
  totalInCluster: number
): [number, number, number] {
  // 权重归一化 (0.1 - 5.0)
  const w = Math.max(0.1, Math.min(5.0, weight));
  
  // 距离映射：
  // 权重 5.0 (核心) -> 距离 3
  // 权重 1.0 (普通) -> 距离 8
  // 权重 0.1 (边缘) -> 距离 12
  const minR = 3;
  const maxR = 12;
  
  // 简单的反比映射
  // 权重越大，radius 越小
  // 映射公式: r = maxR - (w / 5) * (maxR - minR)
  const r = maxR - (w / 5.0) * (maxR - minR);
  
  // 角度分布：均匀分布 + 随机扰动
  const angleStep = (Math.PI * 2) / Math.max(1, totalInCluster);
  const theta = index * angleStep + (Math.random() * 0.5); // 增加随机性避免排成直线

  const x = center[0] + Math.cos(theta) * r;
  const z = center[2] + Math.sin(theta) * r;
  
  // Y 轴高度：形成一个圆盘，带一点厚度
  const yVariation = (Math.random() - 0.5) * 3;
  const y = center[1] + yVariation;

  return [x, y, z];
}
