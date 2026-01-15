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
        setError("密码输入不一致。")
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
        <span className="text-sm tracking-wide">返回现实</span>
      </Link>

      <motion.div 
        key={mode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
             <Infinity className="w-5 h-5 text-white/80" />
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white mb-2">
            {isLogin ? '链入矩阵' : '初始化身份'}
          </h1>
          <p className="text-white/30 text-xs text-center">
            {isLogin ? '欢迎回来，操作员。' : '开启你的星系旅程。'}
          </p>
        </div>

        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em] ml-1">Email</label>
            <input 
              name="email" type="email" required placeholder="neo@matrix.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 focus:bg-white/[0.02] transition-all"
            />
          </div>
          
          {mode === 'signup' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1.5 overflow-hidden"
            >
              <label className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em] ml-1">Nickname</label>
              <input 
                name="nickname" type="text" required placeholder="你的称呼"
                value={nickname} onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 focus:bg-white/[0.02] transition-all"
              />
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em] ml-1">Password</label>
            <input 
              name="password" type="password" required placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 focus:bg-white/[0.02] transition-all"
            />
          </div>

          {mode === 'signup' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1.5 overflow-hidden"
            >
              <label className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
              <input 
                name="confirmPassword" type="password" required placeholder="••••••••"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 focus:bg-white/[0.02] transition-all"
              />
            </motion.div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400/80 text-[11px] text-center font-mono">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading || !isValid}
            className={`
              w-full h-11 rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-2 mt-6
              disabled:bg-white/[0.02] disabled:text-white/20 disabled:cursor-not-allowed
              ${!isValid || isLoading ? '' : 'bg-white text-black hover:bg-white/90 active:scale-[0.98]'}
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isLogin ? '正在链入...' : '正在初始化...'}</span>
              </>
            ) : (
              <span className="tracking-[0.2em]">{isLogin ? '登 录' : '注 册'}</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setMode(isLogin ? 'signup' : 'login')
              setError(null)
            }}
            className="text-[11px] text-white/20 hover:text-white/40 transition-colors uppercase tracking-widest border-b border-transparent hover:border-white/10 pb-0.5"
          >
            {isLogin ? "创建新账号" : "登录已有账号"}
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
