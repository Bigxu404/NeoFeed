'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Link2, Image as ImageIcon, FileText, Puzzle, Monitor, Command } from 'lucide-react';

interface InputHubProps {
  onSave: (content: string) => void;
  isProcessing: boolean;
}

export default function InputHub({ onSave, isProcessing }: InputHubProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content);
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const shortcuts = [
    { icon: Link2, label: "Link", active: true },
    { icon: ImageIcon, label: "Image", active: true },
    { icon: FileText, label: "Note", active: true },
    { icon: Puzzle, label: "Plugin", active: false },
  ];

  return (
    <div className="h-full flex flex-col justify-center p-8 relative z-10">
      
      {/* Section Title with glitch effect hint */}
      <div className="mb-12 relative group">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/20 font-serif tracking-tight">
          INPUT SOURCE
        </h2>
        <div className="h-1 w-12 bg-green-500 mt-2 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
        <p className="absolute -top-4 -left-4 text-[100px] font-bold text-white/[0.02] pointer-events-none select-none font-serif">
          01
        </p>
      </div>

      {/* The Source Well Container */}
      <div className="relative group">
        {/* Ambient Glow */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl transition-opacity duration-700 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />

        {/* The Input Interface */}
        <div className={`
            relative overflow-hidden rounded-2xl transition-all duration-500
            ${isFocused ? 'bg-[#050505] border-white/10 shadow-[0_0_50px_-10px_rgba(0,0,0,0.8)] translate-y-[-2px]' : 'bg-black/40 border-white/5 hover:border-white/10 hover:bg-black/60'}
            border backdrop-blur-2xl
        `}>
            
            {/* Inner Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.svg')] pointer-events-none" />

            <div className="p-6">
                <textarea
                    className="w-full bg-transparent border-none outline-none text-lg md:text-xl text-white/90 placeholder:text-white/10 resize-none custom-scrollbar font-sans h-40 leading-relaxed tracking-wide"
                    placeholder="Feed the system..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isProcessing}
                    spellCheck={false}
                />
            </div>

            {/* Futuristic Action Bar */}
            <div className="flex justify-between items-center p-4 border-t border-white/5 bg-white/[0.02]">
                
                {/* Holographic Toggles */}
                <div className="flex gap-1">
                    {shortcuts.map((item, index) => (
                        <button
                            key={index}
                            className={`p-3 rounded-xl transition-all duration-300 relative group/btn ${item.active ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'opacity-20 cursor-not-allowed text-white'}`}
                        >
                            <item.icon size={18} />
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black border border-white/20 rounded text-[10px] text-white opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
                
                {/* The Launch Button */}
                <button 
                    onClick={handleSave}
                    disabled={!content.trim() || isProcessing}
                    className={`
                        relative overflow-hidden group/send
                        flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-300
                        ${content.trim() && !isProcessing
                            ? 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]' 
                            : 'bg-white/5 text-white/20 cursor-not-allowed'}
                    `}
                >
                    <div className="relative z-10 flex items-center gap-2">
                        <span>Inject</span>
                        <div className="bg-black/10 p-1 rounded-md">
                             <Command size={10} />
                        </div>
                    </div>
                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/send:translate-x-full transition-transform duration-700 ease-in-out" />
                </button>
            </div>
        </div>
      </div>

      {/* Decor Elements */}
      <div className="mt-8 flex items-center gap-4 text-[10px] font-mono text-white/20 uppercase tracking-widest">
        <div className="h-px w-8 bg-white/10" />
        <div>System Status: Online</div>
        <div className="h-px flex-1 bg-white/10" />
        <div>v2.0.45</div>
      </div>

    </div>
  );
}
