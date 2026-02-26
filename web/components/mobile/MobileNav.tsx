'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeeds } from '@/hooks/useFeeds';

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'fast';
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { feeds } = useFeeds();

  const [searchQuery, setSearchQuery] = useState('');

  // 简单的本地搜索过滤逻辑，匹配标题、摘要或笔记
  const filteredFeeds = feeds.filter(feed => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    return (
      (feed.title && feed.title.toLowerCase().includes(query)) ||
      (feed.summary && feed.summary.toLowerCase().includes(query)) ||
      (feed.user_notes && feed.user_notes.toLowerCase().includes(query))
    );
  });

  // 当搜索弹窗打开时，自动聚焦输入框
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      // 稍微延迟以等待动画完成
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // 仅在移动端首页显示底部导航栏
  const isMobileHome = pathname === '/mobile' || pathname === '/mobile/';
  if (!isMobileHome) return null;

  return (
    <>
      <div className="fixed bottom-8 left-0 right-0 px-6 z-40 flex items-center justify-between pointer-events-none">
      {/* 左侧：快慢思考 Tab 切换 */}
      <nav className="pointer-events-auto flex items-center bg-white/90 backdrop-blur-xl p-1 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/50">
        <Link
          href="?tab=fast"
          className={cn(
            'relative px-5 py-2.5 rounded-full text-[15px] font-bold transition-colors z-10',
            tab === 'fast' ? 'text-black' : 'text-gray-500 hover:text-gray-800'
          )}
        >
          {tab === 'fast' && (
            <motion.div
              layoutId="mobile-nav-pill"
              className="absolute inset-0 bg-gray-100 rounded-full -z-10"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          快思考
        </Link>
        <Link
          href="?tab=slow"
          className={cn(
            'relative px-5 py-2.5 rounded-full text-[15px] font-bold transition-colors z-10',
            tab === 'slow' ? 'text-black' : 'text-gray-500 hover:text-gray-800'
          )}
        >
          {tab === 'slow' && (
            <motion.div
              layoutId="mobile-nav-pill"
              className="absolute inset-0 bg-gray-100 rounded-full -z-10"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          慢思考
        </Link>
      </nav>

      {/* 右侧：搜索按钮 */}
      <button 
        onClick={() => setIsSearchOpen(true)}
        className="pointer-events-auto flex items-center justify-center w-[52px] h-[52px] bg-white/90 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/50 text-black active:scale-95 transition-transform"
      >
        <Search className="w-6 h-6" />
      </button>
    </div>

    {/* 全屏搜索弹窗 */}
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-50 bg-[#F7F8FA] flex flex-col"
        >
          {/* 搜索头部，增加 safe-area-inset-top 适配刘海屏 */}
          <div className="flex items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),4rem)] pb-4 bg-white border-b border-gray-200/50">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="查找或提问 NeoFeed AI"
                className="w-full h-12 pl-11 pr-10 bg-gray-100 rounded-full text-[15px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/5"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <button 
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="p-2 text-gray-500 hover:text-black active:scale-95 transition-all"
            >
              取消
            </button>
          </div>

          {/* 搜索内容区 */}
          <div className="flex-1 px-5 py-6 overflow-y-auto">
            {!searchQuery ? (
              <>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  最近访问
                </h3>
                <div className="space-y-2">
                  {/* 模拟最近访问记录 */}
                  <button className="w-full flex items-center gap-3 p-4 bg-[#F0F0FF] rounded-xl active:scale-95 transition-transform text-left">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <span className="text-[15px] font-medium text-gray-900">NeoFeed 入门</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {filteredFeeds.length > 0 ? (
                  filteredFeeds.map(feed => (
                    <div 
                      key={feed.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        router.push(`/mobile/reader/${feed.id}`);
                      }}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform cursor-pointer"
                    >
                      <h4 className="text-[15px] font-bold text-gray-900 mb-1 line-clamp-1">{feed.title}</h4>
                      {feed.summary && (
                        <p className="text-[13px] text-gray-500 line-clamp-2">{feed.summary}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500 text-sm">
                    未找到相关内容
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
}
