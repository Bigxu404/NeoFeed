'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Trash2, Sparkles, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeedItem } from '@/app/dashboard/actions';

// ── 分类配色 ──
const categoryColors: Record<string, { border: string; bg: string; text: string; accent: string }> = {
  tech:  { border: 'border-cyan-500/30',    bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    accent: 'cyan' },
  life:  { border: 'border-amber-500/30',   bg: 'bg-amber-500/10',   text: 'text-amber-400',   accent: 'amber' },
  idea:  { border: 'border-violet-500/30',  bg: 'bg-violet-500/10',  text: 'text-violet-400',  accent: 'violet' },
  art:   { border: 'border-rose-500/30',    bg: 'bg-rose-500/10',    text: 'text-rose-400',    accent: 'rose' },
  other: { border: 'border-white/10',       bg: 'bg-white/5',        text: 'text-white/50',    accent: 'white' },
};

const categoryLabels: Record<string, string> = {
  tech: '科技与未来',
  life: '生活方式',
  idea: '灵感与思考',
  art: '艺术与设计',
  other: '未分类',
};

function getCategoryStyle(cat: string) {
  return categoryColors[cat] || categoryColors.other;
}

interface CategorySectionProps {
  category: string;
  items: FeedItem[];
  totalFeedCount?: number;
  onSelectFeed: (item: FeedItem) => void;
  onSummarize: (e: React.MouseEvent, id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

// ── 操作按钮（共享） ──
function ActionButtons({ item, onSummarize, onDelete }: { item: FeedItem; onSummarize: (e: React.MouseEvent, id: string) => void; onDelete: (e: React.MouseEvent, id: string) => void }) {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity absolute bottom-4 right-4 z-10">
      <button onClick={(e) => onSummarize(e, item.id)} className="p-1.5 rounded-md bg-black/50 hover:bg-cyan-500/20 text-white/30 hover:text-cyan-400 transition-all backdrop-blur-sm border border-white/5" title="AI 重新总结">
        <Sparkles className="w-3 h-3" />
      </button>
      <button onClick={(e) => onDelete(e, item.id)} className="p-1.5 rounded-md bg-black/50 hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all backdrop-blur-sm border border-white/5" title="删除">
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 布局 A：信号矩阵 — tech
// 三段式：头条 → 精选网格 → 终端信号流
// ═══════════════════════════════════════════════════════
function TechLayout({ items, onSelectFeed, onSummarize, onDelete }: { items: FeedItem[]; onSelectFeed: (item: FeedItem) => void; onSummarize: (e: React.MouseEvent, id: string) => void; onDelete: (e: React.MouseEvent, id: string) => void }) {
  const lead = items[0];
  const featured = items.slice(1, 4);
  const stream = items.slice(4);

  return (
    <div className="space-y-4">
      {/* ── 头条 ── */}
      {lead && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
          onClick={() => onSelectFeed(lead)}
          className="group/card cursor-pointer rounded-xl bg-[#202022] border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden"
        >
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[22px] font-serif text-white/10 group-hover/card:text-white/20 font-bold leading-none transition-colors">01</span>
                <span className="text-[10px] text-white/25 group-hover/card:text-white/40 font-mono transition-colors">
                  {new Date(lead.created_at).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white/90 leading-snug group-hover/card:text-white transition-colors mb-3 tracking-tight">
                {lead.title || 'Untitled'}
              </h3>
              {lead.summary && (
                <p className="text-sm text-white/40 group-hover/card:text-white/60 leading-relaxed line-clamp-2 font-light transition-colors">
                  {lead.summary}
                </p>
              )}
            </div>
            <div className="md:w-44 shrink-0 flex flex-col justify-between">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {lead.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded text-[9px] font-mono text-white/30 bg-white/[0.04]">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-mono group-hover/card:text-white/60 transition-colors">
                <span>阅读全文</span>
                <ExternalLink className="w-3 h-3 group-hover/card:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
          <ActionButtons item={lead} onSummarize={onSummarize} onDelete={onDelete} />
        </motion.div>
      )}

      {/* ── 精选三格 ── */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {featured.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              transition={{ delay: (idx + 1) * 0.04 }}
              onClick={() => onSelectFeed(item)}
              className="group/card cursor-pointer rounded-lg bg-[#202022] border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[15px] font-serif text-white/8 group-hover/card:text-white/20 font-bold leading-none transition-colors">
                    {String(idx + 2).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-white/20 group-hover/card:text-white/40 font-mono transition-colors">
                    {new Date(item.created_at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                  </span>
                  {item.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin text-white/30" />}
                </div>
                <h3 className="text-sm font-semibold text-white/80 leading-snug group-hover/card:text-white transition-colors line-clamp-2 mb-2">
                  {item.title || 'Untitled'}
                </h3>
                {item.summary && (
                  <p className="text-[11px] text-white/25 group-hover/card:text-white/40 line-clamp-1 font-light mb-2 transition-colors">
                    {item.summary}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  {item.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 rounded text-[8px] font-mono text-white/20 bg-white/[0.03]">#{tag}</span>
                  ))}
                </div>
              </div>
              <ActionButtons item={item} onSummarize={onSummarize} onDelete={onDelete} />
            </motion.div>
          ))}
        </div>
      )}

      {/* ── 更多条目 ── */}
      {stream.length > 0 && (
        <div className="rounded-lg overflow-hidden">
          {stream.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (idx + 4) * 0.02 }}
              onClick={() => onSelectFeed(item)}
              className="group/card cursor-pointer px-4 py-3 hover:bg-[#202022] transition-colors relative flex items-center gap-4 border-b border-white/[0.03] last:border-b-0"
            >
              <span className="text-xs text-white/30 font-mono w-6 shrink-0 text-right group-hover/card:text-white/50 transition-colors">
                {String(idx + 5).padStart(2, '0')}
              </span>
              <span className="text-xs text-white/40 font-mono w-12 shrink-0 group-hover/card:text-white/60 transition-colors">
                {new Date(item.created_at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
              </span>
              <h3 className="flex-1 text-sm text-white/60 group-hover/card:text-white/90 transition-colors truncate font-medium">
                {item.title || 'Untitled'}
              </h3>
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                {item.tags?.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[8px] font-mono text-white/12">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity shrink-0">
                <button onClick={(e) => onSummarize(e, item.id)} className="p-1 rounded hover:bg-white/10 text-white/20 hover:text-white/60 transition-all" title="AI 重新总结">
                  <Sparkles className="w-3 h-3" />
                </button>
                <button onClick={(e) => onDelete(e, item.id)} className="p-1 rounded hover:bg-white/10 text-white/20 hover:text-red-400 transition-all" title="删除">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 布局 B：深度专栏 — idea
// 杂志社论风格：无卡片背景，强调衬线字体排版，分割线分隔
// ═══════════════════════════════════════════════════════
function IdeaLayout({ items, onSelectFeed, onSummarize, onDelete }: { items: FeedItem[]; onSelectFeed: (item: FeedItem) => void; onSummarize: (e: React.MouseEvent, id: string) => void; onDelete: (e: React.MouseEvent, id: string) => void }) {
  return (
    <div className="space-y-8 py-4">
      {items.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="group/article relative"
        >
          {/* 文章主体容器 - 去除卡片背景，增加内边距和分割线 */}
          <div 
            onClick={() => onSelectFeed(item)}
            className="cursor-pointer border-b border-white/10 pb-8 hover:border-white/20 transition-colors"
          >
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
              
              {/* 左侧：元数据与标题 */}
              <div className="flex-1 space-y-4">
                {/* Meta Header */}
                <div className="flex items-center gap-3 text-[10px] font-mono tracking-wider uppercase text-white/40">
                  <span className="text-violet-400">Vol. {new Date(item.created_at).getMonth() + 1}</span>
                  <span className="w-px h-3 bg-white/10" />
                  <span>{new Date(item.created_at).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</span>
                  {item.tags?.slice(0, 1).map(tag => (
                    <React.Fragment key={tag}>
                      <span className="w-px h-3 bg-white/10" />
                      <span>{tag}</span>
                    </React.Fragment>
                  ))}
                </div>

                {/* Title - 巨大的衬线字体 */}
                <h3 className="text-2xl md:text-4xl font-serif font-bold text-white/90 leading-[1.2] group-hover/article:text-violet-200 transition-colors duration-300">
                  {item.title || 'Untitled'}
                </h3>

                {/* Takeaway Quote - 模拟杂志引言 */}
                {item.takeaways && item.takeaways.length > 0 && (
                  <div className="relative pl-4 md:pl-0 md:border-l-0 border-l-2 border-violet-500/30 py-1">
                    <p className="font-serif italic text-lg text-white/60 leading-relaxed">
                      "{item.takeaways[0]}"
                    </p>
                  </div>
                )}
              </div>

              {/* 右侧：摘要 (在桌面端显示在右侧，移动端在下方) */}
              {item.summary && (
                <div className="md:w-1/3 shrink-0 pt-1 md:pt-10">
                  <p className="text-sm text-white/50 leading-loose text-justify font-light group-hover/article:text-white/70 transition-colors">
                    {item.summary}
                  </p>
                  
                  {/* Read More Link style */}
                  <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-violet-400/60 group-hover/article:text-violet-400 transition-colors">
                    Read Article <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮 - 悬浮在右上角或跟随 */}
          <div className="absolute top-0 right-0 opacity-0 group-hover/article:opacity-100 transition-opacity duration-300">
             <ActionButtons item={item} onSummarize={onSummarize} onDelete={onDelete} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 布局 C：视觉网格 — life, art
// 纯净网格布局：无图片，强调排版与分割线
// ═══════════════════════════════════════════════════════
function MosaicLayout({ items, category, onSelectFeed, onSummarize, onDelete }: { items: FeedItem[]; category: string; onSelectFeed: (item: FeedItem) => void; onSummarize: (e: React.MouseEvent, id: string) => void; onDelete: (e: React.MouseEvent, id: string) => void }) {
  const style = getCategoryStyle(category);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16 border-t border-white/10 pt-8">
      {items.map((item, idx) => {
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
            transition={{ delay: idx * 0.03 }}
            onClick={() => onSelectFeed(item)}
            className="group/item cursor-pointer flex flex-col relative p-6 -mx-6 rounded-2xl hover:bg-[#202022] transition-all duration-300"
          >
            {/* 顶部装饰线 - 移除发光效果，改为静态分割线 */}
            {/* <div className={cn("w-12 h-0.5 mb-5 transition-all duration-500 group-hover/item:w-full group-hover/item:opacity-100", style.bg, "opacity-70")} /> */}

            <div className="flex flex-col h-full">
              {/* Meta Info */}
              <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest group-hover/item:text-white/60 transition-colors">
                  <span>{new Date(item.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                </div>
                {item.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin text-white/50" />}
              </div>
              
              {/* Title - 更大的字号，更好的行高 */}
              <h3 className="font-serif font-bold text-xl leading-tight text-white/90 group-hover/item:text-white transition-colors mb-4 line-clamp-3">
                {item.title || 'Untitled'}
              </h3>
              
              {/* Summary - 更好的阅读体验 */}
              {item.summary && (
                <p className="text-sm text-white/50 leading-relaxed line-clamp-4 font-light group-hover/item:text-white/70 transition-colors mb-4">
                  {item.summary}
                </p>
              )}
              
              {/* Footer Tags - 底部对齐 */}
              <div className="mt-auto pt-2 flex items-center gap-2 opacity-60 group-hover/item:opacity-100 transition-opacity">
                 {item.tags?.slice(0, 1).map(tag => (
                  <span key={tag} className="text-[9px] font-mono text-white/30 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 悬浮操作按钮 */}
            <div className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity z-10">
               <ActionButtons item={item} onSummarize={onSummarize} onDelete={onDelete} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 布局 D：默认 — other / 未分类
// 标准 3 列网格
// ═══════════════════════════════════════════════════════
function DefaultLayout({ items, category, onSelectFeed, onSummarize, onDelete }: { items: FeedItem[]; category: string; onSelectFeed: (item: FeedItem) => void; onSummarize: (e: React.MouseEvent, id: string) => void; onDelete: (e: React.MouseEvent, id: string) => void }) {
  const style = getCategoryStyle(category);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
          transition={{ delay: idx * 0.03 }}
          onClick={() => onSelectFeed(item)}
          className="group/card cursor-pointer rounded-xl bg-[#202022] border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden flex flex-col"
        >
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-white/30 group-hover/card:text-white/50 font-mono transition-colors">
                {new Date(item.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
              </span>
              {item.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />}
            </div>
            <h3 className="font-serif font-bold text-white/90 leading-snug mb-3 group-hover/card:text-white transition-colors text-base line-clamp-2">
              {item.title || 'Untitled'}
            </h3>
            <div className="flex flex-wrap gap-2 mt-auto pt-2">
              {item.tags?.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 text-white/40 transition-colors">#{tag}</span>
              ))}
            </div>
          </div>
          <ActionButtons item={item} onSummarize={onSummarize} onDelete={onDelete} />
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 主组件：根据分类选择布局
// ═══════════════════════════════════════════════════════
export default function CategorySection({ category, items, onSelectFeed, onSummarize, onDelete }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 针对不同分类设置不同的初始显示数量
  // idea 分类只显示前 4 篇，其他分类默认显示 10 篇
  const initialLimit = category === 'idea' ? 4 : 10;
  
  const displayItems = isExpanded ? items : items.slice(0, initialLimit);
  const hasMore = items.length > initialLimit;

  // 根据分类选择布局
  const renderLayout = () => {
    const props = { items: displayItems, category, onSelectFeed, onSummarize, onDelete };
    switch (category) {
      case 'tech':
        return <TechLayout {...props} />;
      case 'idea':
        return <IdeaLayout {...props} />;
      case 'life':
      case 'art':
        return <MosaicLayout {...props} />;
      default:
        return <DefaultLayout {...props} />;
    }
  };

  return (
    <section>
      {/* 版块标题 */}
      <div className="flex items-center gap-4 mb-8">
        <h2 className={cn(
          "text-xs font-bold tracking-[0.25em] uppercase font-mono",
          getCategoryStyle(category).text
        )}>
          {categoryLabels[category] || category.toUpperCase()}
        </h2>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* 差异化布局 */}
      {renderLayout()}

      {/* More 按钮 */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-6 py-2.5 text-xs font-mono text-white/40 hover:text-white/80 bg-[#1A1A1C] hover:bg-[#202022] rounded-xl transition-all flex items-center gap-2"
          >
            {isExpanded ? '收起' : `查看全部 ${items.length} 篇`}
            <ArrowRight className={cn("w-3 h-3 transition-transform", isExpanded ? "-rotate-90" : "rotate-90")} />
          </button>
        </div>
      )}
    </section>
  );
}
