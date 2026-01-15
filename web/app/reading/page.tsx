'use client'

import { Bell, Construction, ArrowLeft } from 'lucide-react'
import { PageLayout } from '@/components/PageLayout'
import { useRouter } from 'next/navigation'

export default function ReadingPage() {
  const router = useRouter();

  return (
    <PageLayout>
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[60vh]">
        
        {/* Navigation Back (Temporary until we have global nav on this page too) */}
        <button 
          onClick={() => router.push('/dashboard')}
          className="absolute top-8 left-8 text-white/40 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-mono uppercase tracking-widest">Back to Workbench</span>
        </button>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center max-w-lg w-full relative overflow-hidden group">
          {/* Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px] pointer-events-none" />

          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(37,99,235,0.3)] relative z-10">
            <Bell className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-serif italic text-white mb-4">Reading Queue</h1>
          <p className="text-white/40 mb-8 font-light">
            Incoming transmissions will be decoded here. <br/>
            Mark content for deep reading and analysis.
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
            <Construction className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-widest">System Under Construction</span>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
