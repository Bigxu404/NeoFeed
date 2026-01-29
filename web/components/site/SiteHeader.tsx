'use client'

import Link from 'next/link';
import { PillButton, RabbitButton } from '@/components/ui/CreativeButtons';

export default function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 2xl:px-12 2xl:py-8 flex items-center justify-between bg-transparent backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center gap-12 2xl:gap-24">
      <div className="flex items-center gap-2 2xl:gap-4 group cursor-pointer">
          <div className="w-8 h-8 2xl:w-12 2xl:h-12 bg-white text-black flex items-center justify-center font-bold text-xl 2xl:text-3xl rounded-lg group-hover:rotate-12 transition-transform">N</div>
        <span className="text-lg 2xl:text-3xl font-bold tracking-tight text-white group-hover:text-white/90">NeoFeed</span>
      </div>

      <nav className="hidden md:flex items-center gap-8 2xl:gap-16">
        <button 
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          className="text-sm 2xl:text-xl font-medium text-white/60 hover:text-white transition-colors font-sans"
        >
            产品功能
        </button>
        <button 
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          className="text-sm 2xl:text-xl font-medium text-white/60 hover:text-white transition-colors font-sans"
        >
            产品思考
        </button>
      </nav>
      </div>

      <div className="flex items-center gap-2 2xl:gap-4 scale-100 2xl:scale-150 origin-right">
        <PillButton text="Log In" href="/login" />
        <RabbitButton text="Sign Up" href="/login?mode=signup" />
      </div>
    </header>
  );
}
