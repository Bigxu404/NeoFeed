import { GalaxyItem } from '@/types';

// 模拟一些更真实的文本内容
const MOCK_CONTENT = {
  tech: {
    summaries: [
      "AI 模型推理成本下降了 90%，这将引爆端侧应用。",
      "新的量子纠缠实验证明了超距作用的稳定性。",
      "Rust 内核正在逐步取代 Linux 中的 C 模块。",
      "WebGPU 的普及将让浏览器成为下一代游戏主机。",
      "SpaceX 星舰第四次试飞成功入轨。"
    ],
    tags: ["AI", "Quantum", "Rust", "WebGPU", "Space"]
  },
  life: {
    summaries: [
      "长寿科技新突破：端粒酶修复剂进入二期临床。",
      "冥想 10 分钟对大脑前额叶皮层的重塑作用。",
      "数字化游民的终极指南：如何在巴厘岛工作。",
      "合成生物学正在制造不需要杀生的肉类。",
      "多巴胺斋戒：通过减少刺激来恢复专注力。"
    ],
    tags: ["Bio", "Mindfulness", "Health", "Food", "Focus"]
  },
  idea: {
    summaries: [
      "关于意识上传的伦理学悖论探讨。",
      "极简主义不是少买东西，而是确认什么是重要的。",
      "元宇宙的失败在于它试图复制现实，而非超越现实。",
      "为什么我们需要建立一个去中心化的数字图书馆？",
      "人类的创造力在 AI 时代将变得更加稀缺还是廉价？"
    ],
    tags: ["Ethics", "Minimalism", "Metaverse", "Web3", "Philosophy"]
  }
};

export function generateGalaxyData(count: number = 50): GalaxyItem[] {
  const items: GalaxyItem[] = [];
  const categories: ('tech' | 'life' | 'idea')[] = ['tech', 'life', 'idea'];
  
  const colors = {
    tech: '#FF9800', // Orange
    life: '#66BB6A', // Green
    idea: '#E0E0E0', // White
  };

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < count; i++) {
    const timeOffset = i * (oneDay * 0.8) + Math.random() * (oneDay * 0.5);
    const timestamp = now - timeOffset;
    const dateObj = new Date(timestamp);
    const dateStr = dateObj.toISOString().split('T')[0];

    const minRadius = 6; 
    const maxRadius = 50;
    
    const normalizedIndex = i / count; 
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

    const category = categories[Math.floor(Math.random() * categories.length)];
    const typeContent = MOCK_CONTENT[category];
    const summary = typeContent.summaries[Math.floor(Math.random() * typeContent.summaries.length)];
    const randomTags = [
      typeContent.tags[Math.floor(Math.random() * typeContent.tags.length)],
      typeContent.tags[Math.floor(Math.random() * typeContent.tags.length)]
    ].filter((v, idx, a) => a.indexOf(v) === idx);

    items.push({
      id: `star-${i}`,
      position: [x, y, z],
      size: 0.2 + Math.random() * 0.4, 
      color: colors[category],
      category: category,
      summary: summary,
      content: `这里是关于 "${summary}" 的详细全文内容...\n\n(这是一条来自 ${dateStr} 的记忆片段。)\n\nLorem ipsum dolor sit amet...`,
      tags: randomTags,
      date: dateStr,
      timestamp: timestamp,
      wordCount: Math.floor(Math.random() * 5000) + 200, 
      complexity: Math.random(), 
    } as any);
  }

  return items;
}

export const STATIC_GALAXY_DATA = generateGalaxyData(50);
