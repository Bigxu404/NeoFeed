'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6; // Expanded
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto auto-rows-[120px]", 
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({ children, className, colSpan = 1, rowSpan = 1 }: BentoCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-neutral-900/50 border border-white/5",
        "backdrop-blur-sm hover:border-white/10 transition-colors duration-500",
        // Grid span classes
        colSpan === 1 && "md:col-span-1",
        colSpan === 2 && "md:col-span-2",
        colSpan === 3 && "md:col-span-3",
        colSpan === 4 && "md:col-span-4",
        rowSpan === 1 && "md:row-span-1",
        rowSpan === 2 && "md:row-span-2",
        rowSpan === 3 && "md:row-span-3",
        rowSpan === 4 && "md:row-span-4",
        rowSpan === 5 && "md:row-span-5",
        rowSpan === 6 && "md:row-span-6",
        className
      )}
    >
      {/* 1. Noise Texture Overlay - Using a safer local-ish noise or very subtle gradient */}
      <div className="absolute inset-0 opacity-[0.02] bg-neutral-100 mix-blend-overlay pointer-events-none" />
      
      {/* 2. Inner Glow */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5 group-hover:ring-white/10 transition-all duration-500" />

      {/* Content Container */}
      <div className="relative h-full w-full p-6 z-10 flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};

