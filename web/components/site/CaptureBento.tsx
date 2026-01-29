'use client';

import { motion } from 'framer-motion';
import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  MeshTransmissionMaterial, 
  Environment, 
  ContactShadows, 
  RoundedBox,
  Cylinder,
  PresentationControls
} from '@react-three/drei';
import * as THREE from 'three';
import { Check, X, Search, Terminal as TerminalIcon, Command, Zap, Filter, Smartphone, Globe, Radio } from 'lucide-react';

// ============================================================================
// TYPOGRAPHY HELPERS
// ============================================================================
const numberFont = '"Times New Roman", Times, serif';
const serifFont = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';

// ============================================================================
// 1. DYNAMIC SCREEN CONTENT (3D Monitor Content - Kept as is)
// ============================================================================
const DynamicTerminalContent = () => {
  const [pulses, setPulses] = React.useState<number[]>(new Array(12).fill(0).map(() => Math.random()));
  const lastUpdate = useRef(0);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (time - lastUpdate.current > 0.1) {
      setPulses(prev => [...prev.slice(1), Math.random()]);
      lastUpdate.current = time;
    }
  });

  return (
    <group position={[-1.5, 1.3, 0.1]}>
      <mesh position={[1.5, -1.3, -0.05]}>
        <planeGeometry args={[3.2, 2.8]} />
        <meshBasicMaterial color="#1ff40a" transparent opacity={0.03} wireframe />
      </mesh>
      {pulses.map((val, i) => (
        <group key={i} position={[0, -i * 0.22, 0]}>
          <mesh position={[val * 2.5 / 2, 0, 0]}>
            <planeGeometry args={[val * 2.5, 0.02]} />
            <meshBasicMaterial color="#1ff40a" transparent opacity={0.4 + val * 0.4} />
          </mesh>
          {val > 0.7 && (
            <mesh position={[val * 2.5 + 0.1, 0, 0]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color="#1ff40a" />
            </mesh>
          )}
        </group>
      ))}
      <group position={[2.2, -2.4, 0]}>
        <mesh>
          <planeGeometry args={[0.5, 0.05]} />
          <meshBasicMaterial color="#1ff40a" />
        </mesh>
      </group>
    </group>
  );
};

// ============================================================================
// 2. 3D MONITOR (Kept as Hero Visual)
// ============================================================================

const Monitor3D = () => {
  const meshRef = useRef<THREE.Group>(null);
  const materialProps = { 
    color: "#d1d5db", // 银灰色/铝合金基底
    roughness: 0.15,  // 低粗糙度，产生犀利的高光
    metalness: 0.9,   // 极高金属度，产生拟真的金属光泽
    envMapIntensity: 2
  };

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 0.3) * 0.015;
    }
  });

  return (
    <group ref={meshRef} rotation={[0.05, -Math.PI / 5, 0]} position={[0, 0.8, 0]}>
      {/* 强化金属边缘光 */}
      <pointLight position={[10, 10, 10]} intensity={15} color="#ffffff" distance={20} />
      <pointLight position={[-10, 5, 10]} intensity={8} color="#ffffff" distance={20} />
      
      <group>
        {/* 前边框 - 增加细腻的倒角反射感 */}
        <RoundedBox args={[4.4, 4, 0.8]} radius={0.12} smoothness={10} position={[0, 0, 1]}>
          <meshStandardMaterial {...materialProps} />
        </RoundedBox>
        {/* 主机身 - 核心金属块 */}
        <RoundedBox args={[4.2, 3.8, 3]} radius={0.2} smoothness={10} position={[0, 0, -0.5]}>
          <meshStandardMaterial {...materialProps} />
        </RoundedBox>
        {/* 后部 - 略微深色的喷砂处理感 */}
        <RoundedBox args={[3.2, 3, 1]} radius={0.3} smoothness={10} position={[0, 0, -2]}>
          <meshStandardMaterial color="#9ca3af" roughness={0.3} metalness={0.8} />
        </RoundedBox>
      </group>

      <group position={[0, 0, 1.51]}>
        <mesh frustumCulled={false}>
          <planeGeometry args={[3.7, 3.1]} />
          <meshStandardMaterial color="#000000" emissive="#1ff40a" emissiveIntensity={0.25} toneMapped={false} />
        </mesh>
        <DynamicTerminalContent />
        {/* 屏幕对金属边框的绿光投影 */}
        <pointLight position={[0, 0, 0.2]} intensity={0.8} color="#1ff40a" distance={2} />
      </group>

      <group position={[0, -2, 0.5]}>
        <Cylinder args={[0.6, 0.8, 0.6, 32]} position={[0, 0.2, 0]}>
          <meshStandardMaterial {...materialProps} />
        </Cylinder>
        <RoundedBox args={[3.5, 0.3, 3]} radius={0.1} smoothness={10} position={[0, -0.1, 0]}>
          <meshStandardMaterial {...materialProps} />
        </RoundedBox>
      </group>
    </group>
  );
};

