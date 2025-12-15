'use client'

import { useState, useEffect } from 'react';
import { generateGalaxyData, GalaxyItem } from '@/lib/mockData';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import HistoryTerminal from '@/components/history/HistoryTerminal';

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(generateGalaxyData(150));
    setIsLoaded(true);
  }, []);

  // 处理详情页关闭
  const closeDetail = () => setSelectedItem(null);

  return (
    <div className="w-screen h-screen relative bg-black text-white overflow-hidden font-sans">
      
      {/* 🌌 3D 背景层 (始终存在) */}
      <div className="absolute inset-0 z-0">
         {isLoaded && (
           <GalaxyScene 
             data={items} 
             onItemClick={setSelectedItem} 
             highlightedItemId={hoveredItemId} // ✨ 传入悬浮 ID
           />
         )}
      </div>

      {/* 🟢 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none">
        <button 
          className="pointer-events-auto text-white/50 hover:text-white flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/5 hover:bg-white/10 transition-all group"
          onClick={() => window.location.href = '/'}
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">返回</span>
        </button>

        <div className="text-right pointer-events-auto">
          <h1 className="text-2xl font-light tracking-widest text-white/80">MY GALAXY</h1>
          <p className="text-white/30 text-xs mt-1 font-mono">
            {items.length} FRAGMENTS DISCOVERED
          </p>
            </div>
          </div>

      {/* 🖥️ 左侧：星际终端 (替代原有列表) */}
      <HistoryTerminal 
        items={items} 
        onItemHover={setHoveredItemId}
        onItemClick={setSelectedItem}
      />

      {/* 📄 详情页模态框 (Landing Experience) */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-black/60 backdrop-blur-md"
            onClick={closeDetail}
          >
            <div 
              className="w-full max-w-4xl max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 左侧装饰栏 (模拟数据流) */}
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
                    {selectedItem.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded text-xs bg-white/5 text-white/60 border border-white/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 正文内容 */}
                <div className="prose prose-invert prose-lg max-w-none text-white/70 font-light leading-relaxed">
                  <p className="whitespace-pre-wrap">{selectedItem.content}</p>
                  <p>
                    (这里模拟了一篇长文的阅读体验。真正的星际探索才刚刚开始...)
                  </p>
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
