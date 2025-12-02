'use client'

import { motion } from 'framer-motion';

// Custom Zhihu Icon
function ZhihuIcon({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5.333 7.333H3.555v1.334h1.778V12c0 1.467-1.333 1.333-1.333 1.333v1.778s2.667.444 3.111-1.778V8.667h2v-1.334H6.89V3.556H5.333v3.777zm9.778-1.333h-4v1.333h4v2.667h-3.111v4.889s.222 1.333-1.333 1.333v2s3.111.222 3.111-2.667V11.333h1.333V6z" />
      <path d="M13.778 15.556c-.89 0-1.334-1.334-1.334-1.334h-2.222s-.222 3.111 3.556 3.111c4 0 3.555-3.111 3.555-3.111H15.11s-.222 1.334-1.333 1.333z" />
      <path d="M15.778 3.556h-2v2.222h2V3.556z" />
    </svg>
  );
}

// Static particles to prevent Hydration Error (no Math.random() during render)
const STATIC_PARTICLES = [
  { radius: 70, size: 3, duration: 8, delay: 0, opacity: 0.8 },
  { radius: 85, size: 2, duration: 12, delay: -5, opacity: 0.5 },
  { radius: 60, size: 2, duration: 6, delay: -2, opacity: 0.6 },
];

export default function AboutSection() {
  return (
    <section id="about" className="w-full relative overflow-hidden py-48 flex flex-col items-center justify-center bg-black">
      
      {/* Background Gradient Spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        
        {/* THE AVATAR SINGULARITY */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative inline-block mb-12 group"
        >
          {/* 1. Accretion Discs (Outer Rings) */}
          <div className="absolute -inset-12 rounded-full border border-white/5 border-t-white/10 border-r-transparent animate-spin-slow" style={{ animationDuration: '20s' }} />
          <div className="absolute -inset-8 rounded-full border border-white/5 border-b-white/20 border-l-transparent animate-spin-slow" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
          
          {/* 2. Event Horizon (Glow) */}
          <div className="absolute -inset-2 bg-white/10 blur-xl rounded-full group-hover:bg-green-500/20 transition-colors duration-500" />

          {/* 3. The Avatar Core */}
          <div className="relative w-32 h-32 rounded-full bg-black flex items-center justify-center overflow-hidden z-10 border border-white/20 shadow-[inset_0_0_30px_rgba(0,0,0,1)] group-hover:border-green-500/50 transition-colors duration-500">
             
             {/* Inner Texture */}
             <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-30 mix-blend-overlay" />
             
             {/* Letter */}
             <span className="text-5xl font-serif italic text-white/90 z-20 group-hover:text-green-400 transition-colors duration-500">N</span>
             
             {/* Status Dot */}
             <div className="absolute bottom-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-black shadow-[0_0_10px_#4ade80] animate-pulse z-30" />
          </div>

          {/* 4. Orbiting Particles (Static & Optimized) */}
          {STATIC_PARTICLES.map((p, i) => (
            <motion.div 
              key={i}
              className="absolute top-1/2 left-1/2 bg-white rounded-full shadow-[0_0_5px_white]"
              animate={{ rotate: 360 }}
              transition={{ 
                duration: p.duration, 
                repeat: Infinity, 
                ease: "linear",
                delay: p.delay
              }}
              style={{ 
                width: p.size,
                height: p.size,
                opacity: p.opacity,
                x: p.radius, 
                originX: -p.radius // Orbit radius logic
              }} 
            />
          ))}
          
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-6 font-serif tracking-wide">Created by Neo</h2>
        <p className="text-white/50 max-w-xl mx-auto mb-10 leading-relaxed font-sans font-light text-lg">
          "在数字荒原中寻找信号。NeoFeed 是我为对抗信息过载而锻造的武器，<br/>
          愿它成为你在网络深空中的导航塔。"
        </p>

        <div className="flex items-center justify-center gap-6">
           <SocialLink icon={ZhihuIcon} href="https://www.zhihu.com" label="Zhihu" />
        </div>
      </div>
    </section>
  );
}

function SocialLink({ icon: Icon, href, label }: { icon: any, href: string, label: string }) {
  return (
    <a 
      href={href} 
      target="_blank"
      rel="noopener noreferrer"
      className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5 hover:border-white/20 group backdrop-blur-sm hover:scale-110"
      aria-label={label}
    >
      <Icon size={24} className="group-hover:rotate-12 transition-transform duration-300" />
    </a>
  );
}