// ============================================================================
// 3. REALISTIC 2D UI SCENES (Skeuomorphic / High-Fidelity)
// ============================================================================

// 01: Mobile - "Instant Capture" UI
const MobileScene = () => (
  <div className="relative w-full h-full bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center p-4 md:p-8 group text-blue-500">
    {/* Refined Grid Background */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
    
    {/* The Phone Container with Metallic Rim */}
    <div className="relative w-[130px] md:w-[160px] h-[200px] md:h-[260px] bg-black rounded-[1.8rem] md:rounded-[2.2rem] border-[4px] border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.8),inset_0_0_2px_rgba(255,255,255,0.2)] overflow-hidden">
      {/* Notch */}
      <div className="absolute top-1.5 md:top-2 left-1/2 -translate-x-1/2 w-12 md:w-16 h-3 md:h-4 bg-neutral-900 rounded-full z-30 shadow-inner" />
      
      {/* Screen Content */}
      <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col p-3 md:p-4 pt-8 md:pt-10 space-y-3">
        {/* Chat Bubble with Glass Effect */}
      <motion.div
          initial={{ opacity: 0, x: -10 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          className="bg-white/5 border border-white/5 p-2 rounded-2xl rounded-tl-none w-4/5 backdrop-blur-sm"
        >
          <div className="h-1 bg-white/20 rounded w-1/3 mb-1.5" />
          <div className="h-1 bg-white/10 rounded w-2/3" />
        </motion.div>

        {/* The Link Card with Premium Styling */}
            <motion.div
          initial={{ opacity: 0, scale: 0.95 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          className="bg-gradient-to-br from-blue-500/20 to-indigo-500/5 p-2.5 rounded-xl border border-blue-500/30 shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
            >
           <div className="flex gap-2.5 items-center">
             <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/40">
                <Globe size={14} className="text-blue-400" />
             </div>
             <div className="flex-1 space-y-1.5">
               <div className="h-1 bg-blue-200/40 rounded w-full" />
               <div className="h-1 bg-blue-200/20 rounded w-1/2" />
                </div>
                </div>
            </motion.div>

        {/* Capturing Status */}
        <div className="mt-auto py-2 border-t border-white/5 flex items-center justify-between px-1">
           <div className="flex gap-1">
              {[1,2,3].map(i => (
                <motion.div 
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                  className="w-1 h-1 rounded-full bg-blue-500" 
                />
              ))}
           </div>
           <span className="text-[6px] md:text-[8px] text-white/30 font-mono tracking-widest">ENCRYPTING...</span>
        </div>
      </div>

      {/* Screen Glare */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
    </div>
  </div>
);

// 02: Browser - "Reader Mode" UI
const BrowserScene = () => (
  <div className="relative w-full h-full bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center p-4 md:p-8 group text-green-500">
    {/* Browser Window with Glassmorphism */}
    <div className="relative w-full max-w-[280px] md:max-w-sm h-[180px] md:h-[220px] bg-[#0d0d0d] rounded-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col scale-95 md:scale-100">
      {/* Refined Toolbar */}
      <div className="h-7 md:h-9 bg-[#1a1a1a] border-b border-white/5 flex items-center px-3 gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] shadow-[0_0_5px_rgba(255,95,87,0.3)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 h-5 md:h-6 bg-black/60 rounded-md border border-white/5 flex items-center px-2 text-[7px] md:text-[9px] text-neutral-500 font-mono italic">
           https://archive.is/neofeed...
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Left: Distraction Area */}
        <div className="w-1/4 md:w-[30%] border-r border-white/5 p-2 space-y-2 opacity-20 grayscale">
           <div className="h-8 bg-neutral-800 rounded" />
           <div className="h-12 bg-neutral-800 rounded" />
           <div className="h-10 bg-neutral-800 rounded" />
        </div>

        {/* Right: Focused Content */}
        <div className="flex-1 p-3 md:p-5 bg-[#0a0a0a] relative overflow-hidden">
          {/* Active Highlight */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-green-500/10 blur-[30px] rounded-full" />
          
          <div className="space-y-2.5 relative z-10">
             <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-4 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <div className="h-3 bg-neutral-200 rounded-sm w-3/4" />
             </div>
             <div className="h-1.5 bg-neutral-600 rounded w-full" />
             <div className="h-1.5 bg-neutral-600 rounded w-full opacity-80" />
             <div className="h-1.5 bg-neutral-600 rounded w-5/6 opacity-60" />
             <div className="h-1.5 bg-neutral-600 rounded w-4/6 opacity-40" />
            </div>

          {/* Magical Icon Floating */}
            <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center backdrop-blur-md shadow-lg"
          >
             <Zap size={14} className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
            </motion.div>
        </div>
      </div>
    </div>
  </div>
);

// 03: RSS - "Radar" UI
const RSSScene = () => {
  const [dots, setDots] = React.useState<Array<{top: string, left: string, delay: number}>>([]);
  
  React.useEffect(() => {
    const newDots = [...Array(8)].map((_, i) => ({
      top: `${25 + Math.random() * 50}%`, 
      left: `${25 + Math.random() * 50}%`,
      delay: i * 0.3
    }));
    setDots(newDots);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center p-4 md:p-8 group text-orange-500">
      {/* Sophisticated Radar Grid */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
         <div className="w-[260px] h-[260px] rounded-full border border-current opacity-[0.1]" />
         <div className="w-[180px] h-[180px] rounded-full border border-current opacity-[0.2]" />
         <div className="w-[100px] h-[100px] rounded-full border border-current opacity-[0.3]" />
         <div className="w-full h-[1px] bg-current opacity-[0.1] absolute" />
         <div className="w-[1px] h-full bg-current opacity-[0.1] absolute" />
      </div>

      {/* Pulsing Core */}
      <div className="absolute w-2 h-2 bg-current rounded-full shadow-[0_0_20px_currentColor]" />

      {/* Rotating Scanner with Gradient Trail */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-center"
      >
         <div className="w-[130px] md:w-[160px] h-[130px] md:h-[160px] bg-gradient-to-tr from-transparent via-orange-500/5 to-orange-500/30 rounded-full" 
              style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }} />
      </motion.div>

      {/* Data Points with Haze */}
      <div className="relative z-10 w-full h-full">
         {dots.map((dot, i) => (
      <motion.div
             key={i}
             initial={{ scale: 0, opacity: 0 }}
             animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
             transition={{ duration: 3, delay: dot.delay, repeat: Infinity }}
             className="absolute w-2 h-2 flex items-center justify-center"
             style={{ top: dot.top, left: dot.left }}
           >
              <div className="w-1.5 h-1.5 bg-current rounded-full shadow-[0_0_10px_currentColor]" />
              <div className="absolute w-4 h-4 bg-current/20 rounded-full blur-[2px]" />
           </motion.div>
         ))}
      </div>

      {/* Target HUD Label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-3 shadow-2xl">
         <Radio size={12} className="text-orange-400 animate-pulse" />
         <span className="text-[8px] md:text-[10px] text-white/80 font-mono tracking-[0.2em] uppercase">Signal Detected</span>
      </div>
    </div>
  );
};

// 04: Terminal - "Command Line" UI
const TerminalScene = () => (
  <div className="relative w-full h-full bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center p-4 md:p-8 group text-purple-500">
    {/* Terminal Window */}
    <div className="relative w-full max-w-[280px] md:max-w-sm h-[180px] md:h-[220px] bg-[#050505] rounded-lg border border-white/10 shadow-2xl flex flex-col font-mono overflow-hidden">
            {/* Header */}
      <div className="h-7 bg-[#111] border-b border-white/5 flex items-center px-3 justify-between">
         <div className="flex items-center gap-2">
            <TerminalIcon size={10} className="text-purple-500" />
            <span className="text-neutral-500 text-[8px] md:text-[9px] uppercase tracking-widest font-bold">NeoFeed CLI</span>
         </div>
                <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                    </div>
                 </div>

      {/* Main Console Area */}
      <div className="flex-1 p-3 md:p-4 text-purple-400/90 space-y-2 relative overflow-hidden">
         <div className="flex gap-2">
           <span className="text-purple-600 font-bold">$</span>
           <span className="text-white/90">capture <span className="text-purple-400/60">--url</span> "https://..."</span>
                     </div>
         
         <div className="flex items-start gap-2 pl-4">
            <div className="w-1 h-3 mt-1 bg-purple-500/20 rounded-full" />
            <div className="text-[9px] md:text-[10px] text-neutral-500 space-y-0.5">
               <p>Connecting to neural core...</p>
               <p className="text-green-500/60 font-bold opacity-80">[OK] Handshake verified</p>
            </div>
        </div>
            
         {/* JSON Highlighted Result */}
            <motion.div
           initial={{ opacity: 0, y: 5 }}
           whileInView={{ opacity: 1, y: 0 }}
           className="mt-4 p-2 bg-purple-500/5 border border-purple-500/10 rounded-md text-[9px] md:text-[10px] relative group/json"
         >
           <div className="absolute top-1 right-2 text-[7px] text-purple-500/40 uppercase font-bold">JSON</div>
           <p><span className="text-purple-300">"status":</span> <span className="text-green-400">"captured"</span>,</p>
           <p><span className="text-purple-300">"vectors":</span> <span className="text-orange-400">1024_dim</span></p>
            </motion.div>

         {/* Blinking Cursor */}
         <div className="flex items-center gap-2 pt-1">
            <span className="text-purple-600 font-bold">$</span>
                 <motion.div 
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-2 h-4 bg-purple-500/80 shadow-[0_0_8px_rgba(168,85,247,0.5)]" 
                 />
            </div>
        </div>

      {/* Retro CRT Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_2px,3px_100%] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent pointer-events-none animate-scanline" />
            </div>
        </div>
);

// ============================================================================
// COMPONENT: THE BENTO SECTION
// ============================================================================

const sections = [
  { id: "mobile", title: "一次震动，信息入库", subtitle: "Neural Shortcut", description: "在微信、小红书看到好文章？无需复制链接，只需点击分享，NeoFeed 瞬间捕获。不用打断阅读，我们替你稍后读。", scene: () => <MobileScene />, accent: "text-blue-400", gradient: "from-blue-500 to-indigo-500" },
  { id: "browser", title: "阅读心流，拒绝打断", subtitle: "Browser Extension", description: "浏览器里的“一键剪藏”。自动去除广告弹窗，只提取干净的正文。别让好内容在收藏夹里吃灰，让 AI 替你读完。", scene: () => <BrowserScene />, accent: "text-green-400", gradient: "from-green-500 to-emerald-500" },
  { id: "rss", title: "全天候的数字哨兵", subtitle: "Automated Sentinel", description: "你不需要刷完所有新闻。订阅你关心的源，AI 会像私人编辑一样，每天从数百条更新中，为你精选出最值得读的 Top 7。", scene: () => <RSSScene />, accent: "text-orange-400", gradient: "from-orange-500 to-red-500" },
  { id: "terminal", title: "物理输入枢纽", subtitle: "Direct Command", description: "给极客的物理接口。在控制台直接键入灵感或 URL。把你的碎片想法，投喂给第二大脑，看着它生长。", scene: () => <TerminalScene />, accent: "text-purple-400", gradient: "from-purple-500 to-pink-500" }
];

export default function CaptureBento() {
  return (
    <section id="features" className="w-full py-16 md:py-32 2xl:py-64 relative z-10 overflow-hidden" style={{ fontFamily: serifFont }}>
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 space-y-20 md:space-y-32 2xl:space-y-64">
        <div className="text-center mb-12 md:mb-20 2xl:mb-40 relative">
          <div className="hidden md:block absolute top-[-230px] 2xl:top-[-350px] left-0 right-0 z-0 opacity-90">
             <div className="w-full h-[600px] 2xl:h-[1000px] flex items-center justify-center overflow-visible">
                <Canvas camera={{ position: [0, 2, 16], fov: 32 }} gl={{ antialias: true, alpha: true, logarithmicDepthBuffer: true }}>
                    <Suspense fallback={null}>
                    <ambientLight intensity={0.4} color="#ffffff" />
                    <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={15} castShadow />
                    <pointLight position={[-10, 10, 15]} intensity={10} color="#ffffff" />
                    <pointLight position={[0, -10, -10]} intensity={5} color="#4040ff" />
                    <PresentationControls global={false} snap={true} speed={2} polar={[-Math.PI / 6, Math.PI / 6]} azimuth={[-Math.PI / 4, Math.PI / 4]}>
                        <Monitor3D />
                    </PresentationControls>
                    </Suspense>
                </Canvas>
             </div>
          </div>
          <div className="relative z-10 pt-4 md:pt-[240px] 2xl:pt-[400px] flex flex-col items-center gap-4 md:gap-6 2xl:gap-12">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl md:text-8xl 2xl:text-[10rem] font-serif text-white font-bold leading-tight">
            万物接入<br />
              <span className="text-white/30 text-xl md:text-6xl 2xl:text-8xl font-sans font-light tracking-tight italic">The Portals of Capture</span>
          </motion.h2>
          </div>
        </div>

        {sections.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.8 }} className={`flex flex-col-reverse md:flex-row items-center gap-6 md:gap-24 2xl:gap-48 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className="w-full md:w-1/2 h-[220px] md:h-[350px] 2xl:h-[600px] relative group shrink-0">
                    <div className={`absolute inset-0 md:-inset-4 bg-gradient-to-r ${item.gradient} opacity-10 blur-[30px] md:blur-[50px] group-hover:opacity-20 transition-opacity duration-1000`} />
                    {item.scene()}
                </div>
                <div className="w-full md:w-1/2 space-y-4 md:space-y-8 2xl:space-y-16">
                    <div className="flex flex-col gap-2 2xl:gap-4">
                        <span className={`font-mono text-[10px] md:text-sm 2xl:text-xl tracking-widest uppercase ${item.accent}`} style={{ fontFamily: numberFont }}>
                            0{index + 1} <span className="opacity-40">/</span> {item.subtitle}
                         </span>
                        <h3 className="text-2xl md:text-5xl 2xl:text-8xl font-bold text-white leading-tight">{item.title}</h3>
                    </div>
                    <p className="text-sm md:text-lg 2xl:text-3xl text-white/60 leading-relaxed font-light max-w-md 2xl:max-w-2xl">
                        {item.description}
                    </p>
                    <div className={`w-12 md:w-24 2xl:w-48 h-1 bg-gradient-to-r ${item.gradient} opacity-50`} />
                </div>
            </motion.div>
        ))}
      </div>
    </section>
  );
}
