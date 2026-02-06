'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Telescope, RefreshCw, Plus, ExternalLink, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { DiscoveryItem, getDiscoveryItems } from '@/app/dashboard/discovery-actions';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import DualPaneModal from '@/components/dashboard/DualPaneModal';
import { GalaxyItem } from '@/types';

interface DiscoveryStreamProps {
    onFeed: (url: string) => Promise<void>;
}

export default function DiscoveryStream({ onFeed }: DiscoveryStreamProps) {
    const [items, setItems] = useState<DiscoveryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedItem, setSelectedItem] = useState<GalaxyItem | null>(null);

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

    const handleSelectItem = useCallback((item: DiscoveryItem) => {
        const galaxyItem: GalaxyItem = {
            id: item.id,
            summary: item.title,
            content: item.summary, 
            date: new Date(item.created_at).toISOString().split('T')[0],
            timestamp: new Date(item.created_at).getTime(),
            category: 'other',
            tags: [],
            color: '#00ffff',
            size: 1,
            position: [0, 0, 0]
        };
        setSelectedItem(galaxyItem);
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Telescope className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">发现流 Discovery</span>
                </div>
                <button 
                    onClick={handleRefresh}
                    className="p-1.5 rounded-full hover:bg-white/5 text-white/20 hover:text-cyan-400 transition-all"
                    title="换一换"
                >
                    <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                </button>
            </div>

            <div className="flex-1 space-y-4 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            {[1, 2, 3].map(i => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ))}
                        </motion.div>
                    ) : items.length === 0 ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center p-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Telescope className="w-6 h-6 text-white/10" />
                            </div>
                            <p className="text-[10px] text-white/20 font-mono">暂无发现信号。<br/>请在设置中配置 RSS 订阅。</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {displayItems.map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={() => handleSelectItem(item)}
                                    className="group/item relative p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[8px] text-cyan-500/60 font-mono truncate max-w-[120px]">
                                            {item.source_name}
                                        </span>
                                        <div className="flex gap-2">
                                            <a 
                                                href={item.url} 
                                                target="_blank" 
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-white/10 hover:text-white transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                    <h4 className="text-xs font-medium text-white/80 line-clamp-1 mb-1.5 group-hover/item:text-cyan-400 transition-colors">
                                        {item.title}
                                    </h4>
                                    <p className="text-[10px] text-white/40 line-clamp-2 mb-2 leading-relaxed font-light">
                                        {item.summary}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                                        <div className="flex items-start gap-1.5 py-0.5 px-2 rounded bg-cyan-500/10 border border-cyan-500/10">
                                            <Sparkles className="w-2.5 h-2.5 text-cyan-400 shrink-0 mt-0.5" />
                                            <span className="text-[8px] text-cyan-300/80 leading-tight italic">
                                                {item.reason}
                                            </span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onFeed(item.url);
                                        }}
                                        className="mt-3 w-full py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-black text-[9px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover/item:opacity-100"
                                    >
                                        <Plus className="w-3 h-3" /> Feed to Matrix
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {items.length > 3 && (
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-center gap-1">
                    {Array.from({ length: Math.ceil(items.length / 3) }).map((_, i) => (
                        <div 
                            key={i}
                            className={cn(
                                "w-1 h-1 rounded-full transition-all",
                                Math.floor(currentIndex / 3) === i ? "bg-cyan-400 w-3" : "bg-white/10"
                            )}
                        />
                    ))}
                </div>
            )}

            {/* 🌟 发现流专用双栏模态框 */}
            <DualPaneModal 
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                item={selectedItem}
                isDiscovery={true}
            />
        </div>
    );
}
