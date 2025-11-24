'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Sparkles } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { NAV_ITEMS } from '@/lib/constants'

export function Header() {
  const router = useRouter()
  const [isNavOpen, setIsNavOpen] = useState(false)

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="px-6 py-4 border-b border-gray-200">
              <SheetTitle>NeoFeed</SheetTitle>
              <SheetDescription className="sr-only">导航菜单</SheetDescription>
            </SheetHeader>
            <nav className="py-4">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-100 transition-colors text-left"
                  onClick={() => {
                    router.push(item.path)
                    setIsNavOpen(false)
                  }}
                >
                  <item.icon className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-800">{item.label}</span>
                </button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="tracking-tight">NeoFeed</span>
        </div>
      </div>
    </header>
  )
}

