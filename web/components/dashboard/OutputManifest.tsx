'use client'

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Brain, Database, Calendar, Copy, Share2 } from 'lucide-react';
import { InsightData } from '@/components/dashboard/InstantInsightCard';

interface OutputManifestProps {
  data: InsightData | null;
  isProcessing: boolean;
}

export default function OutputManifest({ data, isProcessing }: OutputManifestProps) {
  return (
    <div className="h-full flex flex-col justify-center p-8 relative z-10">
       
      {/* Header */}
      <div className="mb-12 flex flex-col items-end">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-bl from-white via-white/80 to-white/20 font-serif tracking-tight">
          MANIFEST
        </h2>
        <div className="h-1 w-12 bg-blue-500 mt-2 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
      </div>

      <div className="flex-1 flex flex-col gap-6 relative">
        
        {/* Decorative Grid Line */}
        <div className="absolute right-[-32px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {/* 1. The Crystal Slate (AI Insight) */}
        <div className="flex-1 min-h-[300px] relative">
            {isProcessing ? (
                <div className="h-full rounded-2xl bg-[#050505] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
                    {/* Scanning Effect */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-green-500/50 blur-[2px] animate-[scan_2s_ease-in-out_infinite]" />
                    <div className="text-white/20 text-xs font-mono tracking-widest">DECRYPTING SIGNAL...</div>
                    <div className="mt-4 flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />
                        ))}
                    </div>
                </div>
            ) : data ? (
                <motion.div 
                    initial={{ scale: 0.9, rotateX: 10, opacity: 0 }}
                    animate={{ scale: 1, rotateX: 0, opacity: 1 }}
                    className="h-full rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-md border border-white/10 p-8 relative overflow-hidden group hover:border-white/20 transition-colors"
                >
                    {/* Glass Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 h-full flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-2 text-green-400">
                                <Sparkles size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Insight Generated</span>
                            </div>
                            <div className="flex gap-2 text-white/30">
                                <button className="hover:text-white transition-colors"><Copy size={14} /></button>
                                <button className="hover:text-white transition-colors"><Share2 size={14} /></button>
                            </div>
                        </div>
                        
                        {/* Content */}
                        <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{data.title}</h3>
                        <p className="text-sm text-white/70 leading-relaxed font-light mb-8 flex-1">
                            {data.summary}
                        </p>

                        {/* Footer Meta */}
                        <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                            <div className="flex gap-2">
                                {data.tags.map(tag => (
                                    <span key={tag} className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/40 font-mono">#{tag}</span>
                                ))}
                            </div>
                            <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="h-full rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 opacity-50">
                    <Brain size={32} className="text-white/10 mb-4" />
                    <div className="text-xs font-mono text-white/20">AWAITING DATA STREAM</div>
                </div>
            )}
        </div>

        {/* 2. System Stats (Horizontal Bars) */}
        <div className="grid grid-cols-2 gap-4">
            <div className="h-20 rounded-xl bg-black/40 border border-white/10 p-4 flex flex-col justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start">
                     <Database size={16} className="text-blue-400 group-hover:text-blue-300" />
                     <span className="text-[10px] text-white/30 font-mono">GALAXY</span>
                </div>
                <div>
                    <div className="text-lg font-bold text-white">42</div>
                    <div className="text-[10px] text-white/40">Active Nodes</div>
                </div>
            </div>

            <div className="h-20 rounded-xl bg-black/40 border border-white/10 p-4 flex flex-col justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                 <div className="flex justify-between items-start">
                     <Calendar size={16} className="text-purple-400 group-hover:text-purple-300" />
                     <span className="text-[10px] text-white/30 font-mono">REPORT</span>
                </div>
                <div className="w-full">
                    <div className="flex justify-between text-[10px] text-white/40 mb-1">
                        <span>Progress</span>
                        <span>75%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-purple-500" />
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
