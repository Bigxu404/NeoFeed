'use client'

import { useState, useMemo } from 'react';
import { GalaxyItem } from '@/types';
import { Search, SlidersHorizontal, ChevronRight, X, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryTerminalProps {
  items: GalaxyItem[];
  onItemHover: (itemId: string | null) => void;
  onItemClick: (item: GalaxyItem) => void;
  className?: string;
}

export default function HistoryTerminal({ items, onItemHover, onItemClick, className = '' }: HistoryTerminalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false); // 默认收起

  // 过滤与时间分组逻辑
  const groupedItems = useMemo(() => {
    const filtered = items.filter(item => {
      const matchesSearch = 
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });

    // 按时间排序
    const sorted = filtered.sort((a, b) => b.timestamp - a.timestamp);

    // 分组
    const groups: { [key: string]: GalaxyItem[] } = {};
    sorted.forEach(item => {
      const date = item.date || '未知时间';
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });

    console.log(`📦 [Terminal] Grouped ${sorted.length} items into ${Object.keys(groups).length} days`);
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [items, searchQuery]);

  return (
    <div className={`fixed left-6 top-24 bottom-8 z-50 flex flex-col pointer-events-none ${className}`}>
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* 🔘 收起状态：黑洞风格按钮，带边缘滚动光效 */
          <motion.button
            key="collapsed-btn"
            initial={{ scale: 0, opacity: 0, x: -20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: -20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(true)}
            className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-xl flex items-center justify-center pointer-events-auto relative group overflow-hidden border border-white/5 shadow-2xl"
          >
            {/* 🌈 边缘滚动光效 (橙、黑、白) */}
            <div className="absolute inset-0 rounded-full p-[1px] overflow-hidden">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#ff8c00,black,#ffffff,black,#ff8c00)] opacity-40 group-hover:opacity-100 transition-opacity"
              />
            </div>

            {/* 🌑 内部黑洞核心 */}
            <div className="absolute inset-[2px] rounded-full bg-black z-10" />
            
            {/* ⚪️ 内部形状：白色带黑色滑动效果 */}
            <div className="relative z-20 w-4 h-4 flex items-center justify-center transition-transform group-hover:scale-110 overflow-hidden">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <mask id="listMask">
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </mask>
                </defs>
                
                {/* 基础白色层 */}
                <path 
                  d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" 
                  stroke="white" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="opacity-40"
                />

                {/* 🏃‍♂️ 黑色滑动层 */}
                <motion.g mask="url(#listMask)">
                  <motion.rect
                    x="-100%"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="black"
                    animate={{ x: ["0%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* 亮白色扫光点 */}
                  <path 
                    d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" 
                    stroke="white" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </motion.g>
              </svg>
            </div>
          </motion.button>
        ) : (
          /* 🚀 展开状态：完整终端面板 */
          <motion.div
            key="expanded-panel"
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex flex-col h-full w-[360px] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden pointer-events-auto shadow-[0_0_50px_-10px_rgba(0,0,0,0.7)]"
          >
            {/* 🟢 顶部控制栏 */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                NEURAL_TERMINAL :: {items.length} NODES
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* 🔍 搜索 */}
            <div className="p-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索知识碎片..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* 📜 滚动列表 (按时间分组) */}
            <div className="flex-1 overflow-y-auto p-2 space-y-6 custom-scrollbar">
              {groupedItems.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-white/20 text-xs gap-2">
                   <Search size={24} />
                   <span>未探测到相关信号</span>
                </div>
              ) : (
                groupedItems.map((group) => (
                  <div key={group.date} className="space-y-2">
                    {/* 🌟 强化后的时间分割线 */}
                    <div className="px-3 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/30" />
                      <span className="text-[10px] font-mono text-blue-400 font-bold tracking-[0.2em] uppercase px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
                        {group.date}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/30" />
                    </div>
                    
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        onMouseEnter={() => onItemHover(item.id)}
                        onMouseLeave={() => onItemHover(null)}
                        onClick={() => onItemClick(item)}
                        className={`
                          group relative p-3 rounded-xl border border-transparent cursor-pointer transition-all duration-200
                          hover:bg-white/5 hover:border-white/10
                        `}
                      >
                        <div className="pl-2">
                          <h3 className="text-sm text-white/80 font-medium leading-snug group-hover:text-white transition-colors line-clamp-2 pr-4">
                            {item.summary}
                          </h3>
                          
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                            <div className="flex gap-1">
                              {item.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="bg-white/5 px-1.5 py-0.5 rounded text-white/40">#{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-hover:text-white/50 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
