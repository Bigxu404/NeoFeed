'use client'

import { motion, MotionValue } from 'framer-motion';

interface StarFieldProps {
  isHovering: boolean;
  isFocused: boolean;
  starMoveX: MotionValue<number>;
  starMoveY: MotionValue<number>;
}

export default function StarField({ isHovering, isFocused, starMoveX, starMoveY }: StarFieldProps) {
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${isHovering ? 'stars-revealed' : ''}`}>
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
       
       <motion.div
          className="absolute inset-0"
          animate={{ 
              opacity: isFocused ? 0.2 : (isHovering ? 1 : 0.6), 
              scale: isFocused ? 1.1 : 1,
          }}
          transition={{ duration: 1.5 }}
       >
           {/* SVG Constellations */}
           <motion.svg 
              className="absolute top-[5%] left-[5%] w-[300px] h-[300px] rotate-[-15deg]"
              viewBox="0 0 100 100"
              style={{ x: starMoveX, y: starMoveY }}
           >
              <path d="M10 20 L25 25 L25 40 L10 35 Z" className="constellation-line" /> 
              <path d="M25 40 L35 42 L45 45 L60 55" className="constellation-line" />   
              <circle cx="10" cy="20" r="0.8" className="constellation-star" style={{animationDelay: '0s'}} />
              <circle cx="25" cy="25" r="0.9" className="constellation-star" style={{animationDelay: '1s'}} />
              <circle cx="25" cy="40" r="0.9" className="constellation-star" style={{animationDelay: '2s'}} />
              <circle cx="10" cy="35" r="0.7" className="constellation-star" style={{animationDelay: '3s'}} />
              <circle cx="35" cy="42" r="0.6" className="constellation-star" style={{animationDelay: '1.5s'}} />
              <circle cx="45" cy="45" r="0.6" className="constellation-star" style={{animationDelay: '2.5s'}} />
              <circle cx="60" cy="55" r="0.9" className="constellation-star" style={{animationDelay: '0.5s'}} />
           </motion.svg>
           
           <motion.svg 
              className="absolute bottom-[5%] right-[5%] w-[380px] h-[380px] rotate-[10deg]"
              viewBox="0 0 100 100"
              style={{ x: starMoveX, y: starMoveY }}
           >
              <path d="M40 20 L50 30 L60 20" className="constellation-line" /> 
              <path d="M50 30 L50 45 L40 55 L60 55 L50 45" className="constellation-line" />
              <path d="M40 55 L30 70 M60 55 L70 70" className="constellation-line" strokeDasharray="2 2" />
              <circle cx="40" cy="20" r="0.8" className="constellation-star" style={{animationDelay: '0s'}} />
              <circle cx="60" cy="20" r="0.8" className="constellation-star" style={{animationDelay: '2s'}} />
              <circle cx="50" cy="30" r="1.0" className="constellation-star" style={{animationDelay: '1s'}} />
              <circle cx="50" cy="45" r="0.9" className="constellation-star" style={{animationDelay: '3s'}} />
              <circle cx="40" cy="55" r="0.7" className="constellation-star" style={{animationDelay: '0.5s'}} />
              <circle cx="60" cy="55" r="0.7" className="constellation-star" style={{animationDelay: '1.5s'}} />
              <circle cx="30" cy="70" r="0.6" className="constellation-star" style={{animationDelay: '2.5s'}} />
              <circle cx="70" cy="70" r="0.6" className="constellation-star" style={{animationDelay: '3.5s'}} />
           </motion.svg>

           <motion.svg 
              className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] rotate-[5deg]"
              viewBox="0 0 100 100"
              style={{ x: starMoveX, y: starMoveY }}
           >
              <path d="M70 20 L65 30 L55 35 L45 40 L40 50 L45 60 L55 65 L65 60 L70 55" className="constellation-line" />
              <path d="M70 20 L75 15 L80 15" className="constellation-line" />
              <circle cx="70" cy="20" r="1.2" className="constellation-star" style={{animationDelay: '0s'}} /> 
              <circle cx="65" cy="30" r="0.9" className="constellation-star" style={{animationDelay: '1s'}} />
              <circle cx="55" cy="35" r="0.8" className="constellation-star" style={{animationDelay: '2s'}} />
              <circle cx="45" cy="40" r="0.8" className="constellation-star" style={{animationDelay: '3s'}} />
              <circle cx="40" cy="50" r="0.7" className="constellation-star" style={{animationDelay: '0.5s'}} />
              <circle cx="45" cy="60" r="0.7" className="constellation-star" style={{animationDelay: '1.5s'}} />
              <circle cx="55" cy="65" r="0.8" className="constellation-star" style={{animationDelay: '2.5s'}} />
              <circle cx="65" cy="60" r="0.9" className="constellation-star" style={{animationDelay: '3.5s'}} />
              <circle cx="70" cy="55" r="0.7" className="constellation-star" style={{animationDelay: '4s'}} />
           </motion.svg>

           <motion.svg 
              className="absolute top-[15%] right-[10%] w-[280px] h-[280px] rotate-[-10deg]"
              viewBox="0 0 100 100"
              style={{ x: starMoveX, y: starMoveY }}
           >
              <path d="M30 60 L50 60 L60 40 L40 40 Z" className="constellation-line" /> 
              <path d="M60 40 L50 20" className="constellation-line" /> 
              <path d="M50 60 L60 70 L70 65" className="constellation-line" /> 
              <path d="M30 60 L20 50" className="constellation-line" /> 
              <circle cx="30" cy="60" r="0.9" className="constellation-star" />
              <circle cx="50" cy="60" r="0.9" className="constellation-star" />
              <circle cx="60" cy="40" r="1.0" className="constellation-star" />
              <circle cx="40" cy="40" r="0.9" className="constellation-star" />
              <circle cx="50" cy="20" r="0.8" className="constellation-star" />
              <circle cx="60" cy="70" r="0.8" className="constellation-star" />
              <circle cx="20" cy="50" r="0.7" className="constellation-star" />
           </motion.svg>

           <motion.svg 
              className="absolute top-[2%] right-[30%] w-[300px] h-[300px] opacity-30 rotate-[20deg]"
              viewBox="0 0 100 100"
              style={{ x: starMoveX, y: starMoveY }}
           >
              <path d="M20 30 Q 50 50 80 40" className="constellation-line" />
              <circle cx="20" cy="30" r="0.9" className="constellation-star" />
              <circle cx="80" cy="40" r="0.9" className="constellation-star" />
              <circle cx="50" cy="46" r="0.6" className="constellation-star" />
           </motion.svg>
       </motion.div>
    </div>
  );
}

