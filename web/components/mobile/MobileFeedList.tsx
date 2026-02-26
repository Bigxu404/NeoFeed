'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedItem } from '@/app/dashboard/actions';
import { Check, Quote, Sparkles, ChevronDown, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MobileFeedListProps {
  feeds: FeedItem[];
  loading: boolean;
  activeTab: 'fast' | 'slow';
  error?: Error | null;
  onRetry?: () => void;
}

export default function MobileFeedList({ feeds, loading, activeTab, error, onRetry }: MobileFeedListProps) {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'all'>('today');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (loading) {
    return (
      <div className="w-full space-y-4">
        {/* 顶部过滤控制栏骨架 */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-24 h-9 bg-gray-200/60 rounded-full animate-pulse"></div>
          <div className="w-16 h-7 bg-gray-200/40 rounded-full animate-pulse"></div>
        </div>
        {/* 列表项骨架 */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100/50">
            <div className="w-3/4 h-5 bg-gray-200/60 rounded-md mb-3 animate-pulse"></div>
            <div className="w-full h-4 bg-gray-200/40 rounded-md mb-2 animate-pulse"></div>
            <div className="w-5/6 h-4 bg-gray-200/40 rounded-md animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  // 时间过滤逻辑（本周以周一 00:00 起算，符合中文习惯）
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  const daysSinceMonday = (now.getDay() + 6) % 7; // 0=Mon, 1=Tue, ..., 6=Sun
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);

  const filterByTime = (items: FeedItem[]) => {
    return items.filter(feed => {
      if (timeFilter === 'all') return true;
      const feedDate = new Date(feed.created_at);
      if (timeFilter === 'today') return feedDate >= todayStart;
      if (timeFilter === 'week') return feedDate >= weekStart;
      return true;
    });
  };

  const fastFeeds = filterByTime(feeds);
  const slowFeeds = filterByTime(feeds.filter(f => f.user_notes && f.user_notes.trim().length > 0));

  return (
    <div className="w-full">
      {/* 顶部过滤控制栏 */}
      <div className="flex items-center justify-between mb-6">
        {/* 时间列表选择器 (下拉菜单) */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-sm font-bold text-gray-800 active:scale-95 transition-all"
          >
            {timeFilter === 'today' ? '今天' : timeFilter === 'week' ? '本周' : '过往所有'}
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/5"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                >
                  {(['today', 'week', 'all'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTimeFilter(t);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-[15px] font-medium transition-colors ${
                        timeFilter === t ? 'text-black bg-gray-50' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {t === 'today' ? '今天' : t === 'week' ? '本周' : '过往所有'}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        {/* 数据总量提示 (可选的视觉平衡) */}
        <div className="text-[13px] font-medium text-gray-400 bg-gray-100/50 px-3 py-1.5 rounded-full">
          {activeTab === 'fast' ? fastFeeds.length : slowFeeds.length} 篇内容
        </div>
      </div>

      {error && onRetry && (
        <div
          role="button"
          onClick={onRetry}
          className="bg-white rounded-[24px] p-8 flex flex-col items-center justify-center shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
        >
          <RefreshCw className="w-8 h-8 text-gray-400 mb-3" />
          <p className="text-gray-500 font-medium text-[14px] mb-1">加载失败</p>
          <p className="text-gray-400 text-[13px]">点击重试</p>
        </div>
      )}

      {!error && (
      <AnimatePresence mode="wait">
        {activeTab === 'fast' && (
          <motion.div
            key={`fast-${timeFilter}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {fastFeeds.length === 0 ? (
              <div className="bg-white rounded-[24px] p-10 flex flex-col items-center justify-center shadow-sm">
                <div className="w-12 h-12 mb-3">
                  <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center relative">
                    <Check className="w-6 h-6 text-white" />
                    <Sparkles className="w-5 h-5 text-gray-400 absolute -top-1 -right-1" />
                  </div>
                </div>
                <p className="text-gray-500 font-medium text-[14px]">全部已读，放松一下吧！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fastFeeds.map((feed) => (
                  <div 
                    key={feed.id} 
                    className="bg-white p-5 rounded-[24px] shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                    onClick={() => router.push(`/mobile/reader/${feed.id}`)}
                  >
                    <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
                      {feed.title || 'Untitled'}
                    </h3>
                    {feed.summary && (
                      <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-3">
                        <span className="text-blue-500 font-medium mr-1">AI总结 /</span>
                        {feed.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'slow' && (
          <motion.div
            key={`slow-${timeFilter}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {slowFeeds.length === 0 ? (
              <div className="bg-gradient-to-br from-[#FFF5E9] to-[#FFF0DB] rounded-[24px] p-8 flex flex-col items-center justify-center shadow-sm">
                <Quote className="w-8 h-8 text-[#E2A669] mb-3 opacity-50" />
                <p className="text-[#8C6D45] font-medium text-[14px]">暂无慢思考标注</p>
              </div>
            ) : (
              <div className="space-y-4">
                {slowFeeds.map((feed) => (
                  <div 
                    key={feed.id} 
                    className="bg-gradient-to-br from-[#FFF5E9] to-[#FFF0DB] p-5 rounded-[24px] shadow-sm relative border border-[#FFE8CC]/50 active:scale-[0.98] transition-transform cursor-pointer"
                    onClick={() => router.push(`/mobile/reader/${feed.id}`)}
                  >
                    <Quote className="w-6 h-6 text-[#E2A669] mb-2 opacity-50" />
                    <p className="text-[15px] font-medium text-[#A67843] leading-relaxed mb-4 whitespace-pre-wrap relative z-10">
                      {feed.user_notes}
                    </p>
                    <div className="pt-3 border-t border-[#E2A669]/20">
                      <p className="text-[11px] font-medium text-[#A67843]/60 line-clamp-1">
                        源自: {feed.title || 'Untitled'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      )}
    </div>
  );
}