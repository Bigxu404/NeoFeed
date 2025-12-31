'use client';

import { motion } from 'framer-motion';

// ============================================================================
// SCENE 1: NEURAL SYNTHESIS (Chaotic Text -> Structured Cards)
// ============================================================================
const SynthesisScene = () => {
  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-indigo-900/20 to-black rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
      {/* Chaotic Fragments - Fixed positions to avoid hydration mismatch */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
          {[
            {x: -120, y: -80}, {x: 150, y: 120}, {x: -180, y: 40}, {x: 90, y: -150},
            {x: -40, y: 180}, {x: 200, y: -60}, {x: -150, y: -140}, {x: 130, y: 70},
            {x: -70, y: -190}, {x: 180, y: 150}, {x: -200, y: 10}, {x: 110, y: -110}
          ].map((pos, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ 
                    opacity: [0, 1, 0],
                    x: [pos.x, pos.x + 50],
                    y: [pos.y, pos.y - 50],
                    rotate: [0, 180]
                }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.2 }}
                className="absolute w-12 h-1 bg-white/40 rounded-full"
                style={{ top: '50%', left: '50%' }}
              />
          ))}
      </div>

      {/* The Central Synthesis Machine */}
      <div className="relative z-10 w-64 h-64 flex items-center justify-center">
          {/* Pulsing Core */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute w-32 h-32 rounded-full border border-indigo-500/30 flex items-center justify-center"
          >
              <div className="w-24 h-24 rounded-full border border-indigo-400/20 border-dashed" />
          </motion.div>

          {/* Emerging Structured Card */}
          <motion.div
            animate={{ 
                y: [40, 0, 40],
                opacity: [0, 1, 0],
                scale: [0.8, 1, 0.8]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 bg-[#1a1a1a] border border-indigo-500/40 rounded-2xl p-4 shadow-2xl space-y-3"
          >
              <div className="flex justify-between items-center">
                  <div className="w-12 h-2 bg-indigo-500/40 rounded-full" />
                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                  <div className="w-full h-1.5 bg-white/10 rounded-full" />
                  <div className="w-full h-1.5 bg-white/10 rounded-full" />
                  <div className="w-2/3 h-1.5 bg-white/10 rounded-full" />
              </div>
              <div className="flex gap-2 pt-2">
                  <div className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[8px] text-indigo-300 font-mono tracking-tighter uppercase">#AI</div>
                  <div className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[8px] text-indigo-300 font-mono tracking-tighter uppercase">#TECH</div>
              </div>
          </motion.div>
      </div>
    </div>
  );
};

// ============================================================================
// SCENE 2: WEEKLY INTELLIGENCE (Timeline -> Report)
// ============================================================================
const WeeklyScene = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return (
      <div className="w-full h-full min-h-[400px] bg-gradient-to-bl from-teal-900/20 to-black rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
        {/* Timeline dots */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] flex justify-between items-center">
            {days.map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-4">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.5, 1],
                            backgroundColor: ["rgba(20, 184, 166, 0.1)", "rgba(20, 184, 166, 0.6)", "rgba(20, 184, 166, 0.1)"]
                        }}
                        transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatDelay: 2 }}
                        className="w-2 h-2 rounded-full border border-teal-500/30"
                    />
                    <span className="text-[8px] font-mono text-teal-500/40 uppercase tracking-tighter">{day}</span>
                </div>
            ))}
        </div>

        {/* Data convergence paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            {[...Array(7)].map((_, i) => (
                <motion.path
                    key={i}
                    d={`M ${15 + i * 11}% 50% Q 50% 50%, 50% 20%`}
                    fill="transparent"
                    stroke="rgba(20, 184, 166, 0.5)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    animate={{ strokeDashoffset: [20, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
            ))}
        </svg>

        {/* The Final Report */}
        <motion.div
            animate={{ 
                y: [100, 0, 100],
                opacity: [0, 1, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
            className="absolute top-12 w-56 bg-[#0a0a0a] border border-teal-500/30 rounded-xl p-5 shadow-2xl"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-teal-500 rounded-sm" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white leading-none">Weekly Insight</span>
                    <span className="text-[8px] text-teal-500/60 leading-none mt-1">Dec 24 - Dec 31</span>
                </div>
            </div>
            <div className="space-y-3">
                <div className="w-full h-1.5 bg-white/10 rounded-full" />
                <div className="w-full h-1.5 bg-white/10 rounded-full" />
                <div className="w-2/3 h-1.5 bg-white/10 rounded-full" />
                <div className="pt-2 flex justify-between items-center border-t border-white/5">
                    <span className="text-[8px] text-white/40">24 Items Analyzed</span>
                    <div className="w-8 h-3 rounded bg-teal-500/20 flex items-center justify-center">
                        <div className="w-4 h-[1px] bg-teal-400" />
                    </div>
                </div>
            </div>
        </motion.div>
      </div>
    )
}

// ============================================================================
// SCENE 3: SPATIAL MEMORY (Growing Galaxy Core)
// ============================================================================
const GalaxyGrowthScene = () => {
    return (
        <div className="w-full h-full min-h-[400px] bg-gradient-to-tr from-orange-900/20 to-black rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
            {/* Ambient Stars - Fixed positions to avoid hydration mismatch */}
            <div className="absolute inset-0">
                {[
                    {t: '10%', l: '20%', o: 0.3}, {t: '85%', l: '15%', o: 0.4}, {t: '45%', l: '85%', o: 0.2},
                    {t: '30%', l: '70%', o: 0.5}, {t: '60%', l: '40%', o: 0.3}, {t: '15%', l: '55%', o: 0.4},
                    {t: '75%', l: '80%', o: 0.2}, {t: '20%', l: '10%', o: 0.5}, {t: '90%', l: '60%', o: 0.3},
                    {t: '40%', l: '30%', o: 0.4}, {t: '50%', l: '90%', o: 0.2}, {t: '5%', l: '45%', o: 0.5},
                    {t: '95%', l: '75%', o: 0.3}, {t: '35%', l: '25%', o: 0.4}, {t: '80%', l: '50%', o: 0.2},
                    {t: '12%', l: '88%', o: 0.5}, {t: '68%', l: '12%', o: 0.3}, {t: '25%', l: '65%', o: 0.4},
                    {t: '55%', l: '35%', o: 0.2}, {t: '42%', l: '78%', o: 0.5}
                ].map((star, i) => (
                    <div 
                        key={i} 
                        className="absolute w-[1px] h-[1px] bg-white rounded-full"
                        style={{ 
                            top: star.t, 
                            left: star.l,
                            opacity: star.o
                        }} 
                    />
                ))}
            </div>

            {/* Galaxy Core */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                 {/* Gravitational Rings */}
                 {[...Array(3)].map((_, i) => (
                    <motion.div 
                        key={i}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
                        className="absolute rounded-full border border-orange-500/10"
                        style={{ 
                            width: `${100 + i * 60}px`, 
                            height: `${100 + i * 60}px`,
                            borderStyle: i % 2 === 0 ? 'solid' : 'dashed'
                        }}
                    />
                 ))}

                 {/* Central Singularity */}
                 <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-12 bg-orange-500 rounded-full shadow-[0_0_50px_rgba(249,115,22,0.8)] z-10 relative flex items-center justify-center"
                 >
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                    <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white]" />
                 </motion.div>

                 {/* Incoming Star (Feed Item) */}
                 <motion.div
                    animate={{ 
                        opacity: [0, 1, 1, 0],
                        scale: [0.2, 1, 1, 0.2],
                        x: [-150, 0, 0, 0],
                        y: [-100, 0, 0, 0]
                    }}
                    transition={{ duration: 5, repeat: Infinity, times: [0, 0.3, 0.8, 1] }}
                    className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] z-20 flex items-center justify-center"
                 >
                     <div className="w-1 h-1 bg-orange-400 rounded-full" />
                 </motion.div>

                 {/* Success Ring Pulse */}
                 <motion.div
                    animate={{ scale: [0.8, 2], opacity: [0.5, 0] }}
                    transition={{ duration: 2, delay: 1.5, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute w-32 h-32 rounded-full border-2 border-orange-400 z-0"
                 />
            </div>

            {/* Legend */}
            <div className="absolute bottom-8 right-8 font-mono text-[9px] text-orange-500/60 uppercase tracking-[0.2em] space-y-1 text-right">
                <div>Memory Cluster Expanding...</div>
                <div>Node Connectivity: +14%</div>
            </div>
        </div>
    )
}

// ============================================================================
// MAIN COMPONENT CONFIG
// ============================================================================

const sections = [
  {
    id: "processing",
    title: "变噪音为信号，瞬时重构",
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
    <section className="w-full py-32 relative z-10 bg-black">
      <div className="max-w-7xl mx-auto px-6 space-y-32">
        
        {/* Section Header */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-sm font-mono text-white/60 tracking-wider uppercase">Processing Layer</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-8xl font-serif text-white font-bold leading-tight"
          >
            理解万物<br />
            <span className="text-white/30 text-2xl md:text-6xl font-sans font-light tracking-tight italic">The Core of Intelligence</span>
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
                className={`flex flex-col md:flex-row items-center gap-10 md:gap-24 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
                {/* Visual Scene (50%) */}
                <div className="w-full md:w-1/2 h-[350px] md:h-[500px] relative group shrink-0">
                    <div className={`absolute -inset-4 bg-gradient-to-r ${item.gradient} opacity-20 blur-[50px] group-hover:opacity-30 transition-opacity duration-1000`} />
                    <item.scene />
                </div>

                {/* Text Content (50%) */}
                <div className="w-full md:w-1/2 space-y-6 md:space-y-8 text-left">
                    <div className="flex flex-col gap-2">
                         <span className={`font-mono text-[10px] md:text-sm tracking-widest uppercase ${item.accent}`}>
                            Phase II / {item.subtitle}
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

