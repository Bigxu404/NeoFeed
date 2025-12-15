'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Globe, FileText, Cpu } from 'lucide-react';

interface NeuralPrismProps {
  isProcessing: boolean;
}

export default function NeuralPrism({ isProcessing }: NeuralPrismProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center relative perspective-1000">
      
      {/* The Hypercube Container */}
      <div className="relative w-[400px] h-[400px] flex items-center justify-center">
        
        {/* Active Beam (Particle Stream) */}
        {isProcessing && (
             <>
                <div className="absolute left-0 top-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-green-500 to-white blur-[2px] animate-pulse" />
                <div className="absolute right-0 top-1/2 w-1/2 h-[2px] bg-gradient-to-l from-transparent via-green-500 to-white blur-[2px] animate-pulse delay-75" />
             </>
        )}

        {/* 3D Construct */}
        <motion.div 
            animate={{ 
                rotateX: isProcessing ? [0, 360] : [0, 5],
                rotateY: isProcessing ? [0, 360] : [0, -5],
                scale: isProcessing ? 1.2 : 1
            }}
            transition={{ 
                rotateX: { duration: isProcessing ? 4 : 10, repeat: Infinity, ease: "linear", repeatType: "mirror" },
                rotateY: { duration: isProcessing ? 5 : 12, repeat: Infinity, ease: "linear", repeatType: "mirror" },
                scale: { duration: 0.5 }
            }}
            className="relative w-48 h-48 transform-style-3d"
        >
            {/* Cube Faces - Wireframe Style */}
            {[...Array(3)].map((_, i) => (
                <div key={i} className={`absolute inset-0 border border-white/20 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.05)] transform-style-3d
                    ${i === 0 ? 'border-dashed rotate-45' : i === 1 ? 'border-dotted -rotate-45 scale-75' : 'border-solid scale-50'}
                `}>
                   {isProcessing && (
                       <div className="absolute inset-0 bg-green-500/5 blur-xl rounded-full animate-pulse" />
                   )}
                </div>
            ))}
            
            {/* The Core Singularity */}
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className={`w-16 h-16 bg-white rounded-full blur-[20px] transition-all duration-500 ${isProcessing ? 'opacity-80 scale-150' : 'opacity-10 scale-100'}`} />
                 <div className={`w-4 h-4 bg-black rounded-full relative z-10 border border-white/50 ${isProcessing ? 'scale-0' : 'scale-100'} transition-transform`} />
            </div>

        </motion.div>

        {/* Holographic Status Ring */}
        <motion.div
            className="absolute inset-0 border border-white/5 rounded-full"
            animate={{ scale: [1, 1.02, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
            className="absolute inset-8 border border-white/5 rounded-full border-dashed"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />

      </div>

      {/* Minimalist Info Overlay */}
      <AnimatePresence>
        {!isProcessing && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-24 flex gap-8 text-center"
            >
                {[
                    { label: "Neural Engine", status: "Idle" },
                    { label: "Galaxy Link", status: "Connected" },
                    { label: "Entropy", status: "Stable" },
                ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono text-white/30 uppercase">{item.label}</span>
                        <span className="text-xs font-bold text-white/80">{item.status}</span>
                    </div>
                ))}
            </motion.div>
        )}
      </AnimatePresence>

      {/* Active Processing State Text */}
      <AnimatePresence>
        {isProcessing && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-24 font-mono text-sm text-green-400 tracking-widest animate-pulse"
            >
                RECONSTRUCTING REALITY...
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
