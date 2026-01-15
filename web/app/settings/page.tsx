'use client'

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Monitor, HardDrive, Shield, AlertTriangle, Terminal, RefreshCw, Power, Globe, Cpu } from 'lucide-react';
import AIConfiguration from '@/components/settings/AIConfiguration';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useProfile } from '@/hooks/useProfile';
import { useFeeds } from '@/hooks/useFeeds';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// 类型定义
type TabId = 'display' | 'system' | 'ai' | 'account' | 'danger';

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

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'display', label: '显示设置', icon: Monitor, desc: '视觉效果参数 Visual Parameters' },
    { id: 'ai', label: '神经核心', icon: Cpu, desc: 'LLM 与 洞察引擎 Core Intelligence' },
    { id: 'system', label: '系统配置', icon: HardDrive, desc: '核心功能设定 Core Configuration' },
    { id: 'account', label: '账户安全', icon: Shield, desc: '身份与密钥 Identity & Security' },
    { id: 'danger', label: '危险区域', icon: AlertTriangle, desc: '不可逆操作 Irreversible Actions', danger: true },
  ];

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-green-500/30 flex flex-col">
      
      {/* 背景网格 */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />

      {/* Header */}
      <div className="sticky top-0 z-[100] md:relative md:z-50 bg-black/50 backdrop-blur-md md:bg-transparent md:backdrop-blur-none border-b border-white/5 md:border-none p-4 md:p-8">
        <ErrorBoundary name="SettingsHeader">
          <DashboardHeader profile={profile} clearCache={clearCache} isOffline={isOffline} autoHide={false} />
        </ErrorBoundary>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full relative z-10">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 p-4 md:border-r border-b md:border-b-0 border-white/10 bg-black/20 backdrop-blur-sm flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`
                flex items-center gap-3 p-3 w-full text-left transition-all border border-transparent whitespace-nowrap md:whitespace-normal
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
        <div className="flex-1 p-6 md:p-12 overflow-y-auto h-[calc(100vh-80px)]">
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

              {/* AI SETTINGS */}
              {activeTab === 'ai' && (
                <AIConfiguration />
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

              {/* ACCOUNT SETTINGS */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div className="p-6 rounded border border-white/10 bg-white/[0.02] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-900/20 border border-green-500/30 flex items-center justify-center text-green-500 font-serif italic text-xl">
                      A
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Mr. Anderson</div>
                      <div className="text-xs font-mono text-white/40">neo@matrix.org</div>
                    </div>
                    <button className="ml-auto px-3 py-1 text-xs border border-white/10 hover:bg-white/5 rounded text-white/60 hover:text-white transition-colors">
                      编辑
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button className="w-full p-4 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-left text-sm font-mono text-white/70 hover:text-white flex items-center justify-between group">
                      <span>导出用户数据 (JSON)</span>
                      <RefreshCw size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="w-full p-4 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-left text-sm font-mono text-white/70 hover:text-white flex items-center justify-between group">
                      <span>管理 API 密钥</span>
                      <Terminal size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
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
                      <button className="flex items-center gap-2 px-3 py-1.5 border border-white/10 text-xs text-white/50 hover:bg-white hover:text-black transition-all rounded">
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
