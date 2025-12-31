'use client';

import { motion } from 'framer-motion';

// ============================================================================
// SCENE 1: MOBILE SHORTCUT (Fix: Border Radius Overflow)
// ============================================================================
const MobileScene = () => {
  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-blue-900/20 to-black rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center perspective-1000">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[length:40px_40px] opacity-20" />
      
      {/* 3D Phone Container */}
      <motion.div
        initial={{ rotateY: -10, rotateX: 5 }}
        animate={{ rotateY: [-10, 0, -10], rotateX: [5, 0, 5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-52 h-[420px] bg-black rounded-[3rem] border-[6px] border-gray-800 shadow-2xl flex flex-col items-center p-2 overflow-hidden z-10"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Dynamic Island */}
        <div className="w-16 h-5 bg-black rounded-full border border-gray-800 z-20 mb-2 mt-2 shrink-0" />
        
        {/* Screen Content - Perfectly Nested */}
        <div className="flex-1 w-full bg-gray-900 rounded-[2.2rem] overflow-hidden flex flex-col relative border border-gray-800/50">
            {/* Notification Banner */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: [-100, 10, 10, -100] }} 
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.2, 0.8, 1], repeatDelay: 1 }}
                className="absolute top-2 left-2 right-2 h-12 bg-[#1c1c1e]/95 backdrop-blur rounded-xl p-2 flex items-center gap-2 border border-white/10 z-50 shadow-lg"
            >
                <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center shrink-0">
                    <div className="w-3 h-3 bg-white rounded-sm" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-bold text-white leading-tight">NeoFeed</span>
                    <span className="text-[8px] text-white/60 leading-tight truncate">✅ 已成功捕获内容</span>
                </div>
            </motion.div>

            {/* Fake App UI */}
            <div className="w-full flex-1 bg-gradient-to-b from-gray-800 to-black p-3 space-y-3 opacity-50 pt-16">
                <div className="w-full h-24 bg-white/5 rounded-xl" />
                <div className="w-3/4 h-3 bg-white/5 rounded-full" />
                <div className="w-1/2 h-3 bg-white/5 rounded-full" />
                <div className="w-full h-20 bg-white/5 rounded-xl mt-4" />
            </div>

            {/* Share Sheet Pop-up */}
            <motion.div
                animate={{ y: [150, 0, 150] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.15, 1], repeatDelay: 1 }}
                className="absolute bottom-0 left-0 right-0 h-40 bg-[#1c1c1e] rounded-t-2xl p-3 z-40 flex flex-col gap-3 border-t border-white/10"
            >
                <div className="w-8 h-1 bg-white/20 rounded-full mx-auto" />
                {/* Action Row */}
                <div className="w-full h-10 bg-blue-500/20 rounded-xl border border-blue-500/50 flex items-center px-3 gap-2 relative overflow-hidden">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }} // Tap effect
                        transition={{ duration: 4, times: [0.2, 0.3, 1], repeat: Infinity, repeatDelay: 1 }}
                        className="absolute inset-0 bg-blue-500/30"
                    />
                    <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 bg-white rounded-[1px]" />
                    </div>
                    <span className="text-[9px] text-blue-200 font-bold truncate">Run NeoFeed Shortcut</span>
                </div>
            </motion.div>
        </div>
      </motion.div>

      {/* The Signal Beam */}
      <motion.div
        animate={{ 
            opacity: [0, 1, 1, 0],
            x: [-20, 100, 250],
            y: [50, -50, -150],
            scale: [0.5, 1.5, 0.2]
        }}
        transition={{ duration: 4, repeat: Infinity, times: [0.2, 0.4, 0.6, 1], repeatDelay: 1 }}
        className="absolute z-50 w-4 h-4 bg-blue-400 rounded-full blur-[2px] shadow-[0_0_30px_rgba(59,130,246,1)]"
      />
    </div>
  );
};

