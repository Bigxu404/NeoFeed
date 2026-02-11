'use client';

import { motion } from 'framer-motion';

// ============================================================================
// SCENE 1: AI SORT (乱序文本 -> 自动归类)
// ============================================================================
const SortScene = () => {
  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-indigo-900/20 to-black rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[length:30px_30px] opacity-20" />

        <div className="relative w-[80%] h-[300px] flex items-center justify-center">
            
            {/* The "Hand" / Processor Core */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-indigo-500/20 rounded-full border border-indigo-500/50 flex items-center justify-center z-20 backdrop-blur-sm">
                <div className="w-8 h-8 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
            </div>

            {/* Chaotic Particles (Incoming) */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={`chaos-${i}`}
                    className="absolute w-12 h-16 bg-white/5 border border-white/10 rounded-lg flex flex-col gap-2 p-2"
                    initial={{ x: -150, y: (i - 2) * 60, opacity: 0, scale: 0.8, rotate: (i % 2 === 0 ? 15 : -15) }}
                    animate={{ 
                        x: [null, 0], 
                        y: [null, 0], 
                        opacity: [0, 1, 0], 
                        scale: [0.8, 0],
                        rotate: [null, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                >
                    <div className="w-full h-2 bg-white/20 rounded-full" />
                    <div className="w-2/3 h-2 bg-white/10 rounded-full" />
                </motion.div>
            ))}

            {/* Organized Stacks (Outgoing) */}
            {['Tech', 'Art', 'Life'].map((label, i) => (
                <motion.div
                    key={`stack-${i}`}
                    className="absolute right-10 w-32 h-10 bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex items-center px-3 gap-3"
                    style={{ top: 60 + i * 60 }}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 + i * 0.2 }}
                >
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="text-xs font-mono text-indigo-300">{label}</span>
                    
                    {/* Filling Animation */}
                    <motion.div
                        className="absolute right-2 w-1.5 h-1.5 bg-indigo-400 rounded-full"
                        animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5, delay: 2 + i * 0.5 }}
                    />
                </motion.div>
            ))}

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <motion.path 
                    d="M 50% 50% L 80% 25%" 
                    stroke="url(#grad1)" 
                    strokeWidth="2" 
                    fill="none"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -10] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.path 
                    d="M 50% 50% L 80% 50%" 
                    stroke="url(#grad1)" 
                    strokeWidth="2" 
                    fill="none"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -10] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.path 
                    d="M 50% 50% L 80% 75%" 
                    stroke="url(#grad1)" 
                    strokeWidth="2" 
                    fill="none"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -10] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                </defs>
            </svg>

        </div>
    </div>
  );
};

// ============================================================================
// SCENE 2: WEEKLY CYCLE (日历积累 -> 信封飞出)
// ============================================================================
const WeeklyScene = () => {
    return (
      <div className="w-full h-full min-h-[400px] bg-gradient-to-bl from-teal-900/20 to-black rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-3 mb-12">
              {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                      <div className="text-[10px] text-white/20 font-mono">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                      </div>
                      <motion.div 
                        className="w-8 h-10 rounded-md bg-white/5 border border-white/10 relative overflow-hidden"
                        animate={{ 
                            backgroundColor: ["rgba(255,255,255,0.05)", "rgba(20,184,166,0.2)"],
                            borderColor: ["rgba(255,255,255,0.1)", "rgba(20,184,166,0.5)"]
                        }}
                        transition={{ delay: i * 0.3, duration: 0.5 }}
                      >
                          {/* Daily Dots Accumulating */}
                          <motion.div 
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.3, type: "spring" }}
                          >
                              <div className="w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
                          </motion.div>
                      </motion.div>
                  </div>
              ))}
          </div>

          {/* The Weekly Report Envelope */}
          <motion.div
            className="absolute bottom-16 w-48 h-32 bg-[#1a1a1a] border border-teal-500/30 rounded-xl flex items-center justify-center shadow-2xl z-20"
            initial={{ y: 50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 2.5, duration: 0.8, type: "spring" }}
          >
              <div className="absolute -top-4 w-full h-8 bg-[#1a1a1a] border-t border-l border-r border-teal-500/30 rounded-t-xl [clip-path:polygon(0%_100%,50%_0%,100%_100%)]" />
              
              <div className="text-center">
                  <div className="text-teal-400 font-bold text-lg mb-1">WEEKLY SIGNAL</div>
                  <div className="text-[10px] text-white/40 font-mono">Ready for Dispatch</div>
              </div>

              {/* Glowing Seal */}
              <motion.div 
                className="absolute top-[-8px] w-6 h-6 bg-teal-500 rounded-full border-2 border-black flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.6)]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 3 }}
              >
                  <div className="w-3 h-3 border-r-2 border-b-2 border-white rotate-45 mb-1" />
              </motion.div>
          </motion.div>

          {/* Particle Convergence Animation */}
          {[...Array(7)].map((_, i) => (
              <motion.div
                key={`p-${i}`}
                className="absolute w-2 h-2 bg-teal-400 rounded-full z-10"
                style={{ top: '40%', left: `${15 + i * 11.5}%` }} // Approximate center of calendar days
                animate={{ 
                    y: [0, 80], 
                    x: [0, (3.5 - i) * 15], // Converge to center
                    opacity: [0, 1, 0] 
                }}
                transition={{ delay: 2 + i * 0.1, duration: 0.8 }}
              />
          ))}

      </div>
    )
}

