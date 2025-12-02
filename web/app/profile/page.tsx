'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Shield, Zap, Brain, Clock, Award, Globe, Radio, Loader2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// ✨ 动态导入 TheArchitectWall (Client Component)
const TheArchitectWall = dynamic(() => import('@/components/profile/TheArchitectWall'), { ssr: false });

interface ProfileData {
  username: string;
  bio: string;
  level: number;
  exp: number;
  galaxy_name: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState({
    totalFeeds: 0,
    daysActive: 0,
    starCount: 0,
    galaxyMass: '0',
  });

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // 1. Check Session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 2. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // 3. Fetch Stats (Feed Count)
      const { count, error: countError } = await supabase
        .from('feeds')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (profileData) {
        setProfile(profileData);
        
        // Calculate Stats
        const totalFeeds = count || 0;
        const createdDate = new Date(profileData.created_at || user.created_at); // fallback to auth created_at
        const daysActive = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
        
        // Level Logic: 5 feeds = 1 level (example)
        // Update local state (in real app, this should be updated in DB via trigger or server action)
        const calculatedLevel = Math.floor(totalFeeds / 5) + 1;
        
        setStats({
          totalFeeds,
          daysActive,
          starCount: totalFeeds, // 1 feed = 1 star
          galaxyMass: `${(totalFeeds * 0.2 + 1.2).toFixed(1)}M 太阳质量`,
        });
      }

