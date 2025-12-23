'use client';

import { useState, useEffect } from 'react';
import { BentoGrid, BentoCard } from '@/components/dashboard/BentoGrid';
import FeedDetailSheet from '@/components/dashboard/FeedDetailSheet';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Radio, Zap, ArrowRight, Activity, Loader2, CheckCircle2, AlertCircle, LogOut, LayoutGrid, Clock, Settings, BookOpen, Menu, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFeeds, FeedItem } from '@/app/dashboard/actions'; // Removed getUserProfile
import { useProfile } from '@/hooks/useProfile'; // 🚀 使用新 Hook
import ScrambleText from '@/components/ui/ScrambleText';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const NavItems = [
    { icon: LayoutGrid, label: '工作台', path: '/dashboard' },
    { icon: Clock, label: '知识星系', path: '/history' },
    { icon: Activity, label: '洞察中心', path: '/insight' },
    { icon: User, label: '个人矩阵', path: '/profile' },
    { icon: Settings, label: '系统设置', path: '/settings' },
];

export default function Workbench() {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const { profile, loading: profileLoading } = useProfile(); // 🚀 从全局缓存获取
  const [feedsLoading, setFeedsLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'analyzing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<FeedItem | null>(null);
  const router = useRouter();

  const fetchFeedsData = async () => {
    try {
      const { data } = await getFeeds();
      if (data) setFeeds(data);
    } catch (err) {
      console.error("Failed to fetch feeds", err);
    } finally {
      setFeedsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedsData();
  }, []);

  const handleIngest = async () => {
    if (!url.trim()) return;
    setStatus('scanning');
    setProgress(20);
    setIsProcessing(true);

    try {
      await new Promise(r => setTimeout(r, 1000)); 
      setStatus('analyzing');
      setProgress(45);

      const res = await fetch('/api/ingest-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!res.ok) throw new Error('Ingest trigger failed');

      let attempts = 0;
      const poll = async () => {
        if (attempts >= 20) throw new Error('Timeout');
        attempts++;
        setProgress(Math.min(90, 45 + (attempts * 2)));
        const { data } = await getFeeds();
        const match = data?.find(f => f.url === url || (f.url && url.includes(f.url)));
        if (match && match.status === 'done') return true;
        if (match && match.status === 'failed') throw new Error('AI Analysis failed');
        await new Promise(r => setTimeout(r, 3000));
        return poll();
      };

      await poll();
      setProgress(100);
      setStatus('success');
      setUrl('');
      await fetchFeedsData(); // Refresh list
      setTimeout(() => { setStatus('idle'); setProgress(0); setIsProcessing(false); }, 3000);
    } catch (e) {
      console.error(e);
      setStatus('error');
      setProgress(0);
      setTimeout(() => { setStatus('idle'); setIsProcessing(false); }, 3000);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/landing');
  };

  if (profileLoading || feedsLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-white/20 relative flex flex-col overflow-x-hidden">
      
      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 w-full max-w-7xl mx-auto px-4 z-50 shrink-0">
        <nav className="flex items-center gap-1 px-2 py-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
            {NavItems.map((item, idx) => {
                const isActive = item.label === '工作台'; 
                return (
                    <button key={idx} onClick={() => item.path !== '/dashboard' && router.push(item.path)}
                        className={cn("relative flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300", isActive ? "bg-white text-black font-medium" : "text-white/60 hover:text-white hover:bg-white/10")}>
                        <item.icon className={cn("w-4 h-4", isActive ? "text-black" : "text-current")} strokeWidth={2} />
                        <span className="text-xs tracking-wide">{item.label}</span>
                    </button>
                );
            })}
        </nav>

        <div className="flex items-center gap-6">
            <h1 className="text-2xl tracking-tight text-white font-serif italic">NeoFeed</h1>
            <div className="relative group cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-black border border-white/20 flex items-center justify-center">
                        <span className="text-xs font-serif italic text-white">N</span>
                    </div>
                    <LogOut className="w-4 h-4 text-white/30 group-hover:text-red-400 transition-colors" />
                </div>
                {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl p-2 shadow-2xl z-50">
                        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <LogOut className="w-3 h-3" /> 断开连接
                        </button>
                    </div>
                )}
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4">
          <BentoGrid className="gap-4">
        
                {/* 1. Input Prism (Left Large) */}
                <BentoCard colSpan={3} rowSpan={4} className="relative bg-gradient-to-br from-neutral-900/80 to-black">
                  <div className="flex flex-col h-full justify-between py-2">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">输入棱镜 Input Prism</span>
                        </div>
                        <h2 className="text-4xl font-light leading-tight mb-4 text-white/90">捕获 <span className="font-serif italic text-white/50">万物</span></h2>
                        <p className="text-sm text-white/40 max-w-md leading-relaxed">将整个互联网作为你的数据源。粘贴 URL，记录灵感，或初始化自动化代理任务。</p>
                    </div>

                    <div className="relative group">
                        {status === 'scanning' && <motion.div layoutId="scanner" className="absolute left-0 right-0 top-0 h-full bg-cyan-500/10 z-0" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }} />}
                        {isProcessing && <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden rounded-t-xl z-20"><motion.div className="h-full bg-cyan-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} /></div>}
                        <div className={cn("absolute -inset-0.5 rounded-xl opacity-20 group-hover:opacity-40 blur transition duration-500", status === 'error' ? "bg-red-500" : status === 'success' ? "bg-green-500" : "bg-gradient-to-r from-cyan-500 to-purple-500")} />
                        <div className="relative bg-black rounded-xl p-1 flex items-center z-10">
                            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleIngest()} disabled={isProcessing} placeholder={status === 'scanning' ? "正在初始化协议..." : status === 'analyzing' ? "神经网络处理中..." : status === 'success' ? "传输完成。" : status === 'error' ? "传输失败。" : "粘贴 URL 或输入指令..."} className="w-full bg-transparent border-none outline-none text-white px-6 py-4 placeholder:text-white/20 font-mono text-sm disabled:cursor-not-allowed" />
                            <button onClick={handleIngest} disabled={isProcessing} className={cn("p-3 rounded-lg transition-colors flex items-center justify-center min-w-[48px]", isProcessing ? "bg-white/5 cursor-wait" : "bg-white/10 hover:bg-white/20")}>
                                {status === 'scanning' || status === 'analyzing' ? <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> : status === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : status === 'error' ? <AlertCircle className="w-5 h-5 text-red-500" /> : <ArrowRight className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                  </div>
                </BentoCard>

                {/* 2. Profile Card (Right Row 1-2) */}
                <BentoCard colSpan={1} rowSpan={2} className="bg-neutral-900/30">
                    <div className="flex flex-col h-full justify-between py-1">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-800 to-black border border-white/20 flex items-center justify-center shrink-0">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span className="text-sm font-serif italic text-white">{profile?.full_name?.charAt(0) || 'N'}</span>
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

                {/* 3. Quick Stats (Right Row 3) */}
                <BentoCard colSpan={1} rowSpan={1} className="bg-neutral-900/30">
                    <div className="flex flex-row h-full items-center justify-between px-2">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold font-serif text-white">{feeds.length}</span>
                            <span className="text-[9px] uppercase tracking-widest text-white/40">已收集项目</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <Settings className="w-4 h-4 text-white/20" />
                        </div>
                    </div>
                </BentoCard>

                {/* 4. System Status (Right Row 4) */}
                <BentoCard colSpan={1} rowSpan={1} className="bg-neutral-900/30">
                    <div className="flex flex-row h-full items-center justify-between px-2">
                        <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[9px] uppercase text-white/60">系统正常</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <Globe className="w-2.5 h-2.5 text-blue-500" />
                                <span className="text-[9px] uppercase text-white/60">网络已连接</span>
                             </div>
                        </div>
                        <div className="h-8 w-px bg-white/10 mx-2" />
                        <div className="text-right">
                            <div className="text-[8px] text-white/30 font-mono">CPU: 12%</div>
                            <div className="text-[8px] text-white/30 font-mono">MEM: 34%</div>
                        </div>
                    </div>
                </BentoCard>

                {/* 5. Insight Stream (Bottom Wide) */}
                <BentoCard colSpan={4} rowSpan={2} className="min-h-[400px]">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-bold tracking-widest uppercase text-white/40">洞察流 Insight Stream</span>
                        </div>
                    </div>
                    {feedsLoading ? <div className="flex h-40 items-center justify-center text-white/30"><Loader2 className="animate-spin w-6 h-6" /></div> : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {feeds.length === 0 ? <div className="col-span-3 text-center text-white/30 py-10 font-mono text-xs">虚空中暂无信号。</div> : feeds.map((item) => (
                                <div key={item.id} onClick={() => setSelectedFeed(item)} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group/card flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-7 h-7 rounded bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-[10px] font-bold uppercase">{item.category?.slice(0, 2) || 'AI'}</div>
                                        <span className="text-[9px] text-white/30 font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-sm font-medium leading-snug mb-2 group-hover/card:text-cyan-400 transition-colors line-clamp-2"><ScrambleText text={item.title || 'Untitled Signal'} /></h3>
                                    <p className="text-xs text-white/40 line-clamp-2 mb-3 flex-1">{item.summary || '等待分析...'}</p>
                                    <div className="flex flex-wrap gap-1 mt-auto">{item.tags?.slice(0, 2).map((tag) => <span key={tag} className="px-1.5 py-0.5 rounded-md bg-white/5 text-[8px] text-white/40 uppercase">#{tag}</span>)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </BentoCard>
          </BentoGrid>
      </div>
      <FeedDetailSheet feed={selectedFeed} onClose={() => setSelectedFeed(null)} />
    </div>
  );
}
