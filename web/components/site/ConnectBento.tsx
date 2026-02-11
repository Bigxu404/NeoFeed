'use client';

import { motion } from 'framer-motion';
import { Users, Share2, Globe, ShieldCheck } from 'lucide-react';

// ============================================================================
// SCENE 1: SHARED CONSCIOUSNESS (Two stars exchanging data)
// ============================================================================
const SharingScene = () => {
  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-blue-900/20 to-black rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
      <div className="relative w-64 h-64 flex items-center justify-between px-8">
          {/* User A */}
          <div className="relative">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <Users className="text-blue-400 w-8 h-8" />
              </div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
          </div>

          {/* Data Flow Line */}
          <div className="flex-1 h-[1px] bg-gradient-to-r from-blue-500/50 via-purple-500 to-pink-500/50 relative">
              <motion.div
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-sm shadow-[0_0_15px_white]"
              />
          </div>

          {/* User B */}
          <div className="relative">
              <div className="w-16 h-16 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                  <Share2 className="text-pink-400 w-8 h-8" />
              </div>
          </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
          Protocol: Synchronized Knowledge Exchange
      </div>
    </div>
  );
};

// ============================================================================
// SCENE 2: THE HIVE MIND (Team / Org Hub)
// ============================================================================
const HiveScene = () => {
    return (
      <div className="w-full h-full min-h-[400px] bg-gradient-to-bl from-purple-900/20 to-black rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
        <div className="relative w-64 h-64">
            {/* Central Node */}
            <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center z-10"
            >
                <Globe className="text-white/40 w-10 h-10" />
                <div className="absolute inset-0 bg-purple-500/10 blur-2xl rounded-full" />
            </motion.div>

            {/* Orbiting Members */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ width: `${140 + i * 20}px`, height: `${140 + i * 20}px` }}
                >
                    <div 
                        className="w-6 h-6 rounded-full bg-white/10 border border-white/20 absolute top-0 left-1/2 -translate-x-1/2 overflow-hidden flex items-center justify-center"
                    >
                        <div className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_purple]" />
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    )
}

// ============================================================================
// MAIN COMPONENT CONFIG
// ============================================================================

const sections = [
  {
    id: "sharing",
    title: "打破孤岛，知识互赏",
    subtitle: "Peer Exchange",
    description: "NeoFeed 不仅仅是个人的收集器。通过内置的通讯录与分享协议，你可以与好友一键交换各自感兴趣的‘星球’。让优质信号在信任网络中自由流动。",
    scene: SharingScene,
    accent: "text-blue-400",
    gradient: "from-blue-500 to-pink-500"
  },
  {
    id: "hive",
    title: "组织进化：从大脑到蜂群",
    subtitle: "Team Intelligence",
    description: "下一个阶段，我们将开启团队与组织模式。多维度的权限管理、共享的知识库，让团队中的每一个成员都成为集体的触角。汇聚众人的碎片，形成组织的共识。",
    scene: HiveScene,
    accent: "text-purple-400",
    gradient: "from-purple-500 to-indigo-500"
  }
];

export default function ConnectBento() {
  return (
    <section className="w-full py-32 relative z-10 bg-black pb-64">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 2xl:px-24 space-y-32">
        
        {/* Section Header */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm font-mono text-white/60 tracking-wider uppercase">Future Network</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-8xl font-serif text-white font-bold leading-tight"
          >
            万物互联<br />
            <span className="text-white/30 text-2xl md:text-6xl font-sans font-light tracking-tight italic">The Network Horizon</span>
          </motion.h2>
        </div>

        {/* The Zig-Zag Theater */}
        {sections.map((item, index) => (
            <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col md:flex-row items-center gap-10 md:gap-24 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
                {/* Visual Scene (50%) */}
                <div className="w-full md:w-1/2 h-[350px] md:h-[500px] relative group shrink-0">
                    <div className={`absolute -inset-4 bg-gradient-to-r ${item.gradient} opacity-20 blur-[50px] group-hover:opacity-30 transition-opacity duration-1000`} />
                    <item.scene />
                </div>

                {/* Text Content (50%) */}
                <div className="w-full md:w-1/2 space-y-6 md:space-y-8">
                    <div className="flex flex-col gap-2">
                         <span className={`font-mono text-[10px] md:text-sm tracking-widest uppercase ${item.accent}`}>
                            Final Phase / {item.subtitle}
                         </span>
                         <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            {item.title}
                         </h3>
                    </div>
                    <p className="text-base md:text-lg text-white/60 leading-relaxed font-light max-w-md">
                        {item.description}
                    </p>
                    <div className={`w-16 md:w-24 h-1 bg-gradient-to-r ${item.gradient} opacity-50`} />
                </div>
            </motion.div>
        ))}

      </div>
    </section>
  );
}