// ... (BrowserScene, RadarScene, TerminalScene remain unchanged)
const BrowserScene = () => {
    return (
      <div className="w-full h-full min-h-[400px] bg-gradient-to-bl from-green-900/20 to-black rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
        {/* Browser Window */}
        <div className="w-[90%] max-w-[500px] h-[300px] bg-[#0a0a0a] rounded-xl border border-white/10 relative overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-white/[0.02]">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
                <div className="flex-1 h-6 bg-black/40 rounded ml-4 border border-white/5" />
                
                {/* Extension Icon (Click Animation) */}
                <motion.div 
                    animate={{ scale: [1, 0.8, 1], backgroundColor: ["rgba(255,255,255,0)", "rgba(255,255,255,0.1)", "rgba(255,255,255,0)"] }}
                    transition={{ duration: 4, times: [0.1, 0.15, 0.2], repeat: Infinity, repeatDelay: 0 }}
                    className="w-8 h-8 rounded border border-white/20 flex items-center justify-center cursor-pointer relative"
                >
                    <div className="w-4 h-4 bg-green-500 rounded-sm" />
                    {/* Mouse Cursor */}
                    <motion.div 
                        animate={{ 
                            opacity: [0, 1, 1, 0],
                            x: [20, 0, 0, 20],
                            y: [20, 0, 0, 20]
                        }}
                        transition={{ duration: 4, times: [0, 0.1, 0.2, 0.3], repeat: Infinity }}
                        className="absolute bottom-0 right-0 w-3 h-3 border-l border-t border-white rotate-[135deg]" 
                    />
                </motion.div>
            </div>

            {/* Content Body */}
            <div className="p-6 relative flex-1 flex items-center justify-center">
                 {/* Page Content */}
                 <div className="absolute inset-0 p-6 space-y-4 opacity-30">
                    <div className="w-full h-4 bg-white/10 rounded" />
                    <div className="w-3/4 h-4 bg-white/10 rounded" />
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="col-span-1 h-24 bg-white/5 rounded" />
                        <div className="col-span-2 space-y-3">
                            <div className="w-full h-3 bg-white/5 rounded" />
                            <div className="w-full h-3 bg-white/5 rounded" />
                        </div>
                    </div>
                 </div>

                 {/* Success Pop-up Card (Updated Text) */}
                 <motion.div 
                    animate={{ scale: [0, 1.1, 1, 1, 0], opacity: [0, 1, 1, 1, 0] }}
                    transition={{ duration: 4, times: [0.2, 0.3, 0.35, 0.8, 0.9], repeat: Infinity }}
                    className="relative z-20 w-56 bg-[#1a1a1a] border border-green-500/30 rounded-xl p-4 shadow-2xl flex flex-col items-center gap-3 text-center"
                 >
                     <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                         <motion.div 
                            animate={{ scale: [0, 1] }}
                            transition={{ delay: 0.3 }}
                            className="w-3 h-2 border-l-2 border-b-2 border-green-500 -rotate-45 mb-1" 
                         />
                     </div>
                     <div>
                         <div className="text-xs font-bold text-white mb-1">已存储到矩阵核心</div>
                         <div className="text-[9px] text-white/40 font-mono">Neural Analysis Pending...</div>
                     </div>
                 </motion.div>
            </div>
        </div>
      </div>
    )
}

const RadarScene = () => {
    return (
        <div className="w-full h-full min-h-[400px] bg-gradient-to-tr from-orange-900/20 to-black rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
            
            {/* Phase 1: Config Panel */}
            <motion.div
                animate={{ opacity: [0, 1, 0], scale: [0.9, 1, 1.1] }}
                transition={{ duration: 5, times: [0, 0.1, 0.3], repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 backdrop-blur-sm"
            >
                <div className="w-56 p-4 border border-orange-500/30 bg-black rounded-lg font-mono text-[10px] text-orange-400">
                    <div className="mb-1 text-white/50 border-b border-white/10 pb-1">RSS CONFIG</div>
                    <div>{'>'} ADD SOURCE... OK</div>
                    <div>{'>'} 正在连接信号源...</div>
                    <div>{'>'} 启动自动巡逻模式...</div>
                </div>
            </motion.div>

            {/* Phase 2: Radar Active */}
            <div className="w-64 h-64 rounded-full border border-orange-500/30 relative flex items-center justify-center">
                 <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_270deg,rgba(249,115,22,0.4)_360deg)]"
                 />
                 
                 <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-orange-500/60 bg-black px-2 whitespace-nowrap">
                    AUTO-SCANNING
                 </div>

                 {/* Static Noise Dots (Fixed Hydration) */}
                 <div className="absolute top-[25%] left-[30%] w-1.5 h-1.5 bg-white/10 rounded-full" />
                 <div className="absolute top-[65%] left-[20%] w-1.5 h-1.5 bg-white/10 rounded-full" />
                 <div className="absolute top-[75%] left-[70%] w-1.5 h-1.5 bg-white/10 rounded-full" />

                 {/* Signal Dots */}
                 <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute top-[20%] right-[30%] w-2 h-2 bg-orange-400 rounded-full shadow-[0_0_10px_orange]"
                 />
                 <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
                    className="absolute bottom-[30%] left-[20%] w-2 h-2 bg-orange-400 rounded-full shadow-[0_0_10px_orange]"
                 />
            </div>
        </div>
    )
}

