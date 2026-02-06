'use client'

import { useState, useRef, useMemo, memo, Suspense, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GalaxyItem } from '@/types';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import FastUniverse from './FastUniverse';
import SlowUniverse from './SlowUniverse';
import SlowUniverseHUD from '../dashboard/SlowUniverseHUD';
import { toast } from 'sonner';

// ==========================================
// 🎥 相机控制组件 (Camera Controller)
// ==========================================
const CameraController = ({ 
  isTopView, 
  targetItem, 
  onWarpComplete 
}: { 
  isTopView: boolean, 
  targetItem: GalaxyItem | null,
  onWarpComplete: () => void
}) => {
  const { camera, controls } = useThree();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const lastMode = useRef(isTopView);
  const warpStartTime = useRef(0);
  const startPos = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3());

  useEffect(() => {
    if (lastMode.current !== isTopView) {
      setHasInteracted(false);
      lastMode.current = isTopView;
    }
  }, [isTopView]);

  useEffect(() => {
    if (targetItem && targetItem.position) {
      setIsWarping(true);
      setHasInteracted(true);
      warpStartTime.current = performance.now();
      startPos.current.copy(camera.position);
      
      const direction = new THREE.Vector3().subVectors(camera.position, new THREE.Vector3(...targetItem.position)).normalize();
      targetPos.current.set(
        targetItem.position[0] + direction.x * 10,
        targetItem.position[1] + direction.y * 10,
        targetItem.position[2] + direction.z * 10
      );
    } else {
      setIsWarping(false);
    }
  }, [targetItem, camera.position]);

  useEffect(() => {
    const ctrl = controls as any;
    if (!ctrl) return;
    const onStart = () => {
      if (!isWarping) setHasInteracted(true);
    };
    ctrl.addEventListener('start', onStart);
    return () => ctrl.removeEventListener('start', onStart);
  }, [controls, isWarping]);

  useFrame(() => {
    const t = performance.now();

    if (isWarping && targetItem) {
      const elapsed = (t - warpStartTime.current) / 1000;
      const duration = 1.5;
      const p = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - p, 5);
      
      camera.position.lerpVectors(startPos.current, targetPos.current, ease);
      camera.lookAt(new THREE.Vector3(...targetItem.position));
      
      const fovStretch = Math.sin(p * Math.PI) * 8;
      camera.fov = 55 + fovStretch;
      camera.updateProjectionMatrix();

      if (p >= 1) {
        setIsWarping(false);
        onWarpComplete();
      }
      return;
    }

    if (!hasInteracted) {
      const targetPosition = isTopView ? new THREE.Vector3(0, 400, 0) : new THREE.Vector3(0, 0, 45);
      const targetFov = isTopView ? 15 : 55;
      
      if (camera.position.distanceTo(targetPosition) > 0.1) {
        camera.position.lerp(targetPosition, 0.05);
      }

      if (Math.abs(camera.fov - targetFov) > 0.1) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.05);
        camera.updateProjectionMatrix();
      }
      
      if (isTopView) {
        camera.lookAt(0, 0, 0);
      }
    }
  });

  return null;
};

// ==========================================
// 🌌 主场景容器 (Galaxy Scene Container)
// ==========================================
const GalaxyScene = memo(({ data, onItemClick, onModalClose, isModalOpen }: { 
  data: GalaxyItem[], 
  onItemClick: (item: GalaxyItem) => void, 
  onModalClose?: () => void,
  isModalOpen: boolean 
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [universeMode, setUniverseMode] = useState<'fast' | 'slow'>('fast');
  const [warpTarget, setWarpTarget] = useState<GalaxyItem | null>(null);
  const [isTopView, setIsTopView] = useState(false);

  // 处理点击事件：先触发跳跃
  const handleItemClick = useCallback((item: GalaxyItem) => {
    setWarpTarget(item);
  }, []);

  // 跳跃完成后的回调：通知父组件打开弹窗
  const handleWarpComplete = useCallback(() => {
    if (warpTarget) {
      onItemClick(warpTarget);
      setWarpTarget(null);
    }
  }, [warpTarget, onItemClick]);

  // 慢宇宙状态管理
  const [slowUniverseFocused, setSlowUniverseFocused] = useState(false);
  const resetSlowUniverseViewRef = useRef<(() => void) | null>(null);

  const handleSlowUniverseFocusChange = useCallback((focused: boolean) => {
    setSlowUniverseFocused(focused);
  }, []);

  const handleResetSlowUniverseView = useCallback(() => {
    if (resetSlowUniverseViewRef.current) {
      resetSlowUniverseViewRef.current();
    }
  }, []);

  return (
    <div className="w-full h-full relative bg-[#050508]">
      <Canvas dpr={[1, 2]} shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 45]} fov={55} />
        <CameraController 
          isTopView={isTopView} 
          targetItem={warpTarget} 
          onWarpComplete={handleWarpComplete} 
        />
        
        <group key={universeMode}>
          {universeMode === 'fast' ? (
            <FastUniverse data={data} onItemClick={handleItemClick} setIsHovering={setIsHovering} />
          ) : (
            <SlowUniverse 
              data={data} 
              onItemClick={handleItemClick} 
              setIsHovering={setIsHovering}
              onFocusChange={handleSlowUniverseFocusChange}
              onRegisterReset={(resetFn: () => void) => { resetSlowUniverseViewRef.current = resetFn; }}
              isTopView={isTopView}
            />
          )}
        </group>
        
        <Suspense fallback={null}>
          <EffectComposer disableNormalPass multisampling={4}>
            <Bloom luminanceThreshold={0.8} intensity={2.0} radius={0.7} mipmapBlur />
            <ChromaticAberration 
              offset={warpTarget ? new THREE.Vector2(0.015, 0.015) : new THREE.Vector2(0.001, 0.001)} 
              radialModulation={true} 
              modulationOffset={0.4} 
            />
            <Noise opacity={0.08} />
            <Vignette eskil={false} offset={0.3} darkness={0.8} /> 
          </EffectComposer>
        </Suspense>

        <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true} 
            minDistance={5} 
            maxDistance={800} 
            autoRotate={!isHovering && !isModalOpen && !isTopView && !warpTarget} 
            autoRotateSpeed={universeMode === 'fast' ? 0.2 : 0.1}
            makeDefault
        />
      </Canvas>

      {universeMode === 'slow' && (
        <SlowUniverseHUD 
          data={data} 
          isVisible={!isModalOpen} 
          isTopView={isTopView}
          onToggleTopView={() => setIsTopView(!isTopView)}
          isFocused={slowUniverseFocused}
          onResetView={handleResetSlowUniverseView}
        />
      )}

      {universeMode === 'fast' && (
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono tracking-widest pointer-events-none text-center transition-opacity duration-500 ${isModalOpen ? 'opacity-0' : 'opacity-100'}`}>
          <p>SYSTEM: CHAOS ENGINE ACTIVE</p>
          <p className="mt-2 text-[10px] opacity-50">SCANNING FOR COGNITIVE PATTERNS...</p>
        </div>
      )}

      <div className={`absolute top-8 right-8 z-40 transition-opacity duration-500 ${isModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
