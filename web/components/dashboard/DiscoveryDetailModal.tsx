'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, ExternalLink, Sparkles, Plus, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiscoveryItem } from '@/app/dashboard/discovery-actions';

interface DiscoveryDetailModalProps {
  item: DiscoveryItem | null;
  onClose: () => void;
  onFeed: (url: string) => Promise<void>;
}

export default function DiscoveryDetailModal({ item, onClose, onFeed }: DiscoveryDetailModalProps) {
  if (!item) return null;

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* 弹窗主体 - 模仿知识星球/精美卡片样式 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0f1115] border border-white/10 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
          >
            {/* 顶部操作条 */}
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1">
              <div className="p-8 md:p-12 space-y-8">
                {/* 来源信息 */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Globe className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white/90">{item.source_name}</h4>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-mono">
                      {new Date(item.created_at).toLocaleDateString()} · {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
              </div>

                {/* 标题 */}
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
                {item.title}
              </h2>

                {/* AI 一句话总结 */}
                <div className="p-6 md:p-8 rounded-2xl bg-cyan-500/[0.03] border border-cyan-500/10 space-y-2">
                  <p className="text-[11px] font-bold text-cyan-400/40 uppercase tracking-[0.2em] font-mono">一句话总结</p>
                  <p className="text-lg md:text-xl text-white/80 italic leading-relaxed">
                    “{item.reason}”
                  </p>
                </div>

                {/* 正文摘要 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[11px] font-bold text-white/10 uppercase tracking-[0.3em] font-mono px-2">结构化深度分析</span>
                    <div className="h-px flex-1 bg-white/5" />
              </div>

                  {/* 分段展示研究主题、方式、结果 */}
                  <div className="space-y-8">
                    {item.summary.includes('主题：') ? (
                      item.summary.split('\n').map((line, i) => {
                        const [label, content] = line.split('：');
                        if (!content) return null;
                        return (
                          <div key={i} className="space-y-2">
                            <h5 className="text-[12px] font-bold text-cyan-400/60 uppercase tracking-widest font-mono flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/40" />
                              {label}
                            </h5>
                            <p className="text-[17px] md:text-[19px] text-white/80 leading-relaxed font-serif pl-3.5 border-l border-white/5">
                              {content}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-[18px] md:text-[20px] text-white/70 leading-loose font-serif whitespace-pre-wrap">
                        {item.summary || "暂无详细内容摘要。"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 底部固定操作区 */}
            <div className="p-6 bg-[#16181d] border-t border-white/5 flex items-center justify-between gap-4">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 text-white/40 hover:text-cyan-400 transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                <span>阅读原文</span>
              </a>

                <button
                  onClick={() => {
                    onFeed(item.url);
                    onClose();
                  }}
                className="flex items-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full font-bold transition-all active:scale-95 shadow-lg shadow-cyan-500/20 text-sm"
                >
                <Plus className="w-4 h-4" />
                注入矩阵 FEED
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
