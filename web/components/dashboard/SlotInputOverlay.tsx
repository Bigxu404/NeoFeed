'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Link2, Type, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface SlotInputOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'article' | 'thought' | 'image' | null;
  onSubmit: (content: string) => void;
}

export default function SlotInputOverlay({ isOpen, onClose, type, onSubmit }: SlotInputOverlayProps) {
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setContent('');
    }
  }, [isOpen]);

  const config = {
    article: {
      title: "Inject Knowledge",
      subtitle: "Paste a URL to a long-form article or technical paper.",
      placeholder: "https://...",
      icon: Link2,
      color: "blue"
    },
    thought: {
      title: "Capture Spark",
      subtitle: "Log a quick idea, observation, or fragment.",
      placeholder: "I just realized that...",
      icon: Type,
      color: "purple"
    },
    image: {
      title: "Upload Visual",
      subtitle: "Drag & drop an image or paste a screenshot.",
      placeholder: "Waiting for image data...",
      icon: ImageIcon,
      color: "orange"
    }
  };

  if (!type) return null;
  const current = config[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-2xl bg-[#0a0a0a] border border-${current.color}-500/30 rounded-3xl overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,0.8)]`}
          >
             {/* Glow Header */}
             <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${current.color}-500 to-transparent opacity-50`} />

             <div className="p-8 md:p-12">
                <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className={`p-3 rounded-xl bg-${current.color}-500/10 text-${current.color}-400`}>
                        <current.icon size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{current.title}</h2>
                        <p className="text-white/40">{current.subtitle}</p>
                    </div>
                </div>

                <div className={`relative rounded-2xl bg-white/5 border border-white/10 focus-within:border-${current.color}-500/50 focus-within:bg-white/[0.07] transition-all duration-300`}>
                    <textarea
                        ref={inputRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={current.placeholder}
                        className="w-full h-40 bg-transparent p-6 text-xl text-white placeholder:text-white/20 outline-none resize-none font-sans"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                onSubmit(content);
                            }
                        }}
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-4">
                        <span className="text-xs text-white/20 font-mono hidden md:block">CMD + ENTER to send</span>
                        <button 
                            onClick={() => onSubmit(content)}
                            disabled={!content.trim()}
                            className={`
                                px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all
                                ${content.trim() 
                                    ? `bg-${current.color}-500 text-black hover:brightness-110` 
                                    : 'bg-white/10 text-white/20 cursor-not-allowed'}
                            `}
                        >
                            <span>TRANSMIT</span>
                            <Send size={14} />
                        </button>
                    </div>
                </div>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


