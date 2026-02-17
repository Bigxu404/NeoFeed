'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Link as LinkIcon, Loader2, ArrowRight, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FeedOrbProps {
  onIngest: (url: string) => Promise<void>;
  isProcessing: boolean;
}

export default function FeedOrb({ onIngest, isProcessing }: FeedOrbProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [clipboardUrl, setClipboardUrl] = useState('');

  // 尝试读取剪贴板
  const checkClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.startsWith('http') || text.startsWith('www'))) {
        setClipboardUrl(text);
        if (!inputValue) setInputValue(text);
      }
    } catch (e) {
      // 忽略权限错误
    }
  };

  useEffect(() => {
    // 页面聚焦时检查
    window.addEventListener('focus', checkClipboard);
    return () => window.removeEventListener('focus', checkClipboard);
  }, []);

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    await onIngest(inputValue);
    setInputValue('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#1A1A1C] border border-white/10 rounded-2xl p-2 shadow-2xl w-80 mb-2 backdrop-blur-xl"
          >
            <div className="relative flex items-center">
              <input
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="粘贴 URL..."
                className="w-full bg-transparent border-none outline-none text-white/90 text-sm px-3 py-2 font-mono placeholder:text-white/20"
              />
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !inputValue}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
            {/* 剪贴板提示 */}
            {clipboardUrl && clipboardUrl !== inputValue && (
              <div 
                onClick={() => setInputValue(clipboardUrl)}
                className="mt-2 px-3 py-1.5 bg-cyan-500/10 rounded-lg text-[10px] text-cyan-400 flex items-center gap-2 cursor-pointer hover:bg-cyan-500/20 transition-colors truncate"
              >
                <LinkIcon className="w-3 h-3 shrink-0" />
                <span className="truncate">检测到链接: {clipboardUrl}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
            if (!isOpen) checkClipboard();
            setIsOpen(!isOpen);
        }}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 transition-all duration-300 relative group",
          isOpen ? "bg-white text-black rotate-45" : "bg-[#1A1A1C] text-white hover:bg-[#252528]"
        )}
      >
        {isOpen ? (
            <X className="w-6 h-6" />
        ) : (
            <>
                <Zap className="w-6 h-6 group-hover:text-cyan-400 transition-colors" />
                {/* 脉冲光环 */}
                <span className="absolute inset-0 rounded-full border border-cyan-500/30 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
            </>
        )}
      </motion.button>
    </div>
  );
}
