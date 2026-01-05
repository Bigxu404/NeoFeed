'use client'

import React, { useState, useEffect } from 'react';
import { GalaxyItem } from '@/types';
import { mapFeedsToGalaxy } from '@/lib/galaxyMapping';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import HistoryTerminal from '@/components/history/HistoryTerminal';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useFeedContent } from '@/hooks/useFeedContent';
import { useProfile } from '@/hooks/useProfile';
import { useFeeds } from '@/hooks/useFeeds';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useRouter } from 'next/navigation';

// 动态导入 GalaxyScene，禁用 SSR
const GalaxyScene = dynamic(() => import('@/components/galaxy/GalaxyScene'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-t-2 border-white/50 rounded-full animate-spin" />
        <div className="text-white/30 text-sm font-mono animate-pulse">
          INITIALIZING NEURAL GALAXY...
        </div>
      </div>
    </div>
  )
});

export default function HistoryPage() {
  const [items, setItems] = useState<GalaxyItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalaxyItem | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { profile, clearCache } = useProfile();
  const { isOffline } = useFeeds();
  const { content: fullContent, loading: contentLoading } = useFeedContent(selectedItem?.id || null, selectedItem?.summary);

  useEffect(() => {
    const fetchGalaxyData = async () => {
      console.log("🚀 [Galaxy] Initializing fetch...");
      
      // 1. Try Local Cache First
      const cached = localStorage.getItem('galaxy_cache');
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Array.isArray(data) && Date.now() - timestamp < 300000) {
            console.log("🌌 [Galaxy] Loaded from cache", data.length);
            setItems(mapFeedsToGalaxy(data));
            setLoading(false);
          }
        } catch (e) {
          localStorage.removeItem('galaxy_cache');
        }
      }

      // 2. Network Fetch
      try {
        const res = await fetch('/api/galaxy');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const { data } = await res.json();
        
        if (Array.isArray(data)) {
          console.log(`✅ [Galaxy] Received ${data.length} items from network`);
          
          localStorage.setItem('galaxy_cache', JSON.stringify({
            data,
            timestamp: Date.now()
          }));

          setItems(mapFeedsToGalaxy(data));
        }
      } catch (e) {
        console.error("❌ [Galaxy] Fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchGalaxyData();
  }, []);

  // 处理详情页关闭
  const closeDetail = () => setSelectedItem(null);

  return (
    <div className="w-screen h-screen relative bg-black text-white overflow-hidden font-sans flex flex-col">
      
      {/* 🚀 统一 Header (移动端固顶) */}
      <div className="sticky top-0 z-[100] md:relative md:z-50 bg-black/50 backdrop-blur-md md:bg-transparent md:backdrop-blur-none border-b border-white/5 md:border-none p-4 md:pt-8">
        <ErrorBoundary name="HistoryHeader">
          <DashboardHeader profile={profile} clearCache={clearCache} isOffline={isOffline} autoHide={true} />
        </ErrorBoundary>
      </div>

      {/* 🛡️ 全局错误捕获，防止整个页面崩溃 */}
      <ErrorBoundary name="HistoryContent">
        <div className="flex-1 relative min-h-0 overflow-hidden flex flex-col md:block">
          {/* 🌌 3D 背景层 (始终存在) */}
          <div className="absolute inset-0 z-0 touch-none">
            {loading ? (
                <div className="w-full h-full flex items-center justify-center bg-black">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-t-2 border-white/50 rounded-full animate-spin" />
                    <div className="text-white/30 text-[10px] font-mono tracking-widest animate-pulse">
                      NEURAL GALAXY LOADING...
                    </div>
                  </div>
                </div>
            ) : items.length > 0 ? (
              <ErrorBoundary name="GalaxyScene">
                <GalaxyScene 
                  data={items} 
                  onItemClick={setSelectedItem} 
                  highlightedItemId={hoveredItemId}
                />
              </ErrorBoundary>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-black text-white/30 font-mono text-sm">
                    <div className="text-center">
                        <p className="mb-2">VOID DETECTED.</p>
                        <p className="text-xs text-white/20">Ingest data to ignite your first star.</p>
                    </div>
                </div>
            )}
          </div>

          {/* 🖥️ 星际终端 - 移动端调整布局 */}
          <div className="absolute bottom-4 left-4 right-4 md:bottom-12 md:left-12 md:right-auto z-10 w-auto md:w-[450px]">
            <ErrorBoundary name="HistoryTerminal">
              <HistoryTerminal 
                items={items} 
                onItemHover={setHoveredItemId}
                onItemClick={setSelectedItem}
              />
            </ErrorBoundary>
          </div>
        </div>
      </ErrorBoundary>

      {/* 📄 详情页模态框 */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-12 bg-black/60 backdrop-blur-md"
            onClick={closeDetail}
          >
            <div 
              className="w-full max-w-4xl max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 左侧装饰栏 */}
              <div className={`hidden md:flex w-24 flex-col items-center py-8 border-r border-white/5
                ${selectedItem.category === 'tech' ? 'bg-orange-900/10' : 
                  selectedItem.category === 'life' ? 'bg-green-900/10' : 'bg-white/5'}
              `}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-8 text-xl
                   ${selectedItem.category === 'tech' ? 'bg-orange-500/20 text-orange-400' : 
                     selectedItem.category === 'life' ? 'bg-green-500/20 text-green-400' : 'bg-white/20 text-white'}
                `}>
                  {selectedItem.category === 'tech' ? '⚡' : selectedItem.category === 'life' ? '🌱' : '💡'}
                </div>
                <div className="flex-1 w-px bg-gradient-to-b from-white/20 to-transparent" />
              </div>

              {/* 右侧内容区 */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
                {/* 头部信息 */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 text-xs font-mono text-white/40 mb-4">
                     <span>ID: {selectedItem.id.toUpperCase()}</span>
                     <span>//</span>
                     <span>DATE: {selectedItem.date}</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-serif text-white/90 leading-tight mb-4">
                    {selectedItem.summary}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedItem.tags) && selectedItem.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded text-xs bg-white/5 text-white/60 border border-white/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 正文内容 */}
                <div className="space-y-6 text-white/70 font-light leading-relaxed">
                  {/* 🤖 AI Intelligence Summary - Simplified Refined Orange Theme */}
                  {selectedItem.summary && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-10 p-6 rounded-2xl bg-orange-500/[0.03] border border-orange-500/20 relative group overflow-hidden shadow-[0_0_30px_rgba(249,115,22,0.05)]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-orange-400 tracking-wide">AI 总结</span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-orange-500/20 to-transparent ml-4" />
                      </div>

                      <p className="text-lg md:text-xl text-orange-50/90 font-medium italic leading-relaxed relative z-10">
                        “{selectedItem.summary}”
                      </p>
                    </motion.div>
                  )}

                  {contentLoading ? (
                    <div className="flex flex-col items-center py-12 space-y-4">
                      <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                      <p className="text-xs font-mono text-white/20 uppercase tracking-widest">Loading full neural record...</p>
                    </div>
                  ) : (
                    (fullContent || selectedItem.summary).split('\n').filter(p => p.trim()).map((paragraph, idx) => (
                      <motion.p
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 1.5) }}
                      >
                        {paragraph}
                      </motion.p>
                    ))
                  )}
                  <hr className="border-white/10 my-8" />
                  <p className="text-sm text-white/30 italic">
                    Source: Neural Interface / Deep Space Network
                  </p>
                </div>
              </div>

              {/* 关闭按钮 */}
              <button 
                onClick={closeDetail}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
