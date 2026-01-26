import { useState, useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { GalaxyItem } from '@/types';
import './GalaxyShaders'; // 确保材质已注册

// ==========================================
// 💎 组件: 涌动碎片 (Surging Shard)
// ==========================================
const Shard = ({ item, onClick, onHover }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [hovered, setHover] = useState(false);

  // 初始随机参数
  const randomOffset = useMemo(() => Math.random() * 1000, []);
  const randomSpeed = useMemo(() => 0.2 + Math.random() * 0.4, []);
  const surgePhase = useMemo(() => Math.random() * Math.PI * 2, []);
  
  // 非均匀缩放：制造尖锐的碎片感
  const scale = useMemo(() => {
    const s = item.size || 1;
    return [
      s * (0.6 + Math.random() * 0.4), 
      s * (0.6 + Math.random() * 1.5), // 随机拉长
      s * (0.6 + Math.random() * 0.4)
    ] as [number, number, number];
  }, [item.size]);

  // 颜色映射
  const coreColor = useMemo(() => {
    switch (item.category) {
      case 'tech': return new THREE.Color('#00f2ea'); 
      case 'life': return new THREE.Color('#ff0050'); 
      case 'idea': return new THREE.Color('#ffd700'); 
      default: return new THREE.Color('#ffffff');
    }
  }, [item.category]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (meshRef.current) {
      // 🌊 复杂涌动逻辑 (Chaotic Surge)
      const p = item.position; 
      
      // 多重正弦波叠加，模拟湍流
      const driftX = Math.sin(t * randomSpeed * 0.5 + surgePhase) * 2.0;
      const driftY = Math.cos(t * randomSpeed * 0.3 + surgePhase * 1.5) * 2.0;
      const driftZ = Math.sin(t * randomSpeed * 0.4 + surgePhase * 0.5) * 2.0;
      
      // 高频抖动
      const jitter = Math.sin(t * 2.0 + randomOffset) * 0.05;

      meshRef.current.position.x = p[0] + driftX + jitter;
      meshRef.current.position.y = p[1] + driftY + jitter;
      meshRef.current.position.z = p[2] + driftZ + jitter;

      // 复杂的翻滚旋转
      meshRef.current.rotation.x = t * randomSpeed * 0.5 + randomOffset;
      meshRef.current.rotation.y = t * randomSpeed * 0.3 + randomOffset;
    }
    
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = t;
      materialRef.current.uniforms.hoverState.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.hoverState.value,
        hovered ? 1 : 0,
        0.1
      );
    }
  });

  return (
    <mesh 
      ref={meshRef}
      scale={scale} 
      onClick={(e) => { e.stopPropagation(); onClick(item); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); onHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHover(false); onHover(false); document.body.style.cursor = 'auto'; }}
    >
      <dodecahedronGeometry args={[1, 0]} /> 
      <oreMaterial 
        ref={materialRef} 
        colorCore={coreColor}
        transparent
      />
    </mesh>
  );
};

// ==========================================
// 🏛️ 组件: 远古造物 (Alien Artifacts)
// ==========================================
function Artifacts() {
  return (
    <group>
       {/* 1. 破碎环 (The Broken Ring) */}
       <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.5} position={[30, -15, -40]}>
         <mesh rotation={[Math.PI/3, 0, Math.PI/4]}>
           <torusGeometry args={[12, 0.8, 4, 32, Math.PI * 1.6]} />
           <meshStandardMaterial color="#050505" roughness={0.2} metalness={0.8} emissive="#111" />
         </mesh>
         {/* 伴生碎片 */}
         <mesh position={[8, 5, 0]} rotation={[0,0,1]}>
            <dodecahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial color="#050505" roughness={0.2} metalness={0.8} />
         </mesh>
       </Float>

       {/* 2. 沉默方碑 (The Monolith) */}
       <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.2} position={[-25, 20, -50]}>
         <mesh rotation={[0.2, 0.5, 0]}>
           <boxGeometry args={[4, 16, 4]} />
           <meshStandardMaterial color="#080808" roughness={0.9} />
           {/* 微光裂缝 */}
           <mesh scale={[1.01, 0.95, 0.05]} position={[0,0,2]}>
              <planeGeometry />
              <meshBasicMaterial color="#ff0050" transparent opacity={0.1} side={THREE.DoubleSide} />
           </mesh>
         </mesh>
       </Float>

       {/* 3. 几何星团 (The Geometric Cluster) */}
       <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1} position={[0, -30, -20]}>
         <group rotation={[0, 0, Math.PI/6]}>
            <mesh position={[0,0,0]}>
                <octahedronGeometry args={[5, 0]} />
                <meshStandardMaterial color="#0a0a0a" wireframe />
            </mesh>
            <mesh position={[0,0,0]}>
                <octahedronGeometry args={[3, 0]} />
                <meshStandardMaterial color="#000" />
          </mesh>
         </group>
       </Float>
    </group>
  )
}

