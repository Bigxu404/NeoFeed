'use client'

import { useState, useMemo } from 'react';
import { GalaxyItem } from '@/types';
import { Search, SlidersHorizontal, Tag, Calendar, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryTerminalProps {
  items: GalaxyItem[];
  onItemHover: (itemId: string | null) => void;
  onItemClick: (item: GalaxyItem) => void;
  className?: string;
}

export default function HistoryTerminal({ items, onItemHover, onItemClick, className = '' }: HistoryTerminalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'tech' | 'life' | 'idea'>('all');
  const [isExpanded, setIsExpanded] = useState(true); // 控制终端展开/收起

  // 过滤逻辑
  const filteredItems = useMemo(() => {
    const filtered = items.filter(item => {
      const matchesSearch = 
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // ⏰ 显式按 timestamp 倒序排列 (Newest first)
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [items, searchQuery, selectedCategory]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: items.length,
      tech: items.filter(i => i.category === 'tech').length,
      life: items.filter(i => i.category === 'life').length,
      idea: items.filter(i => i.category === 'idea').length,
    };
  }, [items]);

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`fixed left-4 top-24 bottom-8 z-20 flex flex-col ${className} pointer-events-none`} // 容器穿透点击，内部元素恢复
    >
      {/* 🚀 终端主面板 */}
      <div className={`
        flex flex-col h-full bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 ease-in-out
        ${isExpanded ? 'w-[360px] opacity-100' : 'w-12 opacity-60 hover:opacity-100'}
        pointer-events-auto shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)]
      `}>
        
        {/* 🟢 顶部控制栏 */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          {isExpanded ? (
            <div className="flex items-center gap-2 text-xs font-mono text-blue-300/80">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              TERMINAL_V0.9 :: CONNECTED
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
          )}
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
          >
             {isExpanded ? <X size={14} /> : <SlidersHorizontal size={16} />}
          </button>
        </div>

        {/* 展开状态下的内容 */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* 🔍 搜索与筛选 */}
              <div className="p-4 space-y-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4 group-focus-within:text-blue-400 transition-colors" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索星系数据..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                {/* 分类 Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {[
                    { id: 'all', label: 'ALL', count: stats.total, color: 'bg-white/10 text-white' },
                    { id: 'tech', label: 'TECH', count: stats.tech, color: 'bg-orange-500/20 text-orange-200 border-orange-500/30' },
                    { id: 'life', label: 'LIFE', count: stats.life, color: 'bg-green-500/20 text-green-200 border-green-500/30' },
                    { id: 'idea', label: 'IDEA', count: stats.idea, color: 'bg-purple-500/20 text-purple-200 border-purple-500/30' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-2
                        ${selectedCategory === cat.id 
                          ? `${cat.color.split(' ')[1]} border-transparent bg-white/20` 
                          : 'bg-transparent border-white/5 text-white/40 hover:bg-white/5'}
                      `}
                    >
                      {cat.label}
                      <span className="opacity-50 text-[10px]">{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 📜 滚动列表 */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredItems.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-white/20 text-xs gap-2">
                     <Search size={24} />
                     <span>未探测到相关信号</span>
                  </div>
                ) : (
                  filteredItems.map((item, index) => (
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
                      {/* ✨ 新增：最新的 3 个项目显示 NEW 标签 */}
                      {index < 3 && searchQuery === '' && selectedCategory === 'all' && (
                        <div className="absolute right-2 top-2 text-[9px] font-bold text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                          NEW
                        </div>
                      )}

                      {/* 左侧装饰线 (根据分类变色) */}
                      <div className={`
                        absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full transition-all duration-300
                        ${item.category === 'tech' ? 'bg-orange-500' : item.category === 'life' ? 'bg-green-500' : 'bg-white'}
                        opacity-0 group-hover:opacity-100 group-hover:w-1
                      `} />

                      <div className="pl-2">
                        <h3 className="text-sm text-white/80 font-medium leading-snug group-hover:text-white transition-colors line-clamp-2 pr-8">
                          {item.summary}
                        </h3>
                        
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                          <div className="flex items-center gap-1">
                            <Calendar size={10} />
                            {item.date}
                          </div>
                          <div className="flex gap-1">
                            {item.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="bg-white/5 px-1.5 py-0.5 rounded text-white/40">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 右侧箭头 */}
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-hover:text-white/50 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
