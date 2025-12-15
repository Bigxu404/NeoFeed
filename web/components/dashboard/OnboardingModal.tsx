'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Lock, Zap, X, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const tasks = [
    { id: 1, title: "初始化投喂系统", desc: "输入任意内容并发送", status: "completed" },
    { id: 2, title: "连接神经网络", desc: "安装浏览器插件 (即将上线)", status: "active" },
    { id: 3, title: "生成首次洞察", desc: "获得 AI 的智能摘要反馈", status: "locked" },
    { id: 4, title: "解锁星系视图", desc: "积累 5 个知识碎片", status: "locked" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-lg"
          >
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl shadow-green-900/20 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-green-400" />
                  <h2 className="text-lg font-bold text-white">系统启动序列</h2>
                </div>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8">
                <div className="relative space-y-8">
                  {/* Vertical Connecting Line */}
                  <div className="absolute left-3 top-2 bottom-2 w-[1px] bg-white/10" />

                  {tasks.map((task) => (
                    <div key={task.id} className="relative flex items-start gap-4 group">
                      
                      {/* Status Icon */}
                      <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-colors mt-0.5 ${
                        task.status === 'completed' ? 'bg-green-500 border-green-500 text-black' :
                        task.status === 'active' ? 'bg-orange-500/20 border-orange-500 text-orange-500 animate-pulse' :
                        'bg-[#0a0a0a] border-white/10 text-white/20'
                      }`}>
                        {task.status === 'completed' && <CheckCircle size={14} />}
                        {task.status === 'active' && <Zap size={14} />}
                        {task.status === 'locked' && <Lock size={12} />}
                      </div>

                      {/* Task Content */}
                      <div className={`flex-1 transition-opacity ${task.status === 'locked' ? 'opacity-40' : 'opacity-100'}`}>
                        <div className="text-sm font-bold text-white mb-1">{task.title}</div>
                        <div className="text-xs text-white/50">{task.desc}</div>
                        
                        {task.status === 'active' && (
                          <div className="text-xs text-orange-400/80 mt-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                            等待信号连接...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-black/40 border-t border-white/5 text-center">
                <p className="text-xs text-white/30 font-mono">完成序列解锁完整系统权限</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