// ==========================================
// 🪨 组件: 黑色陨铁 (Dark Matter Meteorites)
// ==========================================
function DarkMatter({ count = 150 }) {
  const debrisData = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      position: [
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 100
      ],
      scale: [
        Math.random() * 1.5 + 0.5, // 更大
        Math.random() * 2.0 + 0.5, 
        Math.random() * 1.5 + 0.5
      ],
      speed: Math.random() * 0.1 + 0.05,
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0]
    }));
  }, [count]);

  const meshRef = useRef<THREE.InstancedMesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    
    debrisData.forEach((data, i) => {
        const dummy = new THREE.Object3D();
        // 缓慢沉重的运动
        const yOffset = Math.sin(t * data.speed + i) * 2.0;
        
        dummy.position.set(
            data.position[0] as number,
            data.position[1] as number + yOffset,
            data.position[2] as number
        );
        dummy.scale.set(data.scale[0], data.scale[1], data.scale[2]);
        dummy.rotation.set(
            data.rotation[0] + t * data.speed * 0.1, 
            data.rotation[1] + t * data.speed * 0.05, 
            data.rotation[2]
        );
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      {/* 黑金材质：暗色金属光泽，便于反光可见 */}
      <meshStandardMaterial 
        color="#1a1a1a" 
        roughness={0.3} 
        metalness={0.8} 
      />
    </instancedMesh>
  );
}

