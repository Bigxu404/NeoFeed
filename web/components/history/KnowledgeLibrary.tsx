'use client';

import React, { useState, useMemo } from 'react';
import { GalaxyItem } from '@/types';
import { Search, BookOpen, PenTool, Calendar, ArrowUpRight, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KnowledgeLibraryProps {
  items: GalaxyItem[];
  onItemClick: (item: GalaxyItem) => void;
}

export default function KnowledgeLibrary({ items, onItemClick }: KnowledgeLibraryProps) {
  const [activeTab, setActiveTab] = useState<'feeds' | 'notes'>('feeds');
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤逻辑
  const filteredItems = useMemo(() => {
    let result = items;

    // 1. Tab 过滤
    if (activeTab === 'notes') {
      result = result.filter(item => item.user_notes && item.user_notes.trim().length > 0);
    }

    // 2. 搜索过滤
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title?.toLowerCase().includes(q) || 
        item.summary?.toLowerCase().includes(q) ||
        item.user_notes?.toLowerCase().includes(q) ||
        item.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [items, activeTab, searchQuery]);

  return (
    <div className="w-full h-full flex flex-col bg-[#050508] text-white overflow-hidden">
      
      {/* ── Header Area ── */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-white/5 bg-[#050508]/80 backdrop-blur-md z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg self-start">
            <button
              onClick={() => setActiveTab('feeds')}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2
                ${activeTab === 'feeds' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}
              `}
            >
              <BookOpen className="w-4 h-4" />
              全量收藏
              <span className="text-xs opacity-50 ml-1">{items.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2
                ${activeTab === 'notes' ? 'bg-amber-500/20 text-amber-300 shadow-sm' : 'text-white/40 hover:text-white/70'}
              `}
            >
              <PenTool className="w-4 h-4" />
              思考结晶
              <span className="text-xs opacity-50 ml-1">
                {items.filter(i => i.user_notes).length}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white/70 transition-colors" />
            <input 
              type="text" 
              placeholder={activeTab === 'feeds' ? "搜索文章标题、摘要..." : "搜索我的笔记..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Content List ── */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  onClick={() => onItemClick(item)}
                  className={`
                    group relative p-6 rounded-xl border transition-all cursor-pointer hover:scale-[1.01]
                    ${activeTab === 'notes' 
                      ? 'bg-amber-900/5 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-900/10' 
                      : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}
                  `}
                >
                  {/* 如果是笔记模式，优先展示笔记内容 */}
                  {activeTab === 'notes' && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2 text-amber-400/80 text-xs font-mono uppercase tracking-wider">
                        <PenTool className="w-3 h-3" />
                        MY THOUGHTS
                      </div>
                      <p className="text-white/90 text-base leading-relaxed font-serif italic border-l-2 border-amber-500/30 pl-4 py-1">
                        "{item.user_notes}"
                      </p>
                      {/* 笔记标签 */}
                      {item.user_tags && item.user_tags.length > 0 && (
                        <div className="flex gap-2 mt-3 pl-4">
                          {item.user_tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/70 border border-amber-500/10">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 文章原文信息 */}
                  <div className={`flex justify-between items-start gap-4 ${activeTab === 'notes' ? 'pt-4 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity' : ''}`}>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-white/50 line-clamp-2 mb-3 font-light">
                        {item.summary}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-white/30 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.date}
                        </span>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Tag className="w-3 h-3" />
                            {item.tags.slice(0, 3).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Icon */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-white/20">
                <div className="text-4xl mb-4">∅</div>
                <p className="font-mono text-sm">
                  {activeTab === 'notes' ? "暂无思考结晶。去阅读并记录你的想法吧。" : "暂无收藏内容。"}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}