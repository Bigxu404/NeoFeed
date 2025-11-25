'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DigitalRain from '@/components/insight/DigitalRain';
import { TypingEffect, DailyDiscovery, DailySpark, EnergyBars } from '@/components/insight/DashboardWidgets';
import TiltCard from '@/components/insight/TiltCard'; 
import AIChatTerminal from '@/components/insight/AIChatTerminal'; // ✨ 引入 AI 彩蛋
import { MOCK_INSIGHT } from '@/lib/mockData';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function InsightPage() {
  const [isWakingUp, setIsWakingUp] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [currentWeek, setCurrentWeek] = useState('Current Week');

  // 模拟启动序列
  useEffect(() => {
    const timer1 = setTimeout(() => setIsWakingUp(false), 1000); 
    const timer2 = setTimeout(() => setShowContent(true), 1100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#020202] overflow-hidden font-sans text-white selection:bg-green-500/30 selection:text-green-200">
      <DigitalRain />

      {/* ⚪️ 启动序列 */}
      <AnimatePresence>
        {isWakingUp && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black"
          >
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-t-2 border-green-500/50 rounded-full animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🖥️ 主控制台 */}
      {showContent && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 container mx-auto h-full p-6 md:p-8 flex flex-col max-w-[1400px]"
        >
          {/* Header */}
          <header className="flex justify-between items-center mb-8 relative z-20">
            <button 
                onClick={() => window.location.href = '/'}
                className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors px-4 py-2 rounded-full border border-white/5 hover:bg-white/5 hover:border-green-500/30 bg-black/40 backdrop-blur-sm"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-xs font-medium tracking-wide">返回</span>
            </button>

            {/* 📅 周切换器 */}
            <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-1 px-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <button className="p-2 text-white/30 hover:text-white transition-colors hover:bg-white/5 rounded-full">
                    <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-2 px-4 text-sm font-medium text-white/80 min-w-[140px] justify-center font-mono">
                    <Calendar size={14} className="text-green-500/60" />
                    {currentWeek}
                </div>
                <button className="p-2 text-white/30 hover:text-white transition-colors hover:bg-white/5 rounded-full">
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="w-24" /> {/* 占位，保持 Header 平衡 */}
          </header>

          {/* Main Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 pb-8 min-h-0">
            
            {/* 👈 左护法：每日洞察 (Daily Discovery) */}
            <div className="col-span-1 md:col-span-3 flex flex-col">
                <div className="flex-1 bg-[#080808]/80 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:border-green-500/30 transition-all shadow-lg flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 to-transparent opacity-50" />
                    
                    <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/30 mb-8 uppercase flex items-center gap-2">
                        Daily Discovery <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse shadow-[0_0_5px_#60a5fa]" />
                    </h3>
                    <DailyDiscovery />
                </div>
            </div>

            {/* 🔮 中军：核心简报 (C位) - ✨ 包裹上 3D 倾斜卡片 */}
            <div className="col-span-1 md:col-span-6 flex flex-col gap-6">
                {/* 主要内容区 */}
                <TiltCard className="flex-[3] w-full h-full">
                    <div className="w-full h-full bg-[#0a0a0a]/90 border border-white/10 p-8 md:p-12 rounded-3xl backdrop-blur-xl hover:border-green-500/20 transition-all shadow-2xl relative overflow-hidden group flex flex-col justify-center">
                        
                        {/* 装饰光效 */}
                        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[120%] h-[40%] bg-green-500/5 blur-[100px] rounded-full pointer-events-none" />
                        <div className="absolute top-8 right-8 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />

                        <div className="text-center mb-10 relative z-10">
                             <h2 className="text-[10px] font-bold tracking-[0.4em] text-green-500/60 mb-3 uppercase">System Insight</h2>
                             <h1 className="text-4xl md:text-5xl font-serif italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                               Weekly Brief
                             </h1>
                        </div>

                        <div className="relative z-10 px-4">
                            <TypingEffect text={MOCK_INSIGHT.summary} speed={25} />
                        </div>
                        
                        {/* 底部签名 */}
                        <div className="absolute bottom-6 right-8 text-[9px] font-mono text-white/10 tracking-widest">
                            GENERATED BY NEO_CORE v2.4
                        </div>
                    </div>
                </TiltCard>

                {/* 底部数据条 (极简版) */}
                <div className="h-24 bg-[#080808]/80 border border-white/10 p-6 rounded-3xl backdrop-blur-md flex items-center justify-between px-10 hover:border-green-500/20 transition-all">
                     <div className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase w-24 mr-8">
                         Nutrition
                     </div>
                     <div className="flex-1">
                        <EnergyBars categories={MOCK_INSIGHT.stats.categories} />
                     </div>
                </div>
            </div>

            {/* 👉 右护法：每日猜想 (Daily Spark) */}
            <div className="col-span-1 md:col-span-3 flex flex-col gap-6">
                <div className="flex-1 bg-[#080808]/80 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:border-purple-500/30 transition-all shadow-lg flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/20 to-transparent opacity-50" />
                    
                    <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/30 mb-8 uppercase flex items-center gap-2">
                        Daily Spark <span className="w-1 h-1 rounded-full bg-purple-400 animate-pulse shadow-[0_0_5px_#c084fc]" />
                    </h3>
                    <DailySpark />
                </div>
                
                {/* 关键词云 (简化为纯装饰) */}
                <div className="h-24 bg-[#080808]/60 border border-white/10 p-5 rounded-3xl backdrop-blur-md flex items-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
                    <div className="flex gap-2 animate-scroll">
                        {MOCK_INSIGHT.keywords.map(k => (
                            <span key={k} className="text-[10px] px-2 py-1 bg-white/5 rounded border border-white/5 text-white/40 whitespace-nowrap">#{k}</span>
                        ))}
                        {/* 重复一遍以实现无缝滚动 */}
                        {MOCK_INSIGHT.keywords.map(k => (
                            <span key={`dup-${k}`} className="text-[10px] px-2 py-1 bg-white/5 rounded border border-white/5 text-white/40 whitespace-nowrap">#{k}</span>
                        ))}
                    </div>
                </div>
            </div>

          </div>
      
          {/* 🧠 AI 求助彩蛋 (固定在右下角) */}
          <AIChatTerminal />

        </motion.div>
      )}
    </div>
  );
}
