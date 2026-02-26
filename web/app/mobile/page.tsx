'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFeeds } from '@/hooks/useFeeds';
import { useProfile } from '@/hooks/useProfile';
import MobileFeedList from '@/components/mobile/MobileFeedList';
import { Loader2, Settings, User } from 'lucide-react';
import Link from 'next/link';

function MobileHeader() {
  const { profile } = useProfile();
  
  return (
    <header className="flex items-center justify-between mb-6">
      <Link 
        href="/mobile/profile" 
        className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <User className="w-5 h-5 text-gray-500" />
        )}
      </Link>
      <Link 
        href="/mobile/settings" 
        className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center active:scale-95 transition-transform"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </Link>
    </header>
  );
}

function MobileFeedData() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'fast';
  const { feeds, loading, error, refreshFeeds } = useFeeds();

  return (
    <MobileFeedList
      feeds={feeds}
      loading={loading}
      activeTab={tab as 'fast' | 'slow'}
      error={error}
      onRetry={refreshFeeds}
    />
  );
}

export default function MobileStreamPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-black px-5 pt-14 pb-32">
      <MobileHeader />
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        }
      >
        <MobileFeedData />
      </Suspense>
    </div>
  );
}
