'use client'

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputCapsuleProps {
  isFocused: boolean;
  onSave: (content: string) => void;
}

export default function InputCapsule({ isFocused, onSave }: InputCapsuleProps) {
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused) {
      setTimeout(() => inputRef.current?.focus(), 800); 
    } else {
      if (inputRef.current) {
        inputRef.current.blur();
        inputRef.current.value = ''; 
      }
      setContent('');
    }
  }, [isFocused]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (content.trim()) {
        onSave(content);
      }
    }
  };

  return (
    <AnimatePresence>
      {isFocused && (
        <motion.div
          key="capsule-interface"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="absolute inset-0 flex items-center justify-center z-[70] pointer-events-none"
        >
          <div className="w-full max-w-3xl pointer-events-auto">
            <div className="relative flex items-center justify-center gap-5 
                            bg-[#1a1a1a]/80 backdrop-blur-2xl 
                            border border-white/10 
                            rounded-full 
                            p-3 px-5 md:p-4 md:px-8 
                            shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]
                            group transition-all duration-300 hover:border-white/20 hover:bg-[#1a1a1a]/90">
                
                {/* 输入框主体 - 居中 */}
                <input
                  ref={inputRef}
                  className="flex-1 bg-transparent border-none outline-none 
                             text-xl text-white/90 text-center
                             placeholder:text-white/30 placeholder:font-light
                             h-14"
                  placeholder="投喂信息碎片..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
