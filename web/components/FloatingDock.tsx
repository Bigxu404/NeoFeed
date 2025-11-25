'use client'

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';

function DockItem({ item, index }: { item: typeof NAV_ITEMS[0], index: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setHovered] = useState(false);

  const isActive = item.href === '/' 
    ? pathname === '/' 
    : pathname.startsWith(item.href);

  return (
    <div 
      className="relative flex items-center group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 
        🔗 电路连接线 (装饰)
        除最后一个外，每个图标下面都有一条线连接到下一个
      */}
      {index < NAV_ITEMS.length - 1 && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-6 bg-white/10 -z-10 group-hover:bg-green-500/50 transition-colors duration-500" />
      )}

      {/* 🔘 图标按钮 */}
      <button
        onClick={() => router.push(item.href)}
        className={cn(
          "relative p-3 rounded-full transition-all duration-300 z-10 border border-transparent",
          isActive 
            ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-110" 
            : "text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 hover:scale-110"
        )}
      >
        <item.icon className={cn("w-5 h-5 transition-transform duration-300", isHovered && "rotate-12")} />
      </button>

      {/* 🏷️ 滑出式标签 */}
      <div className="absolute left-full ml-4 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-2"
            >
              {/* 装饰箭头 */}
              <div className="w-2 h-[1px] bg-green-500" />
              <span className="text-sm font-mono font-bold tracking-wider text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-white/10 uppercase">
                {item.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function FloatingDock() {
  return (
    <motion.div 
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-6" // 增加 gap 以容纳连线
    >
      {/* 去掉了外层容器，直接展示垂直电路结构 */}
      {NAV_ITEMS.map((item, index) => (
        <DockItem key={item.href} item={item} index={index} />
      ))}
    </motion.div>
  );
}