// ==========================================
// 📄 组件: 全息数据页 (Holo Data Sheets)
// ==========================================
function HoloSheets({ count = 120 }) {
  const sheetsData = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      // 初始位置分布在左上
      position: [
        (Math.random() - 0.5) * 100 - 20, 
        (Math.random() - 0.5) * 100 + 20, 
        (Math.random() - 0.5) * 60
      ],
      scale: [
        Math.random() * 0.8 + 0.4, // 宽
        Math.random() * 1.2 + 0.6, // 高 (像纸张/屏幕)
        0.05 // 极薄
      ],
      speed: Math.random() * 0.2 + 0.1,
      rotationSpeed: Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2
    }));
  }, [count]);

  const meshRef = useRef<THREE.InstancedMesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    
    sheetsData.forEach((data, i) => {
        const dummy = new THREE.Object3D();
        
        // 🌊 流动逻辑: 左上 -> 右下
        // 基础位移
        let x = data.position[0] as number + (t * data.speed * 8.0); // 向右
        let y = data.position[1] as number - (t * data.speed * 6.0); // 向下
        let z = data.position[2] as number;

        // 循环重置 (从右下消失，回到左上)
        if (x > 80) x -= 160;
        if (y < -80) y += 160;

        // 湍流扰动
        x += Math.sin(t * 0.5 + data.phase) * 2.0;
        y += Math.cos(t * 0.3 + data.phase) * 2.0;
        z += Math.sin(t * 0.2 + data.phase) * 5.0;

        dummy.position.set(x, y, z);
        dummy.scale.set(data.scale[0], data.scale[1], data.scale[2]);
        
        // 飘落旋转 (像纸张一样翻滚)
        dummy.rotation.set(
            t * data.rotationSpeed + data.phase, 
            t * data.rotationSpeed * 0.5, 
            Math.sin(t * 0.5 + data.phase) * 0.5 // Z轴轻微摆动
        );
        
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      {/* 全息玻璃材质 */}
      <meshPhysicalMaterial 
        color="#e0f7fa" 
        transparent 
        opacity={0.3} 
        roughness={0.1}
        metalness={0.1}
        transmission={0.2} // 玻璃感
        thickness={0.5}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

// ==========================================
// 🌊 组件: 能量流 (Energy Stream Particles)
// ==========================================
function EnergyStream({ count = 800 }) {
  const points = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const [positions, sizes, speeds, offsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);
    
    for(let i=0; i<count; i++) {
        // 初始分布覆盖全场
        pos[i*3] = (Math.random() - 0.5) * 200;
        pos[i*3+1] = (Math.random() - 0.5) * 200;
        pos[i*3+2] = (Math.random() - 0.5) * 100;
        
        sizes[i] = Math.random() * 2.0 + 0.5;
        speeds[i] = Math.random() * 0.5 + 0.2;
        offsets[i] = Math.random() * 100.0;
    }
    return [pos, sizes, speeds, offsets];
  }, [count]);

  useFrame((state) => {
    if (materialRef.current) {
        materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-speed" count={count} array={speeds} itemSize={1} />
        <bufferAttribute attach="attributes-offset" count={count} array={offsets} itemSize={1} />
      </bufferGeometry>
      <directionalStreamMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ==========================================
// ☄️ 组件: 多彩流星/陨石 (Colorful Meteors)
// ==========================================
function ColorfulMeteors({ count = 100 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // 调色板: 橙色、红色、紫色、淡粉色
  const colors = useMemo(() => [
    new THREE.Color('#ff9f43').multiplyScalar(1.5), // 橙色 (增强亮度)
    new THREE.Color('#ff6b6b').multiplyScalar(1.5), // 红色
    new THREE.Color('#5f27cd').multiplyScalar(1.5), // 紫色
    new THREE.Color('#ff9ff3').multiplyScalar(1.5), // 淡粉色
    new THREE.Color('#feca57').multiplyScalar(1.5), // 亮黄
  ], []);

  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      position: [
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 100
      ],
      scale: Math.random() * 0.8 + 0.4, 
      speed: Math.random() * 0.2 + 0.1,
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      color: colors[Math.floor(Math.random() * colors.length)],
      phase: Math.random() * Math.PI * 2
    }));
  }, [count, colors]);

  useLayoutEffect(() => {
    if (meshRef.current) {
      data.forEach((d, i) => {
        meshRef.current!.setColorAt(i, d.color);
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [data]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // 更新 shader 时间
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = t;
    }

    data.forEach((d, i) => {
      const dummy = new THREE.Object3D();
      
      // 漂浮运动 + 缓慢公转
      const yOffset = Math.sin(t * d.speed + d.phase) * 5.0;
      const xOffset = Math.cos(t * d.speed * 0.5 + d.phase) * 3.0;
      
      dummy.position.set(
        d.position[0] + xOffset,
        d.position[1] + yOffset,
        d.position[2]
      );
      dummy.scale.setScalar(d.scale);
      dummy.rotation.set(
        d.rotation[0] + t * d.speed,
        d.rotation[1] + t * d.speed * 0.5,
        d.rotation[2]
      );
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 10]} /> {/* 增加细分以支持 shader 置换 */}
      <meteorMaterial ref={materialRef} transparent />
    </instancedMesh>
  );
}

// ==========================================
// 🔦 组件: 意识探照灯
// ==========================================
function Headlamp() {
  const { camera, scene } = useThree();
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(new THREE.Object3D());

  useEffect(() => {
    scene.add(targetRef.current);
    return () => { scene.remove(targetRef.current); };
  }, [scene]);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.copy(camera.position);
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      targetRef.current.position.copy(camera.position).add(dir.multiplyScalar(10));
      lightRef.current.target = targetRef.current;
    }
  });

  return (
    <spotLight
      ref={lightRef}
      intensity={10} 
      angle={0.6}
      penumbra={0.5} 
      distance={100}
      decay={2}
      color="#ffffff"
      castShadow
    />
  );
}

// ==========================================
// 🌌 场景: 破碎虚空 (The Shattered Void)
// ==========================================
export default function FastUniverse({ data, onItemClick, setIsHovering }: any) {
  const processedData = useMemo(() => {
    return data.map((item: any) => {
      // 扩大分布范围
      const r = 15 + Math.random() * 30; 
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      return {
        ...item,
        position: [x, y, z],
        size: 0.8 + Math.random() * 1.2, 
      };
    });
  }, [data]);

  return (
    <>
      {/* 1. 环境氛围 */}
      <color attach="background" args={['#050508']} />
      <fogExp2 attach="fog" args={['#050508', 0.025]} />
      
      {/* 2. 意识探照灯 */}
      <Headlamp />
      <ambientLight intensity={0.02} /> 

      {/* 3. 空间介质 (丰富度来源 - 纯NPC) */}
      <DarkMatter count={150} /> {/* 黑色陨铁 - 沉重、缓慢 */}
      <ColorfulMeteors count={100} /> {/* 多彩流星 - 活跃、点缀 */}
      <HoloSheets count={120} /> {/* 全息数据页 - 替代廉价碎片 */}
      <EnergyStream count={800} /> {/* 能量流 - 穿梭、流动 */}
      <Artifacts /> {/* 远古造物 */}

      {/* 4. 数据矿场 (Feed内容) */}
      <group>
        {processedData.map((item: any) => (
          <Shard 
            key={item.id} 
            item={item} 
            onClick={onItemClick} 
            onHover={setIsHovering}
          />
        ))}
      </group>
    </>
  );
}

