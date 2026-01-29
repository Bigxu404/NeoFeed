'use client'

import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import GlitchText from './GlitchText';

export default function SiteHero() {
  const mouseX = useMotionValue(0.5);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, innerWidth } = e.nativeEvent.view || { clientX: 0, innerWidth: 1000 };
    mouseX.set(clientX / innerWidth);
  };

  const springX = useSpring(mouseX, { damping: 20, stiffness: 150 });
  
  // Parallax for background
  const moveX = useTransform(springX, [0, 1], [20, -20]);

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505]"
    >
      
      {/* ==================== BACKGROUND TEXTURES (Visible & Static) ==================== */}
      
      {/* 🕶️ NEO (Left Background) */}
      <motion.div 
        style={{ x: moveX }}
        className="absolute left-[-5%] bottom-0 h-[90vh] w-[50vw] pointer-events-none z-0 opacity-20 mix-blend-screen"
      >
         <svg viewBox="0 0 400 800" className="w-full h-full fill-white/5">
            <path d="M100,800 L120,600 Q150,400 200,300 Q250,200 220,150 Q180,100 150,150 Q100,200 80,300 L50,800 Z" />
            <circle cx="185" cy="130" r="35" />
         </svg>
         {/* Matrix Rain Overlay - Removed missing image */}
         <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-30 mask-image-gradient" />
      </motion.div>

      {/* 🕴️ SMITH (Right Background) */}
      <motion.div 
        style={{ x: useTransform(moveX, (v) => -v) }}
        className="absolute right-[-5%] bottom-0 h-[90vh] w-[50vw] pointer-events-none z-0 opacity-20 mix-blend-screen"
      >
         <svg viewBox="0 0 400 800" className="w-full h-full fill-green-500/5">
            <path d="M200,800 L200,300 L150,200 L250,200 L300,300 L300,800 Z" />
            <circle cx="225" cy="150" r="40" />
         </svg>
         {/* Grid Overlay */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </motion.div>


      {/* ==================== SPLIT CONTENT LAYOUT ==================== */}

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 w-full max-w-7xl 2xl:max-w-[1600px] px-6 md:px-12 2xl:px-24 h-full gap-12 items-center">
        
        {/* 🔴 LEFT: THE HUMAN (Serif / Chaos) */}
        <div className="flex flex-col justify-center items-start text-left space-y-6 2xl:space-y-10">
           <div className="font-serif italic text-white/40 text-sm 2xl:text-base tracking-widest">
             // THE ANOMALY
           </div>
           
           <div className="relative">
             <h1 className="text-7xl md:text-9xl 2xl:text-[12rem] font-serif font-bold text-white leading-[0.85] tracking-tight">
               <GlitchText text="NeoFeed" />
             </h1>
             <div className="text-3xl md:text-4xl 2xl:text-6xl text-white/80 font-serif italic mt-2 2xl:mt-4 ml-1">
               is the key.
             </div>
           </div>

           <p className="font-serif text-xl md:text-2xl 2xl:text-4xl text-white/60 max-w-md 2xl:max-w-2xl leading-relaxed mt-4">
             "The Internet is a prison for your mind.<br/>
             <span className="text-white underline decoration-1 underline-offset-4 decoration-white/30">Wake up.</span>"
           </p>
           
           <button className="group flex items-center gap-4 2xl:gap-8 text-white hover:text-green-400 transition-colors mt-6 2xl:mt-12">
              <div className="w-12 h-12 2xl:w-20 2xl:h-20 border border-white/20 rounded-full flex items-center justify-center group-hover:border-green-500 transition-colors bg-white/5 backdrop-blur-sm">
                 <span className="w-2 h-2 2xl:w-4 2xl:h-4 bg-white group-hover:bg-green-500 rounded-full transition-colors" />
              </div>
              <span className="font-serif tracking-wide text-lg 2xl:text-3xl">Follow the White Rabbit</span>
           </button>
        </div>

        {/* 🟢 RIGHT: THE MACHINE (Mono / Order) */}
        <div className="flex flex-col justify-center items-end text-right space-y-6 2xl:space-y-12 relative pt-12 md:pt-0">
           <div className="font-mono text-green-500/40 text-xs 2xl:text-sm tracking-widest">
             // SYSTEM_ROOT_ACCESS
           </div>
           
           {/* Code Waterfall */}
           <div className="font-mono text-sm md:text-base 2xl:text-2xl text-green-500/80 leading-tight opacity-80">
              <TypewriterCode />
           </div>

           <div className="h-[1px] w-32 2xl:w-64 bg-green-500/30" />
           
           <div className="font-mono text-xs 2xl:text-base text-green-500/50">
              &gt; ORDER RESTORED<br/>
              &gt; ENTROPY DELETED<br/>
              &gt; KNOWLEDGE INDEXED
           </div>
        </div>

      </div>

      {/* CENTER: SCROLL INDICATOR */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
         <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
      </div>

    </section>
  );
}

function TypewriterCode() {
  const codeLines = [
    "struct Reality {",
    "  const chaos: void;",
    "  var order: boolean;",
    "}",
    "",
    "func optimize(mind: User) {",
    "  while(true) {",
    "    NeoFeed.ingest(mind);",
    "    Reality.order = true;",
    "  }",
    "}"
  ];

  return (
    <div className="flex flex-col items-end">
      {codeLines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {line}
        </motion.div>
      ))}
    </div>
  );
}
