'use client'

import { BackgroundDecorations } from './BackgroundDecorations'
import { Header } from './Header'

interface PageLayoutProps {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col relative overflow-hidden">
      <BackgroundDecorations />
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative z-0">
        {children}
      </main>

      {/* 底部装饰线 */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600" />
    </div>
  )
}

