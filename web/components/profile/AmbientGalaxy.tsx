'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function GalaxyParticles({ count = 2000 }) {
  const points = useRef<THREE.Points>(null!);

  // ✨ 生成螺旋星系粒子
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorInside = new THREE.Color('#4ade80'); // 绿色核心 (Matrix Green)
    const colorOutside = new THREE.Color('#60a5fa'); // 蓝色边缘 (更亮)

    for (let i = 0; i < count; i++) {
      // 螺旋算法
      const radius = Math.random() * 15 + 2; // 半径 2-17
      const spinAngle = radius * 0.8; // 螺旋紧一度
      const branchAngle = (i % 3) * ((2 * Math.PI) / 3); // 3条悬臂

      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;

      const x = Math.cos(branchAngle + spinAngle) * radius + randomX;
      const y = (Math.random() - 0.5) * (radius * 0.2) + randomY; // 扁平状，但稍微有点厚度
      const z = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // 颜色混合
      const mixedColor = colorInside.clone().lerp(colorOutside, radius / 20);
      
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // 1. 整体旋转
    points.current.rotation.y = time * 0.05;
    
    // 2. 缓慢起伏 (游动感)
    points.current.rotation.z = Math.sin(time * 0.1) * 0.1;
    points.current.position.y = Math.sin(time * 0.2) * 0.5;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.positions.length / 3}
          array={particlesPosition.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particlesPosition.colors.length / 3}
          array={particlesPosition.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2} // 增大粒子尺寸
        vertexColors
        transparent
        opacity={0.8} // 提高不透明度
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function AmbientGalaxy() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
       <Canvas camera={{ position: [0, 10, 15], fov: 45 }} gl={{ alpha: true }}>
          {/* 使用 fog 制造深邃感，但不设背景色，让 CSS 控制背景 */}
          <fog attach="fog" args={['#050505', 5, 30]} />
          <GalaxyParticles />
       </Canvas>
       
       {/* 底部渐变遮罩，让文字区域更清晰 */}
       <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
    </div>
  );
}

