'use client'

import React, { useState, useEffect } from 'react';
import { GalaxyItem } from '@/types';
import { mapFeedsToGalaxy } from '@/lib/galaxyMapping';
import dynamic from 'next/dynamic';
import HistoryTerminal from '@/components/history/HistoryTerminal';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useProfile } from '@/hooks/useProfile';
import { useFeeds } from '@/hooks/useFeeds';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleItemClick = (item: GalaxyItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const { profile, clearCache } = useProfile();
  const { isOffline } = useFeeds();

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
        
        // 🛡️ 调试日志：检查 API 响应状态
        console.log(`📡 [Galaxy] API Status: ${res.status}`);

        if (!res.ok) {
           console.warn(`⚠️ [Galaxy] API failed with status ${res.status}, falling back to mock data.`);
           // 只有在真正没有数据时才显示 VOID
           const mockData = []; 
           setItems(mapFeedsToGalaxy(mockData));
           setLoading(false);
           return;
        }

        const json = await res.json();
        const data = json.data;
        
        console.log(`📦 [Galaxy] API Data received:`, data ? (Array.isArray(data) ? data.length : 'not an array') : 'null');

        if (Array.isArray(data) && data.length > 0) {
          console.log(`✅ [Galaxy] Mapping ${data.length} items to galaxy...`);
          
          localStorage.setItem('galaxy_cache', JSON.stringify({
            data,
            timestamp: Date.now()
          }));

          const mapped = mapFeedsToGalaxy(data);
          console.log(`✨ [Galaxy] Mapped items: ${mapped.length}`);
          setItems(mapped);
        } else {
          console.warn("⚠️ [Galaxy] No data returned from API or empty array.");
          setItems([]);
        }
      } catch (e) {
        console.error("❌ [Galaxy] Fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchGalaxyData();
  }, []);

  return (
    <div className="w-screen h-screen relative bg-black text-white overflow-hidden font-sans flex flex-col">
      
      {/* 🚀 统一 Header (移动端固顶) */}
      <div className="sticky top-0 z-[100] md:relative md:z-50 bg-black/50 backdrop-blur-md md:bg-transparent md:backdrop-blur-none border-b border-white/5 md:border-none p-4 md:pt-8">
        <DashboardHeader profile={profile} clearCache={clearCache} isOffline={isOffline} autoHide={true} />
      </div>

      {/* 🛡️ 全局内容区域 */}
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
              <GalaxyScene 
                data={items} 
                onItemClick={handleItemClick} 
                highlightedItemId={hoveredItemId}
                onModalClose={() => {
                  setSelectedItem(null);
                  setIsModalOpen(false);
                }}
              />
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
        <div className={`absolute bottom-4 left-4 right-4 md:bottom-12 md:left-12 md:right-auto z-10 w-auto md:w-[450px] transition-all duration-500 ease-in-out ${selectedItem || isModalOpen ? 'opacity-0 -translate-x-full pointer-events-none' : 'opacity-100 translate-x-0'}`}>
          <HistoryTerminal 
            items={items} 
            onItemHover={setHoveredItemId} 
            onItemClick={(item) => {
                handleItemClick(item);
            }} 
          />
        </div>
      </div>
    </div>
  );
}