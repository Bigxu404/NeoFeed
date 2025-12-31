'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import DigitalRain from '@/components/insight/DigitalRain';
import { TypingEffect, DailyDiscovery, DailySpark, EnergyBars } from '@/components/insight/DashboardWidgets';
import TiltCard from '@/components/insight/TiltCard'; 
import AIChatTerminal from '@/components/insight/AIChatTerminal';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { getLatestWeeklyReport, getCategoryDistribution } from '@/app/dashboard/actions';
import { WeeklyReport } from '@/types/database';
import { useProfile } from '@/hooks/useProfile';
import { useFeeds } from '@/hooks/useFeeds';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { toast } from 'sonner';

export default function InsightPage() {
  const router = useRouter();
  const [isWakingUp, setIsWakingUp] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [report, setReport] = useState<WeeklyReport | null>(null);
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
        const [reportRes, distRes] = await Promise.all([
          getLatestWeeklyReport(),
          getCategoryDistribution()
        ]);
        
        if (reportRes.data) {
          setReport(reportRes.data as WeeklyReport);
        }

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

  // 格式化日期，避免 hydration 错误
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="relative w-screen h-screen bg-[#020202] overflow-hidden font-sans text-white selection:bg-green-500/30 selection:text-green-200 flex flex-col">
      <DigitalRain />

      {/* ⚪️ 启动序列 */}
      <AnimatePresence>
        {isWakingUp && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black"
          >
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-t-2 border-green-500/50 rounded-full animate-spin" />
               <div className="text-green-500/40 text-[10px] font-mono tracking-widest uppercase animate-pulse">Synchronizing Matrix...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 统一 Header (置于顶层) */}
      <div className="sticky top-0 z-[100] md:relative md:z-50 bg-black/50 backdrop-blur-md md:bg-transparent md:backdrop-blur-none border-b border-white/5 md:border-none p-4 md:pt-8">
        <ErrorBoundary name="InsightHeader">
          <DashboardHeader profile={profile} clearCache={clearCache} isOffline={isOffline} autoHide={true} />
        </ErrorBoundary>
      </div>

      {/* 🖥️ 主控制台 */}
      {showContent && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex-1 container mx-auto px-4 py-6 md:p-8 flex flex-col max-w-[1400px] min-h-0 overflow-y-auto md:overflow-hidden"
        >
          {/* Sub Header: 周切换器 */}
          <div className="flex justify-center mb-6 md:mb-8 relative z-20">
            <div className="flex items-center gap-2 md:gap-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-1 px-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <button className="p-2 text-white/30 hover:text-white transition-colors hover:bg-white/5 rounded-full">
                    <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-2 px-2 md:px-4 text-[10px] md:text-sm font-medium text-white/80 min-w-[120px] md:min-w-[140px] justify-center font-mono">
                    <Calendar size={14} className="text-green-500/60" />
                    {report ? `${formatDate(report.start_date)} - ${formatDate(report.end_date)}` : 'No Report'}
                </div>
                <button className="p-2 text-white/30 hover:text-white transition-colors hover:bg-white/5 rounded-full">
                    <ChevronRight size={16} />
                </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 pb-20 md:pb-8 min-h-0">
            
            {/* 👈 左护法：每日洞察 (Daily Discovery) - 移动端排在中间 */}
            <div className="col-span-1 md:col-span-3 flex flex-col min-h-[400px] md:min-h-0 order-2 md:order-1">
                <ErrorBoundary name="DailyDiscovery">
                  <div className="flex-1 bg-[#080808]/80 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:border-green-500/30 transition-all shadow-lg flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 to-transparent opacity-50" />
                      
                      <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/30 mb-8 uppercase flex items-center gap-2">
                          Daily Discovery <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse shadow-[0_0_5px_#60a5fa]" />
                      </h3>
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                        <DailyDiscovery onFeed={handleFeed} />
                      </div>
                  </div>
                </ErrorBoundary>
            </div>

            {/* 🔮 中军：核心简报 (C位) - 移动端排在最前 */}
            <div className="col-span-1 md:col-span-6 flex flex-col gap-6 min-h-0 order-1 md:order-2">
                <ErrorBoundary name="WeeklyBrief">
                  <TiltCard className="flex-[3] w-full min-h-[300px] md:min-h-0">
                      <div className="w-full h-full bg-[#0a0a0a]/90 border border-white/10 p-6 md:p-12 rounded-3xl backdrop-blur-xl hover:border-green-500/20 transition-all shadow-2xl relative overflow-hidden group flex flex-col justify-center">
                          <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[120%] h-[40%] bg-green-500/5 blur-[100px] rounded-full pointer-events-none" />
                          <div className="absolute top-8 right-8 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />

                          <div className="text-center mb-6 md:mb-10 relative z-10">
                               <h2 className="text-[10px] font-bold tracking-[0.4em] text-green-500/60 mb-3 uppercase">System Insight</h2>
                               <h1 className="text-3xl md:text-5xl font-serif italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                 Weekly Brief
                               </h1>
                          </div>

                          <div className="relative z-10 px-2 md:px-4 overflow-y-auto custom-scrollbar max-h-[250px] md:max-h-[300px]">
                              <TypingEffect text={report?.content || '本周暂无智能简报。快去摄入一些新鲜信息吧。'} speed={25} />
                          </div>
                          
                          <div className="absolute bottom-6 right-8 text-[8px] md:text-[9px] font-mono text-white/10 tracking-widest uppercase">
                              GENERATED BY NEO_CORE v2.5
                          </div>
                      </div>
                  </TiltCard>
                </ErrorBoundary>

                {/* 底部数据条 */}
                <ErrorBoundary name="IngestionMap">
                  <div className="h-auto md:h-24 bg-[#080808]/80 border border-white/10 p-6 rounded-3xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between px-6 md:px-10 hover:border-green-500/20 transition-all shrink-0 gap-4">
                       <div className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase md:w-24 md:mr-8">
                           Ingestion Map
                       </div>
                       <div className="flex-1 w-full">
                          <EnergyBars categories={[
                            { label: 'TECH', value: stats.tech },
                            { label: 'LIFE', value: stats.life },
                            { label: 'IDEA', value: stats.idea },
                            { label: 'ART', value: stats.art },
                            { label: 'OTHER', value: stats.other },
                          ]} />
                       </div>
                  </div>
                </ErrorBoundary>
            </div>

            {/* 👉 右护法：每日猜想 (Daily Spark) - 移动端排在最后 */}
            <div className="col-span-1 md:col-span-3 flex flex-col gap-6 min-h-[300px] md:min-h-0 order-3">
                <ErrorBoundary name="DailySpark">
                  <div className="flex-1 bg-[#080808]/80 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:border-purple-500/30 transition-all shadow-lg flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/20 to-transparent opacity-50" />
                      
                      <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/30 mb-8 uppercase flex items-center gap-2">
                          Daily Spark <span className="w-1 h-1 rounded-full bg-purple-400 animate-pulse shadow-[0_0_5px_#c084fc]" />
                      </h3>
                      <DailySpark />
                  </div>
                </ErrorBoundary>
                
                <div className="h-20 md:h-24 bg-[#080808]/60 border border-white/10 p-5 rounded-3xl backdrop-blur-md flex items-center overflow-hidden relative shrink-0">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
                    <div className="flex gap-2 animate-scroll">
                        {['NEOFEED', 'INTELLIGENCE', 'GALAXY', 'INSIGHT', 'DEEPSEEK', 'NEXTJS', 'SUPABASE'].map(k => (
                            <span key={k} className="text-[9px] md:text-[10px] px-2 py-1 bg-white/5 rounded border border-white/5 text-white/40 whitespace-nowrap">#{k}</span>
                        ))}
                    </div>
                </div>
            </div>

          </div>
      
          <AIChatTerminal />
        </motion.div>
      )}
    </div>
  );
}
