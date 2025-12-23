'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

interface ScrambleTextProps {
  text: string;
  className?: string;
  scrambleSpeed?: number; // ms per char flip
  revealSpeed?: number;   // ms between revealing next char
  trigger?: any; // Change this prop to re-trigger animation
}

export default function ScrambleText({ 
  text, 
  className, 
  scrambleSpeed = 30, 
  revealSpeed = 50,
  trigger
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    startAnimation();
  }, [text, trigger]);

  const startAnimation = () => {
    setIsAnimating(true);
    let revealIndex = 0;
    
    // 增加速度：从 30ms 减慢到 50ms，让乱码更明显
    const interval = setInterval(() => {
      let output = '';
      
      // 1. Construct the string
      for (let i = 0; i < text.length; i++) {
        if (i < revealIndex) {
          // Already revealed part
          output += text[i];
        } else {
          // Scrambling part
          // 使用更明显的字符集
          const CHARS = "!<>-_\\/[]{}—=+*^?#________"; 
          output += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      
      setDisplayText(output);

      // 减慢揭示速度：每次只有 30% 概率推进，延长解密感
      if (Math.random() > 0.7) { 
        revealIndex++;
      }

      // 3. Check completion
      if (revealIndex > text.length) {
        clearInterval(interval);
        setDisplayText(text); // Ensure final state is clean
        setIsAnimating(false);
      }
    }, 50); // 更慢的帧率，更有复古终端感

    return () => clearInterval(interval);
  };

  return (
    <motion.span className={className}>
      {displayText}
    </motion.span>
  );
}

