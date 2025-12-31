'use client';

import { useState, useEffect } from 'react';
import { getUserProfile } from '@/app/dashboard/actions';
import { UserProfile } from '@/types/index';

// 简单的内存缓存，用于在页面跳转间保持数据
let memoryCache: UserProfile | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 分钟有效

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(memoryCache);
  const [loading, setLoading] = useState(!memoryCache);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (force = false) => {
    const now = Date.now();
    
    // 如果没有强制更新，且内存中有数据且没过期，直接使用
    if (!force && memoryCache && (now - lastFetchTime < CACHE_TTL)) {
      setProfile(memoryCache);
      setLoading(false);
      return;
    }

    try {
      // 尝试加载本地存储 (加速首屏)
      if (!memoryCache) {
        const local = localStorage.getItem('neofeed_profile');
        if (local) {
          const parsed = JSON.parse(local) as UserProfile;
          setProfile(parsed);
          memoryCache = parsed;
        }
      }

      // 从后端同步
      const { data, error: fetchError } = await getUserProfile();
      if (fetchError) throw new Error(fetchError);

      if (data) {
        const typedData = data as UserProfile;
        setProfile(typedData);
        memoryCache = typedData;
        lastFetchTime = now;
        localStorage.setItem('neofeed_profile', JSON.stringify(typedData));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取个人资料失败';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const refreshProfile = () => fetchProfile(true);

  // 提供一个手动更新缓存的方法，用于 nickname/avatar 修改后
  const updateCache = (newData: Partial<UserProfile>) => {
    const updated = { ...(memoryCache || profile), ...newData } as UserProfile;
    setProfile(updated);
    memoryCache = updated;
    localStorage.setItem('neofeed_profile', JSON.stringify(updated));
  };

  const clearCache = () => {
    memoryCache = null;
    localStorage.removeItem('neofeed_profile');
  };

  return { profile, loading, error, refreshProfile, updateCache, clearCache };
}