      setLoading(false);
    }

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  // Mock badges for now (or unlock based on level)
  const BADGES = [
    { id: 'star-gazer', name: '星际漫游者', icon: '✨', unlocked: true },
    { id: 'matrix-hacker', name: '矩阵黑客', icon: '💻', unlocked: stats.totalFeeds >= 5 },
    { id: 'data-miner', name: '数据矿工', icon: '⛏️', unlocked: stats.totalFeeds >= 20 },
    { id: 'void-explorer', name: '虚空探索者', icon: '🌌', unlocked: stats.daysActive >= 7 },
    { id: 'time-bender', name: '时间操控者', icon: '⏳', unlocked: false },
  ];

  // Title logic
  const getTitle = (level: number) => {
    if (level >= 10) return "救世主";
    if (level >= 5) return "觉醒者";
    return "漫游者";
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-green-500/30 overflow-hidden relative">
      
      {/* 🧱 架构师之墙背景 */}
      <TheArchitectWall />

      {/* 背景噪点纹理 */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0" />
      
      {/* Header Navigation */}
      <div className="relative z-10 p-6 md:p-12">
        <button 
          onClick={() => window.location.href = '/'}
          className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors px-4 py-2 rounded-full border border-white/5 hover:bg-white/5 hover:border-green-500/30"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-medium tracking-wide">返回</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 pb-20">
        
        {/* 1. Identity Card (身份卡) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12 p-8 rounded-3xl bg-black/40 backdrop-blur-xl backdrop-saturate-150 border border-white/10 shadow-2xl"
        >
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-black border border-green-500/20 flex items-center justify-center overflow-hidden relative group shadow-[0_0_30px_rgba(34,197,94,0.1)]">
               <span className="text-3xl font-serif italic text-green-500/80 group-hover:scale-110 transition-transform">
                 {profile.username?.[0]?.toUpperCase() || 'U'}
               </span>
               {/* 动态光环 */}
               <div className="absolute inset-0 rounded-full border border-green-500/30 animate-spin-slow opacity-50 group-hover:opacity-100 transition-opacity" style={{ animationDuration: '8s' }} />
               <div className="absolute inset-0 rounded-full border border-green-500/10 animate-spin-slow opacity-30" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            </div>
            {/* Level Badge */}
            <div className="absolute -bottom-2 -right-2 bg-green-900/80 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30 backdrop-blur-sm">
              LV {profile.level}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-2 text-white">{profile.username}</h1>
            <div className="flex items-center gap-3 text-xs font-mono text-green-500/60 mb-4">
              <span className="uppercase tracking-wider border border-green-500/20 px-2 py-0.5 rounded bg-green-500/5">
                {getTitle(profile.level)}
              </span>
              <span>//</span>
              <span>System ID: {profile.galaxy_name}</span>
            </div>
            <p className="text-white/50 text-sm font-light max-w-md leading-relaxed font-serif italic">
              "{profile.bio}"
            </p>
          </div>

          {/* EXP Bar */}
          <div className="w-full md:w-48 flex flex-col gap-2">
             <div className="flex justify-between text-[10px] text-white/30 font-mono">
                <span>矩阵同步率</span>
                <span>{profile.exp}%</span>
             </div>
             <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${profile.exp}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-green-500/50 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                />
             </div>
          </div>
        </motion.div>

        {/* ✨ NEW: Galaxy & Social Bridge (星系与社交承接层) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* 左侧：星系状态 (Galaxy Portal) */}
          <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="group relative p-6 rounded-2xl bg-black/40 backdrop-blur-xl backdrop-saturate-150 border border-white/10 hover:border-green-500/50 transition-all duration-300 overflow-hidden cursor-pointer hover:bg-black/60 hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(74,222,128,0.2)] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-sm font-bold text-white/90 flex items-center gap-2 group-hover:text-white transition-colors">
                    <Globe size={14} className="text-green-400 group-hover:animate-pulse" />
                    我的星系
                  </h3>
                  <p className="text-[10px] text-white/40 font-mono mt-1 group-hover:text-green-400/60 transition-colors">{profile.galaxy_name}</p>
               </div>
               <Link href="/history" onClick={(e) => e.stopPropagation()}>
                 <button className="text-[10px] bg-white/5 hover:bg-green-500/20 hover:text-green-400 px-3 py-1.5 rounded-full transition-all border border-white/5 hover:border-green-500/30 font-medium tracking-wide">
                    进入系统
                 </button>
               </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
               <div className="group/item">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider group-hover/item:text-green-400/50 transition-colors">纪元</div>
                  <div className="text-lg font-light text-white/80 group-hover/item:text-white transition-colors">
                    {stats.daysActive} 天
                  </div>
               </div>
               <div className="group/item">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider group-hover/item:text-green-400/50 transition-colors">恒星数</div>
                  <div className="text-lg font-light text-white/80 group-hover/item:text-white transition-colors">{stats.starCount}</div>
               </div>
               <div className="group/item">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider group-hover/item:text-green-400/50 transition-colors">文明等级</div>
                  <div className="text-sm font-light text-green-400/80 group-hover/item:text-green-300 transition-colors">Type-{Math.min(3, Math.floor(profile.level / 10) + 1)}</div>
               </div>
               <div className="group/item">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider group-hover/item:text-green-400/50 transition-colors">总质量</div>
                  <div className="text-sm font-light text-white/60 group-hover/item:text-white/80 transition-colors">{stats.galaxyMass}</div>
               </div>
            </div>
          </motion.div>

          {/* 右侧：社交协议 (Social Protocol) */}
          <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
             className="group relative p-6 rounded-2xl bg-black/40 backdrop-blur-xl backdrop-saturate-150 border border-white/10 hover:border-blue-500/50 transition-all duration-300 overflow-hidden cursor-pointer hover:bg-black/60 hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-sm font-bold text-white/90 flex items-center gap-2 group-hover:text-white transition-colors">
                    <Radio size={14} className="text-blue-400 group-hover:animate-pulse" />
                    信号协议
                  </h3>
                  <p className="text-[10px] text-white/40 font-mono mt-1 group-hover:text-blue-400/60 transition-colors">网络可见性控制</p>
               </div>
               {/* 模拟开关 */}
               <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5 group-hover:border-blue-500/20 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]" />
                  <span className="text-[9px] text-green-400 font-bold tracking-wider">广播中</span>
               </div>
            </div>

            <div className="space-y-3 relative z-10">
               <div className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors hover:border-white/10 cursor-pointer">
                  <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors">允许访客接入</span>
                  <div className="w-8 h-4 bg-green-500/20 rounded-full relative border border-green-500/30 transition-colors group-hover:bg-green-500/30">
                     <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]" />
                  </div>
               </div>
               <div className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors hover:border-white/10 cursor-pointer">
                  <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors">共享洞察数据</span>
                  <div className="w-8 h-4 bg-green-500/20 rounded-full relative border border-green-500/30 transition-colors group-hover:bg-green-500/30">
                     <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]" />
                  </div>
               </div>
               
               <p className="text-[10px] text-white/20 mt-2 italic group-hover:text-white/30 transition-colors">
                  * 激活 "黑暗森林" 协议将向主网络隐藏你的坐标。
               </p>
            </div>
          </motion.div>

        </div>

        {/* 2. Core Metrics (核心指标) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
           <MetricCard icon={Zap} label="摄入总量" value={stats.totalFeeds} delay={0.1} />
           <MetricCard icon={Clock} label="觉醒天数" value={stats.daysActive} delay={0.2} />
           <MetricCard icon={Brain} label="神经连接度" value="92%" delay={0.3} />
        </div>

        {/* 3. Badges (成就勋章) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h3 className="text-xs font-bold tracking-[0.2em] text-white/30 uppercase mb-6 flex items-center gap-2">
            <Award size={14} />
            成就系统
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {BADGES.map((badge) => (
              <div 
                key={badge.id} 
                className={`
                  aspect-square rounded-xl border flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden group
                  ${badge.unlocked 
                    ? 'bg-white/5 border-white/10 hover:border-green-500/30 hover:bg-green-500/10 cursor-pointer' 
                    : 'bg-transparent border-white/5 opacity-20 grayscale'}
                `}
              >
                {badge.unlocked && <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{badge.icon}</span>
                <span className="text-[10px] font-mono text-white/50 group-hover:text-green-400 transition-colors">{badge.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// 辅助组件：数据卡片
function MetricCard({ icon: Icon, label, value, delay }: { icon: any, label: string, value: string | number, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl backdrop-saturate-150 flex items-center gap-4 group hover:border-white/30 transition-all duration-300 cursor-pointer hover:bg-black/60 hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="p-3 rounded-lg bg-white/5 text-white/50 group-hover:text-white group-hover:bg-white/10 transition-all border border-transparent group-hover:border-white/10">
        <Icon size={20} />
      </div>
      <div>
        <div className="text-2xl font-light tracking-tight group-hover:text-white transition-colors">{value}</div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider group-hover:text-white/50 transition-colors">{label}</div>
      </div>
    </motion.div>
  );
}
