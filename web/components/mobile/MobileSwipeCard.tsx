'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo, useDragControls } from 'framer-motion';
import { Archive, Trash2, Sparkles } from 'lucide-react';
import { DiscoveryItem } from '@/app/dashboard/discovery-actions';

interface MobileSwipeCardProps {
  item: DiscoveryItem;
  onDiscard: (id: string) => void;
  onSave: (id: string) => void;
}

export default function MobileSwipeCard({ item, onDiscard, onSave }: MobileSwipeCardProps) {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  
  // Background icons opacity and scale based on drag distance
  const leftIconOpacity = useTransform(x, [50, 100], [0, 1]);
  const leftIconScale = useTransform(x, [50, 100], [0.8, 1]);
  
  const rightIconOpacity = useTransform(x, [-100, -50], [0, 1]);
  const rightIconScale = useTransform(x, [-100, -50], [0.8, 1]);

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Discard (swipe left)
    if (offset < -100 || velocity < -500) {
      setExitDirection('left');
      await controls.start({ x: -window.innerWidth, opacity: 0, transition: { duration: 0.2 } });
      onDiscard(item.id);
    } 
    // Save (swipe right)
    else if (offset > 100 || velocity > 500) {
      setExitDirection('right');
      await controls.start({ x: window.innerWidth, opacity: 0, transition: { duration: 0.2 } });
      onSave(item.id);
    } 
    // Snap back
    else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Dead Zone: ignore touch in the leftmost 20px for iOS swipe back
    if (e.clientX < 20) {
      return;
    }
    dragControls.start(e);
  };

  const isSmart = item.reason?.includes('[智能匹配]');

  return (
    <div className="relative w-full mb-4 rounded-2xl overflow-hidden touch-pan-y" style={{ WebkitTapHighlightColor: 'transparent' }}>
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6 rounded-2xl bg-white/5">
        <motion.div 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400"
          style={{ opacity: leftIconOpacity, scale: leftIconScale }}
        >
          <Archive className="w-5 h-5" />
        </motion.div>
        
        <motion.div 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 text-red-400"
          style={{ opacity: rightIconOpacity, scale: rightIconScale }}
        >
          <Trash2 className="w-5 h-5" />
        </motion.div>
      </div>

      {/* Draggable Card */}
      <motion.div
        drag="x"
        dragListener={false}
        dragControls={dragControls}
        onPointerDown={handlePointerDown}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="relative z-10 w-full p-5 bg-[#111113] border border-white/5 rounded-2xl shadow-xl active:scale-[0.98] transition-transform duration-200"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[17px] font-medium leading-snug text-white/90 line-clamp-2">
              {item.title || 'Untitled'}
            </h3>
            {isSmart && (
              <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              </div>
            )}
          </div>
          
          <p className="text-sm text-white/50 leading-relaxed line-clamp-2">
            {item.summary || 'No summary available.'}
          </p>
          
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] text-white/40 font-medium px-2 py-1 bg-white/5 rounded-md">
              {item.source_name || 'Source'}
            </span>
            <span className="text-[11px] text-white/30">
              {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
          
          {isSmart && (
            <div className="mt-2 text-xs italic text-blue-400/80 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">
              "{item.reason?.replace('[智能匹配] ', '')}"
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
