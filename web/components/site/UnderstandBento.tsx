'use client';

import { motion } from 'framer-motion';
import { FileText, Mail, Network, BarChart2, Hash, ArrowRight, Database, Scan, AlignLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// ============================================================================
// TYPOGRAPHY HELPERS
// ============================================================================
const numberFont = '"Times New Roman", Times, serif';
const serifFont = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';

// ============================================================================
// SCENE 1: NEURAL SYNTHESIS (The Data Reconstructor)
// Metaphor: Scanning chaos and outputting structured grids
// ============================================================================
const SynthesisScene = () => {
  return (
    <div className="relative w-full h-[400px] bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-8 group">
      {/* Background: Raw Data Stream (Noise) */}
      <div className="absolute inset-0 bg-black overflow-hidden opacity-30">
        <div className="font-mono text-[10px] text-indigo-900/40 p-4 leading-relaxed break-all">
          {`0x8F2A... ERROR: NULL_PTR... SEGMENT_FAULT... %$#@!... KERNEL_PANIC... 
            [NOISE] [NOISE] [NOISE] ... BUFFER_OVERFLOW ... 
            x86_64 ... 00101010 ... AF29 ... 
            (chaos) (random) (entropy) ... 
            SYSTEM_HALT ... REBOOT ... 
            0x8F2A... ERROR: NULL_PTR... SEGMENT_FAULT... %$#@!... 
            [NOISE] [NOISE] [NOISE] ... BUFFER_OVERFLOW ...`}
        </div>
      </div>

      {/* The Reconstruction Interface */}
      <div className="relative z-10 w-[300px] bg-[#151515] rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-9 bg-[#1a1a1a] border-b border-white/5 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <Database size={12} className="text-indigo-400" />
            <span className="text-[10px] text-neutral-400 font-mono tracking-wide">RECONSTRUCTOR_V9</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[9px] text-indigo-500 font-bold uppercase">Processing</span>
          </div>
        </div>

        {/* Processing Area */}
        <div className="p-4 relative min-h-[180px]">
          {/* 1. The Raw Input (Fading out) */}
          <motion.div 
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-4 space-y-2 opacity-30 blur-[1px]"
          >
             <div className="w-full h-2 bg-neutral-700 rounded" />
             <div className="w-3/4 h-2 bg-neutral-700 rounded" />
             <div className="w-5/6 h-2 bg-neutral-700 rounded" />
             <div className="w-full h-2 bg-neutral-700 rounded" />
             <div className="w-2/3 h-2 bg-neutral-700 rounded" />
          </motion.div>

          {/* 2. The Scanning Line */}
          <motion.div 
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_10px_#6366f1] z-20"
          />

          {/* 3. The Structured Output (Masked reveal) */}
          <div className="absolute inset-4 z-10 overflow-hidden">
             <motion.div 
               animate={{ height: ['0%', '100%'] }}
               transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
               className="bg-[#151515] w-full overflow-hidden border-b border-indigo-500/20"
             >
                <div className="space-y-3 pt-1">
                   {/* Field 1: Title */}
                   <div className="flex gap-2 items-center">
                      <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                      <div className="h-3 w-3/4 bg-indigo-500/20 rounded border border-indigo-500/30" />
                   </div>
                   
                   {/* Field 2: Summary */}
                   <div className="p-2 bg-neutral-900 rounded border border-white/5 space-y-1.5">
                      <div className="flex items-center gap-1.5 mb-1">
                         <AlignLeft size={8} className="text-neutral-500" />
                         <span className="text-[8px] text-neutral-500 uppercase">Summary</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/20 rounded" />
                      <div className="h-1.5 w-full bg-white/20 rounded" />
                      <div className="h-1.5 w-2/3 bg-white/20 rounded" />
                   </div>

                   {/* Field 3: Tags */}
                   <div className="flex gap-1.5">
                      <div className="px-1.5 py-0.5 bg-indigo-900/30 border border-indigo-500/30 rounded text-[8px] text-indigo-300">#DATA</div>
                      <div className="px-1.5 py-0.5 bg-indigo-900/30 border border-indigo-500/30 rounded text-[8px] text-indigo-300">#STRUCTURE</div>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SCENE 2: WEEKLY INTELLIGENCE (Premium Email Report UI)
// Metaphor: Delivery of refined knowledge
// ============================================================================
const WeeklyScene = () => {
  return (
    <div className="relative w-full h-[400px] bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-8 group">
      {/* Background Glow */}
      <div className="absolute w-[300px] h-[300px] bg-teal-500/10 blur-[100px] rounded-full" />

      {/* The Envelope / Report Interface */}
      <div className="relative w-[300px] bg-[#0f0f0f] rounded-lg border border-white/10 shadow-2xl overflow-hidden flex flex-col">
         {/* Email Header */}
         <div className="p-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
               <Mail size={14} className="text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
               <div className="text-[10px] text-white font-bold tracking-wide">Weekly Intelligence Report</div>
               <div className="text-[9px] text-neutral-500 font-serif italic">Monday, 9:00 AM</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
         </div>

         {/* Email Body - Preview */}
         <div className="p-4 space-y-4 bg-neutral-900/50">
            {/* Chart Visualization */}
            <div className="flex items-end gap-1 h-16 border-b border-white/5 pb-2 px-2">
               {[0.3, 0.5, 0.4, 0.7, 0.6, 0.8, 0.9].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex-1 bg-teal-500/20 rounded-t-sm hover:bg-teal-500/40 transition-colors"
                  />
               ))}
            </div>

            {/* Summary List */}
            <div className="space-y-2">
               {[1, 2].map((_, i) => (
                 <motion.div 
                   key={i}
                   initial={{ x: -10, opacity: 0 }}
                   whileInView={{ x: 0, opacity: 1 }}
                   transition={{ delay: 0.5 + i * 0.2 }}
                   className="flex items-start gap-2"
                 >
                    <ArrowRight size={10} className="text-teal-500 mt-0.5 shrink-0" />
                    <div className="space-y-1 w-full">
                       <div className="w-full h-1.5 bg-white/20 rounded-full" />
                       <div className="w-2/3 h-1.5 bg-neutral-600 rounded-full" />
                    </div>
                 </motion.div>
               ))}
            </div>
            
            {/* CTA Button */}
            <motion.div 
               whileHover={{ scale: 1.02 }}
               className="mt-2 w-full py-1.5 bg-teal-500/10 border border-teal-500/30 rounded text-center text-[9px] text-teal-400 font-mono tracking-widest uppercase cursor-pointer"
            >
               Read Full Report
            </motion.div>
         </div>
      </div>
    </div>
  );
};

// ============================================================================
// SCENE 3: SPATIAL MEMORY (Knowledge Graph UI)
// Metaphor: Connecting dots, growing network
// ============================================================================
const GalaxyGrowthScene = () => {
  return (
    <div className="relative w-full h-[400px] bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-8">
       {/* Graph Background Grid */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1)_0%,transparent_70%)]" />
       
       {/* UI Overlay - HUD */}
       <div className="absolute top-4 left-4 flex gap-2">
          <div className="px-2 py-1 bg-black/40 border border-white/10 rounded text-[9px] text-neutral-400 font-mono flex items-center gap-2">
             <Network size={10} />
             <span>NODES: 842</span>
          </div>
          <div className="px-2 py-1 bg-black/40 border border-white/10 rounded text-[9px] text-neutral-400 font-mono flex items-center gap-2">
             <BarChart2 size={10} />
             <span>DENSITY: HIGH</span>
          </div>
       </div>

       {/* The Graph Network */}
       <div className="relative w-full h-full">
          {/* Central Node */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.8)] z-20" />

          {/* Orbiting Nodes & Connections */}
          {[...Array(6)].map((_, i) => (
             <motion.div
               key={i}
               animate={{ rotate: 360 }}
               transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
               className="absolute top-1/2 left-1/2 w-0 h-0"
             >
                <div 
                  className="absolute w-2 h-2 bg-neutral-300 rounded-full border border-black z-10"
                  style={{ transform: `translateX(${60 + i * 25}px)` }} 
                />
                {/* Connection Line */}
                <div 
                  className="absolute h-[1px] bg-orange-500/30 origin-left"
                  style={{ width: `${60 + i * 25}px` }}
                />
             </motion.div>
          ))}

          {/* New Node Injecting */}
          <motion.div
             initial={{ scale: 0, opacity: 0 }}
             animate={{ scale: [0, 1.5, 1], opacity: 1 }}
             transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
             className="absolute top-1/2 left-1/2 w-[200px] h-[200px] border border-orange-500/20 rounded-full -translate-x-1/2 -translate-y-1/2"
          />
       </div>

       {/* Legend */}
       <div className="absolute bottom-6 right-6 text-right">
          <div className="text-[10px] text-orange-400 font-bold uppercase tracking-widest" style={{ fontFamily: numberFont }}>Knowledge Graph</div>
          <div className="text-[9px] text-neutral-600 font-mono">Topological View</div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 md:mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs md:text-sm font-mono text-white/60 tracking-wider uppercase" style={{ fontFamily: numberFont }}>Processing Layer</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-8xl font-serif text-white font-bold leading-tight"
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
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-24 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
                {/* Visual Scene (50%) */}
                <div className="w-full md:w-1/2 h-[280px] md:h-[450px] relative group shrink-0">
                    <div className={`absolute -inset-4 bg-gradient-to-r ${item.gradient} opacity-20 blur-[50px] group-hover:opacity-30 transition-opacity duration-1000`} />
                    <item.scene />
                </div>

                {/* Text Content (50%) */}
                <div className="w-full md:w-1/2 space-y-4 md:space-y-8 text-left">
                    <div className="flex flex-col gap-2">
                         <span className={`font-mono text-[10px] md:text-sm tracking-widest uppercase ${item.accent}`} style={{ fontFamily: numberFont }}>
                            Phase II <span className="opacity-40">/</span> {item.subtitle}
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
