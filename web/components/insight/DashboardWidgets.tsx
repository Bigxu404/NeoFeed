'use client'

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Globe, Lightbulb, ChevronRight, RefreshCw, Plus, ExternalLink } from 'lucide-react';
import { DiscoveryItem, getDiscoveryItems } from '@/app/dashboard/discovery-actions';
import { Skeleton } from '@/components/ui/Skeleton';
import DiscoveryDetailModal from '../dashboard/DiscoveryDetailModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

// 📟 打字机效果组件 (支持分段展示)
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

  const paragraphs = useMemo(() => {
    return displayedText.split('\n').filter(p => p.trim());
  }, [displayedText]);

  return (
    <div className="font-serif text-lg md:text-xl text-white/90 leading-relaxed tracking-wide drop-shadow-[0_0_8px_rgba(34,197,94,0.3)] space-y-4">
      {paragraphs.map((p, idx) => (
        <p key={idx}>
          {p}
          {idx === paragraphs.length - 1 && displayedText.length < text.length && (
            <span className="animate-pulse ml-1 text-green-400">|</span>
          )}
        </p>
      ))}
      {displayedText.length === text.length && paragraphs.length === 0 && (
          <p className="text-white/20 italic">No content available.</p>
      )}
    </div>
  );
}

// 🌍 左侧：每日洞察 (现在连接到 Discovery Stream)
export function DailyDiscovery({ onFeed }: { onFeed?: (url: string) => Promise<void> }) {
    const [items, setItems] = useState<DiscoveryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedItem, setSelectedItem] = useState<DiscoveryItem | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await getDiscoveryItems();
        if (error) {
            toast.error('获取发现流失败');
        } else {
            setItems(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const displayItems = useMemo(() => {
        if (items.length <= 3) return items;
        return items.slice(currentIndex, currentIndex + 3);
    }, [items, currentIndex]);

    const handleRefresh = () => {
        if (items.length <= 3) {
            fetchItems();
        } else {
            setCurrentIndex(prev => (prev + 3 >= items.length ? 0 : prev + 3));
        }
    };

    const handleFeedClick = async (e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        if (onFeed) {
            await onFeed(url);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 space-y-4">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                                    <Skeleton className="h-3 w-1/4" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            ))}
                        </motion.div>
                    ) : items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 text-white/20 font-mono text-[10px]">
                            NO_SIGNALS_FOUND
                        </div>
                    ) : (
                        <motion.div 
                            key={currentIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {displayItems.map((item) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => setSelectedItem(item)}
                                    className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/40 hover:bg-green-900/10 transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="relative z-10 flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-mono text-green-300/70 uppercase tracking-wider truncate max-w-[100px]">
                                            {item.source_name}
                                        </span>
                                        <div className="flex gap-2">
                                            <a href={item.url} target="_blank" className="text-white/10 hover:text-white transition-colors">
                                                <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    </div>
                                    <h4 className="relative z-10 text-sm text-white/70 group-hover:text-white leading-snug mb-2">
                                        {item.title}
                                    </h4>
                                    
                                    {/* Intelligence Reason (Small) */}
                                    <div className="relative z-10 flex items-center gap-1.5 text-[9px] text-green-400/60 font-mono italic">
                                        <Sparkles size={10} />
                                        <span className="truncate">{item.reason}</span>
                                    </div>

                                    {/* Hover Action */}
                                    <button 
                                        onClick={(e) => handleFeedClick(e, item.url)}
                                        className="absolute bottom-2 right-2 p-1.5 rounded-full bg-green-500 text-black scale-0 group-hover:scale-100 transition-transform duration-300 z-20"
                                        title="Feed to Matrix"
                                    >
                                        <Plus size={12} strokeWidth={3} />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button 
                onClick={handleRefresh}
                disabled={loading}
                className="w-full py-3 text-xs text-white/30 hover:text-green-400 border-t border-white/5 mt-4 transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
            >
                <RefreshCw size={12} className={cn("group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} /> 
                {items.length > 3 ? 'SWAP_SIGNALS' : 'REFRESH_STREAM'}
            </button>

            <DiscoveryDetailModal 
                item={selectedItem} 
                onClose={() => setSelectedItem(null)} 
                onFeed={async (url) => {
                    if (onFeed) await onFeed(url);
                }}
            />
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