const TerminalScene = () => {
    return (
        <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-purple-900/20 to-black rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
            <div className="w-[80%] max-w-[500px] h-[200px] flex flex-col justify-center items-center relative z-10">
                
                {/* Input Field Transformation */}
                <motion.div
                    animate={{ 
                        width: ["100%", "100%", "45%", "45%"], // Hold width then shrink
                        height: ["50px", "50px", "50px", "50px"],
                        backgroundColor: ["rgba(0,0,0,0.5)", "rgba(0,0,0,0.5)", "rgba(168,85,247,0.1)", "rgba(168,85,247,0.1)"],
                        borderColor: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.1)", "rgba(168,85,247,0.5)", "rgba(168,85,247,0.5)"],
                        borderRadius: ["8px", "8px", "25px", "25px"]
                    }}
                    transition={{ duration: 4, times: [0, 0.6, 0.7, 1], repeat: Infinity }}
                    className="border flex items-center px-4 overflow-hidden relative"
                >
                    {/* Text typing */}
                    <motion.div
                        animate={{ opacity: [1, 1, 0, 0] }} // Disappear BEFORE shrink
                        transition={{ duration: 4, times: [0, 0.6, 0.65, 1], repeat: Infinity }}
                        className="flex items-center gap-2 font-mono text-sm w-full absolute left-4"
                    >
                        <span className="text-purple-400">➜</span>
                        <motion.span
                            initial={{ width: 0 }}
                            animate={{ width: "auto" }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                            className="text-white/80 overflow-hidden whitespace-nowrap"
                        >
                            https://neofeed.cn/insight
                        </motion.span>
                    </motion.div>

                    {/* Success Icon (Appears AFTER shrink) */}
                    <motion.div
                        animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.5, 0.5, 1, 1, 0.5] }}
                        transition={{ duration: 4, times: [0, 0.65, 0.75, 0.9, 1], repeat: Infinity }}
                        className="absolute inset-0 flex items-center justify-center gap-2"
                    >
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                        <span className="text-purple-200 text-xs font-bold whitespace-nowrap">完成投喂</span>
                    </motion.div>
                </motion.div>

            </div>
        </div>
    )
}

// ... (sections config remains the same)
const sections = [
  {
    id: "mobile",
    title: "一次震动，信息入库",
    subtitle: "Neural Shortcut",
    description: "在微信、小红书看到好文章？无需复制链接，只需点击分享，NeoFeed 瞬间捕获。不用打断阅读，我们替你稍后读。",
    scene: MobileScene,
    accent: "text-blue-400",
    gradient: "from-blue-500 to-indigo-500"
  },
  {
    id: "browser",
    title: "阅读心流，拒绝打断",
    subtitle: "Browser Extension",
    description: "浏览器里的“一键剪藏”。自动去除广告弹窗，只提取干净的正文。别让好内容在收藏夹里吃灰，让 AI 替你读完。",
    scene: BrowserScene,
    accent: "text-green-400",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: "rss",
    title: "全天候的数字哨兵",
    subtitle: "Automated Sentinel",
    description: "你不需要刷完所有新闻。订阅你关心的源，AI 会像私人编辑一样，每天从数百条更新中，为你精选出最值得读的 Top 7。",
    scene: RadarScene,
    accent: "text-orange-400",
    gradient: "from-orange-500 to-red-500"
  },
  {
    id: "terminal",
    title: "物理输入枢纽",
    subtitle: "Direct Command",
    description: "给极客的物理接口。在控制台直接键入灵感或 URL。把你的碎片想法，投喂给第二大脑，看着它生长。",
    scene: TerminalScene,
    accent: "text-purple-400",
    gradient: "from-purple-500 to-pink-500"
  }
];

export default function CaptureBento() {
  return (
    <section id="features" className="w-full py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6 space-y-32">
        
        {/* Section Header */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm font-mono text-white/60 tracking-wider uppercase">Input Vectors</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-8xl font-serif text-white font-bold leading-tight"
          >
            万物接入<br />
            <span className="text-white/30 text-2xl md:text-6xl font-sans font-light tracking-tight italic">The Portals of Capture</span>
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
                            0{index + 1} / {item.subtitle}
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
