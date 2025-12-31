'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Monitor, HardDrive, Shield, AlertTriangle, Terminal, RefreshCw, Power, Globe, Copy, Check, Eye, EyeOff, Key, Cpu } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { generateApiKey, getApiKey } from './actions';
import AIConfiguration from '@/components/settings/AIConfiguration';
import ProfileSettings from '@/components/settings/ProfileSettings';
import SubscriptionSettings from '@/components/settings/SubscriptionSettings';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useProfile } from '@/hooks/useProfile';
import { useFeeds } from '@/hooks/useFeeds';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { toast } from 'sonner';

// API Key 管理组件
// ... (keep ApiKeyManager as is)
function ApiKeyManager() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getApiKey().then(({ apiKey }) => {
      setApiKey(apiKey);
      setIsLoading(false);
    });
  }, []);

  const handleGenerate = async () => {
    if (!confirm(apiKey ? '重新生成将导致旧密钥立即失效。确定要继续吗？' : '确定要生成新的 API 密钥吗？')) return;
    
    setIsGenerating(true);
    const result = await generateApiKey();
    if (result.apiKey) {
      setApiKey(result.apiKey);
      setShowKey(true); // 生成后自动显示
      toast.success('API 密钥已生成');
    } else {
      toast.error('生成失败，请重试');
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success('密钥已复制到剪贴板');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 mt-6">
       <h3 className="text-xs font-bold text-yellow-500/80 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Key size={12} /> 神经链路 Neural Link (API Key)
      </h3>
      
      <div className="p-4 border border-white/10 bg-white/[0.02] rounded-lg space-y-4">
        <p className="text-xs text-white/60 leading-relaxed">
          使用此密钥连接 Chrome 插件、Obsidian 或其他第三方工具。
          <br/>
          <span className="text-red-400/80">警告：请勿将此密钥泄露给他人。</span>
        </p>

        {isLoading ? (
          <div className="h-10 bg-white/5 animate-pulse rounded" />
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-10 bg-black/40 border border-white/10 rounded px-3 flex items-center justify-between font-mono text-sm text-white/80">
              <span>
                {apiKey 
                  ? (showKey ? apiKey : `${apiKey.slice(0, 10)}...${apiKey.slice(-4)}`) 
                  : '未生成密钥 No API Key Active'}
              </span>
              {apiKey && (
                <button onClick={() => setShowKey(!showKey)} className="text-white/30 hover:text-white transition-colors">
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
            </div>
            
            {apiKey && (
              <button 
                onClick={handleCopy}
                className="h-10 w-10 flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 rounded text-white/60 hover:text-white transition-all"
                title="复制密钥"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="h-10 px-4 border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs font-mono rounded transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
              {apiKey ? '重置' : '生成'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 类型定义
type TabId = 'display' | 'system' | 'intelligence' | 'discovery' | 'account' | 'danger';
// 模拟设置项组件：开关
function Switch({ label, checked, onChange, description }: { label: string; checked: boolean; onChange: () => void; description?: string }) {
  return (
    <div className="flex items-center justify-between p-4 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-mono text-white/80 group-hover:text-green-400 transition-colors">{label}</span>
        {description && <span className="text-[10px] text-white/30 font-mono">{description}</span>}
      </div>
      <button
        onClick={onChange}
        className={`
          relative w-12 h-6 rounded-full transition-all duration-300
          ${checked ? 'bg-green-500/20 border border-green-500/50' : 'bg-white/5 border border-white/10'}
        `}
      >
        <div className={`
          absolute top-1 left-1 w-3.5 h-3.5 rounded-full transition-all duration-300
          ${checked ? 'translate-x-6 bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-white/20'}
        `} />
      </button>
    </div>
  );
}

// 模拟设置项组件：滑动条
function Slider({ label, value, min = 0, max = 100, onChange, unit = '%' }: { label: string; value: number; min?: number; max?: number; onChange: (val: number) => void; unit?: string }) {
  return (
    <div className="p-4 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
      <div className="flex justify-between mb-3">
        <span className="text-sm font-mono text-white/80 group-hover:text-green-400 transition-colors">{label}</span>
        <span className="text-xs font-mono text-green-400">{value}{unit}</span>
      </div>
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group/slider">
        <div 
            className="absolute top-0 left-0 h-full bg-green-500/50 transition-all duration-100 ease-out" 
            style={{ width: `${(value / max) * 100}%` }}
        />
        <input 
            type="range" 
            min={min} 
            max={max} 
            value={value} 
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('display');
  const router = useRouter();
  const { profile, clearCache } = useProfile();
  const { isOffline } = useFeeds();

  // 模拟状态
  const [settings, setSettings] = useState({
    highPerformance: true,
    particles: 80,
    bloom: 60,
    sound: false,
    notifications: true,
    language: 'ZH-CN',
    autoSave: true
  });

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearCache();
    router.replace('/landing');
  };

  const updateSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

    const tabs = [
        { id: 'display', label: '显示设置', icon: Monitor, desc: '视觉效果参数 Visual Parameters' },
        { id: 'system', label: '系统配置', icon: HardDrive, desc: '核心功能设定 Core Configuration' },
        { id: 'intelligence', label: '神经核心', icon: Cpu, desc: 'AI 模型与逻辑配置 AI Model & Logic' },
        { id: 'discovery', label: '信号发现', icon: Globe, desc: 'RSS 订阅与主题筛选 RSS Discovery' },
        { id: 'account', label: '账户安全', icon: Shield, desc: '身份与密钥 Identity & Security' },
        { id: 'danger', label: '危险区域', icon: AlertTriangle, desc: '不可逆操作 Irreversible Actions', danger: true },
    ];

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-green-500/30 flex flex-col">
      
      {/* 背景网格 */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />

      {/* 🚀 统一 Header */}
      <div className="relative z-50 pt-8 border-b border-white/5 pb-4 bg-black/20 backdrop-blur-md">
        <ErrorBoundary name="SettingsHeader">
          <DashboardHeader profile={profile} clearCache={clearCache} isOffline={isOffline} autoHide={true} />
        </ErrorBoundary>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full relative z-10 min-h-0 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 p-4 md:border-r border-b md:border-b-0 border-white/10 bg-black/20 backdrop-blur-sm flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`
                flex items-center gap-3 p-3 w-full text-left transition-all border border-transparent whitespace-nowrap md:whitespace-normal rounded-lg
                ${activeTab === tab.id 
                  ? 'bg-white/[0.08] border-white/10 text-green-400' 
                  : 'text-white/40 hover:text-white hover:bg-white/[0.03]'}
                ${tab.danger && activeTab !== tab.id ? 'hover:text-red-400' : ''}
                ${tab.danger && activeTab === tab.id ? '!text-red-500 !bg-red-500/10 !border-red-500/20' : ''}
              `}
            >
              <tab.icon size={16} className={activeTab === tab.id ? 'animate-pulse' : ''} />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider font-mono">{tab.label}</span>
                <span className="text-[9px] opacity-50 font-mono hidden md:block">{tab.desc}</span>
              </div>
              {activeTab === tab.id && (
                <div className="ml-auto w-1.5 h-1.5 bg-current rounded-full shadow-[0_0_5px_currentColor] hidden md:block" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl space-y-8"
            >
              {/* Tab Title */}
              <div className="border-b border-white/10 pb-4 mb-8">
                <h2 className="text-2xl font-light text-white">{tabs.find(t => t.id === activeTab)?.label}</h2>
                <p className="text-xs font-mono text-white/40 mt-1 uppercase tracking-widest">
                  // {tabs.find(t => t.id === activeTab)?.desc}
                </p>
              </div>

              {/* DISPLAY SETTINGS */}
              {activeTab === 'display' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-green-500/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Monitor size={12} /> 渲染引擎 Rendering Engine
                    </h3>
                    <Switch 
                      label="高性能模式 High Performance" 
                      description="启用高级着色器和后处理效果。"
                      checked={settings.highPerformance} 
                      onChange={() => updateSetting('highPerformance', !settings.highPerformance)} 
                    />
                    <Slider 
                      label="粒子密度 Particle Density" 
                      value={settings.particles} 
                      onChange={(val) => updateSetting('particles', val)} 
                    />
                    <Slider 
                      label="辉光强度 Bloom Intensity" 
                      value={settings.bloom} 
                      onChange={(val) => updateSetting('bloom', val)} 
                    />
                  </div>
                </div>
              )}

              {/* SYSTEM SETTINGS */}
              {activeTab === 'system' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                     <h3 className="text-xs font-bold text-blue-500/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Globe size={12} /> 本地化 Localization
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {['English', '简体中文', '日本語'].map((lang) => (
                        <button 
                          key={lang}
                          onClick={() => updateSetting('language', lang)}
                          className={`p-3 border text-xs font-mono transition-all
                            ${settings.language === lang 
                              ? 'border-green-500/50 bg-green-500/10 text-green-400' 
                              : 'border-white/10 bg-white/[0.02] text-white/40 hover:border-white/30 hover:text-white'}
                          `}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-xs font-bold text-blue-500/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <HardDrive size={12} /> 数据管理 Data Management
                    </h3>
                    <Switch 
                      label="碎片自动保存" 
                      description="自动持久化 Feed 内容到本地存储。"
                      checked={settings.autoSave} 
                      onChange={() => updateSetting('autoSave', !settings.autoSave)} 
                    />
                    <Switch 
                      label="系统通知" 
                      description="接收每日洞察和系统异常警报。"
                      checked={settings.notifications} 
                      onChange={() => updateSetting('notifications', !settings.notifications)} 
                    />
                  </div>
                </div>
              )}

                  {/* INTELLIGENCE SETTINGS */}
                  {activeTab === 'intelligence' && (
                    <AIConfiguration />
                  )}

                  {/* DISCOVERY SETTINGS */}
                  {activeTab === 'discovery' && (
                    <SubscriptionSettings />
                  )}

                  {/* ACCOUNT SETTINGS */}
              {activeTab === 'account' && (
                <div className="space-y-10">
                  {/* 1. 个人资料编辑 */}
                  <ProfileSettings />

                  {/* 2. 导出与安全 */}
                  <div className="space-y-6 pt-10 border-t border-white/5">
                    <h3 className="text-xs font-bold text-blue-500/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Shield size={12} /> 数据与访问 Data & Access
                    </h3>
                    
                    <button className="w-full p-4 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-left text-sm font-mono text-white/70 hover:text-white flex items-center justify-between group rounded-lg">
                      <span>导出用户数据 (JSON)</span>
                      <RefreshCw size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    
                    {/* 集成 API Key Manager */}
                    <ApiKeyManager />
                  </div>
                </div>
              )}

              {/* DANGER ZONE */}
              {activeTab === 'danger' && (
                <div className="space-y-6">
                  <div className="p-4 border border-red-500/30 bg-red-500/5 rounded-lg">
                    <h3 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle size={14} /> 警告 WARNING
                    </h3>
                    <p className="text-red-400/60 text-xs leading-relaxed">
                      以下操作具有破坏性且不可逆转。请谨慎操作。
                      恢复数据可能需要物理连接到主机 mainframe。
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-white/5 bg-white/[0.02] group hover:border-red-500/30 transition-colors">
                      <div>
                        <div className="text-sm text-white/80 font-mono group-hover:text-red-400 transition-colors">清除本地缓存</div>
                        <div className="text-[10px] text-white/30">删除所有临时的模拟数据。</div>
                      </div>
                      <button className="px-3 py-1.5 border border-white/10 text-xs text-white/50 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all rounded">
                        清除
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-white/5 bg-white/[0.02] group hover:border-red-500/30 transition-colors">
                      <div>
                        <div className="text-sm text-white/80 font-mono group-hover:text-red-400 transition-colors">重置星系</div>
                        <div className="text-[10px] text-white/30">抹除所有恒星和碎片。重新开始。</div>
                      </div>
                      <button className="px-3 py-1.5 border border-white/10 text-xs text-white/50 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all rounded">
                        重置
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-white/5 bg-white/[0.02] group hover:border-red-500/30 transition-colors">
                      <div>
                        <div className="text-sm text-white/80 font-mono group-hover:text-red-400 transition-colors">断开连接</div>
                        <div className="text-[10px] text-white/30">从系统登出。</div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-1.5 border border-white/10 text-xs text-white/50 hover:bg-white hover:text-black transition-all rounded"
                      >
                        <Power size={12} />
                        登出
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
