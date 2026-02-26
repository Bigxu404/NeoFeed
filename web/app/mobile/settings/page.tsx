'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/hooks/useProfile';

export default function MobileSettingsPage() {
  const router = useRouter();
  const { clearCache } = useProfile();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearCache();
    router.replace('/mobile/landing');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-black">
      {/* 顶部悬浮返回导航 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#F7F8FA]/90 backdrop-blur-xl pb-3 pt-[max(env(safe-area-inset-top),1.5rem)] px-5 flex items-center justify-between border-b border-gray-200/50">
        <button 
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 bg-white shadow-sm border border-gray-200/50 rounded-full text-black active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => router.push('/mobile/settings')}
          className="text-[14px] font-bold text-gray-700 hover:text-black bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200/50 active:scale-95 transition-all"
        >
          设置
        </button>
      </div>

      <div className="px-5 pt-[calc(max(env(safe-area-inset-top),1.5rem)+5rem)] pb-10">
        <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900 mb-8">设置</h1>

        <div className="space-y-4">
          {/* 设置项预留位置 */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-2">RSS 订阅源</h3>
            <p className="text-sm text-gray-500">在电脑端管理您的信息源</p>
          </div>
          
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-2">AI 模型配置</h3>
            <p className="text-sm text-gray-500">自定义总结与分析参数（开发中）</p>
          </div>
        </div>

        <div className="mt-12">
          <button 
            onClick={handleLogout}
            className="w-full bg-white text-red-500 font-bold py-4 rounded-[20px] shadow-sm border border-red-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}
