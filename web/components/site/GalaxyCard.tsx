'use client'

import dynamic from 'next/dynamic';
import { MOCK_GALAXY_DATA } from '@/lib/mockData';
import { Globe } from 'lucide-react';

const GalaxyScene = dynamic(() => import('@/components/galaxy/GalaxyScene'), { ssr: false });

export default function GalaxyCard() {
  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl bg-[#0a0a0a] border border-white/10 group hover:border-blue-500/20 transition-colors duration-500">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.05),transparent_40%)] pointer-events-none" />

      {/* Header - Precision Style */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 pb-4 border-b border-white/5 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
         <div>
            <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-blue-400" />
                <h3 className="text-lg font-bold text-white font-sans tracking-tight">星系养成</h3>
            </div>
            <p className="text-xs text-white/40 font-sans">碎片化知识自动整理，生长为独特的知识宇宙。</p>
         </div>
         <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-mono">
            LIVE_VIEW
         </div>
      </div>

      {/* Galaxy Scene */}
      <div className="absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity duration-1000">
        <GalaxyScene 
          data={MOCK_GALAXY_DATA} 
          onItemClick={() => {}} 
          highlightedItemId={null}
        />
      </div>
    </div>
  );
}
