'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { login, signup } from './actions'
import { Loader2, Infinity } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    if (mode === 'signup') {
      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirmPassword') as string
      
      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        setIsLoading(false)
        return
      }
    }
    
    const action = mode === 'login' ? login : signup
    const result = await action(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
    // Success will redirect via server action
  }

  return (
    <div className="min-h-screen w-full bg-[#05020a] flex items-center justify-center relative overflow-hidden font-sans">
      {/* 背景效果 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,50,50,0.1)_0%,transparent_100%)]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)]">
             <Infinity className="w-6 h-6 text-white/80" />
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white mb-2">
            {mode === 'login' ? 'Access The Source' : 'Join The Resistance'}
          </h1>
          <p className="text-white/40 text-sm text-center max-w-xs">
            {mode === 'login' 
              ? 'Welcome back, Operator. The system awaits your input.' 
              : 'Begin your journey into the digital void.'}
          </p>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="neo@matrix.com"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all"
            />
          </div>

          {mode === 'signup' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">Confirm Password</label>
              <input 
                name="confirmPassword" 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all"
              />
            </motion.div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 bg-white text-black rounded-xl font-medium hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Enter System' : 'Initialize User'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError(null)
            }}
            className="text-sm text-white/30 hover:text-white transition-colors"
          >
            {mode === 'login' 
              ? "Don't have an identity? Create one." 
              : "Already authenticated? Log in."}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

