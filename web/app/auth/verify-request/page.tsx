'use client'

import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen w-full bg-[#05020a] flex items-center justify-center relative overflow-hidden font-sans">
      {/* 背景效果 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,50,50,0.1)_0%,transparent_100%)]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md p-8 relative z-10 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]">
           <Mail className="w-8 h-8 text-white/90" />
        </div>

        <h1 className="text-2xl font-light tracking-tight text-white mb-4">
          Verify your neural link
        </h1>
        
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          A signal has been sent to your email address.<br/>
          Please click the link in the message to initialize your connection to the network.
        </p>

        <div className="space-y-4">
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Login Gateway
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

