'use client'

import { motion } from 'framer-motion';
import { FileText, Link as LinkIcon, Clock } from 'lucide-react';

export interface FeedItem {
  id: number;
  title: string;
  type: string;
  time: string;
  status: 'processing' | 'done';
}

interface FeedStreamProps {
  items: FeedItem[];
}

export default function FeedStream({ items }: FeedStreamProps) {
  return (
    <div className="h-full flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-md">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest">实时输入流</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {items.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            layout
            className="p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                item.type === 'tech' ? 'border-blue-500/30 text-blue-400' : 
                item.type === 'design' ? 'border-purple-500/30 text-purple-400' :
                item.type === 'idea' ? 'border-green-500/30 text-green-400' :
                'border-white/20 text-white/40'
              }`}>
                {item.type.toUpperCase()}
              </span>
              {item.status === 'processing' && (
                <span className="flex items-center gap-1.5 text-[10px] text-orange-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  处理中
                </span>
              )}
            </div>
            
            <h3 className="text-sm font-medium text-white/90 group-hover:text-white leading-tight mb-2">
              {item.title}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-white/30">
              <Clock size={10} />
              <span>{item.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

