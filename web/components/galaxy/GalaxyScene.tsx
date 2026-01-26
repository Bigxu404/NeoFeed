'use client'

import { useState, useRef, useMemo, memo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GalaxyItem } from '@/types';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import FastUniverse from './FastUniverse';
import SlowUniverse from './SlowUniverse';

// ==========================================
// 🌌 主场景容器 (Galaxy Scene Container)
// ==========================================
const GalaxyScene = memo(({ data, onItemClick }: { data: GalaxyItem[], onItemClick: (item: GalaxyItem) => void }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [universeMode, setUniverseMode] = useState<'fast' | 'slow'>('fast');

  return (
    <div className="w-full h-full relative bg-[#050508]">
      <Canvas camera={{ position: [0, 0, 45], fov: 55 }} dpr={[1, 2]} shadows>
        {/* 渲染对应的宇宙模式 */}
        {universeMode === 'fast' ? (
          <FastUniverse 
            data={data} 
            onItemClick={onItemClick} 
            setIsHovering={setIsHovering} 
          />
        ) : (
          <SlowUniverse 
            data={data} 
            onItemClick={onItemClick} 
            setIsHovering={setIsHovering} 
          />
        )}
        
        {/* 通用后期处理 (根据模式微调参数) */}
        <Suspense fallback={null}>
          <EffectComposer disableNormalPass multisampling={4}>
            <Bloom 
              luminanceThreshold={universeMode === 'fast' ? 0.6 : 0.8} 
              intensity={universeMode === 'fast' ? 1.8 : 1.2} 
              radius={0.5} 
              mipmapBlur 
            />
            {universeMode === 'fast' && <Noise opacity={0.1} />}
            <Vignette eskil={false} offset={0.2} darkness={0.6} /> 
            {universeMode === 'fast' && (
              <ChromaticAberration 
                  offset={new THREE.Vector2(0.002, 0.002)} 
                  radialModulation={true} 
                  modulationOffset={0.5} 
              />
            )}
          </EffectComposer>
        </Suspense>

        <OrbitControls 
            enablePan={false} 
          enableZoom={true} 
            minDistance={10} 
            maxDistance={80} 
            autoRotate={!isHovering} 
            autoRotateSpeed={universeMode === 'fast' ? 0.2 : 0.1} 
        />
      </Canvas>

      {/* HUD 界面 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono tracking-widest pointer-events-none text-center">
        <p>SYSTEM: {universeMode === 'fast' ? 'CHAOS ENGINE' : 'ORDER MATRIX'} ACTIVE</p>
        <p className="mt-2 text-[10px] opacity-50">
          {universeMode === 'fast' ? 'SCANNING FOR COGNITIVE PATTERNS...' : 'KNOWLEDGE STRUCTURE STABILIZED'}
        </p>
      </div>

      {/* 宇宙切换开关 (临时) */}
      <div className="absolute top-8 right-8 z-50">
        <button 
          onClick={() => setUniverseMode(prev => prev === 'fast' ? 'slow' : 'fast')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white text-xs font-mono backdrop-blur-md transition-colors"
        >
          切换至 {universeMode === 'fast' ? '慢思考' : '快思考'} 宇宙
        </button>
      </div>
    </div>
  );
});

export default GalaxyScene;
