'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile'; // 🚀 使用新 Hook
import { updateProfile, uploadAvatar } from '@/app/settings/actions';
import { Loader2, Camera, User, Check, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfileSettings() {
  const { profile, loading, updateCache } = useProfile(); // 🚀 修复：增加 loading 解构
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [nickname, setNickname] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 修复：定义头像点击处理函数
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // 初始化昵称
  useEffect(() => {
    if (profile) setNickname(profile.full_name || '');
  }, [profile]);

  const handleUpdateNickname = async () => {
    setSaving(true);
    setStatus(null);
    const res = await updateProfile({ full_name: nickname });
    setSaving(false);
    if (res.error) {
      setStatus({ type: 'error', msg: `更新失败: ${res.error}` });
    } else {
      setStatus({ type: 'success', msg: '昵称已更新' });
      updateCache({ full_name: nickname }); // 🚀 同步更新全局缓存
    }
    setTimeout(() => setStatus(null), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: 'error', msg: '文件过大，请上传 2MB 以下的图片' });
      return;
    }

    setUploading(true);
    setStatus(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadAvatar(formData);
      setUploading(false);
      
      if (res.error) {
        setStatus({ type: 'error', msg: res.error });
      } else {
        setStatus({ type: 'success', msg: '头像已上传' });
        updateCache({ avatar_url: (res as any).url }); // 🚀 同步更新全局缓存
      }
    } catch (err) {
      setUploading(false);
      setStatus({ type: 'error', msg: '上传失败，网络连接异常' });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/20" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-white mb-1">身份识别 (Identity)</h3>
        <p className="text-sm text-white/40">在星系中展示你的数字身份。</p>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Avatar Section */}
        <div className="relative group">
          <div 
            onClick={handleAvatarClick}
            className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden cursor-pointer hover:border-white/30 transition-all relative"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-white/20" />
            )}
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              {uploading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Camera className="w-6 h-6 text-white" />}
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <p className="text-[10px] text-center mt-2 text-white/30 font-mono uppercase tracking-tighter">Avatar_Link</p>
        </div>

        {/* Nickname Section */}
        <div className="flex-1 space-y-4 w-full">
          <div className="space-y-2">
            <label className="text-xs font-mono text-white/50 uppercase flex items-center gap-2">
              <User className="w-3 h-3" /> 昵称 (Nickname)
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="输入你的代号..."
                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-white/30 outline-none font-mono"
              />
              <button 
                onClick={handleUpdateNickname}
                disabled={saving || nickname === profile?.full_name}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 opacity-50">
             <label className="text-xs font-mono text-white/50 uppercase">电子邮箱 (Email)</label>
             <input 
                type="text" 
                value={profile?.email || ''} 
                disabled 
                className="w-full bg-transparent border border-white/5 rounded-lg px-3 py-2 text-white/30 text-sm font-mono cursor-not-allowed"
             />
          </div>
        </div>
      </div>

      {status && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-3 rounded-lg border text-xs font-mono flex items-center gap-2",
            status.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
          )}
        >
          {status.type === 'success' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          {status.msg}
        </motion.div>
      )}
    </div>
  );
}

