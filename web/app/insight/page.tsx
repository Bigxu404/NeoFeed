'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import DigitalRain from '@/components/insight/DigitalRain';
import ControlTower from '@/components/insight/ControlTower';
import IntelligenceStream from '@/components/insight/IntelligenceStream';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { getCategoryDistribution } from '@/app/dashboard/actions';
import { useProfile } from '@/hooks/useProfile';
import { useFeeds } from '@/hooks/useFeeds';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { toast } from 'sonner';

export default function InsightPage() {
  const router = useRouter();
  const [isWakingUp, setIsWakingUp] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const { profile, loading: profileLoading, clearCache } = useProfile();
  const { isOffline } = useFeeds();
  const [stats, setStats] = useState({ tech: 0, life: 0, idea: 0, art: 0, other: 0 });

  const handleFeed = async (url: string) => {
    toast.info('正在建立神经连接...', { description: url });
    try {
      const res = await fetch('/api/ingest-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (!res.ok) throw new Error('捕获请求失败');
      toast.success('信号已注入矩阵', { description: '请返回工作台查看进度' });
    } catch (e) {
      toast.error('连接失败');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const distRes = await getCategoryDistribution();

        if (distRes.data) {
          setStats({
            tech: distRes.data.tech || 0,
            life: distRes.data.life || 0,
            idea: distRes.data.idea || 0,
            art: distRes.data.art || 0,
            other: distRes.data.other || 0,
          });
        }

      } catch (e) {
        console.error("Failed to load insight data", e);
      } finally {
        setIsWakingUp(false);
        setTimeout(() => setShowContent(true), 100);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#020202] overflow-hidden font-sans text-white flex flex-col selection:bg-[#1ff40a]/20 selection:text-[#1ff40a]">
      <DigitalRain opacity={0.03} />

      {/* ⚪️ 启动序列 */}
      <AnimatePresence>
        {isWakingUp && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black"
          >
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-t-2 border-[#1ff40a]/40 rounded-full animate-spin" />
               <div className="text-[#1ff40a]/40 text-[10px] font-mono tracking-widest uppercase animate-pulse">正在同步情报中心... Synchronizing Intelligence Center...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 统一 Header - 修复对齐问题，增加与 Dashboard 一致的 padding */}
      <div className="sticky top-0 z-[50] bg-black/40 backdrop-blur-md border-b border-white/5 p-4 md:p-8">
        <ErrorBoundary name="InsightHeader">
          <DashboardHeader profile={profile} clearCache={clearCache} isOffline={isOffline} autoHide={false} />
        </ErrorBoundary>
      </div>

      {/* 🖥️ 1:3 布局主控制台 */}
      {showContent && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex overflow-hidden relative gap-4 md:gap-8 px-4 md:px-8 pb-4 md:pb-8"
        >
          {/* 左侧：控制塔 (Focused) - 保持 Fallout 风格，拉宽以提供更好的周报配置体验 */}
          <aside className="w-[380px] h-full bg-black/40 backdrop-blur-xl shrink-0 overflow-hidden relative crt-screen rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <ErrorBoundary name="ControlTower">
              <ControlTower stats={stats} />
                </ErrorBoundary>
          </aside>

          {/* 垂直分割线 - 明晰的边界 */}
          <div className="w-px h-full bg-gradient-to-b from-transparent via-[#1ff40a]/30 to-transparent shrink-0 hidden md:block" />

          {/* 右侧：情报中心 (75%) - 内容区域保持极简 */}
          <main className="flex-1 h-full overflow-hidden relative bg-black/20 backdrop-blur-sm rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(31,244,10,0.03)_0%,transparent_50%)]">
              <ErrorBoundary name="IntelligenceStream">
                <IntelligenceStream onFeed={handleFeed} />
                </ErrorBoundary>
            </div>
          </main>
        </motion.div>
      )}
    </div>
  );
}
