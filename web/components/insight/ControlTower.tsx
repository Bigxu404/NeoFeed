'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rss, 
  Mail, 
  Plus, 
  Trash2, 
  Loader2, 
  RefreshCw, 
  Settings2,
  X,
  Globe,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { 
  getSubscriptions, 
  addSubscription, 
  deleteSubscription,
  triggerAllSubscriptionsSync,
  DiscoveryItem
} from '@/app/dashboard/discovery-actions';
import { getAiConfig, updateAiConfig, sendTestWeeklyReport } from '@/app/settings/actions';
import { AIConfig } from '@/types/index';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';


// --- 弹窗组件：RSS 设置 ---
function RSSSettingsModal({ isOpen, onClose, aiConfig, onUpdate }: { isOpen: boolean, onClose: () => void, aiConfig: AIConfig | null, onUpdate: () => void }) {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [rssPollFrequency, setRssPollFrequency] = useState<'daily' | 'weekly'>('daily');
  const [savingFreq, setSavingFreq] = useState(false);

  useEffect(() => {
    if (aiConfig?.rssPollFrequency) {
      setRssPollFrequency(aiConfig.rssPollFrequency);
    }
  }, [aiConfig]);

  const fetchSubs = async () => {
    setLoading(true);
    const res = await getSubscriptions();
    setSubscriptions(res.data || []);
    setLoading(false);
  };

  useEffect(() => { if (isOpen) fetchSubs(); }, [isOpen]);

  const handleUpdateFrequency = async (freq: 'daily' | 'weekly') => {
    if (!aiConfig) return;
    setSavingFreq(true);
    setRssPollFrequency(freq);
    const res = await updateAiConfig({ ...aiConfig, rssPollFrequency: freq });
    if (!res.error) {
      toast.success('更新频率已同步');
      onUpdate();
    } else {
      toast.error('同步失败');
    }
    setSavingFreq(false);
  };

  const handleAdd = async () => {
    if (!newUrl) return;
    setIsAdding(true);
    const res = await addSubscription(newUrl);
    if (!res.error) {
      toast.success('信号源已接入');
      setNewUrl('');
      fetchSubs();
      onUpdate();
    } else {
      toast.error('接入失败', { description: res.error });
    }
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    const res = await deleteSubscription(id);
    if (!res.error) {
      toast.success('信号源已切断');
      fetchSubs();
      onUpdate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md bg-[#0a0a0a] border-2 border-[#1ff40a] rounded overflow-hidden shadow-[0_0_20px_rgba(31,244,10,0.3)] fallout-panel">
        <div className="p-4 border-b-2 border-[#1ff40a]/30 flex items-center justify-between bg-[#1ff40a]/5">
          <h3 className="text-xs font-bold flex items-center gap-2 text-[#1ff40a] font-mono uppercase tracking-widest">
            [SIGNAL_SOURCE_CONTROL] 信号源管理
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-[#1ff40a]/10 rounded text-[#1ff40a]/40 hover:text-[#1ff40a] transition-all"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-3 p-4 bg-[#1ff40a]/5 border border-[#1ff40a]/20 rounded-sm">
            <div className="flex items-center gap-2 text-[#1ff40a]/60 font-mono text-[10px] uppercase tracking-widest">
              <RefreshCw size={12} className={cn(savingFreq && "animate-spin")} />
              AUTO_SYNC_FREQUENCY 自动更新频率
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: '每天 (9AM)', value: 'daily' as const },
                { label: '每周 (Mon 9AM)', value: 'weekly' as const },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleUpdateFrequency(opt.value)}
                  disabled={savingFreq}
                  className={cn(
                    "py-2 px-1 text-[9px] font-mono border transition-all text-center leading-tight",
                    rssPollFrequency === opt.value
                      ? "bg-[#1ff40a]/20 border-[#1ff40a] text-[#1ff40a]"
                      : "bg-black border-[#1ff40a]/20 text-[#1ff40a]/40 hover:border-[#1ff40a]/40"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <input type="text" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="ENTER_RSS_URL..." className="flex-1 bg-black border border-[#1ff40a]/30 px-3 py-2 text-xs text-[#1ff40a] focus:border-[#1ff40a] outline-none transition-all font-mono" />
            <button onClick={handleAdd} disabled={isAdding || !newUrl} className="px-4 py-2 bg-[#1ff40a]/20 border border-[#1ff40a] text-[#1ff40a] hover:bg-[#1ff40a] hover:text-black transition-all disabled:opacity-30 font-mono text-[10px] font-bold">[ADD]</button>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
            {loading ? <div className="py-10 text-center"><Loader2 className="animate-spin text-[#1ff40a] mx-auto" size={20} /></div> :
              subscriptions.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-2.5 rounded bg-[#1ff40a]/5 border border-[#1ff40a]/20 group">
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono text-[#1ff40a]/70 truncate uppercase">{sub.url}</p>
                  </div>
                  <button onClick={() => handleDelete(sub.id)} className="ml-4 p-1.5 text-[#1ff40a]/30 hover:text-red-500 transition-all"><Trash2 size={12} /></button>
                </div>
              ))
            }
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- 弹窗组件：周报设置 ---
function WeeklyReportSettingsModal({ isOpen, onClose, aiConfig, onUpdate }: { isOpen: boolean, onClose: () => void, aiConfig: AIConfig | null, onUpdate: () => void }) {
  const [email, setEmail] = useState('');
  const [rssPrompt, setRssPrompt] = useState('');
  const [rssReportDays, setRssReportDays] = useState<number[]>([]);
  const [rssReportTime, setRssReportTime] = useState('09:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    if (aiConfig) {
      setEmail(aiConfig.notificationEmail || ''); 
      setRssPrompt(aiConfig.rssPrompt || aiConfig.prompt || '');
      setRssReportDays(aiConfig.rssReportDays || aiConfig.reportDays || [1]); 
      setRssReportTime(aiConfig.rssReportTime || aiConfig.reportTime || '09:00');
    }
  }, [aiConfig]);

  const toggleDay = (day: number) => {
    setRssReportDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = async () => {
    if (!aiConfig) return;
    setSaving(true);
    const newConfig = { 
      ...aiConfig, 
      notificationEmail: email,
      rssPrompt: rssPrompt,
      rssReportDays: rssReportDays,
      rssReportTime: rssReportTime
    };
    const res = await updateAiConfig(newConfig);
    if (!res.error) {
      toast.success('订阅周报配置已更新');
      onUpdate();
      onClose();
    } else {
      toast.error('保存失败');
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  const weekDays = [
    { label: '周一', value: 1 }, { label: '周二', value: 2 }, { label: '周三', value: 3 },
    { label: '周四', value: 4 }, { label: '周五', value: 5 }, { label: '周六', value: 6 }, { label: '周日', value: 0 },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md bg-[#0a0a0a] border-2 border-[#1ff40a] rounded overflow-hidden shadow-[0_0_20px_rgba(31,244,10,0.3)] fallout-panel">
        <div className="p-4 border-b-2 border-[#1ff40a]/30 flex items-center justify-between bg-[#1ff40a]/5">
          <h3 className="text-xs font-bold flex items-center gap-2 text-[#1ff40a] font-mono uppercase tracking-widest">
            [WEEKLY_PROTOCOL_SETUP] 周报协议配置
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-[#1ff40a]/10 rounded text-[#1ff40a]/40 hover:text-[#1ff40a] transition-all"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#1ff40a]/60 uppercase font-mono tracking-widest">TARGET_EMAIL 接收邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="NEO@VAULT.COM" className="w-full bg-black border border-[#1ff40a]/30 px-3 py-2 text-xs text-[#1ff40a] focus:border-[#1ff40a] outline-none transition-all uppercase font-mono" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-[#1ff40a]/60 uppercase font-mono tracking-widest">RSS_PROMPT 情报汇总指令</label>
            <textarea value={rssPrompt} onChange={(e) => setRssPrompt(e.target.value)} rows={6} placeholder="输入RSS情报汇总指令..." className="w-full bg-black border border-[#1ff40a]/30 px-3 py-2 text-xs text-[#1ff40a] focus:border-[#1ff40a] outline-none transition-all font-mono resize-none custom-scrollbar" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] text-[#1ff40a]/60 uppercase font-mono tracking-widest">SCHEDULE 频率</label>
              <div className="grid grid-cols-4 gap-2">
                {weekDays.map((day) => (
                  <button key={day.value} onClick={() => toggleDay(day.value)} className={cn("py-1.5 text-[9px] font-mono border transition-all", rssReportDays.includes(day.value) ? "bg-[#1ff40a]/20 border-[#1ff40a] text-[#1ff40a]" : "bg-black border-[#1ff40a]/20 text-[#1ff40a]/40 hover:border-[#1ff40a]/40")}>
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-24 space-y-1.5">
              <label className="text-[10px] text-[#1ff40a]/60 uppercase font-mono tracking-widest">TIME 时间</label>
              <input type="time" value={rssReportTime} onChange={(e) => setRssReportTime(e.target.value)} className="w-full bg-black border border-[#1ff40a]/30 px-2 py-1.5 text-[11px] text-[#1ff40a] focus:border-[#1ff40a] outline-none transition-all font-mono" />
            </div>
          </div>
          
          <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-[#1ff40a]/20 border-2 border-[#1ff40a] text-[#1ff40a] hover:bg-[#1ff40a] hover:text-black rounded font-bold text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-50 font-mono">
            {saving ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'UPDATE_CONFIG 更新配置'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- 主组件：控制塔 ---
export default function ControlTower({ stats, onSelectDiscovery }: { 
  stats: { tech: number, life: number, idea: number, art: number, other: number },
  onSelectDiscovery: (item: DiscoveryItem) => void
}) {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  
  const [isRSSModalOpen, setIsRSSModalOpen] = useState(false);
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);

  const fetchControlData = async () => {
    setLoading(true);
    try {
      const [subsRes, configRes] = await Promise.all([ 
        getSubscriptions(), 
        getAiConfig()
      ]);
      setSubscriptions(subsRes.data || []);
      setAiConfig(configRes.config);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchControlData(); }, []);


  const handleManualSync = async () => {
    if (syncing) return;
    setSyncing(true);
    toast.info('正在扫描所有信号源...', { icon: <RefreshCw className="animate-spin text-[#1ff40a]" /> });
    const res = await triggerAllSubscriptionsSync();
    if (res.success) {
      toast.success(`扫描完成，共扫描 ${res.count} 个源`);
      fetchControlData();
    } else {
      toast.error('扫描失败', { description: res.error });
    }
    setSyncing(false);
  };

  const handleGenerateReport = async () => {
    if (syncing) return;
    setSyncing(true);
    toast.info(`正在生成订阅报告...`, { icon: <RefreshCw className="animate-spin text-[#1ff40a]" /> });
    try {
      await triggerAllSubscriptionsSync();
      const reportRes = await sendTestWeeklyReport(aiConfig!);
      if (reportRes.success) {
        toast.success(`报告任务已下达，预计1分钟后送达`);
      } else {
        toast.error(`报告生成失败`, { description: reportRes.error });
      }
    } catch (err) {
      toast.error('系统通信故障');
    } finally {
      setSyncing(false);
    }
  };


  return (
    <div className="flex flex-col h-full bg-[#050505] pl-12 pr-8 py-8 space-y-10 overflow-y-auto custom-scrollbar relative crt-screen">
      
      {/* 1. 周报功能区 */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#1ff40a]/60 uppercase flex items-center gap-2 font-mono">
            <Mail size={14} className="text-[#1ff40a]/70" />
            WEEKLY_PROTOCOL 周报协议
          </h3>
          <button onClick={() => setIsWeeklyModalOpen(true)} className="p-1.5 hover:bg-[#1ff40a]/20 rounded text-[#1ff40a]/50 hover:text-[#1ff40a] transition-all border border-transparent hover:border-[#1ff40a]/30">
            <Settings2 size={14} />
          </button>
        </div>

        <div className="p-5 rounded-sm bg-[#1ff40a]/[0.05] space-y-4 shadow-[0_0_15px_rgba(31,244,10,0.05)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1ff40a]/20 rounded border border-[#1ff40a]/40"><Mail size={14} className="text-[#1ff40a]" /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[#1ff40a]/50 uppercase tracking-widest leading-none mb-1.5 font-mono">TARGET_NODE 接收端</p>
              <p className="text-[13px] font-mono text-[#1ff40a] truncate drop-shadow-[0_0_2px_rgba(31,244,10,0.5)]">{aiConfig?.notificationEmail || 'NOT_SET'}</p>
            </div>
          </div>
          <button onClick={handleGenerateReport} disabled={syncing} className="w-full py-3 rounded-sm bg-[#1ff40a]/10 border border-[#1ff40a]/40 text-[#1ff40a] text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[#1ff40a] hover:text-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50 font-mono shadow-[0_0_10px_rgba(31,244,10,0.1)]">
            {syncing ? <Loader2 size={14} className="animate-spin" /> : <Rss size={14} className="group-hover:scale-110 transition-transform" />}
            生成订阅周报
          </button>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-[#1ff40a]/20 via-[#1ff40a]/10 to-transparent" />

      {/* 2. 订阅源列表 */}
      <section className="space-y-6 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#1ff40a]/60 uppercase flex items-center gap-2 font-mono">
            <Globe size={14} className="text-[#1ff40a]/70" />
            DISCOVERY 订阅源
          </h3>
          <button onClick={() => setIsRSSModalOpen(true)} className="p-1.5 hover:bg-[#1ff40a]/20 rounded text-[#1ff40a]/50 hover:text-[#1ff40a] transition-all border border-transparent hover:border-[#1ff40a]/30">
            <Settings2 size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-10">
          {subscriptions.map(sub => (
            <div key={sub.id} className="group flex flex-col gap-2 p-4 rounded-sm bg-[#1ff40a]/[0.02] border border-[#1ff40a]/10 hover:border-[#1ff40a]/40 hover:bg-[#1ff40a]/[0.05] transition-all relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-mono text-[#1ff40a]/40 uppercase tracking-widest">RSS_SOURCE</span>
                <Rss size={10} className="text-[#1ff40a]/20 group-hover:text-[#1ff40a] transition-colors" />
              </div>
              <p className="text-[10px] font-mono text-[#1ff40a]/70 group-hover:text-[#1ff40a] transition-colors break-all leading-relaxed">{sub.url}</p>
              {sub.themes && sub.themes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {sub.themes.map((tag: string, i: number) => (
                    <span key={i} className="text-[8px] font-mono px-1.5 py-0.5 bg-[#1ff40a]/10 border border-[#1ff40a]/20 rounded-sm text-[#1ff40a]/50">{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#1ff40a]/5">
                <span className="text-[8px] font-mono text-[#1ff40a]/20 uppercase tracking-tighter">
                  {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'ACTIVE'}
                </span>
              </div>
            </div>
          ))}
          {subscriptions.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <p className="text-[10px] font-mono text-[#1ff40a]/20 italic tracking-widest">NO_SOURCE_FOUND</p>
              <button 
                onClick={() => setIsRSSModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1ff40a]/10 border border-[#1ff40a]/30 rounded text-[#1ff40a]/60 hover:bg-[#1ff40a]/20 hover:text-[#1ff40a] transition-all font-mono text-[10px] uppercase tracking-widest"
              >
                <Plus size={12} />
                添加订阅源
              </button>
            </div>
          )}

          {/* 同步按钮 - 有订阅源时显示 */}
          {subscriptions.length > 0 && (
            <button 
              onClick={handleManualSync} 
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#1ff40a]/10 border border-[#1ff40a]/30 rounded text-[#1ff40a]/60 hover:bg-[#1ff40a]/20 hover:text-[#1ff40a] transition-all disabled:opacity-50 font-mono text-[10px] uppercase tracking-widest"
            >
              <RefreshCw size={12} className={cn(syncing && "animate-spin")} />
              {syncing ? '同步中...' : '同步所有订阅源'}
            </button>
          )}
        </div>
      </section>

      <RSSSettingsModal isOpen={isRSSModalOpen} onClose={() => setIsRSSModalOpen(false)} aiConfig={aiConfig} onUpdate={fetchControlData} />
      <WeeklyReportSettingsModal isOpen={isWeeklyModalOpen} onClose={() => setIsWeeklyModalOpen(false)} aiConfig={aiConfig} onUpdate={fetchControlData} />
    </div>
  );
}
