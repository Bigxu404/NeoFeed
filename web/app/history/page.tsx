'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { GalaxyItem } from '@/types';
import { mapFeedsToGalaxy } from '@/lib/galaxyMapping';
import dynamic from 'next/dynamic';
import HistoryTerminal from '@/components/history/HistoryTerminal';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useProfile } from '@/hooks/useProfile';
import { useFeeds } from '@/hooks/useFeeds';
import { crystallizeFeed } from '@/app/dashboard/actions';
import { useRouter } from 'next/navigation';
import DualPaneModal from '@/components/dashboard/DualPaneModal';

const GalaxyScene = dynamic(() => import('@/components/galaxy/GalaxyScene'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-t-2 border-white/50 rounded-full animate-spin" />
        <div className="text-white/30 text-sm font-mono animate-pulse">INITIALIZING NEURAL GALAXY...</div>
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

  const { profile, clearCache } = useProfile();
  const { isOffline } = useFeeds();

  const handleItemClick = useCallback((item: GalaxyItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedItem(null);
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    const fetchGalaxyData = async () => {
      try {
        const res = await fetch('/api/galaxy', {
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        
        if (res.status === 401) {
          toast.error('会话已过期', {
            description: '请重新登录。',
            action: { label: '去登录', onClick: () => router.push('/login') },
            duration: Infinity,
          });
          setLoading(false);
          return;
        }

        const json = await res.json();
        const data = json.data;
        const currentUserId = json.user_id;

        if (Array.isArray(data)) {
          console.log(`✅ [Galaxy] API success. Count: ${data.length}, Current User: ${currentUserId}`);
          
          if (data.length > 0) {
            const earliest = new Date(data[data.length - 1].created_at).toLocaleDateString();
            const latest = new Date(data[0].created_at).toLocaleDateString();
            console.log(`🗓️ [Galaxy] Date range: ${earliest} to ${latest}`);
          }

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
  }, [router]);

  return (
    <div className="w-screen h-screen relative bg-black text-white overflow-hidden font-sans flex flex-col" suppressHydrationWarning>
      <div className="sticky top-0 z-[100] md:relative md:z-50 bg-black/50 backdrop-blur-md md:bg-transparent md:backdrop-blur-none border-b border-white/5 md:border-none p-4 md:pt-8">
        <DashboardHeader profile={profile} clearCache={clearCache} isOffline={isOffline} autoHide={true} />
      </div>

      <div className="flex-1 relative min-h-0 overflow-hidden flex flex-col md:block">
        <div className="absolute inset-0 z-0 touch-none">
          {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-black">
                <div className="w-12 h-12 border-t-2 border-white/50 rounded-full animate-spin" />
              </div>
          ) : items.length > 0 ? (
              <GalaxyScene 
                data={items} 
                onItemClick={handleItemClick} 
                highlightedItemId={hoveredItemId}
                onModalClose={handleModalClose}
                isModalOpen={isModalOpen}
              />
          ) : (
              <div className="w-full h-full flex items-center justify-center bg-black text-white/30 font-mono text-sm uppercase tracking-widest">
                Void detected. Awaiting ingestion.
              </div>
          )}
        </div>

        <HistoryTerminal 
          items={items} 
          onItemHover={setHoveredItemId} 
          onItemClick={handleItemClick}
          className={isModalOpen ? 'opacity-0 -translate-x-full pointer-events-none' : 'opacity-100 translate-x-0'}
        />
      </div>

      <DualPaneModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        item={selectedItem}
        onCrystallize={async (note, tags, weight) => {
          if (!selectedItem) return;
          const res = await crystallizeFeed(selectedItem.id, note, tags, weight);
          if (res.error) {
            toast.error('保存失败: ' + res.error);
          } else {
            toast.success('知识已结晶并存入慢宇宙');
            // 更新本地状态
            setItems(prev => prev.map(item => 
              item.id === selectedItem.id 
                ? { ...item, user_notes: note, user_tags: tags, user_weight: weight }
                : item
            ));
            // 更新选中项，确保弹窗不闪烁
            setSelectedItem(prev => prev ? { ...prev, user_notes: note, user_tags: tags, user_weight: weight } : null);
          }
        }}
      />
    </div>
  );
}
