'use client'

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Brain } from 'lucide-react';

export interface InsightData {
  title: string;
  summary: string;
  tags: string[];
}

interface InstantInsightCardProps {
  data: InsightData | null;
  isProcessing?: boolean;
}

export default function InstantInsightCard({ data, isProcessing = false }: InstantInsightCardProps) {
  return (
    <div className="h-full flex flex-col border-l border-white/5 bg-black/20 backdrop-blur-md p-6">
      <div className="mb-8">
        <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-4">即时洞察</h2>
        
        {isProcessing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center min-h-[300px]"
          >
            <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-green-500 animate-spin mb-4" />
            <p className="text-sm text-white/50 animate-pulse">正在提取知识...</p>
          </motion.div>
        ) : data ? (
          <motion.div 
            key={data.title}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative p-6 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-20">
               <Brain size={48} className="text-white" />
             </div>

             <div className="relative z-10">
               <div className="flex items-center gap-2 text-green-400 mb-3">
                 <Sparkles size={14} />
                 <span className="text-xs font-bold uppercase tracking-wider">AI 摘要已生成</span>
               </div>
               
               <h3 className="text-xl font-bold text-white mb-4">{data.title}</h3>
               
               <p className="text-sm text-white/70 leading-relaxed mb-6">
                 "{data.summary}"
               </p>

               <div className="flex flex-wrap gap-2 mb-6">
                 {data.tags.map(tag => (
                   <span key={tag} className="text-xs px-2 py-1 rounded bg-white/5 text-white/50">#{tag}</span>
                 ))}
               </div>

               <button className="w-full py-3 rounded-lg bg-white text-black font-bold text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
                 查看完整分析 <ArrowRight size={14} />
               </button>
             </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <Brain size={32} className="text-white/20 mb-4" />
            <p className="text-white/30 text-sm">投喂系统以生成洞察。</p>
          </div>
        )}
      </div>

      {/* Empty State Hint */}
      <div className="flex-1 flex items-center justify-center text-center">
        <div className="text-white/20 text-sm">
          <p>{!data && !isProcessing ? '等待信号输入...' : '系统运行中'}</p>
        </div>
      </div>
    </div>
  );
}

