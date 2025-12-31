'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { login, signup } from './actions'
import { Loader2, Infinity, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function LoginContent() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')

  useEffect(() => {
    const initialMode = searchParams.get('mode')
    if (initialMode === 'signup') {
      setMode('signup')
    }
  }, [searchParams])

  const isValid = (() => {
    const emailValid = email.includes('@') && email.includes('.')
    const passwordValid = password.length >= 6
    if (mode === 'login') return emailValid && passwordValid
    const nicknameValid = nickname.trim().length > 0
    return emailValid && passwordValid && password === confirmPassword && nicknameValid
  })()

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
  }

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,30,30,0.1)_0%,transparent_100%)]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.svg')]" />
      
      <Link 
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors z-20 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm tracking-wide">Back to Reality</span>
      </Link>

      <motion.div 
        key={mode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)]">
             <Infinity className="w-6 h-6 text-white/80" />
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white mb-2">
            {isLogin ? 'Access The Source' : 'Initialize User'}
          </h1>
          <p className="text-white/40 text-sm text-center max-w-xs">
            {isLogin ? 'Welcome back, Operator.' : 'Begin your journey into the galaxy.'}
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">Email</label>
            <input 
              name="email" type="email" required placeholder="neo@matrix.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all"
            />
          </div>
          
          {mode === 'signup' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2 overflow-hidden"
            >
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">Nickname</label>
              <input 
                name="nickname" type="text" required placeholder="Neo"
                value={nickname} onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all"
              />
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">Password</label>
            <input 
              name="password" type="password" required placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all"
            />
          </div>

          {mode === 'signup' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2 overflow-hidden"
            >
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">Confirm Password</label>
              <input 
                name="confirmPassword" type="password" required placeholder="••••••••"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
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
            disabled={isLoading || !isValid}
            className={`
              w-full h-12 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 mt-8
              disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed
              ${!isValid || isLoading ? '' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 active:scale-[0.98]'}
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isLogin ? '正在连接矩阵...' : '正在初始化神经元...'}</span>
              </>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center flex flex-col items-center gap-4">
          <p className="text-xs text-white/30 uppercase tracking-widest">Or</p>
          <button 
            onClick={() => {
              setMode(isLogin ? 'signup' : 'login')
              setError(null)
            }}
            className="text-sm text-white/50 hover:text-white transition-colors border-b border-white/10 hover:border-white/50 pb-0.5"
          >
            {isLogin ? "Create an account" : "Log in to existing account"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white/20" /></div>}>
      <LoginContent />
    </Suspense>
  )
}
