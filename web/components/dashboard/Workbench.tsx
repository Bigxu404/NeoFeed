'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BentoGrid, BentoCard } from '@/components/dashboard/BentoGrid';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import InputPrism from '@/components/dashboard/InputPrism';
import ProfileCard from '@/components/dashboard/ProfileCard';
import QuickStatsCard from '@/components/dashboard/QuickStatsCard';
import SystemStatusCard from '@/components/dashboard/SystemStatusCard';
import InsightStream from '@/components/dashboard/InsightStream';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { getFeeds, FeedItem, deleteFeed, summarizeFeed } from '@/app/dashboard/actions';
import { useProfile } from '@/hooks/useProfile';
import { useFeeds } from '@/hooks/useFeeds';
import { useSearchParams } from 'next/navigation';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import DualPaneModal from '@/components/dashboard/DualPaneModal';
import { GalaxyItem } from '@/types';

export default function Workbench() {
  const [url, setUrl] = useState('');
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
  const [status, setStatus] = useState<'idle' | 'scanning' | 'analyzing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [selectedGalaxyItem, setSelectedGalaxyItem] = useState<GalaxyItem | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const searchParams = useSearchParams();
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase
      .channel('feeds-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feeds',
          filter: `user_id=eq.${profile.id}`
        },
        (payload) => {
          refreshFeeds();
          toast.success('🚀 发现新信号', {
            description: '来自移动端的同步请求已链入，正在解析...',
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, refreshFeeds, supabase]);

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleIngest = async (targetUrl?: any) => {
    const actualUrl = (typeof targetUrl === 'string') ? targetUrl : url;
    if (!actualUrl || typeof actualUrl !== 'string' || !actualUrl.trim()) return;
    const originalUrl = actualUrl;
    if (typeof targetUrl !== 'string') setUrl('');
    setStatus('scanning');
    setProgress(30);
    setIsProcessing(true);

    try {
      const res = await fetch('/api/ingest-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: originalUrl })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Ingest trigger failed');
      const initialFeed = resData.data;
      if (initialFeed) addOptimisticFeed(initialFeed);
      setProgress(100);
      setStatus('success');
      toast.success('信号捕获成功');
      setTimeout(() => { setStatus('idle'); setProgress(0); setIsProcessing(false); }, 1500);
    } catch (e) {
      toast.error('捕获失败');
      setStatus('error');
      setProgress(0);
      setIsProcessing(false);
    }
  };

  const handleSummarize = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const currentItem = feeds.find(f => f.id === id);
    if (currentItem) updateFeedInCache({ ...currentItem, status: 'processing' });
    const res = await summarizeFeed(id);
    if (res.error) {
      toast.error('总结失败');
      refreshFeeds();
    } else if (res.data) {
      toast.success('AI 总结已更新');
      updateFeedInCache(res.data);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个信号吗？')) return;
    removeFeedFromCache(id);
    const res = await deleteFeed(id);
    if (res.error) {
      toast.error('删除失败');
      refreshFeeds();
    } else {
      toast.success('信号已抹除');
    }
  };

  const handleSelectFeed = useCallback((item: FeedItem) => {
    const galaxyItem: GalaxyItem = {
      id: item.id,
      title: item.title || '',
      summary: item.summary || item.title || '',
      content: item.content_raw || '',
      content_original: item.content_original || '',
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

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 relative flex flex-col overflow-x-hidden">
      <div className="sticky top-0 z-[100] md:relative md:z-50 bg-black/50 backdrop-blur-md md:bg-transparent md:backdrop-blur-none border-b border-white/5 md:border-none p-4 md:p-8">
        <ErrorBoundary name="Header">
          <DashboardHeader profile={profile} clearCache={clearCache} isOffline={isOffline} />
        </ErrorBoundary>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 pb-12">
          <BentoGrid className="gap-4 md:gap-6 grid-cols-1 md:grid-cols-4 auto-rows-auto md:auto-rows-[120px]">
                <BentoCard colSpan={1} rowSpan={1} className="md:col-span-3 md:row-span-4 overflow-visible bg-gradient-to-br from-neutral-900/80 to-black">
                  <ErrorBoundary name="InputPrism">
                    <InputPrism url={url} setUrl={setUrl} status={status} progress={progress} isProcessing={isProcessing} onIngest={handleIngest} />
                  </ErrorBoundary>
                </BentoCard>
                <BentoCard colSpan={1} rowSpan={2} className="hidden md:block bg-neutral-900/30">
                  <ErrorBoundary name="ProfileCard">
                    <ProfileCard profile={profile} loading={profileLoading} />
                  </ErrorBoundary>
                </BentoCard>
                <BentoCard colSpan={1} rowSpan={1} className="bg-neutral-900/30">
                  <ErrorBoundary name="QuickStats">
                    <QuickStatsCard count={feedsCount} loading={feedsLoading} />
                  </ErrorBoundary>
                </BentoCard>
                <BentoCard colSpan={1} rowSpan={1} className="bg-neutral-900/30">
                  <ErrorBoundary name="SystemStatus">
                    <SystemStatusCard />
                  </ErrorBoundary>
                </BentoCard>
                <BentoCard colSpan={1} rowSpan={3} className="md:col-span-4 md:row-span-3">
                  <ErrorBoundary name="InsightStream">
                    <InsightStream feeds={feeds} feedsLoading={feedsLoading} onSelectFeed={handleSelectFeed} onSummarize={handleSummarize} onDelete={handleDelete} />
                  </ErrorBoundary>
                </BentoCard>
          </BentoGrid>
      </div>

      {/* 🌟 全局双栏处理模态框 */}
      <DualPaneModal 
        isOpen={!!selectedGalaxyItem}
        onClose={() => setSelectedGalaxyItem(null)}
        item={selectedGalaxyItem}
        onCrystallize={(note, tags, weight) => {
          toast.success('洞察已结晶并存入慢宇宙');
        }}
      />

      <AnimatePresence>
        {showWelcome && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-green-500 text-black rounded-full font-bold shadow-2xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            认证成功！欢迎来到 NeoFeed 核心矩阵。
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
