'use client'

import { motion } from 'framer-motion';
import { CheckCircle, Circle, Lock, Zap } from 'lucide-react';

export default function TaskUnlockTree() {
  const tasks = [
    { id: 1, title: "Initialize Feed", status: "completed" },
    { id: 2, title: "Connect Neural Implant", status: "active" },
    { id: 3, title: "Synthesize First Insight", status: "locked" },
    { id: 4, title: "Unlock Galaxy View", status: "locked" },
  ];

  return (
    <div className="w-full max-w-md mx-auto mt-12 p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
      <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-6">System Boot Sequence</h3>
      
      <div className="relative space-y-8">
        {/* Vertical Connecting Line */}
        <div className="absolute left-3 top-2 bottom-2 w-[1px] bg-white/10" />

        {tasks.map((task, index) => (
          <div key={task.id} className="relative flex items-center gap-4 group">
            
            {/* Status Icon */}
            <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
              task.status === 'completed' ? 'bg-green-500 border-green-500 text-black' :
              task.status === 'active' ? 'bg-orange-500/20 border-orange-500 text-orange-500 animate-pulse' :
              'bg-[#0a0a0a] border-white/10 text-white/20'
            }`}>
              {task.status === 'completed' && <CheckCircle size={14} />}
              {task.status === 'active' && <Zap size={14} />}
              {task.status === 'locked' && <Lock size={12} />}
            </div>

            {/* Task Content */}
            <div className={`flex-1 transition-opacity ${task.status === 'locked' ? 'opacity-30' : 'opacity-100'}`}>
              <div className="text-sm font-medium text-white">{task.title}</div>
              {task.status === 'active' && (
                <div className="text-xs text-orange-400/80 mt-1">Waiting for signal...</div>
              )}
            </div>

            {/* Active Glow */}
            {task.status === 'active' && (
              <div className="absolute inset-0 bg-orange-500/5 blur-lg rounded-lg -z-10" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


