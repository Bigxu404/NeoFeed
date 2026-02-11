'use client';

import { motion } from 'framer-motion';
import { LogOut, LayoutGrid, Clock, Activity, User, Settings, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/types/index';

const NavItems = [
    { icon: LayoutGrid, label: '工作台', shortLabel: '首页', path: '/dashboard' },
    { icon: Clock, label: '知识星系', shortLabel: '星系', path: '/history' },
    { icon: Activity, label: '洞察中心', shortLabel: '洞察', path: '/insight' },
    { icon: User, label: '个人矩阵', shortLabel: '个人', path: '/profile' },
    { icon: Settings, label: '系统设置', shortLabel: '设置', path: '/settings' },
];

interface DashboardHeaderProps {
    profile: UserProfile | null;
    clearCache: () => void;
    isOffline?: boolean;
    autoHide?: boolean; // 🚀 新增：是否开启自动隐藏模式（仅非 Dashboard 页面使用）
}

export default function DashboardHeader({ profile, clearCache, isOffline, autoHide = false }: DashboardHeaderProps) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isHovered, setIsHovered] = useState(false); // 🚀 新增：悬浮状态
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        clearCache();
        router.replace('/landing');
    };

    return (
        <div 
            className="relative w-full z-50 shrink-0"
            onMouseEnter={() => autoHide && setIsHovered(true)}
            onMouseLeave={() => autoHide && setIsHovered(false)}
        >
            {/* 🚀 悬浮感应区（固定在顶部，不随 header 移动） */}
            {autoHide && (
                <div className="fixed top-0 left-0 w-full h-20 md:block hidden z-[-1]" />
            )}

            <header 
                className={cn(
                    "flex flex-row justify-between items-center w-full transition-all duration-500 ease-in-out relative z-10 gap-2",
                    // 🚀 自动隐藏逻辑
                    autoHide && !isHovered ? "md:-translate-y-12 md:opacity-0 md:pointer-events-none" : "md:translate-y-0 md:opacity-100 md:pointer-events-auto"
                )}
            >
            <div className="flex items-center gap-2 md:gap-4 flex-1">
                {/* 🚀 Logo 在移动端更小或隐藏文案 */}
                <h1 className="text-xl md:text-2xl tracking-tight text-white font-serif italic shrink-0">N.</h1>
                
                <nav className="flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl overflow-x-auto no-scrollbar">
                    {NavItems.map((item, idx) => {
                        const isActive = pathname === item.path;
                        return (
                            <button 
                                key={idx} 
                                onClick={() => !isActive && router.push(item.path)}
                                className={cn(
                                    "relative flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 rounded-full transition-all duration-300 shrink-0", 
                                    isActive ? "bg-white text-black font-medium" : "text-white/60 hover:text-white hover:bg-white/10"
                                )}
                            >
                                <item.icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4", isActive ? "text-black" : "text-current")} strokeWidth={2} />
                                <span className="text-[10px] md:text-xs tracking-wide">
                                    <span className="md:hidden">{item.shortLabel}</span>
                                    <span className="hidden md:inline">{item.label}</span>
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-2 md:gap-6 shrink-0">
                {/* 🚀 离线标识 (移动端仅显示图标) */}
                {isOffline && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500"
                    >
                        <WifiOff className="w-3.5 h-3.5" />
                    </motion.div>
                )}

                <div className="relative group cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
                    <div className="flex items-center gap-2 md:gap-3 p-1 md:px-3 md:py-1.5 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-neutral-700 to-black border border-white/20 flex items-center justify-center overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                            ) : (
                                <span className="text-[10px] md:text-xs font-serif italic text-white">
                                    {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)?.toUpperCase() || 'N'}
                                </span>
                            )}
                        </div>
                        <LogOut className="hidden md:block w-4 h-4 text-white/30 group-hover:text-red-400 transition-colors" />
                    </div>
                    {showUserMenu && (
                        <div className="absolute top-full right-0 mt-2 w-32 md:w-48 bg-[#0a0a0a] border border-white/10 rounded-xl p-2 shadow-2xl z-50">
                            <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-[10px] md:text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                <LogOut className="w-3 h-3" /> 断开连接
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    </div>
    );
}
