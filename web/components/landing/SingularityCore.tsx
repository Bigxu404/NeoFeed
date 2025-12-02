'use client'

import { useState, useEffect } from 'react';
import { motion, MotionValue, Transition } from 'framer-motion'; 
import InputCapsule from './InputCapsule';

interface Particle {
  width: string;
  height: string;
  radius: string;
  angleStart: string;
  angleEnd: string;
  duration: string;
  delay: string;
  maxOpacity: number;
}

interface SingularityCoreProps {
  isHovering: boolean;
  isFocused: boolean;
  onHoverChange: (isHovering: boolean) => void;
  onFocusTrigger: () => void;
  onSave: (content: string) => void;
  moveX: MotionValue<number>;
  growthTransition: Transition; 
  showInput?: boolean;
}

export default function SingularityCore({ 
  isHovering, 
  isFocused, 
  onHoverChange, 
  onFocusTrigger, 
  onSave,
  moveX,
  growthTransition,
  showInput = true
}: SingularityCoreProps) {
  
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 100 }).map(() => ({ 
      width: Math.random() * 2 + 1 + 'px',
      height: Math.random() * 2 + 1 + 'px',
      radius: `${200 + Math.random() * 380}px`, 
      angleStart: `${Math.random() * 360}deg`,
      angleEnd: `${Math.random() * 360 + 180}deg`,
      duration: `${6 + Math.random() * 8}s`, 
      delay: `-${Math.random() * 15}s`,
      maxOpacity: Math.random() * 0.5 + 0.5, 
    }));
    setParticles(newParticles);
  }, []);

  return (
     <motion.div
        animate={{
          y: isFocused ? -120 : (isHovering ? -80 : 0), 
        }}
        transition={growthTransition} 
        className={`relative w-full overflow-visible max-w-3xl flex items-center justify-center blackhole-container`}
        style={{ x: moveX }}
     >
        
        {/* 🌑 黑洞本体 */}
        <motion.div
          key="singularity-core"
          animate={{ 
              opacity: isFocused ? 0.3 : 1, 
              scale: isFocused ? 3 : 1,     
              filter: isFocused ? 'blur(20px)' : 'blur(0px)', 
          }} 
          transition={{ duration: 1.5, ease: "easeInOut" }} 
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* 融合光晕 */}
          <motion.div 
            className="absolute w-[24rem] h-[24rem] rounded-full z-0 bg-indigo-900/20 blur-[70px]" 
            animate={{ scale: isHovering ? 2 : 1 }} 
            transition={growthTransition}
          />

          <div className={`absolute inset-0 z-0 pointer-events-none ${isHovering ? 'particles-accelerated' : ''}`}>
            {particles.map((p, i) => (
                <div key={i} className="particle" style={{ 
                    width: p.width, 
                    height: p.height, 
                    '--radius': p.radius, 
                    '--angle-start': p.angleStart, 
                    '--angle-end': p.angleEnd, 
                    '--duration': p.duration, 
                    '--delay': p.delay, 
                    '--max-opacity': p.maxOpacity 
                } as any} />
            ))}
          </div>

          {/* 光刃吸积盘 - 上层 */}
          <motion.div 
            className="absolute z-5 accretion-ring opacity-60"
            animate={{ scale: isHovering ? 1.3 : 1 }}
            transition={growthTransition}
            style={{ width: '34rem', height: '3rem', borderRadius: '100%', transform: 'translateY(-18px) rotate(-8deg) scaleY(0.8)', filter: 'blur(8px)', }}
          />

          {/* 事件视界 */}
          <motion.div 
            className="absolute w-32 h-32 bg-black rounded-full z-20"
            animate={{ scale: isHovering ? 1.6 : 1 }}
            transition={growthTransition}
            style={{ boxShadow: isHovering ? `0 0 0 2px rgba(255,255,255,0.2), 0 0 120px rgba(255,255,255,0.2), inset 0 0 160px rgba(0,0,0,1)` : `0 0 0 1px rgba(255,255,255,0.1), 0 0 30px rgba(255,255,255,0.1), inset 0 0 60px rgba(0,0,0,1)` }}
          />

          {/* 光子环 */}
          <motion.div 
            className="absolute w-[8.4rem] h-[8.4rem] rounded-full z-25 border border-white/20"
            animate={{ scale: isHovering ? 1.62 : 1, opacity: isHovering ? 1 : 1, rotate: isHovering ? 180 : 0 }}
            transition={growthTransition}
            style={{ filter: 'url(#chromatic-aberration)', boxShadow: '0 0 20px rgba(255,255,255,0.1), inset 0 0 10px rgba(255,255,255,0.1)' }}
          />

          {/* 光刃吸积盘 - 下层 */}
          <motion.div 
            className="absolute z-30 mix-blend-screen accretion-ring"
            animate={{ scale: isHovering ? 1.3 : 1 }}
            transition={growthTransition}
            style={{ width: '38rem', height: '3px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,1), rgba(255,255,255,0.1), transparent)', transform: 'translateY(20px) rotate(-8deg)', boxShadow: isHovering ? '0 0 60px rgba(255,255,255,0.5)' : '0 0 25px rgba(255,255,255,0.2)', borderRadius: '50%' }}
          />
          
          {!isFocused && (
              <div 
                 className="absolute z-50 w-56 h-56 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20"
                 role="button"
                 aria-label="Activate Singularity Input"
                 tabIndex={0}
                 onMouseEnter={() => onHoverChange(true)}
                 onMouseLeave={() => onHoverChange(false)}
                 onClick={(e) => {
                   e.stopPropagation();
                   onFocusTrigger();
                 }}
                 onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onFocusTrigger();
                    }
                 }}
              />
          )}
        </motion.div>

        {/* 🔮 胶囊型输入框 */}
        {showInput && <InputCapsule isFocused={isFocused} onSave={onSave} />}

     </motion.div>
  );
}
