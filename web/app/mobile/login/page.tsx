'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { login, signup } from '@/app/login/actions';
import { Loader2, ChevronLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function MobileLoginContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') setMode('signup');
  }, [searchParams]);

  const isValid =
    email.includes('@') &&
    email.includes('.') &&
    password.length >= 6 &&
    (mode === 'login' ||
      (nickname.trim().length > 0 && password === confirmPassword));

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    if (mode === 'signup') {
      const p = formData.get('password') as string;
      const cp = formData.get('confirmPassword') as string;
      if (p !== cp) {
        setError('密码输入不一致。');
        setIsLoading(false);
        return;
      }
    }
    const action = mode === 'login' ? login : signup;
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans">
      {/* 顶部返回 */}
      <div className="pt-[max(env(safe-area-inset-top),1.5rem)] px-5 pb-6">
        <Link
          href="/mobile/landing"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">返回</span>
        </Link>
      </div>

      <div className="flex-1 px-6 pb-10 pt-2">
        <div className="max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {isLogin ? '欢迎回来' : '加入矩阵'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isLogin
                ? '输入凭证以接入神经链路。'
                : '创建你的数字分身，开启第二大脑。'}
            </p>
          </div>

          <form action={handleSubmit} className="space-y-5">
            <input type="hidden" name="redirect" value="/mobile" />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                />
              </div>

              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">
                    Nickname
                  </label>
                  <input
                    name="nickname"
                    type="text"
                    required
                    placeholder="你的称呼"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                  />
                </motion.div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      忘记密码?
                    </button>
                  )}
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                />
              </div>

              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">
                    Confirm Password
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
                  />
                </motion.div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !isValid}
              className={`
                w-full h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-6
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isLogin ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb] active:scale-[0.98] shadow-lg shadow-[#3b82f6]/20' : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] shadow-lg shadow-black/10'}
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

          <div className="pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-xs mb-3">
              {isLogin ? '还没有数字身份?' : '已经拥有账号?'}
            </p>
            <button
              type="button"
              onClick={() => {
                setMode(isLogin ? 'signup' : 'login');
                setError(null);
              }}
              className="text-gray-900 font-medium text-sm border-b border-gray-400 hover:border-gray-600 pb-0.5 transition-all"
            >
              {isLogin ? '注册新账号' : '直接登录'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MobileLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      }
    >
      <MobileLoginContent />
    </Suspense>
  );
}
