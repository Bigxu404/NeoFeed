'use client';

import React, { useState, useEffect } from 'react';
import { BentoGrid, BentoCard } from '@/components/dashboard/BentoGrid';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import InputPrism from '@/components/dashboard/InputPrism';
import ProfileCard from '@/components/dashboard/ProfileCard';
import QuickStatsCard from '@/components/dashboard/QuickStatsCard';
import SystemStatusCard from '@/components/dashboard/SystemStatusCard';
import InsightStream from '@/components/dashboard/InsightStream';
import DiscoveryStream from '@/components/dashboard/DiscoveryStream';
import FeedDetailSheet from '@/components/dashboard/FeedDetailSheet';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { getFeeds, FeedItem, deleteFeed, summarizeFeed } from '@/app/dashboard/actions';
import { useProfile } from '@/hooks/useProfile';
import { useFeeds } from '@/hooks/useFeeds';
import { useSearchParams } from 'next/navigation';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function Workbench() {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { 
    feeds, 
    count: feedsCount, // 🚀 使用总数
    loading: feedsLoading, 
    isOffline, // 🚀 引入离线状态
    addOptimisticFeed, 
    updateFeedInCache, 
    removeFeedFromCache, 
    refreshFeeds 
  } = useFeeds(); // 🚀 SWR 数据流
  const { profile, loading: profileLoading, clearCache } = useProfile();
  const [status, setStatus] = useState<'idle' | 'scanning' | 'analyzing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [selectedFeed, setSelectedFeed] = useState<FeedItem | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const searchParams = useSearchParams();
  const supabase = React.useMemo(() => createClient(), []);

  // 🚀 实时监听来自移动端或其他设备的信号注入
  useEffect(() => {
    if (!profile?.id) return;

    // 监听 feeds 表的新增
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
          const newItem = payload.new as any;
          // 触发刷新并提示
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

  const handleIngest = async (targetUrl?: string) => {
    const finalUrl = targetUrl || url;
    if (!finalUrl.trim()) return;
    
    const originalUrl = finalUrl;
    if (!targetUrl) setUrl('');
    
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

      if (!res.ok) {
        const errorMsg = resData.details ? `${resData.error}: ${resData.details}` : (resData.error || 'Ingest trigger failed');
        throw new Error(errorMsg);
      }

      const initialFeed = resData.data;
      if (initialFeed) {
        addOptimisticFeed(initialFeed); // 🚀 乐观更新
      }

      setProgress(100);
      setStatus('success');
      toast.success('信号捕获成功', {
        description: 'AI 正在后台同步神经网络...',
      });
      
      setTimeout(() => { 
        setStatus('idle'); 
        setProgress(0); 
        setIsProcessing(false); 
      }, 1500);

      if (initialFeed) {
        let attempts = 0;
        const pollItem = async () => {
          if (attempts >= 15) return;
          attempts++;
          
          const { data: latestFeeds } = await getFeeds();
          const updatedItem = latestFeeds?.find(f => f.id === initialFeed.id);
          
          if (updatedItem && updatedItem.status === 'done') {
            updateFeedInCache(updatedItem); // 🚀 更新 SWR 缓存
            return;
          }
          
          setTimeout(pollItem, 3000);
        };
        setTimeout(pollItem, 3000);
      }

    } catch (e) {
      const message = e instanceof Error ? e.message : '未知错误';
      console.error(e);
      toast.error('捕获失败', {
        description: message,
      });
      setStatus('error');
      setProgress(0);
      setUrl(originalUrl);
      setTimeout(() => { setStatus('idle'); setIsProcessing(false); }, 3000);
    }
  };

  const handleSummarize = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    // 更新状态为处理中
    const currentItem = feeds.find(f => f.id === id);
    if (currentItem) {
        updateFeedInCache({ ...currentItem, status: 'processing' });
    }

    const res = await summarizeFeed(id);
    if (res.error) {
      toast.error('总结失败', {
        description: res.error,
      });
      refreshFeeds(); // 恢复
    } else if (res.data) {
      toast.success('AI 总结已更新');
      updateFeedInCache(res.data);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个信号吗？')) return;

    removeFeedFromCache(id); // 🚀 乐观删除

    const res = await deleteFeed(id);
    if (res.error) {
      toast.error('删除失败', {
        description: res.error,
      });
      refreshFeeds(); // 失败时重新同步
    } else {
      toast.success('信号已抹除');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 relative flex flex-col overflow-x-hidden">
      
      {/* 🚀 移动端 Header 处理 */}
      <div className="sticky top-0 z-[100] md:relative md:z-50 bg-black/50 backdrop-blur-md md:bg-transparent md:backdrop-blur-none border-b border-white/5 md:border-none p-4 md:p-8">
        <ErrorBoundary name="Header">
          <DashboardHeader profile={profile} clearCache={clearCache} isOffline={isOffline} />
        </ErrorBoundary>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 pb-12">
          <BentoGrid className="gap-4 md:gap-6 grid-cols-1 md:grid-cols-4 auto-rows-auto md:auto-rows-[120px]">
                {/* 1. 捕获棱镜 (Mobile: Full Width, Desktop: col-3) */}
                <BentoCard colSpan={1} rowSpan={1} className="md:col-span-3 md:row-span-4 overflow-visible">
                  <ErrorBoundary name="InputPrism">
                    <InputPrism 
                        url={url} 
                        setUrl={setUrl} 
                        status={status} 
                        progress={progress} 
                        isProcessing={isProcessing} 
                        onIngest={handleIngest} 
                    />
                  </ErrorBoundary>
                </BentoCard>

                {/* 2. 个人资料 (Mobile: Hidden, Desktop: col-1) */}
                <BentoCard colSpan={1} rowSpan={2} className="hidden md:block">
                  <ErrorBoundary name="ProfileCard">
                    <ProfileCard profile={profile} loading={profileLoading} />
                  </ErrorBoundary>
                </BentoCard>

                {/* 3. 快速统计 */}
                <BentoCard colSpan={1} rowSpan={1}>
                  <ErrorBoundary name="QuickStats">
                    <QuickStatsCard count={feedsCount} loading={feedsLoading} />
                  </ErrorBoundary>
                </BentoCard>

                {/* 4. 系统状态 */}
                <BentoCard colSpan={1} rowSpan={1}>
                  <ErrorBoundary name="SystemStatus">
                    <SystemStatusCard />
                  </ErrorBoundary>
                </BentoCard>

                {/* 5. 发现流 (New!) */}
                <BentoCard colSpan={1} rowSpan={3} className="md:col-span-1 md:row-span-3">
                  <ErrorBoundary name="DiscoveryStream">
                    <DiscoveryStream onFeed={(targetUrl) => handleIngest(targetUrl)} />
                  </ErrorBoundary>
                </BentoCard>

                {/* 6. 洞察流 (Mobile: Full Width, Desktop: col-3) */}
                <BentoCard colSpan={1} rowSpan={3} className="md:col-span-1 md:col-span-3 md:row-span-3">
                  <ErrorBoundary name="InsightStream">
                    <InsightStream 
                        feeds={feeds} 
                        feedsLoading={feedsLoading} 
                        onSelectFeed={setSelectedFeed} 
                        onSummarize={handleSummarize} 
                        onDelete={handleDelete} 
                    />
                  </ErrorBoundary>
                </BentoCard>
          </BentoGrid>
      </div>

      <FeedDetailSheet feed={selectedFeed} onClose={() => setSelectedFeed(null)} />

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-green-500 text-black rounded-full font-bold shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            认证成功！欢迎来到 NeoFeed 核心矩阵。
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
