import * as THREE from 'three';

export interface GalaxyItem {
  id: string;
  position: [number, number, number];
  size: number;
  color: string;
  category: 'tech' | 'life' | 'idea';
  summary: string; // 一句话总结
  content: string; // 全文内容
  tags: string[];  // 标签
  date: string;    // 格式化日期 YYYY-MM-DD
  timestamp: number; // 原始时间戳，用于排序
}

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

export function generateGalaxyData(count: number = 150): GalaxyItem[] {
  const items: GalaxyItem[] = [];
  const categories: ('tech' | 'life' | 'idea')[] = ['tech', 'life', 'idea'];
  
  const colors = {
    tech: '#FF9800', // Orange
    life: '#66BB6A', // Green
    idea: '#E0E0E0', // White
  };

  // 1. 先生成时间有序的数据 (模拟从今天往前推的一段时间)
  // 这样我们在循环时，i=0 就是最新的，i=count-1 就是最旧的
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < count; i++) {
    // 模拟时间分布：越新的数据越密集？或者均匀分布
    // 这里假设每天有 1-2 条 feed，所以时间跨度大概是 i * 0.5 天
    const timeOffset = i * (oneDay * 0.8) + Math.random() * (oneDay * 0.5);
    const timestamp = now - timeOffset;
    const dateObj = new Date(timestamp);
    const dateStr = dateObj.toISOString().split('T')[0];

    // 2. 核心算法：Radius 由 Index (时间顺序) 决定
    // i=0 (最新) -> radius 最小 (靠近中心)
    // i=count (最旧) -> radius 最大 (边缘)
    
    // 最小半径 (避开中心的太阳)
    const minRadius = 6; 
    // 最大半径
    const maxRadius = 50;
    
    // 使用非线性分布 (Power function)，让最新的数据稍微稀疏一点，方便查看
    // normalizedIndex 0 -> 1
    const normalizedIndex = i / count; 
    
    // r = min + (max - min) * index^0.8
    // 指数 < 1 会让内圈稍微疏散一点，指数 > 1 会让内圈非常拥挤
    const radius = minRadius + (maxRadius - minRadius) * Math.pow(normalizedIndex, 0.9);

    // 3. 角度生成：基于半径产生螺旋
    // 螺旋系数：数值越大，缠绕越紧
    const spiralTightness = 0.25; 
    const spiralAngle = radius * spiralTightness;
    
    // 4. 分类臂偏移 (可选)
    // 虽然是时间螺旋，我们还是希望不同分类稍微有点区分，或者完全随机混合
    // 这里我们采用：随机混合在螺旋带上，但加上随机偏移，让它看起来像一条自然的银河带
    const armIndex = i % 3; // 简单的轮询分配到 3 条臂
    const armOffset = armIndex * (Math.PI * 2 / 3);
    
    // 最终角度 = 螺旋基础角 + 悬臂偏移 + 少量随机扰动
    const finalAngle = spiralAngle + armOffset + (Math.random() * 0.4 - 0.2);

    const x = Math.cos(finalAngle) * radius;
    const z = Math.sin(finalAngle) * radius;
    
    // Y轴 (厚度) - 中心厚，边缘薄
    const thickness = Math.max(1, 5 - radius * 0.1);
    const y = (Math.random() - 0.5) * thickness * 1.5; // 稍微压扁一点

    // 随机分类和内容
    const category = categories[Math.floor(Math.random() * categories.length)];
    const typeContent = MOCK_CONTENT[category];
    const summary = typeContent.summaries[Math.floor(Math.random() * typeContent.summaries.length)];
    const randomTags = [
      typeContent.tags[Math.floor(Math.random() * typeContent.tags.length)],
      typeContent.tags[Math.floor(Math.random() * typeContent.tags.length)]
    ].filter((v, idx, a) => a.indexOf(v) === idx);

    // 大小：越新的可能稍微大一点点？或者随机
    const size = 0.2 + Math.random() * 0.4;

    items.push({
      id: `star-${i}`,
      position: [x, y, z],
      size: size,
      color: colors[category],
      category: category,
      summary: summary,
      content: `这里是关于 "${summary}" 的详细全文内容...\n\n(这是一条来自 ${dateStr} 的记忆片段。)\n\nLorem ipsum dolor sit amet...`,
      tags: randomTags,
      date: dateStr,
      timestamp: timestamp // 存入时间戳
    });
  }

  // 返回前不需要再排序，因为我们是按 i 生成的，本身就是有序的 (i=0 是最新的)
  return items;
}

export const MOCK_INSIGHT = {
  summary: "Wake up, Neo... 本周你的数据流显示出明显的异常波动。你对 [WebGPU] 和 [Rust] 的关注度提升了 300%，这表明你正在试图突破现有的渲染极限。同时，[长寿科技] 的数据碎片表明你潜意识里渴望更久远的在线时间。系统建议：继续深挖图形学底层，这可能是你打破矩阵的关键。",
  stats: {
    inputRate: [12, 45, 23, 56, 34, 78, 43, 65, 23, 87, 45, 12, 67, 34, 21], // 模拟示波器数据
    categories: {
      tech: 65, // 65%
      life: 25, // 25%
      idea: 10  // 10%
    },
    totalFragments: 128,
    processedFragments: 42
  },
  keywords: ["WebGPU", "Rust", "Longevity", "Metaverse", "Entropy"],
  // ✨ 新增：哲学语录
  sparks: [
    {
      type: "Existential / 存在主义",
      content: "🤔 如果你必须把你所有的记忆都存入一个 1GB 的硬盘，你会选择保留哪三段视频？其余的删除后，你还是你吗？",
      author: "Digital Sartre"
    },
    {
      type: "Stoic / 斯多葛",
      content: "🏛️ 你无法控制网络上每天产生多少垃圾信息，但你可以控制你的‘注意力阀门’。今天，你是否为不值得的事情浪费了带宽？",
      author: "Marcus Aurelius v2.0"
    },
    {
      type: "Cybernetic / 赛博哲学",
      content: "🤖 当你的第二大脑 (NeoFeed) 比你的第一大脑记得更清楚时，谁才是真正的主人？是你喂养了它，还是它在定义你？",
      author: "The Ghost in the Shell"
    }
  ]
};

// ✨ 新增：用户个人资料 Mock
export const MOCK_USER = {
  username: "Mr. Anderson", // 改名
  title: "救世主 / 系统异常点",
  bio: "I know kung fu. Searching for the source code of reality.", // 回归经典英文
  level: 6,
  levelName: "觉醒者",
  exp: 92, // 0-100
  // ✨ 新增：星系养成参数
  galaxy: {
    name: "Nebula-X",
    age: "248 个标准日",
    starCount: 156,
    civilizationType: "I 型文明 (行星系)",
    mass: "420 万倍太阳质量"
  },
  stats: {
    totalFeeds: 1248,
    daysActive: 42,
    neuralLink: 98
  },
  badges: [
    { id: 1, name: "起源", icon: "🥚", unlocked: true },
    { id: 2, name: "观星者", icon: "🔭", unlocked: true },
    { id: 3, name: "架构师", icon: "📐", unlocked: true },
    { id: 4, name: "救世主", icon: "🕶️", unlocked: true }, // 解锁
    { id: 5, name: "幽灵", icon: "👻", unlocked: false },
  ]
};

export const MOCK_GALAXY_DATA = generateGalaxyData(50);
