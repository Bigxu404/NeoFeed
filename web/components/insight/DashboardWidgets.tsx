'use client'

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sparkles, Globe, Lightbulb, ChevronRight } from 'lucide-react';

const DEFAULT_SPARKS = [
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
];

// 📟 打字机效果组件 (增加绿色光晕)
export function TypingEffect({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <div className="font-serif text-xl md:text-2xl text-white/90 leading-relaxed tracking-wide drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]">
      {displayedText}
      <span className="animate-pulse ml-1 text-green-400">|</span>
    </div>
  );
}

// 🌍 左侧：每日洞察
export function DailyDiscovery() {
    const items = [
        { title: "DeepMind 发布新一代天气模型 GraphCast", tag: "Tech", time: "10:00 AM" },
        { title: "NASA 韦伯望远镜发现系外行星 K2-18b", tag: "Space", time: "02:15 PM" },
        { title: "WebAssembly GC 标准正式发布", tag: "Code", time: "Yesterday" },
    ];

    return (
        <div className="space-y-4">
            {items.map((item, i) => (
                <div key={i} className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/40 hover:bg-green-900/10 transition-all cursor-pointer relative overflow-hidden">
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10 flex justify-between items-start mb-1">
                        <span className="text-[10px] font-mono text-green-300/70 uppercase tracking-wider">{item.tag}</span>
                        <span className="text-[10px] text-white/20 font-mono">{item.time}</span>
                    </div>
                    <h4 className="relative z-10 text-sm text-white/70 group-hover:text-white group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] leading-snug transition-all">
                        {item.title}
                    </h4>
                </div>
            ))}
            <button className="w-full py-3 text-xs text-white/30 hover:text-green-400 border-t border-white/5 mt-2 transition-colors flex items-center justify-center gap-2 group">
                <Globe size={12} className="group-hover:animate-spin-slow" /> 
                LOAD_MORE_SIGNALS
            </button>
        </div>
    );
}

// 💡 右侧：每日猜想 (随机抽取一条)
export function DailySpark() {
    const [spark, setSpark] = useState(DEFAULT_SPARKS[0]);

    useEffect(() => {
        const random = DEFAULT_SPARKS[Math.floor(Math.random() * DEFAULT_SPARKS.length)];
        setSpark(random);
    }, []);

    return (
        <div className="h-full flex flex-col justify-between relative">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl -z-10" />
             
             <div className="space-y-4 p-1">
                <div className="flex items-center gap-2 text-purple-300 text-[10px] font-bold mb-4 uppercase tracking-widest opacity-70">
                    <Lightbulb size={12} />
                    {spark.type}
                </div>
                
                <p className="text-sm md:text-base text-white/80 italic leading-loose font-serif">
                    "{spark.content}"
                </p>
                
                <div className="text-right mt-4">
                    <span className="text-[10px] text-white/30 font-mono">
                        — {spark.author}
                    </span>
                </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors group cursor-pointer">
                <h4 className="text-[10px] font-bold text-white/30 mb-1 uppercase tracking-widest group-hover:text-white/60 transition-colors">Action Item</h4>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-white/50 group-hover:text-white transition-colors">
                        尝试在你的星系中搜索 "Entropy"
                    </p>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </div>
    );
}

// 🔋 能量柱组件 (极简版)
export function EnergyBars({ categories }: { categories: { label: string; value: number }[] }) {
    const colorMap: Record<string, string> = {
        'TECH': 'bg-orange-500',
        'LIFE': 'bg-green-500',
        'IDEA': 'bg-purple-500',
        'ART': 'bg-pink-500',
        'OTHER': 'bg-blue-500',
    };

    return (
        <div className="flex items-center gap-6 w-full">
            {categories.map((item) => (
                <div key={item.label} className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-white/30 tracking-wider">{item.label}</span>
                        <span className="text-[10px] font-mono text-white/50">{item.value}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                            className={`h-full ${colorMap[item.label] || 'bg-white/20'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (item.value / 10) * 100)}%` }} // 简单缩放：假设 10 条为满
                            transition={{ duration: 1.2, delay: 0.5, ease: "circOut" }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
