'use client'

import { motion } from 'framer-motion';
import { Rabbit } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

interface ButtonProps {
  text: string;
  href: string;
  className?: string;
}

/**
 * PillButton: Hover reveals a glowing pill silhouette behind the text.
 * Optimized for performance using only transform/opacity changes.
 */
export const PillButton = memo(function PillButton({ text, href, className = "" }: ButtonProps) {
  return (
    <Link href={href}>
      <motion.button 
        className={`relative px-6 py-2 text-xs font-bold tracking-widest text-white/60 hover:text-blue-300 transition-colors uppercase font-mono group flex items-center justify-center ${className}`}
        whileHover="hover"
        initial="rest"
        style={{ willChange: "transform" }} // Hint to browser
      >
        <span className="relative z-10">{text}</span>
        
        {/* Pill Silhouette (Background Glow) */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-blue-500/20 blur-md"
          variants={{
            rest: { opacity: 0, scale: 0.8 },
            hover: { opacity: 1, scale: 1 }
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        {/* Pill Shape Border */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-blue-500/50"
          variants={{
            rest: { opacity: 0, scale: 0.9 },
            hover: { opacity: 1, scale: 1 }
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </motion.button>
    </Link>
  );
});

/**
 * RabbitButton: Hover slides text and reveals a running rabbit.
 * Uses 'Sign Up' style (Red/Orange).
 */
export const RabbitButton = memo(function RabbitButton({ text, href, className = "" }: ButtonProps) {
  return (
    <Link href={href}>
      <motion.button 
        className={`relative px-6 py-2 text-xs font-bold tracking-widest text-white/60 hover:text-white transition-colors uppercase font-mono group flex items-center justify-center overflow-hidden ${className}`}
        whileHover="hover"
        initial="rest"
        style={{ willChange: "transform" }}
      >
        <motion.div 
          className="relative z-10 flex items-center gap-2"
          variants={{
            rest: { x: 0 },
            hover: { x: -8 } // Slide text left to make room
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <span className="group-hover:text-red-400 transition-colors">{text}</span>
        </motion.div>

        {/* Rabbit - Starts hidden right, runs in */}
        <motion.div
          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
          variants={{
            rest: { x: 20, opacity: 0 },
            hover: { x: 0, opacity: 1 }
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Rabbit className="w-4 h-4" />
        </motion.div>
        
        {/* Subtle Red Glow on Hover */}
        <motion.div 
          className="absolute inset-0 bg-red-500/10 blur-lg rounded-full pointer-events-none"
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1 }
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    </Link>
  );
});
