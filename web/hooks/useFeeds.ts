'use client';

import useSWR from 'swr';
import { getFeeds, getFeedsCount } from '@/app/dashboard/actions';
import type { FeedItem } from '@/app/dashboard/actions';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const FEEDS_KEY = 'api/feeds';
const FEEDS_COUNT_KEY = 'api/feeds/count';
const CACHE_KEY = 'neofeed_feeds_cache';
const COUNT_CACHE_KEY = 'neofeed_feeds_count_cache';

function getCachedFeeds(): FeedItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const c = localStorage.getItem(CACHE_KEY);
        return c ? JSON.parse(c) : [];
    } catch {
        return [];
    }
}

function getCachedCount(): number {
    if (typeof window === 'undefined') return 0;
    const c = localStorage.getItem(COUNT_CACHE_KEY);
    return c ? parseInt(c, 10) || 0 : 0;
}

export function useFeeds() {
    const [isOffline, setIsOffline] = useState(false);

    // 首帧就从 localStorage 注入，列表页和阅读页打开即显示缓存，无需等请求
    const [initialData] = useState<FeedItem[]>(() => getCachedFeeds());
    const [initialCount] = useState<number>(() => getCachedCount());

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        setIsOffline(!navigator.onLine);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const fetcherWithRetry = async (): Promise<FeedItem[]> => {
        const res = await getFeeds();
        if (res.error) {
            if (res.error === 'Unauthorized' || res.error.includes('Unauthorized')) {
                await new Promise((r) => setTimeout(r, 800));
                const retry = await getFeeds();
                if (retry.error) {
                    const cached = getCachedFeeds();
                    if (cached.length > 0) {
                        toast.info('网络异常，显示的是上次缓存');
                        return cached;
                    }
                    throw new Error(retry.error);
                }
                return retry.data || [];
            }
            const cached = getCachedFeeds();
            if (cached.length > 0) {
                toast.info('网络异常，显示的是上次缓存');
                return cached;
            }
            throw new Error(res.error);
        }
        return res.data || [];
    };

    const { data, error, isLoading, mutate: swrMutate } = useSWR(FEEDS_KEY, fetcherWithRetry, {
        fallbackData: initialData,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        onSuccess: (data) => {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        }
    });

    const countFetcherWithRetry = async (): Promise<number> => {
        const res = await getFeedsCount();
        if (res.error) {
            if (res.error === 'Unauthorized' || String(res.error).includes('Unauthorized')) {
                await new Promise((r) => setTimeout(r, 800));
                const retry = await getFeedsCount();
                if (retry.error) {
                    const cached = getCachedCount();
                    if (cached > 0) return cached;
                    throw new Error(retry.error);
                }
                return retry.data ?? 0;
            }
            const cached = getCachedCount();
            if (cached > 0) return cached;
            throw new Error(res.error);
        }
        return res.data ?? 0;
    };

    const { data: count, mutate: countMutate } = useSWR(FEEDS_COUNT_KEY, countFetcherWithRetry, {
        fallbackData: initialCount,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 10000,
        onSuccess: (val) => {
            localStorage.setItem(COUNT_CACHE_KEY, val.toString());
        }
    });

    const refreshFeeds = () => {
        swrMutate();
        countMutate();
    };

    const addOptimisticFeed = (newFeed: FeedItem) => {
        swrMutate((currentFeeds) => [newFeed, ...(currentFeeds || [])], false);
        countMutate((currentCount) => (currentCount || 0) + 1, false);
    };

    const updateFeedInCache = (updatedFeed: FeedItem) => {
        swrMutate((currentFeeds) => 
            currentFeeds?.map(f => f.id === updatedFeed.id ? updatedFeed : f), 
            false
        );
    };

    const removeFeedFromCache = (feedId: string) => {
        swrMutate((currentFeeds) => 
            currentFeeds?.filter(f => f.id !== feedId), 
            false
        );
        countMutate((currentCount) => Math.max(0, (currentCount || 0) - 1), false);
    };

    return { 
        feeds: data || [], 
        count: count || 0, // 🚀 暴露总数
        loading: isLoading, 
        error, 
        isOffline, 
        refreshFeeds,
        addOptimisticFeed,
        updateFeedInCache,
        removeFeedFromCache
    };
}

