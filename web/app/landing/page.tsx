'use client'

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader';
import SiteHero from '@/components/site/SiteHero';
import FeatureGrid from '@/components/site/FeatureGrid';
import FlowStream from '@/components/site/FlowStream';
import FinalCTA from '@/components/site/FinalCTA';
import AboutSection from '@/components/site/AboutSection';

function LandingContent() {
  const searchParams = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      
      // 清理 URL 参数
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-green-500/30 selection:text-black overflow-x-hidden">
      
      {/* Deep Noise Texture */}
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none bg-[url('/noise.svg')] z-50 mix-blend-overlay" />
      
      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] bg-repeat" />

      <SiteHeader />
      
      <main className="relative z-10 flex flex-col">
        <SiteHero />
        <FlowStream />
        <FeatureGrid />
        <FinalCTA />
        <AboutSection />
      </main>

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-green-500 text-black rounded-full font-bold shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            认证成功！欢迎回来。
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <LandingContent />
    </Suspense>
  );
}
