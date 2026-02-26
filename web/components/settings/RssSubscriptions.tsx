'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Rss } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

interface RssSub {
  id: string;
  feed_url: string;
  title: string | null;
  mode: 'all' | 'smart';
}

export default function RssSubscriptions() {
  const { profile } = useProfile();
  const [subs, setSubs] = useState<RssSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newMode, setNewMode] = useState<'all' | 'smart'>('smart');

  useEffect(() => {
    if (profile?.id) {
      fetchSubs();
    }
  }, [profile?.id]);

  const fetchSubs = async () => {
    try {
      const res = await fetch('/api/settings/rss');
      if (res.ok) {
        const data = await res.json();
        setSubs(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newUrl) return;
    setAdding(true);
    try {
      const res = await fetch('/api/settings/rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feed_url: newUrl, mode: newMode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('RSS 源添加成功');
        setNewUrl('');
        fetchSubs();
      } else {
        toast.error(data.error || '添加失败');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此订阅吗？')) return;
    try {
      const res = await fetch(`/api/settings/rss?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('删除成功');
        fetchSubs();
      } else {
        toast.error('删除失败');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleToggleMode = async (sub: RssSub) => {
    const newMode = sub.mode === 'smart' ? 'all' : 'smart';
    try {
      const res = await fetch('/api/settings/rss', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sub.id, mode: newMode })
      });
      if (res.ok) {
        toast.success('模式已更新');
        fetchSubs();
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/20" /></div>;

  return (
    <div className="space-y-6">
      <div className="p-4 border border-white/10 bg-white/[0.02] rounded-lg space-y-4">
        <h3 className="text-sm font-bold text-white/80 font-mono flex items-center gap-2">
          <Rss size={16} /> 添加新订阅源
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="url" 
            placeholder="输入 RSS XML 地址..." 
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-white/30 outline-none font-mono"
          />
          <select 
            value={newMode}
            onChange={(e) => setNewMode(e.target.value as any)}
            className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white/80 font-mono outline-none"
          >
            <option value="smart">智能过滤 (Smart)</option>
            <option value="all">全部抓取 (All)</option>
          </select>
          <button 
            onClick={handleAdd}
            disabled={adding || !newUrl}
            className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded flex items-center gap-2 font-mono text-sm transition-all disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            添加
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {subs.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-8 font-mono border border-white/5 border-dashed">暂无订阅记录</p>
        ) : (
          subs.map(sub => (
            <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-colors gap-4 group">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white/90 truncate">{sub.title || sub.feed_url}</h4>
                {sub.title && <p className="text-[10px] text-white/40 font-mono truncate mt-1">{sub.feed_url}</p>}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleToggleMode(sub)}
                  className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
                    sub.mode === 'smart' 
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                  title="点击切换模式"
                >
                  {sub.mode === 'smart' ? 'SMART' : 'ALL'}
                </button>
                <button 
                  onClick={() => handleDelete(sub.id)}
                  className="p-1.5 text-white/20 hover:text-red-400 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
