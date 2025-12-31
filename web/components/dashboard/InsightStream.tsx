'use client';

import React, { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Loader2, Sparkles, Trash2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BentoCard } from './BentoGrid';
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
            onClick={() => onSelect(item)} 
            className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer group/card flex flex-col h-full relative overflow-hidden",
                isProcessing 
                    ? "bg-white/[0.02] border-white/5 cursor-wait" 
                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 shadow-lg hover:shadow-cyan-500/5"
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
                    isProcessing ? "bg-white/5 text-white/20" : "bg-gradient-to-br from-gray-800 to-black text-white"
                )}>
                    {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : (item.category?.slice(0, 2) || 'AI')}
                </div>
                <span className="text-[9px] text-white/30 font-mono">
                    {isProcessing ? "SYNCHRONIZING..." : new Date(item.created_at).toLocaleDateString()}
                </span>
            </div>
            <h3 className={cn(
                "text-sm font-medium leading-snug mb-2 transition-colors line-clamp-2 relative z-10",
                isProcessing ? "text-white/40" : "group-hover/card:text-cyan-400"
            )}>
                <ScrambleText text={item.title || 'Untitled Signal'} />
            </h3>
            <p className="text-xs text-white/40 line-clamp-2 mb-3 flex-1 relative z-10">
                {item.summary || (isProcessing ? '正在链接神经网络，提取核心洞察...' : '等待分析...')}
            </p>
            <div className="flex flex-wrap gap-1 mt-auto relative z-10">
                {isProcessing ? (
                    <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                ) : (
                    item.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 rounded-md bg-white/5 text-[8px] text-white/40 uppercase">#{tag}</span>
                    ))
                )}
            </div>

            {/* Action Buttons - Show on hovering */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 z-20">
                {!isProcessing && (
                    <button 
                        onClick={(e) => onSummarize(e, item.id)}
                        className="p-2 rounded-lg bg-cyan-500/0 hover:bg-cyan-500/20 text-white/0 group-hover/card:text-cyan-400/60 hover:text-cyan-400 transition-all"
                        title="AI 重新总结"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                    </button>
                )}
                <button 
                    onClick={(e) => onDelete(e, item.id)}
                    className="p-2 rounded-lg bg-red-500/0 hover:bg-red-500/20 text-white/0 group-hover/card:text-red-400/60 hover:text-red-400 transition-all"
                    title="删除条目"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.div>
    );
});

FeedCard.displayName = 'FeedCard';

interface InsightStreamProps {
    feeds: FeedItem[];
    feedsLoading: boolean;
    onSelectFeed: (item: FeedItem) => void;
    onSummarize: (e: React.MouseEvent, id: string) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
}

export default function InsightStream({ 
    feeds, 
    feedsLoading, 
    onSelectFeed, 
    onSummarize, 
    onDelete 
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
        <BentoCard colSpan={3} rowSpan={2} className="min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold tracking-widest uppercase text-white/40">洞察流 Insight Stream</span>
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
                        className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-8 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all w-32 group-hover:w-48"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-2 flex items-center text-white/20 hover:text-white transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {feedsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <FeedSkeleton key={i} />)}
                </div>
            ) : (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <AnimatePresence mode='popLayout'>
                        {filteredFeeds.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-3 text-center text-white/30 py-10 font-mono text-xs"
                            >
                                {searchQuery ? "未找到匹配的信号。" : "虚空中暂无信号。"}
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
            )}
        </BentoCard>
    );
}

