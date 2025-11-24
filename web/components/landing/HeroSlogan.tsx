'use client'

import { motion, MotionValue, Transition } from 'framer-motion'; // 引入 Transition

interface HeroSloganProps {
  isHovering: boolean;
  isFocused: boolean;
  textMoveX: MotionValue<number>;
  textMoveY: MotionValue<number>;
  suctionTransition: Transition; // 修复类型: any -> Transition
}

export default function HeroSlogan({ isHovering, isFocused, textMoveX, textMoveY, suctionTransition }: HeroSloganProps) {
  return (
    <motion.div 
      className="text-center space-y-6 origin-center"
      animate={{ 
        opacity: isFocused || isHovering ? 0 : 1, 
        scale: isFocused || isHovering ? 0.8 : 1, 
        filter: isFocused || isHovering ? 'blur(20px)' : 'blur(0px)', 
        y: isHovering ? 50 : 0, 
        pointerEvents: isFocused || isHovering ? 'none' : 'auto',
      }}
      transition={suctionTransition}
      style={{ x: textMoveX, y: textMoveY }}
    >
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-white/95 font-serif drop-shadow-2xl whitespace-nowrap overflow-visible">
        Feed the <span className="fix-clipped-text italic font-normal text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/50">Singularity</span>
      </h1>
      <p className="text-lg text-white/40 max-w-xl mx-auto font-light tracking-wide">
        Your second brain is hungry for knowledge.
      </p>
    </motion.div>
  );
}
