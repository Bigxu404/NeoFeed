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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header / Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
            
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              {/* Top Meta */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <Globe className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-cyan-500/60 uppercase tracking-widest leading-none mb-1">Source Signal</p>
                    <p className="text-xs font-mono text-white/60">{item.source_name}</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title */}
              <h2 className="text-xl md:text-3xl font-bold text-white mb-6 leading-tight">
                {item.title}
              </h2>

              {/* AI Recommendation Reason */}
              <div className="mb-8 p-4 rounded-2xl bg-cyan-500/[0.03] border border-cyan-500/10 flex items-start gap-3 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 relative z-10" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 opacity-70">AI Intelligence Insight</p>
                  <p className="text-sm text-cyan-100/80 italic leading-relaxed">
                    “{item.reason}”
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-4 mb-8">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Signal Abstract</p>
                <div className="text-base text-white/70 leading-relaxed font-light">
                  {item.summary || "No summary available for this signal."}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-white/5 mt-auto">
                <button
                  onClick={() => {
                    onFeed(item.url);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-cyan-500 text-black rounded-2xl font-bold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Feed to Neural Matrix
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl transition-all border border-white/10"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium whitespace-nowrap">View Source</span>
                </a>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
              <p className="text-[9px] font-mono text-white/10 tracking-[0.3em] uppercase">
                Matrix Signal Interception // Protocol 0.9.4
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

