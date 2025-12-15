'use client'

import { motion } from 'framer-motion';
import { Infinity as InfinityIcon, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface DashboardHeaderProps {
  onShowGuide?: () => void;
}

export default function DashboardHeader({ onShowGuide }: DashboardHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-md border-b border-white/5">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 group">
        <motion.div 
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="text-white"
        >
          <InfinityIcon size={28} />
        </motion.div>
        <span className="text-lg font-bold tracking-wider text-white font-serif">NeoFeed</span>
      </Link>

      {/* Right Side - User / Actions Placeholder */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onShowGuide}
          className="p-2 text-white/40 hover:text-white transition-colors"
          title="新手引导"
        >
          <HelpCircle size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
           <span className="text-xs text-white/50 font-mono">N</span>
        </div>
      </div>
    </header>
  );
}
