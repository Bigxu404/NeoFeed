'use client';

import React, { memo, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, 
  Loader2, 
  Sparkles, 
  Trash2, 
  Search, 
  X, 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ScrambleText from '@/components/ui/ScrambleText';
import type { FeedItem } from '@/app/dashboard/actions';
import { Skeleton } from '@/components/ui/Skeleton';

const FeedSkeleton = () => (
    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col h-full space-y-4">
        <div className="flex items-start justify-between">
            <Skeleton className="w-7 h-7 rounded" />
            <Skeleton className="w-16 h-3" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
        </div>
        <div className="flex gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
        </div>
    </div>
);

const FeedCard = memo(({ 
    item, 
    onSelect, 
    onSummarize, 
    onDelete 
}: { 
    item: FeedItem, 
    onSelect: (item: FeedItem) => void, 
    onSummarize: (e: React.MouseEvent, id: string) => void, 
    onDelete: (e: React.MouseEvent, id: string) => void 
}) => {
    const isProcessing = item.status === 'processing';
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            whileHover={{ y: -4 }}
            onClick={() => !isProcessing && onSelect(item)} 
            className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer group/card flex flex-col h-full relative",
                isProcessing 
                    ? "bg-white/[0.02] border-white/5 cursor-wait overflow-hidden" 
                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-cyan-500/30 shadow-lg hover:shadow-cyan-500/5"
            )}
        >
            {/* Processing 扫描线效果 */}
            {isProcessing && (
                <motion.div 
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-1/2 w-full z-0"
                    animate={{ y: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
            )}

            <div className="flex items-start justify-between mb-3 relative z-10">
                <div className={cn(
                    "w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold uppercase",
                    isProcessing ? "bg-white/5 text-white/20" : "bg-gradient-to-br from-gray-800 to-black text-white border border-white/10"
                )}>
                    {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : (item.category?.slice(0, 2) || 'AI')}
                </div>
                <span className="text-[9px] text-white/30 font-mono">
                    {isProcessing ? "SYNCHRONIZING..." : new Date(item.created_at).toLocaleDateString()}
                </span>
            </div>
            <h3 className={cn(
                "text-sm font-bold leading-snug mb-2 transition-colors line-clamp-2 relative z-10 font-mono uppercase tracking-tight",
                isProcessing ? "text-white/40" : "group-hover/card:text-cyan-400"
            )}>
                <ScrambleText text={item.title || 'Untitled Signal'} />
            </h3>
            <p className="text-xs text-white/40 line-clamp-2 mb-3 flex-1 relative z-10 font-light leading-relaxed">
                {item.summary || (isProcessing ? '正在链接神经网络，提取核心洞察...' : '等待分析...')}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 relative z-10">
                <div className="flex flex-wrap gap-1">
                    {!isProcessing && item.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[8px] text-cyan-300 uppercase font-mono">#{tag}</span>
                    ))}
                </div>
                
                {/* 🛠️ 操作按钮：在移动端始终显示，在桌面端悬停显示 */}
                <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-all duration-200 translate-y-0 md:translate-y-1 md:group-hover/card:translate-y-0">
                    {!isProcessing && (
                        <button 
                            onClick={(e) => onSummarize(e, item.id)}
                            className="p-1.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-white/40 hover:text-cyan-400 transition-all border border-white/10"
                            title="AI 重新总结"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button 
                        onClick={(e) => onDelete(e, item.id)}
                        className="p-1.5 rounded-md bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all border border-white/10"
                        title="删除条目"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
});

FeedCard.displayName = 'FeedCard';

interface InsightStreamProps {
    feeds: FeedItem[];
    feedsLoading: boolean;
    onSummarize: (e: React.MouseEvent, id: string) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onSelectFeed: (item: FeedItem) => void;
}

export default function InsightStream({ 
    feeds, 
    feedsLoading, 
    onSummarize, 
    onDelete,
    onSelectFeed
}: InsightStreamProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFeeds = useMemo(() => {
        if (!searchQuery.trim()) return feeds;
        const q = searchQuery.toLowerCase();
        return feeds.filter(f => 
            f.title?.toLowerCase().includes(q) || 
            f.summary?.toLowerCase().includes(q) ||
            f.tags?.some(t => t.toLowerCase().includes(q))
        );
    }, [feeds, searchQuery]);

    return (
        <div className="flex flex-col h-full text-left">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded border border-cyan-500/40">
                        <Radio className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-[0.2em] text-white uppercase font-mono">Insight_Stream</h2>
                        <p className="text-[8px] text-cyan-500/60 font-mono tracking-widest uppercase leading-none mt-1">Neural Intelligence Feed</p>
                    </div>
                </div>

                {/* 🔍 Quick Search */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className={cn("w-3.5 h-3.5 transition-colors", searchQuery ? "text-cyan-400" : "text-white/20")} />
                    </div>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="快速检索..."
                        className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-8 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all w-32 group-hover:w-48 font-mono"
                    />
                </div>
            </div>

            {feedsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <FeedSkeleton key={i} />)}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pt-2 px-2 custom-scrollbar -mr-2 min-h-0">
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                        <AnimatePresence mode='popLayout'>
                            {filteredFeeds.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full text-center text-white/20 py-20 font-mono text-[10px] uppercase tracking-[0.3em] border border-dashed border-white/5 rounded-2xl"
                                >
                                    {searchQuery ? "No matching signals detected." : "Void detected. Awaiting ingestion."}
                                </motion.div>
                            ) : (
                                filteredFeeds.map((item) => (
                                    <FeedCard 
                                        key={item.id}
                                        item={item}
                                        onSelect={onSelectFeed}
                                        onSummarize={onSummarize}
                                        onDelete={onDelete}
                                    />
                                ))
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
