'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { useFeedContent } from '@/hooks/useFeedContent';
import { cn } from '@/lib/utils';
import { FeedItem } from '@/app/dashboard/actions';

interface FeedDetailSheetProps {
  feed: FeedItem | null;
  onClose: () => void;
}

export default function FeedDetailSheet({ feed, onClose }: FeedDetailSheetProps) {
  // Use our new hook to lazy load content
  const { content, loading } = useFeedContent(feed?.id || null, feed?.summary);
  const isProcessing = feed?.status === 'processing';

  return (
    <AnimatePresence>
      {feed && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-[#0a0a0a] border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex-1 pr-8">
                 <div className="flex items-center gap-2 mb-3">
                    <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border",
                        isProcessing ? "border-white/10 text-white/20 bg-white/5" :
                        feed.category === 'tech' ? "border-orange-500/30 text-orange-400 bg-orange-500/10" :
                        feed.category === 'life' ? "border-green-500/30 text-green-400 bg-green-500/10" :
                        "border-white/20 text-white/40 bg-white/5"
                    )}>
                        {isProcessing ? 'Synchronizing' : (feed.category || 'OTHER')}
                    </span>
                    <span className="text-white/30 text-xs font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {isProcessing ? "WAITING..." : new Date(feed.created_at).toLocaleDateString()}
                    </span>
                 </div>
                 <h2 className={cn(
                    "text-xl md:text-2xl font-bold leading-tight",
                    isProcessing ? "text-white/40 italic" : "text-white"
                 )}>
                    {feed.title}
                 </h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                {/* Meta Actions */}
                {feed.url && !isProcessing && (
                    <a 
                        href={feed.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 mb-6 transition-colors border-b border-blue-400/20 hover:border-blue-300 pb-0.5"
                    >
                        <ExternalLink className="w-3 h-3" />
                        View Original Source
                    </a>
                )}

                {/* 🤖 AI Intelligence Summary - Simplified Refined Orange Theme */}
                {feed.summary && !isProcessing && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10 p-6 rounded-2xl bg-orange-500/[0.03] border border-orange-500/20 relative group overflow-hidden shadow-[0_0_30px_rgba(249,115,22,0.05)]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                    <Sparkles className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-bold text-orange-400 tracking-wide">AI 总结</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-orange-500/20 to-transparent ml-4" />
                        </div>

                        <p className="text-[15px] md:text-[16px] text-orange-50/90 leading-relaxed font-medium italic relative z-10">
                            “{feed.summary}”
                        </p>
                        
                        {/* Subtle Background Glow */}
                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-orange-500/5 blur-[40px] rounded-full pointer-events-none" />
                    </motion.div>
                )}

                {/* Main Content */}
                <div className="prose prose-invert prose-sm md:prose-base max-w-none">
                    {loading || isProcessing ? (
                         <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="w-8 h-8 animate-spin text-cyan-500/50" />
                                <div className="text-xs text-white/30 font-mono tracking-[0.2em] animate-pulse">
                                    {isProcessing ? "NEURAL LINK ESTABLISHING..." : "RETRIEVING RECORD..."}
                                </div>
                            </div>
                            <div className="space-y-3 opacity-20">
                                <div className="h-2 bg-white/50 rounded w-full"></div>
                                <div className="h-2 bg-white/50 rounded w-5/6"></div>
                                <div className="h-2 bg-white/50 rounded w-4/6"></div>
                            </div>
                         </div>
                    ) : (
                        <div className="space-y-6 text-white/80 font-light leading-relaxed">
                            {content ? content.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
                                <motion.p 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05, duration: 0.5 }}
                                    className="mb-4 last:mb-0"
                                >
                                    {paragraph}
                                </motion.p>
                            )) : (
                                <p className="text-white/20 italic">No content available.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Tags Footer */}
                {feed.tags && feed.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="flex flex-wrap gap-2">
                            {feed.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-white/40">
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
