'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Infinity, ChevronLeft } from 'lucide-react'; 
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { saveItem } from '@/lib/api';
import { FloatingDock } from '@/components/FloatingDock';
import StarField from '@/components/landing/StarField';
import SingularityCore from '@/components/landing/SingularityCore';
import HeroSlogan from '@/components/landing/HeroSlogan';

export default function Home() {
  const router = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginOpen(false);
  };

  const handleSave = async (content: string) => {
    if (!content.trim()) return;

    setLoading(true);
    setIsAbsorbing(true); 

    try {
        await saveItem({ content: content.trim(), enable_ai: false });
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsAbsorbing(false);
        handleBack();
    } catch (error) {
      console.error("Save failed:", error);
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
        <Button variant="ghost" className="text-white/50 hover:text-white/90 hover:bg-white/5" onClick={() => setIsLoginOpen(true)}>
          Sign In
        </Button>
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

        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white backdrop-blur-xl">
            <DialogHeader>
             <DialogTitle className="text-white">Sign In</DialogTitle>
             <DialogDescription className="text-white/40">Access your second brain.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/70">Username</Label>
                <Input id="username" className="bg-white/5 border-white/10 text-white focus:border-white/30" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70">Password</Label>
                <Input id="password" type="password" className="bg-white/5 border-white/10 text-white focus:border-white/30" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-white text-black hover:bg-white/90">Sign In</Button>
            </form>
          </DialogContent>
        </Dialog>
    </div>
  );
}
