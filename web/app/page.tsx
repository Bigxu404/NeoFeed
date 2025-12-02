'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Infinity, ChevronLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { saveItem } from '@/lib/api';
import { FloatingDock } from '@/components/FloatingDock';
import HeroSlogan from '@/components/landing/HeroSlogan';
import { createClient } from '@/lib/supabase/client';

// ✨ Dynamic import for 3D components (client-only)
const StarField = dynamic(() => import('@/components/landing/StarField'), { ssr: false });
const SingularityCore = dynamic(() => import('@/components/landing/SingularityCore'), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isAbsorbing, setIsAbsorbing] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const moveX = useTransform(springX, [-1, 1], [40, -40]); 
  const textMoveX = useTransform(springX, [-1, 1], [-15, 15]); 
  const textMoveY = useTransform(springY, [-1, 1], [-15, 15]);
  const starMoveX = useTransform(springX, [-1, 1], [15, -15]);
  const starMoveY = useTransform(springY, [-1, 1], [15, -15]);

  const [isHoveringBlackhole, setIsHoveringBlackhole] = useState(false);
  
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleBack = () => {
    setIsFocused(false);
    setIsHoveringBlackhole(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleSave = async (content: string) => {
    if (!content.trim()) return;

    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setIsAbsorbing(true); 

    try {
        await saveItem(content.trim());
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsAbsorbing(false);
        handleBack();
    } catch (error) {
      console.error("Save failed:", error);
      // 如果是 401，跳转登录
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const suctionTransition = { duration: 1.2, ease: "easeInOut" as const };
  const growthTransition = { duration: 4, ease: "easeOut" as const };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#05020a] text-white selection:bg-white/20 selection:text-white">
      
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="chromatic-aberration">
            <feOffset in="SourceGraphic" dx="-1.5" dy="0" result="left" />
            <feOffset in="SourceGraphic" dx="1.5" dy="0" result="right" />
            <feMerge>
              <feMergeNode in="left" />
              <feMergeNode in="right" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      
      {/* 🔙 返回按钮 */}
      <AnimatePresence>
        {isFocused && (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="fixed top-8 left-8 z-[60] cursor-pointer group pointer-events-auto"
                onClick={handleBack}
            >
                 <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/5 hover:bg-white/10 transition-all text-white/50 group-hover:text-white">
                    <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-sm font-medium tracking-wide">返回</span>
      </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 🌑 全局遮罩 */}
      <motion.div 
        className="fixed inset-0 bg-black pointer-events-none z-0"
        animate={{ opacity: isFocused ? 0.9 : 0 }}
        transition={suctionTransition}
      />

      {/* ✨ 星图背景组件 */}
      <StarField 
        isHovering={isHoveringBlackhole} 
        isFocused={isFocused} 
        starMoveX={starMoveX} 
        starMoveY={starMoveY} 
      />

      {/* UI 元素 - 增加 Hover 状态的吞噬效果 */}
      <motion.div
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40"
        animate={{ 
            opacity: isFocused || isHoveringBlackhole ? 0 : 1, // 悬浮时消失
            x: isFocused || isHoveringBlackhole ? -50 : 0,
            filter: isHoveringBlackhole ? 'blur(10px)' : 'blur(0px)', // 增加模糊感
            pointerEvents: isFocused || isHoveringBlackhole ? 'none' : 'auto'
        }}
        transition={suctionTransition}
      >
        <FloatingDock />
      </motion.div>
      
      <motion.header 
        animate={{ 
            opacity: isFocused || isHoveringBlackhole ? 0 : 1, // 悬浮时消失
            y: isFocused || isHoveringBlackhole ? -50 : 0,
            filter: isHoveringBlackhole ? 'blur(10px)' : 'blur(0px)',
            pointerEvents: isFocused || isHoveringBlackhole ? 'none' : 'auto'
        }}
        transition={suctionTransition}
        className="px-6 py-6 flex items-center justify-between sticky top-0 z-50 pointer-events-none md:pointer-events-auto"
      >
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
          <Infinity className="h-6 w-6 text-white/80 transition-colors group-hover:text-white" />
          <span className="text-lg font-medium tracking-tight text-white/80 font-serif">NeoFeed</span>
        </div>

        {user ? (
           <div className="flex items-center gap-4">
             <div className="text-xs text-white/40 font-mono hidden md:block">
                ID: {user.email?.split('@')[0]}
             </div>
             <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => router.push('/profile')}>
                <User className="w-5 h-5 text-white/70" />
             </Button>
           </div>
        ) : (
           <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className="text-white/50 hover:text-white hover:bg-transparent" 
                onClick={() => router.push('/login?mode=login')}
              >
                Sign In
              </Button>
              <Button 
                className="bg-white text-black hover:bg-white/90 rounded-full px-6" 
                onClick={() => router.push('/login?mode=signup')}
              >
                Sign Up
              </Button>
           </div>
        )}
      </motion.header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20 relative z-30">
        <div className="w-full max-w-5xl space-y-24 relative flex flex-col items-center">
          
          {/* Slogan 组件 */}
          <HeroSlogan 
            isHovering={isHoveringBlackhole} 
            isFocused={isFocused} 
            textMoveX={textMoveX} 
            textMoveY={textMoveY} 
            suctionTransition={suctionTransition} 
          />

          <div className="relative w-full h-[500px] flex items-center justify-center z-[60] -mt-24">
             
             {/* 黑洞核心组件 (包含输入框) */}
             <SingularityCore 
                isHovering={isHoveringBlackhole}
                isFocused={isFocused}
                onHoverChange={setIsHoveringBlackhole}
                onFocusTrigger={() => setIsFocused(true)}
                onSave={handleSave}
                moveX={moveX}
                growthTransition={growthTransition}
             />

             <AnimatePresence>
               {isAbsorbing && (
                 <>
              <motion.div
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ 
                       scale: [0.8, 0.5, 100], 
                       opacity: [0, 1, 0],
                     }}
                     transition={{ duration: 1.5, ease: "circIn" as const }}
                     className="absolute rounded-full bg-white z-[100] pointer-events-none w-20 h-20 mix-blend-overlay"
                   />
                 </>
               )}
             </AnimatePresence>
                </div>
        </div>
      </main>
    </div>
  );
}
