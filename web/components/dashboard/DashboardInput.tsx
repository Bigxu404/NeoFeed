'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Link2, FileText } from 'lucide-react';

interface DashboardInputProps {
  onSave: (content: string) => void;
  isProcessing?: boolean;
}

export default function DashboardInput({ onSave, isProcessing = false }: DashboardInputProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content);
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative group">
      {/* Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 transition duration-500 ${isFocused ? 'opacity-100' : 'group-hover:opacity-50'}`} />
      
      <div className={`relative bg-black/80 backdrop-blur-xl border transition-all duration-300 rounded-2xl p-4 flex flex-col gap-4 ${
        isFocused ? 'border-white/20 shadow-2xl shadow-green-900/20' : 'border-white/10'
      }`}>
        
        {/* Input Area */}
        <textarea
          className="w-full bg-transparent border-none outline-none text-lg text-white/90 placeholder:text-white/20 resize-none custom-scrollbar font-sans"
          placeholder="粘贴链接，或输入你的任何想法..."
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isProcessing}
        />

        {/* Action Bar */}
        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <div className="flex gap-2">
            <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors" title="粘贴链接">
              <Link2 size={18} />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors" title="上传文件">
              <FileText size={18} />
            </button>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={!content.trim() || isProcessing}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
              content.trim() && !isProcessing
                ? 'bg-white text-black hover:bg-white/90 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]' 
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            <span>{isProcessing ? '处理中...' : '投喂系统'}</span>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

