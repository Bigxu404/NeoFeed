'use client'

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, GitPullRequestArrow, Clock, Maximize2 } from 'lucide-react';
import { GalaxyItem } from '@/types';

interface SlowUniverseHUDProps {
  data: GalaxyItem[];
  isVisible: boolean;
  isTopView: boolean;
  onToggleTopView: () => void;
}

const SlowUniverseHUD: React.FC<SlowUniverseHUDProps> = ({ data, isVisible, isTopView, onToggleTopView }) => {
  const { totalNodes, tagCounts, lastUpdated } = useMemo(() => {
    const total = data.length;
    const counts: { [key: string]: number } = {};
    
    data.forEach(item => {
      const itemTags = item.tags || (item.category ? [item.category] : ['未分类']);
      itemTags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    return {
      totalNodes: total,
      tagCounts: counts,
      lastUpdated: new Date().toLocaleString(), // 模拟更新时间
    };
  }, [data]);

  const sortedTags = useMemo(() => {
    return Object.entries(tagCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3);
  }, [tagCounts]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-2xl p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto flex flex-col gap-4"
        >
          <div className="flex justify-between items-center text-white/80 text-xs font-mono tracking-wider">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>知识总量: <span className="text-white">{totalNodes}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <GitPullRequestArrow className="w-3.5 h-3.5 text-purple-400" />
              <span>核心领域: <span className="text-white">{sortedTags.map(([tag]) => tag).join(', ') || '无'}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-green-400" />
              <span>同步时间: <span className="text-white">{lastUpdated}</span></span>
            </div>
          </div>

          <div className="h-px bg-white/5 w-full" />

          <div className="flex justify-center">
            <button
              onClick={onToggleTopView}
              className={`
                flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-all
                ${isTopView 
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                  : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'}
              `}
            >
              <Maximize2 className={`w-3 h-3 ${isTopView ? 'rotate-90' : ''} transition-transform`} />
              {isTopView ? '退出俯视视角' : '切换俯视视角'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SlowUniverseHUD;
