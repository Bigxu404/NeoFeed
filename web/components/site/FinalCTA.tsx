'use client'

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="w-full py-32 2xl:py-64 relative overflow-hidden flex flex-col items-center justify-center text-center px-6">
      
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] 2xl:bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <h2 className="text-4xl md:text-6xl 2xl:text-8xl font-serif font-bold text-white mb-8 2xl:mb-12 tracking-tight">
          Ready to wake up?
        </h2>
        
        <p className="text-white/50 text-lg 2xl:text-4xl mb-12 2xl:mb-24 max-w-xl 2xl:max-w-5xl mx-auto">
          The matrix is everywhere. It is all around us. <br/>
          You can stay here, or you can see how deep the rabbit hole goes.
        </p>

        <Link href="/login" className="group relative inline-flex items-center gap-4 2xl:gap-8 px-12 py-5 2xl:px-24 2xl:py-10 bg-green-600 hover:bg-green-500 text-black font-bold text-lg 2xl:text-4xl tracking-widest uppercase rounded-sm transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]">
          <span className="relative z-10">Enter the Construct</span>
          <ArrowRight className="w-5 h-5 2xl:w-10 2xl:h-10 group-hover:translate-x-1 transition-transform relative z-10" />
          
          {/* Glitch Overlay on Hover */}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 mix-blend-overlay transition-opacity" />
        </Link>
        
        <div className="mt-8 2xl:mt-16 flex justify-center gap-2 2xl:gap-4 text-[10px] 2xl:text-xl font-mono text-green-500/40">
           <span>SYSTEM_READY</span>
           <span>::</span>
           <span>V2.0.45</span>
           <span>::</span>
           <span>SECURE_CONNECTION</span>
        </div>

      </motion.div>
    </section>
  );
}


