export interface GalaxyItem {
  id: string;
  content: string;
  category: 'tech' | 'life' | 'idea';
  position: [number, number, number]; // 3D 坐标 [x, y, z]
  size: number;
  color: string;
  date: string;
}

// 生成自然星系数据 (Logarithmic Spiral + Randomness)
export function generateGalaxyData(count: number = 150): GalaxyItem[] {
  const items: GalaxyItem[] = [];
  const categories: ('tech' | 'life' | 'idea')[] = ['tech', 'life', 'idea'];
  const colors = {
    tech: '#ff9800', // 橙色
    life: '#81c784', // 绿色
    idea: '#ffffff', // 白色
  };

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // 基础参数
    const branchCount = 3; // 3条悬臂
    const spin = i * 0.1; // 旋转因子
    
    // 随机选择一条悬臂
    const branchAngle = (Math.PI * 2 * Math.floor(Math.random() * branchCount)) / branchCount;
    
    // 距离中心的距离 (偏向中心更密集)
    const distance = 10 + Math.pow(Math.random(), 0.8) * 40; 
    
    // 混合旋转角度：悬臂角度 + 距离带来的旋转偏移 + 随机扰动
    const randomOffset = (Math.random() - 0.5) * 0.5; // 随机扰动幅度
    const angle = branchAngle + distance * 0.05 + randomOffset;

    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    // Y轴分布：中心厚，边缘薄 (高斯分布近似)
    const thickness = (1 - distance / 60) * 15; 
    const y = (Math.random() - 0.5) * thickness;

    items.push({
      id: `item-${i}`,
      content: `This is a memory fragment about ${category}... #${i}`,
      category,
      position: [x, y, z],
      size: Math.random() * 0.5 + 0.3, // 随机大小
      color: colors[category],
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    });
  }
  return items;
}
