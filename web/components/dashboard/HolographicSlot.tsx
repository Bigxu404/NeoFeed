'use client'

import { motion } from 'framer-motion';
import { LucideIcon, Check, Plus } from 'lucide-react';

interface HolographicSlotProps {
  type: 'article' | 'thought' | 'image';
  title: string;
  subtitle: string;
  icon: LucideIcon;
  isFilled: boolean;
  isActive: boolean;
  onClick: () => void;
  color: string;
}

export default function HolographicSlot({ 
  type, title, subtitle, icon: Icon, isFilled, isActive, onClick, color 
}: HolographicSlotProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full aspect-[3/4] rounded-3xl cursor-pointer transition-all duration-500
        flex flex-col items-center justify-center p-6 text-center group
        ${isActive ? 'border-opacity-100 shadow-[0_0_50px_-10px_rgba(255,255,255,0.2)]' : 'border-opacity-20'}
      `}
    >
      {/* Background & Border Styles */}
      <div className={`absolute inset-0 rounded-3xl border-2 transition-colors duration-500 ${
        isFilled 
          ? `border-${color}-500/50 bg-${color}-900/20` 
          : isActive 
            ? `border-${color}-500/80 bg-${color}-500/10` 
            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
      }`} />

      {/* Dashed placeholder lines for empty state */}
      {!isFilled && (
        <div className="absolute inset-4 border-2 border-dashed border-white/10 rounded-2xl pointer-events-none" />
      )}

      {/* Icon Container */}
      <div className={`
        relative z-10 w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-500
        ${isFilled 
          ? `bg-${color}-500 text-black shadow-[0_0_30px_rgba(255,255,255,0.5)]` 
          : `bg-white/10 text-white/40 group-hover:bg-white/20 group-hover:text-white group-hover:scale-110`}
      `}>
        {isFilled ? <Check size={32} strokeWidth={3} /> : <Icon size={32} />}
        
        {/* Pulse Effect for Empty */}
        {!isFilled && isActive && (
          <div className={`absolute inset-0 rounded-full animate-ping bg-${color}-500/20`} />
        )}
      </div>

      {/* Text Content */}
      <div className="relative z-10">
        <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${isFilled ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
          {isFilled ? 'DATA ACQUIRED' : title}
        </h3>
        <p className={`text-xs font-mono uppercase tracking-wider transition-colors duration-300 ${isFilled ? `text-${color}-400` : 'text-white/30 group-hover:text-white/50'}`}>
          {isFilled ? 'Ready for Synthesis' : subtitle}
        </p>
      </div>

      {/* Active Indicator */}
      {isActive && !isFilled && (
         <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest animate-bounce">
            Input Active
         </div>
      )}
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/20 rounded-tl-xl" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/20 rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/20 rounded-bl-xl" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/20 rounded-br-xl" />

    </motion.div>
  );
}


