'use client'

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

// ============================================================================
// 1. DECODING TEXT EFFECT
// ============================================================================
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;:,.<>?";

const DecryptText = ({ text, className }: { text: string, className?: string }) => {
  // Fix: Initial state must be deterministic to match server render
  const [displayText, setDisplayText] = useState(text); 
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isInView || isDone) return;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => 
        text.split('').map((char, index) => {
          if (index < iteration) {
            return text[index];
          }
          // Random chars only generated on client side
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setIsDone(true);
      }
      
      iteration += 1 / 2; 
    }, 30);

    return () => clearInterval(interval);
  }, [isInView, text, isDone]);

  return (
    <span ref={ref} className={className}>
      {displayText}
    </span>
  );
};

// ============================================================================
// 2. INK SIGNATURE SVG
// ============================================================================
const Signature = () => {
  return (
    <div className="relative w-48 h-24 mx-auto mt-8">
      <svg
        viewBox="0 0 200 100"
        className="w-full h-full overflow-visible"
        style={{ filter: "url(#ink-bleed)" }} // Apply ink bleed filter
      >
        <defs>
          <filter id="ink-bleed" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
        
        {/* 'Xu' Signature Path - Stylized */}
        <motion.path
          d="M60,30 L80,70 M80,30 L60,70 M110,50 C110,60 110,70 120,70 C130,70 140,50 140,40 M140,40 L140,70"
          fill="transparent"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 1.5 }}
        />
      </svg>
    </div>
  );
};

// ============================================================================
// 3. DIGITAL SEAL
// ============================================================================
const DigitalSeal = () => {
  return (
    <motion.div
      initial={{ scale: 2, opacity: 0, rotate: -20 }}
      whileInView={{ scale: 1, opacity: 1, rotate: -12 }}
      viewport={{ once: true }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 15, 
        delay: 3.5 // Appear after signature
      }}
      className="absolute top-1/2 right-[-20px] -translate-y-1/2 w-24 h-24 border-4 border-red-600/80 rounded-full flex flex-col items-center justify-center p-2 mix-blend-screen transform rotate-[-12deg]"
      style={{ boxShadow: "0 0 10px rgba(220, 38, 38, 0.4)" }}
    >
      <div className="absolute inset-0 rounded-full border border-red-600/30 m-1" />
      <span className="text-[8px] font-mono text-red-500 tracking-widest uppercase">Protocol</span>
      <span className="text-[12px] font-black text-red-600 uppercase leading-none my-1 tracking-tighter">HUMAN<br/>VERIFIED</span>
      <span className="text-[8px] font-mono text-red-500 tracking-widest">V1.0</span>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AboutSection() {
  return (
    <section id="about" className="w-full relative overflow-hidden py-48 flex flex-col items-center justify-center bg-black">
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gradient-to-r from-transparent via-white/5 to-transparent blur-[80px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        
        {/* 1. THE MANIFESTO (Decoded) */}
        <div className="mb-12 space-y-2">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
            <DecryptText text="Reclaim Your Cognitive Sovereignty." className="text-white" />
          </h2>
          <div className="text-lg md:text-xl font-mono text-green-500/80 tracking-wide uppercase">
            <DecryptText text="Reject Algorithmic Feeding." className="" />
          </div>
        </div>

        {/* 2. THE EXPLANATION */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          viewport={{ once: true }}
          className="text-white/40 max-w-2xl mx-auto mb-16 leading-relaxed font-sans font-light text-lg"
        >
          "在数字荒原中，我们建立信号塔。NeoFeed 不仅仅是一个工具；
          它是为对抗信息过载而锻造的武器。
          愿它成为你在深网中的导航信标。"
        </motion.p>

        {/* 3. SIGNATURE & SEAL BLOCK */}
        <div className="relative inline-block">
           <Signature />
           <DigitalSeal />
        </div>

      </div>
    </section>
  );
}
