'use client'

interface PageLayoutProps {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-sans selection:bg-white/20">
      {/* 简单的顶部装饰 */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-20" />
      
      <main className="flex-1 flex flex-col px-4 py-16 relative z-0 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
