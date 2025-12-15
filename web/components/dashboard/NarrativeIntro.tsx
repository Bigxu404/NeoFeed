'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';

interface NarrativeIntroProps {
  onComplete: () => void;
}

export default function NarrativeIntro({ onComplete }: NarrativeIntroProps) {
  const [stage, setStage] = useState<'envelope' | 'letter' | 'explosion'>('envelope');

  const handleCloseLetter = () => {
    setStage('explosion');
    setTimeout(() => {
      onComplete();
    }, 4000); 
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#050505] text-white font-serif flex">
      
      {/* LEFT SIDE: The Interaction (Envelope) */}
      <div className="w-1/2 h-full flex items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
            {stage === 'envelope' && (
                <motion.div 
                    key="envelope"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                    className="cursor-pointer group"
                    onClick={() => setStage('letter')}
                >
                    <motion.div 
                        whileHover={{ scale: 1.02, rotate: -1 }}
                        className="relative w-96 h-64 bg-[#e6dccf] shadow-2xl flex items-center justify-center"
                        style={{
                            clipPath: "polygon(0% 0%, 50% 50%, 100% 0%, 100% 100%, 0% 100%)",
                            background: "linear-gradient(135deg, #f0e6da 0%, #d6c7b5 100%)"
                        }}
                    >
                        {/* Wax Seal */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#8a1c1c] rounded-full shadow-lg flex items-center justify-center border-4 border-[#6e1616] z-20 group-hover:scale-110 transition-transform">
                            <span className="text-[#521010] font-serif font-bold text-2xl">N</span>
                        </div>
                        
                        {/* Flap Shadow */}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-black/5 transform origin-top scale-y-[-1] z-10" 
                             style={{ clipPath: "polygon(0% 0%, 50% 100%, 100% 0%)" }} 
                        />
                        
                        <div className="absolute bottom-8 w-full text-center">
                            <p className="text-[#5c4d40] font-mono text-xs tracking-[0.3em] uppercase opacity-70">To: The Architect</p>
                        </div>
                    </motion.div>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center mt-8 text-white/30 text-xs tracking-widest font-mono uppercase group-hover:text-white/60 transition-colors"
                    >
                        Read the Message
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* RIGHT SIDE: The Visual (Jack Kerouac Placeholder) */}
      <motion.div 
        className="w-1/2 h-full bg-cover bg-center relative"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519791883288-dc8bd696e667?q=80&w=2070&auto=format&fit=crop')" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute inset-0 bg-black/10" /> {/* Subtle dim */}
        {/* Vertical Line Separator */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
      </motion.div>


      {/* OVERLAY: The Letter (Centered Modal) */}
      <AnimatePresence>
        {stage === 'letter' && (
          <motion.div 
            key="letter"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            className="absolute inset-0 flex items-center justify-center z-50"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={handleCloseLetter} />
            
            <div className="relative w-full max-w-xl bg-[#fdfbf7] text-[#1a1a1a] p-12 shadow-2xl">
                <button onClick={handleCloseLetter} className="absolute top-6 right-6 text-black/20 hover:text-black transition-colors">
                    <X size={24} />
                </button>

                <div className="space-y-8 font-serif">
                    <p className="text-xs font-bold tracking-widest uppercase text-black/40 border-b border-black/10 pb-4">
                        A Note from the Past
                    </p>
                    
                    <h2 className="text-3xl font-bold leading-tight text-black">
                        思考曾是如此缓慢，<br/>却如此深刻。
                    </h2>
                    
                    <div className="text-lg leading-relaxed text-black/80 space-y-4">
                        <p>看着那台老式打字机，你是否怀念那个时代？</p>
                        <p>没有弹窗，没有红点，没有无穷无尽的 Feed 流。我们花费数小时去打磨一个段落，而不是数秒钟去划过一个屏幕。</p>
                        <p>如今，信息在爆炸。我们看似拥有了一切，却在碎片的海洋中失去了方向。</p>
                        <p>NeoFeed 是我的反抗。我要在这个光速的时代，为你重建一座慢思考的避难所。</p>
                    </div>

                    <div className="pt-8 flex justify-end">
                        <button 
                            onClick={handleCloseLetter}
                            className="group flex items-center gap-3 bg-black text-white px-6 py-3 hover:bg-gray-900 transition-colors"
                        >
                            <span className="font-bold text-sm tracking-widest uppercase">Begin The Shift</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: The Explosion (Transition) */}
      <AnimatePresence>
        {stage === 'explosion' && (
            <motion.div 
                key="explosion"
                className="absolute inset-0 z-[100] bg-black flex items-center justify-center"
            >
                <div className="relative z-10 mix-blend-difference">
                    <motion.h1 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [1, 1.2, 5], opacity: [0, 1, 0] }}
                        transition={{ duration: 3, times: [0, 0.2, 1] }}
                        className="text-6xl md:text-9xl font-black text-white tracking-tighter text-center leading-none"
                    >
                        INFORMATION<br/>OVERLOAD
                    </motion.h1>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
