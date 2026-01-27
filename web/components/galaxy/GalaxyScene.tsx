'use client'

import { useState, useRef, useMemo, memo, Suspense, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GalaxyItem } from '@/types';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import FastUniverse from './FastUniverse';
import SlowUniverse from './SlowUniverse';
import DualPaneModal from '../dashboard/DualPaneModal';
import SlowUniverseHUD from '../dashboard/SlowUniverseHUD';
import { toast } from 'sonner';

// ==========================================
// 🎥 相机控制组件 (Camera Controller)
// 包含模式切换对焦与空间跳跃动效
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

  // 监听模式切换
  useEffect(() => {
    if (lastMode.current !== isTopView) {
      setHasInteracted(false);
      lastMode.current = isTopView;
    }
  }, [isTopView]);

  // 监听目标星球点击 (空间跳跃)
  useEffect(() => {
    if (targetItem && targetItem.position) {
      setIsWarping(true);
      setHasInteracted(true); // 跳跃时接管控制
      warpStartTime.current = performance.now();
      startPos.current.copy(camera.position);
      
      // 计算跳跃目标点：在星球前方一定距离
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

  // 监听用户交互
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

    // 1. 空间跳跃逻辑 (Warp Speed)
    if (isWarping && targetItem) {
      const elapsed = (t - warpStartTime.current) / 1000;
      const duration = 1.2; // 跳跃持续时间
      const p = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数实现“先蓄力再冲刺”的感觉
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      
      camera.position.lerpVectors(startPos.current, targetPos.current, ease);
      camera.lookAt(new THREE.Vector3(...targetItem.position));
      
      // 动态调整 FOV 产生拉伸感
      const fovStretch = Math.sin(p * Math.PI) * 30;
      camera.fov = 55 + fovStretch;
      camera.updateProjectionMatrix();

      if (p >= 1) {
        setIsWarping(false);
        onWarpComplete();
      }
      return;
    }

    // 2. 模式切换自动对焦逻辑
    if (!hasInteracted) {
      const targetPosition = isTopView ? new THREE.Vector3(0, 150, 0) : new THREE.Vector3(0, 0, 45);
      const targetFov = isTopView ? 40 : 55;
      
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
const GalaxyScene = memo(({ data, onItemClick }: { data: GalaxyItem[], onItemClick: (item: GalaxyItem) => void }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [universeMode, setUniverseMode] = useState<'fast' | 'slow'>('fast');
  
  // 弹窗与跳跃状态
  const [selectedItem, setSelectedItem] = useState<GalaxyItem | null>(null);
  const [warpTarget, setWarpTarget] = useState<GalaxyItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTopView, setIsTopView] = useState(false);

  // 处理点击事件：先触发跳跃，再打开弹窗
  const handleItemClick = useCallback((item: GalaxyItem) => {
    setWarpTarget(item);
    // 暂时不打开弹窗，等待跳跃完成
  }, []);

  // 跳跃完成后的回调
  const handleWarpComplete = useCallback(() => {
    if (warpTarget) {
      setSelectedItem(warpTarget);
      setIsModalOpen(true);
      onItemClick(warpTarget);
      setWarpTarget(null); // 清除跳跃目标
    }
  }, [warpTarget, onItemClick]);

  // 处理结晶（保存）事件
  const handleCrystallize = useCallback((note: string, tags: string[], weight: number) => {
    toast.success(`已成功存入 [${tags[0] || '未分类'}] 星系`, {
      description: '知识晶体已生成，正在同步至慢思考宇宙。',
      duration: 3000,
    });
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
        
        {/* 渲染对应的宇宙模式 */}
        <group key={universeMode}>
          {universeMode === 'fast' ? (
            <FastUniverse 
              data={data} 
              onItemClick={handleItemClick} 
              setIsHovering={setIsHovering} 
            />
          ) : (
            <SlowUniverse 
              data={data} 
              onItemClick={handleItemClick} 
              setIsHovering={setIsHovering} 
            />
          )}
        </group>
        
        {/* 通用后期处理 */}
        <Suspense fallback={null}>
          <EffectComposer disableNormalPass multisampling={4}>
            <Bloom 
              luminanceThreshold={1.0} // 只有非常亮的部分才会发光，避免背景发灰
              intensity={1.5} 
              radius={0.6} 
              mipmapBlur 
            />
            {/* 跳跃时增加色差效果 */}
            <ChromaticAberration 
              offset={warpTarget ? new THREE.Vector2(0.01, 0.01) : new THREE.Vector2(0.002, 0.002)} 
              radialModulation={true} 
              modulationOffset={0.5} 
            />
            {universeMode === 'fast' && <Noise opacity={0.1} />}
            <Vignette eskil={false} offset={0.2} darkness={0.6} /> 
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

      {/* 双栏详情弹窗 */}
      <DualPaneModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        onCrystallize={handleCrystallize}
      />

      {/* HUD 界面 */}
      {universeMode === 'slow' && (
        <SlowUniverseHUD 
          data={data} 
          isVisible={!isModalOpen} 
          isTopView={isTopView}
          onToggleTopView={() => setIsTopView(!isTopView)}
        />
      )}

      {/* 快宇宙 HUD */}
      {universeMode === 'fast' && (
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono tracking-widest pointer-events-none text-center transition-opacity duration-500 ${isModalOpen ? 'opacity-0' : 'opacity-100'}`}>
          <p>SYSTEM: CHAOS ENGINE ACTIVE</p>
          <p className="mt-2 text-[10px] opacity-50">SCANNING FOR COGNITIVE PATTERNS...</p>
        </div>
      )}

      {/* 宇宙切换开关 */}
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
