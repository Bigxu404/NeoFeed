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
  const materialProps = { color: "#080808", roughness: 0.6, metalness: 0.4 };

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 0.3) * 0.015;
    }
  });

  return (
    <group ref={meshRef} rotation={[0.05, -Math.PI / 5, 0]} position={[0, 0.8, 0]}>
      <group>
        <RoundedBox args={[4.4, 4, 0.8]} radius={0.08} smoothness={4} position={[0, 0, 1]}><meshStandardMaterial {...materialProps} /></RoundedBox>
        <RoundedBox args={[4.2, 3.8, 3]} radius={0.15} smoothness={4} position={[0, 0, -0.5]}><meshStandardMaterial {...materialProps} /></RoundedBox>
        <RoundedBox args={[3.2, 3, 1]} radius={0.2} smoothness={4} position={[0, 0, -2]}><meshStandardMaterial color="#020202" roughness={0.8} /></RoundedBox>
      </group>
      <group position={[0, 0, 1.51]}>
        <mesh frustumCulled={false}>
          <planeGeometry args={[3.7, 3.1]} />
          <meshStandardMaterial color="#000000" emissive="#1ff40a" emissiveIntensity={0.15} toneMapped={false} />
        </mesh>
        <DynamicTerminalContent />
        <pointLight position={[0, 0, 1]} intensity={0.3} color="#1ff40a" distance={4} />
      </group>
      <group position={[0, -2, 0.5]}>
        <Cylinder args={[0.6, 0.8, 0.6, 32]} position={[0, 0.2, 0]}><meshStandardMaterial {...materialProps} /></Cylinder>
        <RoundedBox args={[3.5, 0.3, 3]} radius={0.1} smoothness={4} position={[0, -0.1, 0]}><meshStandardMaterial {...materialProps} /></RoundedBox>
      </group>
    </group>
  );
};

// ============================================================================
// 3. REALISTIC 2D UI SCENES (Skeuomorphic / High-Fidelity)
// ============================================================================

