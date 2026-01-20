'use client'

import React, { useState, useEffect, Suspense, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { login, signup } from './actions'
import { Loader2, Infinity, ChevronLeft, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, MeshTransmissionMaterial, RoundedBox, Sphere, Cylinder, Torus } from '@react-three/drei'

// ============================================================================
// 1. 3D SCENE ASSETS (Reused for Showcase)
// ============================================================================
const ShowcaseScene = () => {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 10], fov: 35 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <group rotation={[0.5, 0.2, 0]}>
                        <RoundedBox args={[1.2, 3, 0.8]} radius={0.1} smoothness={4} position={[-2, 0, 0]}>
                            <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
                        </RoundedBox>
                        <Torus args={[1.5, 0.05, 16, 100]} position={[-2, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                            <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} />
                        </Torus>
                        
                        <Sphere args={[0.8, 32, 32]} position={[2, 1, -1]}>
                            <meshStandardMaterial emissive="#10b981" emissiveIntensity={1} color="#10b981" />
                        </Sphere>
                        
                        <Cylinder args={[0.1, 0.1, 4]} rotation={[0, 0, Math.PI/2]} position={[0, -2, 1]}>
                            <meshBasicMaterial color="#a855f7" transparent opacity={0.5} />
                        </Cylinder>
                    </group>
                </Float>
                <Environment preset="city" />
            </Canvas>
        </div>
    )
}

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

  const features = [
    { title: "Capture", desc: "RSS订阅捕获内容", color: "text-blue-400" },
    { title: "Synthesize", desc: "AI 自动去噪重构", color: "text-green-400" },
    { title: "Connect", desc: "搭建可视化知识库", color: "text-orange-400" },
  ]

  return (
    <div className="min-h-screen w-full bg-[#050505] flex font-sans overflow-hidden">
      
      {/* ==================== LEFT: PRODUCT SHOWCASE (60%) ==================== */}
      <div className="hidden lg:flex flex-col relative w-7/12 bg-[#080808] p-16 justify-between border-r border-white/5">
         {/* Background Visuals */}
         <div className="absolute inset-0 opacity-40 pointer-events-none">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(30,30,30,0.5)_0%,transparent_70%)]" />
             <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
             <ShowcaseScene />
         </div>

         {/* Top Brand */}
         <div className="relative z-10">
             <Link href="/" className="inline-flex items-center gap-2 group">
                <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold text-xl rounded-lg group-hover:rotate-12 transition-transform">N</div>
                <span className="text-xl font-bold tracking-tight text-white">NeoFeed</span>
             </Link>
         </div>

         {/* Middle: Value Prop */}
         <div className="relative z-10 space-y-8 max-w-xl">
             <h2 className="text-5xl md:text-6xl font-serif font-bold text-white leading-tight">
                对抗算法喂养<br/>
                <span className="text-white/40 italic font-light">重获认知主权</span>
             </h2>
             
             <div className="space-y-6 pt-8">
                {features.map((f, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="flex items-center gap-4 group"
                    >
                        <div className={`w-2 h-2 rounded-full ${f.color.replace('text-', 'bg-')} group-hover:scale-150 transition-transform`} />
                        <h3 className="text-xl text-white font-light">{f.title}</h3>
                        <span className="h-px w-12 bg-white/10" />
                        <p className="text-white/40 text-sm">{f.desc}</p>
                    </motion.div>
                ))}
             </div>
         </div>

         {/* Bottom: Footer */}
         <div className="relative z-10 text-white/20 text-xs font-mono">
            PROTOCOL_V1.0 // SYSTEM_READY
         </div>
      </div>

      {/* ==================== RIGHT: DRAWER LOGIN (40%) ==================== */}
      <div className="w-full lg:w-5/12 bg-[#050505] flex flex-col justify-center px-8 sm:px-16 md:px-24 relative shadow-2xl z-20 py-12 lg:py-0">
         <Link 
            href="/"
            className="absolute top-8 left-8 lg:hidden flex items-center gap-2 text-white/40 hover:text-white transition-colors"
         >
            <ChevronLeft className="w-4 h-4" />
            <span>返回</span>
         </Link>

         <div className="w-full max-w-md mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    {isLogin ? '欢迎回来' : '加入矩阵'}
                </h1>
                <p className="text-white/40 text-sm">
                    {isLogin ? '输入凭证以接入神经链路。' : '创建你的数字分身，开启第二大脑。'}
                </p>
            </div>

            {/* Form */}
            <form action={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-white/50 uppercase tracking-widest ml-1">Email</label>
                        <input 
                            name="email" type="email" required placeholder="name@example.com"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-base text-white placeholder:text-white/10 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                        />
                    </div>
                    
                    {mode === 'signup' && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-1.5 overflow-hidden"
                        >
                            <label className="text-[10px] font-medium text-white/50 uppercase tracking-widest ml-1">Nickname</label>
                            <input 
                                name="nickname" type="text" required placeholder="你的称呼"
                                value={nickname} onChange={(e) => setNickname(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-base text-white placeholder:text-white/10 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                            />
                        </motion.div>
                    )}

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-medium text-white/50 uppercase tracking-widest ml-1">Password</label>
                            {isLogin && <button type="button" className="text-[10px] text-white/40 hover:text-white transition-colors">忘记密码?</button>}
                        </div>
                        <input 
                            name="password" type="password" required placeholder="••••••••"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-base text-white placeholder:text-white/10 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                        />
                    </div>

                    {mode === 'signup' && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-1.5 overflow-hidden"
                        >
                            <label className="text-[10px] font-medium text-white/50 uppercase tracking-widest ml-1">Confirm Password</label>
                            <input 
                                name="confirmPassword" type="password" required placeholder="••••••••"
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-base text-white placeholder:text-white/10 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                            />
                        </motion.div>
                    )}
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading || !isValid}
                    className={`
                        w-full h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-6
                        disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed
                        ${!isValid || isLoading ? '' : 'bg-white text-black hover:bg-neutral-200 active:scale-[0.98]'}
                    `}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{isLogin ? '正在链入...' : '初始化中...'}</span>
                        </>
                    ) : (
                        <>
                            <span>{isLogin ? '立即登录' : '创建账号'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            {/* Toggle */}
            <div className="pt-6 border-t border-white/5 text-center">
                <p className="text-white/40 text-xs mb-3">
                    {isLogin ? "还没有数字身份?" : "已经拥有账号?"}
                </p>
                <button 
                    onClick={() => {
                        setMode(isLogin ? 'signup' : 'login')
                        setError(null)
                    }}
                    className="text-white font-medium text-sm border-b border-white/30 hover:border-white pb-0.5 transition-all"
                >
                    {isLogin ? "注册新账号" : "直接登录"}
                </button>
            </div>
         </div>
      </div>
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
