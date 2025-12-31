'use client';

import { Zap } from 'lucide-react';
import { BentoCard } from './BentoGrid';
import { UserProfile } from '@/types/index';
import { Skeleton } from '@/components/ui/Skeleton';

interface ProfileCardProps {
    profile: UserProfile | null;
    loading?: boolean;
}

export default function ProfileCard({ profile, loading }: ProfileCardProps) {
    if (loading) {
        return (
            <BentoCard colSpan={1} rowSpan={2} className="bg-neutral-900/30">
                <div className="flex flex-col h-full justify-between py-1">
                    <div className="flex items-start gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    <div className="space-y-1 py-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-4/5" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                        <Skeleton className="h-10 rounded-lg" />
                        <Skeleton className="h-10 rounded-lg" />
                    </div>
                </div>
            </BentoCard>
        );
    }
    return (
        <BentoCard colSpan={1} rowSpan={2} className="bg-neutral-900/30">
            <div className="flex flex-col h-full justify-between py-1">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-800 to-black border border-white/20 flex items-center justify-center shrink-0">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" alt="avatar" />
                        ) : (
                            <span className="text-sm font-serif italic text-white">
                                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)?.toUpperCase() || 'N'}
                            </span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white truncate">{profile?.full_name || 'Neo Walker'}</h3>
                        <p className="text-[9px] text-white/40 truncate font-mono">{profile?.email || 'neo@matrix.org'}</p>
                    </div>
                </div>
                <p className="text-[11px] text-white/50 font-serif italic py-1 leading-relaxed line-clamp-2">
                    "Seeking truth in the data stream."
                </p>
                <div className="grid grid-cols-2 gap-2 mt-auto">
                    <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex flex-col items-center justify-center">
                        <span className="text-[8px] text-white/30 uppercase">活跃天数</span>
                        <span className="text-sm font-bold text-white font-mono">{profile?.active_days || 0}</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex flex-col items-center justify-center">
                        <span className="text-[8px] text-white/30 uppercase">成就</span>
                        <div className="flex gap-1"><Zap className="w-3 h-3 text-yellow-500" /></div>
                    </div>
                </div>
            </div>
        </BentoCard>
    );
}

