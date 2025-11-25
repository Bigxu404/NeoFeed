'use client'

import { useState, useEffect } from 'react';
import { generateGalaxyData, GalaxyItem } from '@/lib/mockData';
import dynamic from 'next/dynamic';

// 动态导入 GalaxyScene，禁用 SSR
const GalaxyScene = dynamic(() => import('@/components/galaxy/GalaxyScene'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-white/30 text-xl animate-pulse">
        ✨ Initializing Galaxy Engine...
      </div>
    </div>
  )
});

export default function HistoryPage() {
  const [items, setItems] = useState<GalaxyItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalaxyItem | null>(null);
  const [viewMode, setViewMode] = useState<'galaxy' | 'list'>('list');

  useEffect(() => {
    setItems(generateGalaxyData(150));
  }, []);

  return (
    <div className="w-screen h-screen relative bg-black text-white overflow-hidden">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-50 flex justify-between items-start">
        <div>
          <button 
            className="text-white/50 hover:text-white flex items-center gap-2 px-3 py-2 rounded transition-colors"
            onClick={() => window.location.href = '/'}
          >
            ← Back to Singularity
          </button>
          <h1 className="text-4xl font-serif mt-4 tracking-wider">My Galaxy</h1>
          <p className="text-white/40 text-sm mt-1">Explore {items.length} fragments.</p>
        </div>

        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded border transition-all ${
              viewMode === 'galaxy' 
                ? 'bg-white text-black border-white' 
                : 'border-white/20 text-white hover:border-white/40'
            }`}
            onClick={() => setViewMode('galaxy')}
          >
            🌌 Galaxy
          </button>
          <button 
            className={`px-4 py-2 rounded border transition-all ${
              viewMode === 'list' 
                ? 'bg-white text-black border-white' 
                : 'border-white/20 text-white hover:border-white/40'
            }`}
            onClick={() => setViewMode('list')}
          >
            📋 List
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="absolute inset-0 pt-40 pb-8">
        {viewMode === 'galaxy' ? (
          <div className="w-full h-full">
            <GalaxyScene data={items} onItemClick={setSelectedItem} />
          </div>
        ) : (
          <div className="px-8 max-w-4xl mx-auto h-full overflow-y-auto">
            <div className="space-y-4">
              {items.map(item => (
                <div 
                  key={item.id} 
                  className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                      {item.category}
                    </span>
                    <span className="text-white/30 text-xs">{item.date}</span>
                  </div>
                  <p className="text-white/80 font-light">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-8"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-black/90 border border-white/20 rounded-2xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs px-3 py-1 rounded-full bg-white/10">
                {selectedItem.category}
              </span>
              <button 
                className="text-white/40 hover:text-white text-2xl"
                onClick={() => setSelectedItem(null)}
              >
                ×
              </button>
            </div>
            <p className="text-white/80 text-lg leading-relaxed mb-4">{selectedItem.content}</p>
            <p className="text-white/30 text-sm">{selectedItem.date}</p>
          </div>
        </div>
      )}
    </div>
  );
}
