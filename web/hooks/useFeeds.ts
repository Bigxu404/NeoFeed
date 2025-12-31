'use client';

import useSWR from 'swr';
import { getFeeds, getFeedsCount, FeedItem } from '@/app/dashboard/actions';
import { useEffect, useState } from 'react';

const FEEDS_KEY = 'api/feeds';
const FEEDS_COUNT_KEY = 'api/feeds/count';
const CACHE_KEY = 'neofeed_feeds_cache';
const COUNT_CACHE_KEY = 'neofeed_feeds_count_cache';

export function useFeeds() {
    const [isOffline, setIsOffline] = useState(false);

    // 1. Initial sync with localStorage
    const [initialData, setInitialData] = useState<FeedItem[]>([]);
    const [initialCount, setInitialCount] = useState<number>(0);
    
    useEffect(() => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                setInitialData(JSON.parse(cached));
            } catch (e) {
                console.error('Failed to parse feeds cache', e);
            }
        }

        const cachedCount = localStorage.getItem(COUNT_CACHE_KEY);
        if (cachedCount) {
            setInitialCount(parseInt(cachedCount, 10) || 0);
        }

        // 监听在线状态
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

    const { data, error, isLoading, mutate: swrMutate } = useSWR(FEEDS_KEY, async () => {
        const res = await getFeeds();
        if (res.error) throw new Error(res.error);
        return res.data || [];
    }, {
        fallbackData: initialData,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        onSuccess: (data) => {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        }
    });

    const { data: count, mutate: countMutate } = useSWR(FEEDS_COUNT_KEY, async () => {
        const res = await getFeedsCount();
        if (res.error) throw new Error(res.error);
        return res.data || 0;
    }, {
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

