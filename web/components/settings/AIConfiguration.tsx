'use client';

import { useState, useEffect } from 'react';
import { updateAiConfig, getAiConfig, AIConfig } from '@/app/settings/actions';
import { Loader2, Save, Cpu, MessageSquare, Key, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';


const DEFAULT_PROMPT = `你是 NeoFeed 的首席情报分析师。
你的任务是分析用户过去一周的信息消费，并生成一份高价值的“每周洞察报告”。

输入数据:
- 用户收集的文章列表（标题、摘要、标签）。

输出要求 (Markdown):
1. **核心叙事**: 识别用户兴趣中最重要的一个主题或转变。
2. **关键洞察**: 提炼 3 个深度、非显而易见的信息关联。
3. **行动建议**: 基于阅读内容，提出 1 个具体的行动或工具建议。
4. **语调**: 专业且引人入胜，像一位私人幕僚长。

请严格使用与大多数内容一致的语言输出（中文或英文）。`;

export default function AIConfiguration() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AIConfig>({
    provider: 'siliconflow',
    model: 'deepseek-ai/DeepSeek-V3',
    prompt: DEFAULT_PROMPT,
    apiKey: '',
    notificationEmail: ''
  });

  useEffect(() => {
    const loadConfig = async () => {
      const { config: savedConfig } = await getAiConfig();
      if (savedConfig) {
        setConfig(prev => ({ ...prev, ...savedConfig }));
      }
      setLoading(false);
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateAiConfig(config);
    setSaving(false);
    if (res.error) {
      alert('Failed to save settings');
    } else {
      // Show success feedback
    }
  };

  if (loading) return <div className="p-8 text-center text-white/30"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-white mb-1">神经核心配置</h3>
        <p className="text-sm text-white/40">自定义每周洞察报告背后的“大脑”。</p>
      </div>

      {/* Provider & Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <label className="text-xs font-mono text-white/50 uppercase flex items-center gap-2">
                <Cpu className="w-3 h-3" /> 模型供应商 (Provider)
            </label>
            <select 
                value={config.provider}
                onChange={(e) => setConfig({ ...config, provider: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-white/30 outline-none"
            >
                <option value="siliconflow">SiliconFlow (推荐)</option>
                <option value="deepseek">DeepSeek 官方</option>
                <option value="openai">OpenAI</option>
            </select>
        </div>
        <div className="space-y-2">
            <label className="text-xs font-mono text-white/50 uppercase flex items-center gap-2">
                <Cpu className="w-3 h-3" /> 模型名称 (Model Name)
            </label>
            <input 
                type="text" 
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                placeholder="例如: gpt-4o, deepseek-chat"
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-white/30 outline-none font-mono"
            />
        </div>
      </div>

      {/* API Key */}
      <div className="space-y-2">
          <label className="text-xs font-mono text-white/50 uppercase flex items-center gap-2">
              <Key className="w-3 h-3" /> 自定义 API Key (可选)
          </label>
          <input 
              type="password" 
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="留空则使用系统默认 Key"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-white/30 outline-none font-mono"
          />
          <p className="text-[10px] text-white/30">
            如果提供，将使用此 Key 生成您的报告。您的密钥会被安全存储。
          </p>
      </div>

      {/* Notification Email */}
      <div className="space-y-2">
          <label className="text-xs font-mono text-white/50 uppercase flex items-center gap-2">
              <Mail className="w-3 h-3" /> 通知邮箱
          </label>
          <input 
              type="email" 
              value={config.notificationEmail || ''}
              onChange={(e) => setConfig({ ...config, notificationEmail: e.target.value })}
              placeholder="neo@matrix.org"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-white/30 outline-none font-mono"
          />
          <p className="text-[10px] text-white/30">
            在每周一早上接收您的每周洞察报告。
          </p>
      </div>

      {/* System Prompt */}
      <div className="space-y-2">
          <label className="text-xs font-mono text-white/50 uppercase flex items-center gap-2">
              <MessageSquare className="w-3 h-3" /> 系统提示词 (System Prompt)
          </label>
          <textarea 
              value={config.prompt}
              onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
              rows={10}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-white/80 text-sm focus:border-white/30 outline-none font-mono leading-relaxed resize-y"
          />
          <p className="text-[10px] text-white/30">
            此提示词将指导 AI 如何格式化和撰写您的周报。
          </p>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-white/5 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            保存配置
          </button>
      </div>
    </div>
  );
}