// 01: Mobile - "Instant Capture" UI
const MobileScene = () => (
  <div className="relative w-full h-full bg-neutral-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-4 md:p-8 group">
    {/* Grid Background */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
    
    {/* The Phone Container */}
    <div className="relative w-[130px] md:w-[160px] h-[200px] md:h-[260px] bg-black rounded-[1.5rem] md:rounded-[2rem] border-[3px] md:border-[4px] border-neutral-800 shadow-2xl overflow-hidden transform md:group-hover:scale-105 transition-transform duration-500">
      {/* Notch */}
      <div className="absolute top-1.5 md:top-2 left-1/2 -translate-x-1/2 w-12 md:w-16 h-3 md:h-4 bg-neutral-900 rounded-full z-20" />
      
      {/* Screen Content */}
      <div className="absolute inset-0 bg-neutral-900 flex flex-col p-3 md:p-4 pt-8 md:pt-10 space-y-2 md:space-y-3">
        {/* Chat Bubble (Source) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-neutral-800 p-2 rounded-2xl rounded-tl-none border border-white/5 w-3/4"
        >
          <div className="h-1 bg-neutral-600 rounded w-1/2 mb-1" />
          <div className="h-1 bg-neutral-700 rounded w-3/4" />
        </motion.div>

        {/* The Link Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
          className="bg-[#2a2a2a] p-2 rounded-xl border border-white/10"
        >
           <div className="flex gap-2">
             <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500/20 rounded flex items-center justify-center"><Globe size={10} className="text-blue-400" /></div>
             <div className="flex-1 space-y-1">
               <div className="h-1 bg-neutral-500 rounded w-full" />
               <div className="h-1 bg-neutral-600 rounded w-1/2" />
             </div>
           </div>
        </motion.div>

        {/* Scanning Beam Effect */}
        <motion.div 
          initial={{ top: '30%' }}
          animate={{ top: ['30%', '70%', '30%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-6 bg-blue-500/10 border-t border-b border-blue-500/30 blur-[1px] z-10"
        />

        {/* Captured Result (Notification) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.8 }}
          className="mt-auto bg-green-500/10 border border-green-500/30 p-1.5 md:p-2 rounded-lg flex items-center gap-1.5 backdrop-blur-md"
        >
          <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center"><Check size={8} className="text-black" /></div>
          <span className="text-[7px] md:text-[8px] text-green-400 font-mono tracking-wide">CAPTURED</span>
        </motion.div>
      </div>
    </div>
  </div>
);

// 02: Browser - "Reader Mode" UI
const BrowserScene = () => (
  <div className="relative w-full h-full bg-neutral-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-4 md:p-8 group">
    {/* Browser Window */}
    <div className="relative w-full max-w-[280px] md:max-w-sm h-[180px] md:h-[220px] bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col scale-95 md:scale-100">
      {/* Toolbar */}
      <div className="h-6 md:h-8 bg-[#222] border-b border-white/5 flex items-center px-2 md:px-3 gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
        </div>
        <div className="flex-1 mx-2 md:mx-4 h-4 md:h-5 bg-black/40 rounded flex items-center px-2 text-[7px] md:text-[8px] text-neutral-500 font-mono">
           https://chaos-web.com/article...
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Left: Chaos (Ads) - Fading Out */}
        <div className="w-1/4 md:w-1/3 border-r border-white/5 p-2 md:p-3 space-y-2 relative overflow-hidden">
           <div className="absolute inset-0 bg-black/60 z-10 backdrop-blur-[1px]" />
           {[1,2].map(i => (
             <div key={i} className="h-10 bg-neutral-800/50 rounded border border-white/5 flex items-center justify-center" />
           ))}
        </div>

        {/* Right: Content (Pure) */}
        <div className="flex-1 p-3 md:p-4 bg-[#111] relative">
          <div className="absolute top-0 right-0 p-1.5">
             <div className="w-5 h-5 rounded bg-green-500/10 flex items-center justify-center border border-green-500/20">
               <Zap size={10} className="text-green-400" />
             </div>
          </div>
          <div className="space-y-1.5 md:space-y-2">
             <div className="h-2.5 bg-neutral-200 rounded w-3/4 opacity-90" />
             <div className="h-1.5 bg-neutral-500 rounded w-full opacity-60" />
             <div className="h-1.5 bg-neutral-500 rounded w-full opacity-60" />
             <div className="h-1.5 bg-neutral-500 rounded w-5/6 opacity-60" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// 03: RSS - "Radar" UI
const RSSScene = () => {
  const [dots, setDots] = React.useState<Array<{top: string, left: string}>>([]);
  
  React.useEffect(() => {
    // Generate random positions only after mount on client
    const newDots = [...Array(5)].map(() => ({
      top: `${30 + Math.random() * 40}%`, 
      left: `${30 + Math.random() * 40}%`
    }));
    setDots(newDots);
  }, []);

  return (
    <div className="relative w-full h-full bg-neutral-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-4 md:p-8 group">
      {/* Radar Grid */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
         <div className="w-[180px] md:w-[240px] h-[180px] md:h-[240px] rounded-full border border-orange-500/30" />
         <div className="w-[120px] md:w-[160px] h-[120px] md:h-[160px] rounded-full border border-orange-500/30 absolute" />
         <div className="w-full h-[1px] bg-orange-500/30 absolute" />
         <div className="w-[1px] h-full bg-orange-500/30 absolute" />
      </div>

      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-center"
      >
         <div className="w-[90px] md:w-[120px] h-[90px] md:h-[120px] bg-gradient-to-tr from-transparent to-orange-500/20 rounded-full clip-path-sector" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }} />
      </motion.div>

      <div className="relative z-10 w-full h-full">
         {dots.map((dot, i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0.2 }}
             animate={{ opacity: [0.2, 1, 0.2] }}
             transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
             className="absolute w-1 h-1 md:w-1.5 md:h-1.5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]"
             style={{ top: dot.top, left: dot.left }}
           />
         ))}
      </div>

      <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-orange-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
         <Filter size={8} className="text-orange-400" />
         <span className="text-[8px] md:text-[10px] text-orange-400 font-mono tracking-tighter">FILTER_ACTIVE</span>
      </div>
    </div>
  );
};

// 04: Terminal - "Command Line" UI
const TerminalScene = () => (
  <div className="relative w-full h-full bg-neutral-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-4 md:p-8 group">
    <div className="relative w-full max-w-[280px] md:max-w-sm h-[180px] md:h-[220px] bg-[#0c0c0c] rounded-lg border border-purple-500/20 shadow-2xl flex flex-col font-mono text-[10px] md:text-xs overflow-hidden scale-95 md:scale-100">
      <div className="h-5 md:h-6 bg-[#1a1a1a] border-b border-white/5 flex items-center px-2">
         <span className="text-neutral-500 text-[8px] md:text-[10px]">neofeed-cli</span>
      </div>

      <div className="flex-1 p-2 md:p-3 text-purple-400/80 space-y-1 relative">
         <div className="flex gap-1.5">
           <span className="text-purple-500">➜</span>
           <span className="text-white">feed add "Idea"</span>
         </div>
         <div className="text-neutral-500 pl-3">Processing...</div>
         
         <div className="mt-1.5 flex gap-1.5">
           <span className="text-purple-500">➜</span>
           <span className="text-white">sync --brain</span>
           <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-1 h-3 bg-purple-500 block" />
         </div>

         <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-3 p-1.5 bg-purple-500/5 border border-purple-500/10 rounded text-[9px] text-purple-300">
           {`{ "status": "synced" }`}
         </motion.div>
      </div>
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
    <section id="features" className="w-full py-16 md:py-32 relative z-10 overflow-hidden" style={{ fontFamily: serifFont }}>
      <div className="max-w-7xl mx-auto px-6 space-y-20 md:space-y-32">
        <div className="text-center mb-12 md:mb-20 relative">
          <div className="absolute top-[-180px] md:top-[-230px] left-0 right-0 z-0 opacity-90">
             <div className="w-full h-[400px] md:h-[600px] flex items-center justify-center overflow-visible">
                <Canvas camera={{ position: [0, 2, 16], fov: 32 }} gl={{ antialias: true, alpha: true, logarithmicDepthBuffer: true }}>
                    <Suspense fallback={null}>
                    <ambientLight intensity={0.15} color="#ffffff" />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4040ff" />
                    <PresentationControls global={false} snap={true} speed={2} polar={[-Math.PI / 6, Math.PI / 6]} azimuth={[-Math.PI / 4, Math.PI / 4]}>
                        <Monitor3D />
                    </PresentationControls>
                    </Suspense>
                </Canvas>
             </div>
          </div>
          <div className="relative z-10 pt-[180px] md:pt-[240px] flex flex-col items-center gap-4 md:gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs md:text-sm font-mono text-white/60 tracking-wider uppercase" style={{ fontFamily: numberFont }}>Input Vectors</span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-3xl md:text-8xl font-serif text-white font-bold leading-tight">
              万物接入<br />
              <span className="text-white/30 text-xl md:text-6xl font-sans font-light tracking-tight italic">The Portals of Capture</span>
            </motion.h2>
          </div>
        </div>

        {sections.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.8 }} className={`flex flex-col md:flex-row items-center gap-6 md:gap-24 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className="w-full md:w-1/2 h-[220px] md:h-[350px] relative group shrink-0">
                    <div className={`absolute inset-0 md:-inset-4 bg-gradient-to-r ${item.gradient} opacity-10 blur-[30px] md:blur-[50px] group-hover:opacity-20 transition-opacity duration-1000`} />
                    {item.scene()}
                </div>
                <div className="w-full md:w-1/2 space-y-4 md:space-y-8">
                    <div className="flex flex-col gap-2">
                        <span className={`font-mono text-[10px] md:text-sm tracking-widest uppercase ${item.accent}`} style={{ fontFamily: numberFont }}>
                            0{index + 1} <span className="opacity-40">/</span> {item.subtitle}
                        </span>
                        <h3 className="text-2xl md:text-5xl font-bold text-white leading-tight">{item.title}</h3>
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
