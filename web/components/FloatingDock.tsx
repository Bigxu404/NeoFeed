'use client'

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, History, PieChart, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'home', icon: Sparkles, label: 'Capture', path: '/' },
  { id: 'history', icon: History, label: 'Memories', path: '/history' },
  { id: 'stats', icon: PieChart, label: 'Insights', path: '/stats' },
  { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
];

function DockItem({ item }: { item: typeof NAV_ITEMS[0] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setHovered] = useState(false);

  const isActive = pathname === item.path;

  return (
    <div 
      className="relative flex items-center justify-center w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 🏷️ 悬浮提示文字 - 深色模式适配 */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 5, filter: 'blur(2px)' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-full ml-6 whitespace-nowrap z-50 pointer-events-none flex items-center"
          >
            {/* 装饰性横线 */}
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 16, opacity: 0.3 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-[1px] bg-white mr-3 origin-left"
            />
            
            <span className="font-serif italic text-lg text-white/80 tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {item.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => router.push(item.path)}
        className={cn(
          "relative p-3 rounded-2xl transition-all duration-500 ease-out z-10",
          "hover:scale-110 hover:bg-white/10", 
          isActive ? "text-white" : "text-white/30 hover:text-white"
        )}
      >
        <item.icon className={cn("w-5 h-5 transition-all duration-300", isActive ? "stroke-[2.5]" : "stroke-[1.5]")} />
        
        {/* 选中态的光晕 - 深空极光感 */}
        {isActive && (
          <motion.div
            layoutId="activeGlow"
            className="absolute inset-0 bg-white/10 rounded-2xl shadow-[inset_0_0_12px_rgba(255,255,255,0.2),0_0_20px_rgba(255,255,255,0.1)] -z-10"
            transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </button>
    </div>
  );
}

export function FloatingDock() {
  return (
    <motion.div 
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4"
    >
      {/* 
        Dock 容器 - 深色磨砂玻璃
      */}
      <div className="
        py-5 px-2.5 flex flex-col gap-5 items-center rounded-full
        bg-black/20 
        backdrop-blur-xl backdrop-saturate-150 
        border border-white/10
        shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_20px_40px_-12px_rgba(0,0,0,0.5)]
      ">
        {NAV_ITEMS.map((item) => (
          <DockItem key={item.id} item={item} />
        ))}
      </div>
    </motion.div>
  );
}

