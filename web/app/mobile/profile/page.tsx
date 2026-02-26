'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

export default function MobileProfilePage() {
  const router = useRouter();
  const { profile, loading } = useProfile();

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
        <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900 mb-8">个人主页</h1>
        
        {loading ? (
          <p className="text-gray-400">加载中...</p>
        ) : (
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-white shadow-md flex items-center justify-center overflow-hidden mb-4">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || 'Neo Walker'}</h2>
            <p className="text-sm text-gray-500 mt-1">{profile?.email}</p>
            
            {/* 后续可以补充具体的个人中心数据内容 */}
            <div className="mt-8 pt-8 border-t border-gray-100 w-full text-center text-gray-400 text-sm">
              详细数据模块开发中...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
