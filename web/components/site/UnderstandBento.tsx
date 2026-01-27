'use client';

import { motion } from 'framer-motion';
import { FileText, Mail, Network, BarChart2, Hash, ArrowRight, Database, Scan, AlignLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// ============================================================================
// TYPOGRAPHY HELPERS
// ============================================================================
const numberFont = '"Times New Roman", Times, serif';
const serifFont = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';

// 01: SynthesisScene Refinement
const SynthesisScene = () => {
  return (
    <div className="relative w-full h-full bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-4 md:p-8 group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)]" />
      
      {/* Raw Data Stream Background */}
      <div className="absolute inset-0 opacity-20 overflow-hidden font-mono text-[8px] md:text-[10px] text-indigo-500/30 p-4 leading-relaxed break-all pointer-events-none">
        {`[SYSTEM_LOG] 0x8F2A RECONSTRUCTING_STREAM...
          >> ANALYZING_SEMANTICS... OK
          >> CLUSTERING_VECTORS... OK
          >> MAPPING_TO_GALAXY_COORD...
          [DATA] {id: "neofeed-1", weight: 0.98}
          [DATA] {id: "neofeed-2", weight: 0.85}
          [DEBUG] Mismatch at 0x90... Ignored.`}
      </div>

      {/* The Machine Interface */}
      <div className="relative z-10 w-full max-w-[280px] md:max-w-[320px] bg-[#0d0d0d] rounded-2xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col scale-90 md:scale-100 group-hover:border-indigo-500/30 transition-colors duration-500">
        {/* Machine Header */}
        <div className="h-9 md:h-11 bg-[#151515] border-b border-white/5 flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
               <Database size={12} className="text-indigo-400" />
            </div>
            <span className="text-[10px] text-white/60 font-mono tracking-[0.2em] font-bold uppercase">Synthesis_V2</span>
          </div>
          <div className="flex items-center gap-2">
              <motion.div
              animate={{ opacity: [1, 0.4, 1] }} 
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" 
            />
            <span className="text-[8px] text-indigo-400 font-bold uppercase tracking-widest">Active</span>
          </div>
        </div>

        {/* Processing Core */}
        <div className="p-4 md:p-6 relative min-h-[180px] md:min-h-[220px]">
          {/* Fading Raw Data */}
          <div className="absolute inset-6 space-y-3 opacity-10 grayscale blur-[0.5px]">
             {[1,2,3].map(i => (
               <div key={i} className="h-2 bg-neutral-700 rounded-full w-full" />
          ))}
      </div>

          {/* Precision Scanning Beam */}
          <motion.div 
            animate={{ top: ['5%', '95%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_#6366f1] z-20"
          />

          {/* Reveal Area */}
          <div className="absolute inset-4 md:inset-6 z-10 overflow-hidden">
          <motion.div
               animate={{ height: ['0%', '100%'] }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="bg-[#0d0d0d] w-full overflow-hidden"
             >
                <div className="space-y-4 pt-1">
                   {/* Card 1: Reconstructed Metadata */}
                   <div className="p-3 bg-neutral-900/80 rounded-xl border border-white/5 shadow-inner">
                      <div className="flex items-center gap-2 mb-2">
                         <div className="w-1 h-3 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]" />
                         <div className="h-3 bg-white/20 rounded w-2/3" />
                      </div>
                      <div className="space-y-1.5">
                         <div className="h-1 bg-white/10 rounded-full w-full" />
                         <div className="h-1 bg-white/5 rounded-full w-5/6" />
                      </div>
              </div>

                   {/* Tags */}
                   <div className="flex gap-2">
                      <div className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-[8px] text-indigo-300 font-mono tracking-widest uppercase">Semantic_OK</div>
                      <div className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-md text-[8px] text-purple-300 font-mono tracking-widest uppercase">Vectorized</div>
              </div>
              </div>
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 02: WeeklyScene Refinement
const WeeklyScene = () => {
    return (
    <div className="relative w-full h-full bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-4 md:p-8 group">
      {/* Ambient Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/[0.03] to-transparent" />
      <div className="absolute w-[300px] h-[300px] bg-teal-500/5 blur-[120px] rounded-full" />

      {/* Premium Report UI */}
      <div className="relative w-full max-w-[280px] md:max-w-[340px] bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col scale-95 md:scale-100 group-hover:border-teal-500/30 transition-all duration-500">
         {/* Email Masthead */}
         <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shadow-inner">
                  <Mail size={18} className="text-teal-400 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]" />
               </div>
               <div>
                  <h4 className="text-[11px] md:text-[13px] text-white font-bold tracking-tight">Intelligence Feed</h4>
                  <p className="text-[9px] text-teal-400/60 font-mono uppercase tracking-[0.2em]">Weekly Protocol</p>
               </div>
            </div>
            <div className="text-right">
               <div className="text-[10px] text-white/40 font-serif italic">Issue #24</div>
                </div>
        </div>

         {/* Content Preview Area */}
         <div className="p-4 md:p-6 space-y-5 md:space-y-7 bg-neutral-900/30 backdrop-blur-sm">
            {/* Semantic Density Chart */}
            <div className="space-y-3">
               <div className="flex justify-between items-end mb-1">
                  <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-bold">Semantic Growth</span>
                  <span className="text-[8px] text-teal-400 font-mono">+24.5%</span>
               </div>
               <div className="flex items-end gap-1.5 h-16 md:h-20 border-b border-white/5 pb-2">
                  {[0.4, 0.6, 0.5, 0.8, 0.7, 0.9, 0.85].map((h, i) => (
                     <motion.div 
                    key={i}
                       initial={{ height: 0 }}
                       whileInView={{ height: `${h * 100}%` }}
                       transition={{ delay: i * 0.1, duration: 0.8, ease: "circOut" }}
                       className="flex-1 bg-gradient-to-t from-teal-500/10 to-teal-500/40 rounded-t-md border-t border-teal-500/30"
                />
            ))}
                </div>
            </div>

            {/* Structured Insights Preview */}
            <div className="space-y-3">
               {[1, 2].map((_, i) => (
                 <div key={i} className="flex items-start gap-3 group/item cursor-pointer">
                    <div className="w-5 h-5 rounded-lg bg-teal-500/5 border border-white/5 flex items-center justify-center mt-0.5 shrink-0 group-hover/item:border-teal-500/40 transition-colors">
                       <ArrowRight size={10} className="text-teal-500" />
                    </div>
                    <div className="space-y-2 w-full pt-1.5">
                <div className="w-full h-1.5 bg-white/10 rounded-full" />
                       <div className="w-3/4 h-1.5 bg-neutral-700 rounded-full" />
                    </div>
                </div>
               ))}
            </div>
            
            {/* Premium CTA */}
            <div className="mt-2 w-full py-2.5 bg-teal-500/5 border border-teal-500/20 rounded-xl text-center group/btn cursor-pointer overflow-hidden relative">
               <div className="absolute inset-0 bg-teal-500/0 group-hover/btn:bg-teal-500/5 transition-colors" />
               <span className="text-[9px] md:text-[11px] text-teal-400 font-mono tracking-[0.3em] uppercase relative z-10">Deploy Summary</span>
            </div>
         </div>
      </div>
    </div>
  );
};

// 03: GalaxyGrowthScene Refinement (Multi-Galaxy Cluster Model with Accretion Animation)
const GalaxyGrowthScene = () => {
  const [incomingStar, setIncomingStar] = useState<{ id: number, color: string, targetX: number, targetY: number } | null>(null);
  
  const clusters = [
    { id: 'ai', name: 'AI_RECON', color: '#6366f1', x: -40, y: -30, nodes: 8, status: 'mature' },
    { id: 'design', name: 'DESIGN_SYS', color: '#f97316', x: 50, y: 20, nodes: 5, status: 'growing' },
    { id: 'dev', name: 'CORE_DEV', color: '#10b981', x: -20, y: 50, nodes: 3, status: 'seed' },
  ];

  // Simulate new data capture and "Gravity Accretion"
  useEffect(() => {
    const interval = setInterval(() => {
      const randomCluster = clusters[Math.floor(Math.random() * clusters.length)];
      setIncomingStar({
        id: Date.now(),
        color: randomCluster.color,
        targetX: randomCluster.x,
        targetY: randomCluster.y
      });

      // Reset after animation
      setTimeout(() => setIncomingStar(null), 3000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

    return (
    <div className="relative w-full h-full bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-4 md:p-8 group">
       {/* Background Spatial Texture */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] opacity-50" />
       
       {/* UI Overlay - HUD Header */}
       <div className="absolute top-4 left-4 md:top-6 md:left-6 flex gap-3 z-30">
          <div className="px-2 py-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg text-[9px] md:text-[11px] text-neutral-400 font-mono flex items-center gap-2 shadow-2xl">
             <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
             <span>NEURAL_GRAVITY: ACTIVE</span>
          </div>
       </div>

       {/* The Multi-Galaxy Map */}
       <div className="relative w-full h-full scale-75 md:scale-90 flex items-center justify-center">
          
          {/* Incoming Star Animation (Simulating Gravity Accretion) */}
          {incomingStar && (
            <motion.div
              key={incomingStar.id}
              initial={{ x: 150, y: -150, opacity: 0, scale: 0 }}
              animate={{ 
                x: [150, 0, incomingStar.targetX], 
                y: [-150, 0, incomingStar.targetY], 
                opacity: [0, 1, 1, 0],
                scale: [0, 1.5, 0.5, 0]
              }}
              transition={{ 
                duration: 2.5,
                times: [0, 0.4, 0.8, 1],
                ease: "easeInOut"
              }}
              className="absolute z-40 pointer-events-none"
            >
               <div className="w-3 h-3 rounded-full shadow-[0_0_20px_#fff] bg-white" />
               <motion.div 
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border border-white"
               />
               <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-mono text-white/80 bg-black/50 px-2 py-0.5 rounded border border-white/10">
                  ANALYZING_SEMANTICS...
               </div>
            </motion.div>
          )}

          {clusters.map((cluster) => (
            <div 
              key={cluster.id}
              className="absolute transition-transform duration-1000 group-hover:scale-110"
              style={{ transform: `translate(${cluster.x}px, ${cluster.y}px)` }}
            >
              {/* Cluster Hub */}
              <div className="relative z-20 flex flex-col items-center justify-center">
                 <motion.div 
                    animate={cluster.status === 'mature' ? { 
                      scale: [1, 1.2, 1],
                      boxShadow: [`0 0 20px ${cluster.color}`, `0 0 40px ${cluster.color}`, `0 0 20px ${cluster.color}`]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 md:w-4 md:h-4 rounded-full"
                    style={{ backgroundColor: cluster.color }}
                 />
                 
                 {/* Label */}
                 <div className="absolute top-6 md:top-8 whitespace-nowrap flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5">
                       <span className="text-[7px] md:text-[9px] font-mono font-bold tracking-[0.2em] uppercase px-1.5 py-0.5 bg-black/40 backdrop-blur-sm border border-white/5 rounded" style={{ color: cluster.color }}>
                          {cluster.name}
                       </span>
                    </div>
                    {cluster.status === 'mature' && (
                       <motion.span 
                        animate={{ opacity: [0.2, 0.6, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-[6px] text-white/60 font-mono tracking-tighter italic"
                       >
                        READY TO SYNTHESIZE
                       </motion.span>
                    )}
                 </div>
            </div>

              {/* Orbiting Nodes */}
              {[...Array(cluster.nodes)].map((_, i) => (
                    <motion.div 
                        key={i}
                        animate={{ rotate: 360 }}
                   transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 flex items-center justify-center pointer-events-none"
                   style={{ width: 0, height: 0 }}
                 >
                    <div 
                      className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-white/80 rounded-full border border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.3)] z-10"
                        style={{ 
                        transform: `translateX(${20 + i * 12}px)`,
                        backgroundColor: i % 2 === 0 ? cluster.color : '#fff'
                      }} 
                    />
                 </motion.div>
              ))}
            </div>
          ))}
            </div>

       {/* Legend Overlay */}
       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center z-30">
          <div className="text-[9px] md:text-[12px] text-white font-mono font-bold uppercase tracking-[0.4em] mb-1">Neural Gravity Map</div>
          <div className="h-0.5 w-12 bg-indigo-500 mx-auto rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            </div>
        </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const sections = [
  {
    id: "processing",
    title: "噪音变信息，重构数据",
    subtitle: "Neural Synthesis",
    description: "AI 会自动整理、概括你投喂的每一个碎片。它不仅提取核心论点，还会根据语义自动将其归类到对应的引力场中。告别繁琐的文件夹手动分类。",
    scene: SynthesisScene,
    accent: "text-indigo-400",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    id: "insight",
    title: "让 AI 替你阅读，主动回馈",
    subtitle: "Weekly Intelligence",
    description: "不用担心“收藏了就再也不看”。AI 会定期梳理你阅读和投喂的所有内容，在每周一为你生成一份专属的洞察周报，发送至你的邮箱。让碎片拼凑成完整的智慧图景。",
    scene: WeeklyScene,
    accent: "text-teal-400",
    gradient: "from-teal-500 to-emerald-500"
  },
  {
    id: "galaxy",
    title: "看着你的知识星系，慢慢生长",
    subtitle: "Spatial Memory",
    description: "投喂的内容越多，你的个人知识网络就越庞大。每一条信息都将化为一颗恒星，在 3D 星系中形成独特的拓扑连接。用空间记忆唤醒你沉睡的灵感。",
    scene: GalaxyGrowthScene,
    accent: "text-orange-400",
    gradient: "from-orange-500 to-yellow-500"
  }
];

export default function UnderstandBento() {
  return (
    <section className="w-full py-16 md:py-32 relative z-10 bg-black" style={{ fontFamily: serifFont }}>
      <div className="max-w-7xl mx-auto px-6 space-y-20 md:space-y-32">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-32">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-8xl font-serif text-white font-bold leading-tight"
          >
            理解万物<br />
            <span className="text-white/30 text-xl md:text-6xl font-sans font-light tracking-tight italic">The Core of Intelligence</span>
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
                className={`flex flex-col-reverse md:flex-row items-center gap-8 md:gap-24 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
                {/* Visual Scene (50%) */}
                <div className="w-full md:w-1/2 h-[220px] md:h-[450px] relative group shrink-0">
                    <div className={`absolute inset-0 md:-inset-4 bg-gradient-to-r ${item.gradient} opacity-20 blur-[30px] md:blur-[50px] group-hover:opacity-30 transition-opacity duration-1000`} />
                    <item.scene />
                </div>

                {/* Text Content (50%) */}
                <div className="w-full md:w-1/2 space-y-4 md:space-y-8 text-left">
                    <div className="flex flex-col gap-2">
                         <span className={`font-mono text-[10px] md:text-sm tracking-widest uppercase ${item.accent}`} style={{ fontFamily: numberFont }}>
                            0{index + 1} <span className="opacity-40">/</span> {item.subtitle}
                         </span>
                         <h3 className="text-2xl md:text-5xl font-bold text-white leading-tight">
                            {item.title}
                         </h3>
                    </div>
                    <p className="text-sm md:text-lg text-white/60 leading-relaxed font-light max-w-md">
                        {item.description}
                    </p>
                    <div className={`w-12 md:w-24 h-1 bg-gradient-to-r ${item.gradient} opacity-50`} />
                </div>
            </motion.div>
        ))}

      </div>
    </section>
  );
}
