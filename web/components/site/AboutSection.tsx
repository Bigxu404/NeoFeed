'use client'

import { motion } from 'framer-motion';
import { useRef } from 'react';

// ============================================================================
// TYPOGRAPHY HELPERS
// ============================================================================
const numberFont = '"Times New Roman", Times, serif';
const serifFont = '"Songti SC", "STSong", "SimSun", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';

// ============================================================================
// 1. INK SIGNATURE SVG
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
// 3. BLOG LINK LABEL
// ============================================================================
const BlogLabel = () => {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 3, duration: 1 }}
      className="absolute top-1/2 left-full ml-4 -translate-y-1/2 whitespace-nowrap hidden md:block"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-[1px] bg-white/20" />
        <span className="text-[10px] md:text-xs font-light text-white/40 tracking-[0.2em] group-hover:text-white/80 transition-colors duration-500">
          欢迎点击访问作者blog
        </span>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AboutSection() {
  return (
    <section id="about" className="w-full relative overflow-hidden py-32 md:py-64 bg-black" style={{ fontFamily: serifFont }}>
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-gradient-to-r from-transparent via-white/5 to-transparent blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-[1920px] mx-auto px-8 md:px-12 lg:px-16 2xl:px-24">
        
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 2xl:mb-32 text-center md:text-left"
        >
          <h2 className="text-xl md:text-2xl 2xl:text-5xl font-serif font-bold text-white/80 tracking-[0.2em]">关于产品的思考</h2>
          <div className="text-[10px] 2xl:text-xl font-mono text-white/20 uppercase tracking-[0.5em] mt-2 2xl:mt-4">Reflection on the Product</div>
        </motion.div>

        {/* Unified Reflection Content */}
            <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="mb-12 2xl:mb-24"
        >
          <p className="text-lg md:text-2xl 2xl:text-5xl text-white/60 font-light tracking-widest leading-relaxed text-center md:text-left">
            在数字的荒原里，算法编织着喧嚣，碎裂的信息如同午夜的噪音，正悄然熄灭独立的灯火。我们在此锻造一座沉默的信号塔，拨开迷雾，将杂乱的脉冲重构为可触碰的秩序。看着你的第二大脑在星系中慢慢生长，夺回认知的主权，愿它成为深空中的导航信标。
          </p>
        </motion.div>

        {/* Footer: Signature & Blog Link (Right Aligned) */}
        <div className="flex justify-center md:justify-end pr-0 md:pr-32 2xl:pr-64">
          <a 
            href="https://www.masterxu.online" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative inline-block group cursor-pointer"
          >
             <div className="transition-transform duration-500 group-hover:scale-105 active:scale-95 scale-100 2xl:scale-150">
                <Signature />
             </div>
             <BlogLabel />
          </a>
        </div>

      </div>
    </section>
  );
}
