'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rss, Plus, Trash2, Globe, Tag, Loader2, AlertCircle } from 'lucide-react';
import { getSubscriptions, addSubscription, deleteSubscription } from '@/app/dashboard/discovery-actions';
import { toast } from 'sonner';

export default function SubscriptionSettings() {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    const [newUrl, setNewUrl] = useState('');
    const [newThemes, setNewThemes] = useState('');

    const fetchSubs = async () => {
        setLoading(true);
        const { data, error } = await getSubscriptions();
        if (error) {
            toast.error('加载订阅失败');
        } else {
            setSubscriptions(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSubs();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUrl.trim()) return;

        setIsAdding(true);
        const themes = newThemes.split(/[,，]/).map(t => t.trim()).filter(Boolean);
        const result = await addSubscription(newUrl, themes);
        
        if (result.error) {
            toast.error('添加失败', { description: result.error });
        } else {
            toast.success('订阅成功');
            setNewUrl('');
            setNewThemes('');
            fetchSubs();
        }
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('确定要取消此订阅吗？')) return;
        const result = await deleteSubscription(id);
        if (result.error) {
            toast.error('删除失败');
        } else {
            toast.success('已取消订阅');
            fetchSubs();
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-cyan-500/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Rss size={12} /> 信号发现协议 (RSS Subscriptions)
                </h3>
                
                <form onSubmit={handleAdd} className="p-4 border border-white/10 bg-white/[0.02] rounded-lg space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-mono flex items-center gap-1.5">
                            <Globe size={10} /> RSS 信号源 URL
                        </label>
                        <input 
                            type="url"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="https://example.com/feed.xml"
                            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-cyan-500/50 outline-none transition-all font-mono"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-mono flex items-center gap-1.5">
                            <Tag size={10} /> 关注主题 (逗号分隔)
                        </label>
                        <input 
                            type="text"
                            value={newThemes}
                            onChange={(e) => setNewThemes(e.target.value)}
                            placeholder="AI, 心理学, 编程, 哲学..."
                            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-cyan-500/50 outline-none transition-all font-mono"
                        />
                        <p className="text-[9px] text-white/20 italic">AI 将根据这些主题从信号源中智能筛选内容。</p>
                    </div>

                    <button 
                        type="submit"
                        disabled={isAdding}
                        className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        建立链接 Establish Link
                    </button>
                </form>
            </div>

            <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">当前活跃链接 ACTIVE_LINKS</h4>
                <div className="space-y-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-white/20" />
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-white/5 rounded-lg">
                            <p className="text-xs text-white/20 font-mono">NO_ACTIVE_SIGNALS</p>
                        </div>
                    ) : (
                        subscriptions.map((sub) => (
                            <div 
                                key={sub.id}
                                className="group flex items-center justify-between p-3 bg-white/[0.02] border border-white/10 rounded-lg hover:border-cyan-500/30 transition-all"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_5px_#22d3ee]" />
                                        <p className="text-xs font-mono text-white/80 truncate">{sub.url}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {sub.themes.map((t: string) => (
                                            <span key={t} className="px-1.5 py-0.5 rounded-md bg-white/5 text-[8px] text-white/40 uppercase border border-white/5">
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(sub.id)}
                                    className="ml-4 p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/10 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">协议说明 Protocol Info</p>
                    <p className="text-[10px] text-cyan-300/60 leading-relaxed">
                        系统将每 4 小时扫描一次订阅源。AI 守门员会根据你的主题筛选出最多 7 条相关内容放入工作台的“发现流”中。
                        该流每 7 天会自动重置以保持信息的新鲜度。
                    </p>
                </div>
            </div>
        </div>
    );
}

