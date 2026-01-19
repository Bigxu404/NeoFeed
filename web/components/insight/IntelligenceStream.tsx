'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Telescope, 
  RefreshCw, 
  Plus, 
  ExternalLink, 
  Sparkles,
  Zap
} from 'lucide-react';
import { DiscoveryItem, getDiscoveryItems } from '@/app/dashboard/discovery-actions';
import { Skeleton } from '@/components/ui/Skeleton';
import DiscoveryDetailModal from '@/components/dashboard/DiscoveryDetailModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function IntelligenceStream({ onFeed }: { onFeed: (url: string) => Promise<void> }) {
    const [items, setItems] = useState<DiscoveryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<DiscoveryItem | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await getDiscoveryItems();
        if (error) {
            toast.error('获取订阅内容失败');
        } else {
            setItems(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    return (
        <div className="flex flex-col h-full p-6 md:p-10 space-y-8 max-w-[900px] mx-auto pb-32">
            {/* 头部区域 */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                        <Telescope className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-xl font-bold text-white/80 uppercase tracking-tight font-mono">RSS 的 订 阅 内 容</h2>
                    </div>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">RSS_FEED // 实时获取订阅源最新动态</p>
                </div>
                <button 
                    onClick={fetchItems}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-white/40 hover:text-cyan-400 transition-all disabled:opacity-50 group"
                >
                    <RefreshCw className={cn("w-3.5 h-3.5", loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500")} />
                    刷新信号
                </button>
            </div>

            {/* 信号列表 */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] space-y-3">
                                    <Skeleton className="h-4 w-1/4 bg-white/5" />
                                    <Skeleton className="h-6 w-3/4 bg-white/5" />
                                    <Skeleton className="h-4 w-full bg-white/5" />
                                </div>
                            ))}
                        </motion.div>
                    ) : items.length === 0 ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-32 text-center space-y-4 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl"
                        >
                            <Telescope className="w-12 h-12 text-white/5" />
                            <div className="space-y-1">
                                <p className="text-sm text-white/20 font-medium uppercase tracking-widest">未探测到活跃信号</p>
                                <p className="text-[10px] text-white/10 font-mono uppercase">请在左侧控制塔配置信号来源。</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item, idx) => (
                                <motion.div 
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setSelectedItem(item)}
                                    className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/[0.02] transition-all cursor-pointer overflow-hidden shadow-sm active:scale-[0.99]"
                                >
                                    <div className="flex flex-col gap-3">
                                        {/* 元数据 */}
                                        <div className="flex items-center justify-between text-[11px] font-mono">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded bg-white/5 text-white/40 font-bold uppercase tracking-wider">
                                                    {item.source_name}
                                                </span>
                                                {item.category && (
                                                    <>
                                                        <span className="text-white/10">//</span>
                                                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400/60 font-bold tracking-widest">
                                                            #{item.category}
                                                        </span>
                                                    </>
                                                )}
                                                <span className="text-white/10">//</span>
                                                <span className="text-white/20">
                                                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-cyan-400/60 font-medium">
                                                点击查看详情 <Plus size={12} />
                                            </div>
                                        </div>

                                        {/* 内容 */}
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-white/90 group-hover:text-cyan-400 transition-colors leading-tight tracking-tight">
                                                {item.title}
                                            </h3>
                                            {/* 展示“一句话总结” */}
                                            <p className="text-[15px] text-cyan-400/80 font-medium leading-relaxed italic">
                                                “{item.reason}”
                                            </p>
                                        </div>

                                        {/* 来源信息 */}
                                        <div className="flex items-center gap-2 pt-2">
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/40 font-mono">
                                                <Sparkles className="w-3 h-3" />
                                                {item.source_name}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 悬浮光晕效果 */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/[0.02] to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* 详情弹窗 */}
            <DiscoveryDetailModal 
                item={selectedItem} 
                onClose={() => setSelectedItem(null)} 
                onFeed={onFeed}
            />
        </div>
    );
}
