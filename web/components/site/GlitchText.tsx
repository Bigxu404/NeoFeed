'use client'

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'p' | 'span';
}

export default function GlitchText({ text, className = "", as: Component = 'span' }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  // 随机触发故障
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) { // 5% 概率触发
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Component 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsGlitching(true)}
      onMouseLeave={() => setIsGlitching(false)}
    >
      <span className="relative z-10">{text}</span>
      
      {/* Glitch Layers */}
      {isGlitching && (
        <>
          <span 
            className="absolute top-0 left-0 -z-10 text-red-500 opacity-70 animate-pulse"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)', transform: 'translate(-2px, -2px)' }}
          >
            {text}
          </span>
          <span 
            className="absolute top-0 left-0 -z-10 text-blue-500 opacity-70 animate-pulse"
            style={{ clipPath: 'polygon(0 80%, 100% 20%, 100% 100%, 0 100%)', transform: 'translate(2px, 2px)' }}
          >
            {text}
          </span>
          <span 
            className="absolute top-0 left-0 -z-10 text-green-500 opacity-70"
            style={{ clipPath: 'inset(40% 0 40% 0)', transform: 'translate(-4px, 0)' }}
          >
            {text}
          </span>
        </>
      )}
    </Component>
  );
}

