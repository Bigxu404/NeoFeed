'use client'

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ✨ 架构师之墙：无限延伸的弧形数据屏幕
function ScreenWall({ count = 1000 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);

  // 生成布局数据
  const { positions, rotations, scales } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const rotations = new Float32Array(count * 3);
    const scales = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // 布局逻辑：圆柱体内壁分布
      const radius = 20 + Math.random() * 5; // 墙壁半径
      const theta = Math.random() * Math.PI * 2; // 环绕角度
      const y = (Math.random() - 0.5) * 60; // 高度范围

      // 极坐标转笛卡尔坐标
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;

      // 旋转：让屏幕朝向中心
      const lookAtCenter = Math.atan2(positions[i * 3], positions[i * 3 + 2]);
      rotations[i * 3] = 0;
      rotations[i * 3 + 1] = lookAtCenter + Math.PI; // +PI 因为 PlaneGeometry 默认朝向 Z+
      rotations[i * 3 + 2] = 0;

      // 随机大小 (屏幕尺寸)
      const w = 1.5 + Math.random();
      const h = 1 + Math.random() * 0.5;
      scales[i * 3] = w;
      scales[i * 3 + 1] = h;
      scales[i * 3 + 2] = 1;
    }
    return { positions, rotations, scales };
  }, [count]);

  // 初始化 Instance
  useEffect(() => {
    const tempObject = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      tempObject.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      tempObject.rotation.set(rotations[i * 3], rotations[i * 3 + 1], rotations[i * 3 + 2]);
      tempObject.scale.set(scales[i * 3], scales[i * 3 + 1], scales[i * 3 + 2]);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, positions, rotations, scales]);

  // 动画循环
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // 1. 整体缓慢旋转 (仿佛置身于旋转的监控室)
    meshRef.current.rotation.y = time * 0.02;

    // 2. 呼吸灯光
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(time * 2) * 1;
    }

    // TODO: 如果想做更复杂的每个屏幕独立闪烁，需要用 ShaderMaterial
    // 这里为了性能和实现速度，先用标准材质配合光照闪烁
  });

  return (
    <group>
       {/* 屏幕墙主体 */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <planeGeometry args={[1, 0.8]} />
        <meshStandardMaterial 
           color="#1a1a1a" 
           emissive="#4ade80" // 绿色荧光
           emissiveIntensity={0.15} // 恢复亮度 (0.05 -> 0.15)
           transparent
           opacity={0.8} // 恢复不透明度 (0.4 -> 0.8)
           side={THREE.DoubleSide}
           metalness={0.8}
           roughness={0.2}
        />
      </instancedMesh>
      
      {/* 随机闪烁的屏幕 (通过另一个较少的 InstancedMesh 模拟高亮屏幕) */}
      <ActiveScreens basePositions={positions} baseRotations={rotations} count={40} /> {/* 增加闪烁数量 */}

      {/* 中心光源 (The Source) */}
      <pointLight ref={lightRef} position={[0, 0, 0]} color="#ffffff" distance={50} decay={2} intensity={0.8} /> {/* 恢复光源强度 */}
    </group>
  );
}

// ✨ 活跃屏幕层：模拟部分屏幕突然变亮变白
function ActiveScreens({ basePositions, baseRotations, count }: { basePositions: Float32Array, baseRotations: Float32Array, count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const activeIndices = useMemo(() => {
      return Array.from({length: count}, () => Math.floor(Math.random() * 1000)); // 随机挑一些屏幕
  }, [count]);

  useFrame((state) => {
     const time = state.clock.getElapsedTime();
     meshRef.current.rotation.y = time * 0.02; // 同步旋转

     // 随机闪烁逻辑：每隔一段时间重置颜色/亮度
     // 这里简单模拟：让它们一直很亮
  });

  useEffect(() => {
    const tempObject = new THREE.Object3D();
    activeIndices.forEach((idx, i) => {
       const x = basePositions[idx * 3];
       const y = basePositions[idx * 3 + 1];
       const z = basePositions[idx * 3 + 2];
       
       const rx = baseRotations[idx * 3];
       const ry = baseRotations[idx * 3 + 1];
       const rz = baseRotations[idx * 3 + 2];

       // 稍微放大一点覆盖住底下的屏幕
       tempObject.position.set(x, y, z);
       tempObject.rotation.set(rx, ry, rz);
       tempObject.scale.set(2, 1.5, 1); 
       tempObject.updateMatrix();
       meshRef.current.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [activeIndices, basePositions, baseRotations]);

  return (
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <planeGeometry args={[1, 0.8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} /> {/* 恢复高亮屏幕不透明度 */}
      </instancedMesh>
  )
}

export default function TheArchitectWall() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
       <Canvas camera={{ position: [0, 0, 0], fov: 60 }} gl={{ alpha: true }}>
          {/* 雾气遮挡远处，营造深邃感 */}
          <fog attach="fog" args={['#050505', 15, 35]} /> {/* 恢复雾气距离 */}
          
          <ScreenWall count={800} />
       </Canvas>
       
       {/* 视觉遮罩：上下渐变黑，中间透出 */}
       <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] opacity-80" /> {/* 降低遮罩不透明度 */}
       <div className="absolute inset-0 bg-[#050505]/20" /> {/* 降低整体压暗 */}
    </div>
  );
}

