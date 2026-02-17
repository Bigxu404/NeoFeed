'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { FeedItem, summarizeFeed, deleteFeed } from '@/app/dashboard/actions';
import { useProfile } from '@/hooks/useProfile';
import { useFeeds } from '@/hooks/useFeeds';
import { useSearchParams } from 'next/navigation';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import DualPaneModal from '@/components/dashboard/DualPaneModal';
import FeedOrb from '@/components/dashboard/FeedOrb';
import CategorySection from '@/components/dashboard/CategorySection';
import TechDigestHero from '@/components/dashboard/TechDigestHero';
import { GalaxyItem } from '@/types';

export default function Workbench() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { 
    feeds, 
    count: feedsCount, 
    loading: feedsLoading, 
    isOffline, 
    addOptimisticFeed, 
    updateFeedInCache, 
    removeFeedFromCache, 
    refreshFeeds 
  } = useFeeds();
  const { profile, loading: profileLoading, clearCache } = useProfile();
  const [selectedGalaxyItem, setSelectedGalaxyItem] = useState<GalaxyItem | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const searchParams = useSearchParams();
  const supabase = React.useMemo(() => createClient(), []);

  // ── 实时监听 ──
  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase
      .channel('feeds-realtime')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'feeds',
        filter: `user_id=eq.${profile.id}`
      }, () => {
        refreshFeeds();
        toast.success('发现新信号', { description: '正在解析...' });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, refreshFeeds, supabase]);

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      window.history.replaceState({}, '', window.location.pathname);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // ── 操作 ──
  const handleIngest = async (targetUrl: string) => {
    if (!targetUrl || !targetUrl.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/ingest-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Ingest trigger failed');
      if (resData.data) addOptimisticFeed(resData.data);
      toast.success('信号捕获成功');
    } catch (e) {
      toast.error('捕获失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSummarize = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const currentItem = feeds.find(f => f.id === id);
    if (currentItem) updateFeedInCache({ ...currentItem, status: 'processing' });
    const res = await summarizeFeed(id);
    if (res.error) { toast.error('总结失败'); refreshFeeds(); }
    else if (res.data) { toast.success('AI 总结已更新'); updateFeedInCache(res.data); }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('确定要删除这条内容吗？')) return;
    removeFeedFromCache(id);
    const res = await deleteFeed(id);
    if (res.error) { toast.error('删除失败'); refreshFeeds(); }
    else { toast.success('已删除'); }
  };

  const handleSelectFeed = useCallback((item: FeedItem) => {
    const galaxyItem: GalaxyItem = {
      id: item.id,
      title: item.title || '',
      summary: item.summary || item.title || '',
      content: item.content_raw || '',
      content_original: (item as any).content_original || '',
      date: new Date(item.created_at).toISOString().split('T')[0],
      timestamp: new Date(item.created_at).getTime(),
      category: (item.category as any) || 'other',
      tags: item.tags || [],
      color: '#a855f7',
      size: 1,
      position: [0, 0, 0]
    };
    setSelectedGalaxyItem(galaxyItem);
  }, []);

  // ── 数据处理：所有 feed 进入分类，不再提取 hero ──
  const groupedFeeds = useMemo(() => {
    const groups: Record<string, FeedItem[]> = {};
    feeds.forEach(f => {
      const cat = f.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(f);
    });
    // 按数量降序排列版块
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [feeds]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-white/20 relative flex flex-col overflow-x-hidden">
      {/* ── Header ── */}
      <div className="sticky top-0 z-[100] bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 lg:px-12 2xl:px-16 py-3">
        <ErrorBoundary name="Header">
          <DashboardHeader profile={profile} clearCache={clearCache} isOffline={isOffline} />
        </ErrorBoundary>
      </div>

      {/* ── 主内容区 ── */}
      <div className="flex-1 w-full px-4 md:px-8 lg:px-12 2xl:px-16 pb-24 pt-8">
        
        {/* ── Masthead (仅在内容较少时显示，避免与 Hero 重复) ── */}
        {feeds.length < 3 && (
          <div className="mb-12 flex items-end justify-between border-b border-white/5 pb-6">
             <div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white/90 tracking-tight mb-2">NeoFeed</h1>
                <p className="text-xs text-white/40 font-mono uppercase tracking-widest">
                   个人智能资讯中枢
                </p>
             </div>
          </div>
        )}

        {/* ── 加载态 ── */}
        {feedsLoading ? (
          <div className="space-y-6">
            <div className="h-64 rounded-2xl bg-[#1A1A1C] animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-40 rounded-xl bg-[#1A1A1C] animate-pulse" />)}
            </div>
          </div>
        ) : feeds.length === 0 ? (
          /* ── 空状态 ── */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-6xl font-serif italic text-white/5 mb-6">NeoFeed</div>
            <p className="text-sm text-white/30 mb-2">
              暂无内容
            </p>
            <p className="text-xs text-white/15 font-mono">
              点击右下角投喂按钮开始
            </p>
          </div>
        ) : (
          /* ── 杂志式内容区 ── */
          <div className="space-y-16">
            
            {/* ── HERO: 知识导语 + AI 封面 ── */}
            <TechDigestHero feedCount={feeds.length} />

            {/* ── 分类版块 ── */}
            {groupedFeeds.map(([category, items]) => (
              <CategorySection 
                key={category}
                category={category}
                items={items}
                totalFeedCount={feeds.length}
                onSelectFeed={handleSelectFeed}
                onSummarize={handleSummarize}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 悬浮投喂球 ── */}
      <FeedOrb onIngest={handleIngest} isProcessing={isProcessing} />

      {/* ── 弹窗 ── */}
      <DualPaneModal
        isOpen={!!selectedGalaxyItem}
        onClose={() => setSelectedGalaxyItem(null)}
        item={selectedGalaxyItem}
        onCrystallize={(note, tags, weight) => { toast.success('洞察已结晶'); }}
      />

      <AnimatePresence>
        {showWelcome && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-white text-black rounded-full font-bold shadow-2xl flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5" />
            认证成功！欢迎回到 NeoFeed。
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
