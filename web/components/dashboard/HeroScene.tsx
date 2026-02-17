'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Float, Environment, Edges, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// 📦 神秘盒子组件
function MysteryBox() {
  // 外壳：深空灰 (提亮，增强反光，防止融入背景)
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: '#404040', // 提亮到中深灰，与纯黑背景拉开反差
    roughness: 0.1,   // 极度光滑，增强环境反射
    metalness: 0.8,   // 高金属感，反射光粒子
    envMapIntensity: 2, // 增强环境光反射
  });

  // 内部：发光的金色核心
  const innerMaterial = new THREE.MeshStandardMaterial({
    color: '#ffcc00', 
    roughness: 0.2,
    metalness: 0.8,
    emissive: '#ffaa00',
    emissiveIntensity: 0.8, 
  });

  // 边缘高光颜色 (纯白，极细)
  const edgeColor = "#ffffff"; 

  // 盒子尺寸
  const size = 2.5;
  const thickness = 0.05; // 变薄，像参考图的纸板/薄金属
  const halfSize = size / 2;
  const flapHeight = 1.2; 

  return (
    <group>
      {/* 底部 (发光核心) */}
      <mesh position={[0, -halfSize, 0]} material={innerMaterial}>
        <boxGeometry args={[size - 0.1, thickness, size - 0.1]} />
      </mesh>
      
      {/* 四壁 */}
      <mesh position={[0, 0, halfSize]} material={boxMaterial}>
        <boxGeometry args={[size, size, thickness]} />
        <Edges threshold={15} color={edgeColor} opacity={0.8} transparent lineWidth={2} />
      </mesh>
      <mesh position={[0, 0, -halfSize]} material={boxMaterial}>
        <boxGeometry args={[size, size, thickness]} />
        <Edges threshold={15} color={edgeColor} opacity={0.8} transparent lineWidth={2} />
      </mesh>
      <mesh position={[-halfSize, 0, 0]} material={boxMaterial}>
        <boxGeometry args={[thickness, size, size]} />
        <Edges threshold={15} color={edgeColor} opacity={0.8} transparent lineWidth={2} />
      </mesh>
      <mesh position={[halfSize, 0, 0]} material={boxMaterial}>
        <boxGeometry args={[thickness, size, size]} />
        <Edges threshold={15} color={edgeColor} opacity={0.8} transparent lineWidth={2} />
      </mesh>

      {/* 开启的盖子 - 角度调整为约 60 度，更开阔 */}
      
      {/* 前盖 */}
      <group position={[0, halfSize, halfSize]} rotation={[Math.PI / 3, 0, 0]}>
        <mesh position={[0, flapHeight / 2, 0]} material={boxMaterial}>
           <boxGeometry args={[size, flapHeight, thickness]} />
           <Edges threshold={15} color={edgeColor} opacity={0.8} transparent lineWidth={2} />
        </mesh>
      </group>
      
      {/* 后盖 */}
      <group position={[0, halfSize, -halfSize]} rotation={[-Math.PI / 3, 0, 0]}>
        <mesh position={[0, flapHeight / 2, 0]} material={boxMaterial}>
           <boxGeometry args={[size, flapHeight, thickness]} />
           <Edges threshold={15} color={edgeColor} opacity={0.8} transparent lineWidth={2} />
        </mesh>
      </group>
      
      {/* 左盖 */}
      <group position={[-halfSize, halfSize, 0]} rotation={[0, 0, Math.PI / 3]}>
        <mesh position={[0, flapHeight / 2, 0]} material={boxMaterial}>
           <boxGeometry args={[thickness, flapHeight, size]} />
           <Edges threshold={15} color={edgeColor} opacity={0.8} transparent lineWidth={2} />
        </mesh>
      </group>
      
      {/* 右盖 */}
      <group position={[halfSize, halfSize, 0]} rotation={[0, 0, -Math.PI / 3]}>
        <mesh position={[0, flapHeight / 2, 0]} material={boxMaterial}>
           <boxGeometry args={[thickness, flapHeight, size]} />
           <Edges threshold={15} color={edgeColor} opacity={0.8} transparent lineWidth={2} />
        </mesh>
      </group>
    </group>
  );
}

// ✨ 光粒子流组件
function ParticleStream() {
  return (
    <group position={[0, 0, 0]}>
      {/* 核心高密度粒子束：模拟光柱主体 */}
      <Sparkles 
        count={200}
        scale={[1.2, 10, 1.2]} // 细长柱状
        size={4}
        speed={0.8} // 快速上升
        opacity={0.8}
        color="#ffaa44" // 金橙色
        position={[0, 3, 0]} // 向上偏移，从盒子底部升起
      />
      
      {/* 外围漂浮粒子：模拟溢出的能量尘埃 */}
      <Sparkles 
        count={100}
        scale={[3, 12, 3]} // 宽阔范围
        size={6}
        speed={0.4} // 缓慢飘动
        opacity={0.4}
        color="#ffdd88" // 淡金色
        position={[0, 4, 0]}
        noise={0.5} // 增加随机扰动
      />
      
      {/* 底部辉光：柔和的光晕，不遮挡内部 */}
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 1.8]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.2} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  // 背景色：纯黑
  const bgColor = '#000000';

  return (
    <div className="absolute inset-0 z-0">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 4, 8], fov: 40 }}> {/* 调高相机位置，俯视视角 */}
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 5, 30]} />

        {/* 灯光系统 */}
        <ambientLight intensity={0.5} /> {/* 增强环境光，照亮暗部 */}
        {/* 内部主光源：金橙色 */}
        <pointLight position={[0, -1, 0]} intensity={5} color="#ffaa00" distance={10} decay={2} />
        
        {/* 顶部主光：强白光，照亮盒子顶部 */}
        <directionalLight position={[2, 8, 5]} intensity={2.0} color="#ffffff" />
        {/* 侧面补光：冷色，勾勒左侧轮廓 */}
        <spotLight position={[-5, 2, 5]} intensity={3.0} color="#ccccff" angle={0.6} penumbra={1} />
        {/* 背面轮廓光 (Rim Light)：关键！从背后打光，将深色物体从黑色背景中分离出来 */}
        <spotLight position={[0, 5, -5]} intensity={5.0} color="#ffffff" angle={0.5} penumbra={1} />

        <Float speed={1.0} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[-0.1, 0.1]}>
          {/* 调整整体角度，匹配参考图透视 */}
          <group position={[-2.5, -1.5, 0]} rotation={[0.2, 0.6, 0]}>
            <MysteryBox />
            <ParticleStream />
          </group>
        </Float>
      </Canvas>
      
      {/* 遮罩：左侧透明，右侧渐变黑，底部渐变 */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/50 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