// ============================================================================
// SCENE 3: GALAXY GROWTH (投喂 -> 星球变大)
// ============================================================================
const GrowthScene = () => {
    return (
        <div className="w-full h-full min-h-[400px] bg-gradient-to-tr from-rose-900/20 to-black rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
            
            {/* Background Stars */}
            <div className="absolute inset-0 opacity-50">
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, opacity: Math.random() }}
                    />
                ))}
            </div>

            {/* Central Core (Growing) */}
            <motion.div
                className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 blur-md relative z-10 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1.2, 1.1] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            >
                <div className="w-24 h-24 bg-white rounded-full mix-blend-overlay opacity-50" />
            </motion.div>
            
            {/* Orbit Rings (Expanding) */}
            {[1, 2, 3].map((i) => (
                <motion.div
                    key={`orbit-${i}`}
                    className="absolute rounded-full border border-rose-500/20"
                    style={{ width: i * 120, height: i * 120 }}
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                    transition={{ 
                        rotate: { duration: 10 + i * 5, repeat: Infinity, ease: "linear" },
                        scale: { duration: 4, repeat: Infinity, repeatType: "reverse" }
                    }}
                >
                    {/* Planet on Orbit */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-rose-400 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                </motion.div>
            ))}

            {/* Incoming Asteroids (Feeding) */}
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={`feed-${i}`}
                    className="absolute w-3 h-3 bg-white rounded-sm rotate-45 shadow-[0_0_10px_white]"
                    initial={{ x: -200, y: -200, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 1.2, ease: "easeIn" }}
                />
            ))}

            {/* HUD Stats */}
            <div className="absolute bottom-8 left-8 text-rose-400 font-mono text-xs">
                <div className="mb-1">MASS: 8.42e+12</div>
                <div className="flex items-center gap-2">
                    <span>GROWTH:</span>
                    <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-rose-500"
                            animate={{ width: ["20%", "80%"] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}

// ============================================================================
// MAIN COMPONENT CONFIG
// ============================================================================

const sections = [
  {
    id: "sort",
    title: "AI 自动整理，告别繁琐",
    subtitle: "Neural Sort",
    description: "如果你还在手动给笔记打标签，那就太古典了。NeoFeed 的 AI 会自动阅读每一篇内容，提炼核心语义，并将其精准归类到你的知识图谱中。",
    scene: SortScene,
    accent: "text-indigo-400",
    gradient: "from-indigo-500 to-blue-500"
  },
  {
    id: "weekly",
    title: "洞察周报，智慧回流",
    subtitle: "The Weekly Cycle",
    description: "每周一，你会收到一份特别的邮件。AI 将你这一周捕获的所有碎片，编织成了一份结构化的洞察简报。让遗忘的知识重现价值。",
    scene: WeeklyScene,
    accent: "text-teal-400",
    gradient: "from-teal-500 to-green-500"
  },
  {
    id: "galaxy",
    title: "星系养成，知识具象化",
    subtitle: "Galaxy Growth",
    description: "这不是文件夹，是宇宙。投喂的内容越多，你的核心恒星就越亮，引力场就越强。亲眼见证你的第二大脑从一颗尘埃演化为浩瀚星系。",
    scene: GrowthScene,
    accent: "text-rose-400",
    gradient: "from-rose-500 to-orange-500"
  }
];

export default function ProcessBento() {
  return (
    <section className="w-full py-32 relative z-10 bg-[#050505]">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 2xl:px-24 space-y-32">
        
        {/* Section Header */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-sm font-mono text-white/60 tracking-wider uppercase">Neural Processing</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-serif text-white font-bold leading-tight"
          >
            理解万物<br />
            <span className="text-white/30 text-3xl md:text-6xl font-sans font-light tracking-tight">Understanding The Chaos</span>
          </motion.h2>
        </div>

        {/* The Zig-Zag Theater */}
        {sections.map((item, index) => (
            <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
                {/* Visual Scene (50%) */}
                <div className="w-full md:w-1/2 h-[400px] md:h-[500px] relative group">
                    <div className={`absolute -inset-4 bg-gradient-to-r ${item.gradient} opacity-20 blur-[50px] group-hover:opacity-30 transition-opacity duration-1000`} />
                    <item.scene />
                </div>

                {/* Text Content (50%) */}
                <div className="w-full md:w-1/2 space-y-8">
                    <div className="flex flex-col gap-2">
                         <span className={`font-mono text-sm tracking-widest uppercase ${item.accent}`}>
                            0{index + 1} / {item.subtitle}
                         </span>
                         <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            {item.title}
                         </h3>
                    </div>
                    <p className="text-lg text-white/60 leading-relaxed font-light max-w-md">
                        {item.description}
                    </p>
                    {/* Decorative Line */}
                    <div className={`w-24 h-1 bg-gradient-to-r ${item.gradient} opacity-50`} />
                </div>
            </motion.div>
        ))}

      </div>
    </section>
  );
}
