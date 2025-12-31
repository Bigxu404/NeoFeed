'use client';

import { Settings } from 'lucide-react';
import { BentoCard } from './BentoGrid';
import { Skeleton } from '@/components/ui/Skeleton';

interface QuickStatsCardProps {
    count: number;
    loading?: boolean;
}

export default function QuickStatsCard({ count, loading }: QuickStatsCardProps) {
    if (loading) {
        return (
            <BentoCard colSpan={1} rowSpan={1} className="bg-neutral-900/30">
                <div className="flex flex-row h-full items-center justify-between px-2">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-6 w-8" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>
            </BentoCard>
        );
    }
    return (
        <BentoCard colSpan={1} rowSpan={1} className="bg-neutral-900/30">
            <div className="flex flex-row h-full items-center justify-between px-2">
                <div className="flex flex-col">
                    <span className="text-2xl font-bold font-serif text-white">{count}</span>
                    <span className="text-[9px] uppercase tracking-widest text-white/40">已收集项目</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white/20" />
                </div>
            </div>
        </BentoCard>
    );
}

