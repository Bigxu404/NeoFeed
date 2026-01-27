'use client'

import { useRef, useMemo, useState } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { Float, Html, Stars, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetShaders } from './PlanetShaders';

// 注册自定义材质
const PlanetSurfaceMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color('#60a5fa'), emissiveIntensity: 1 },
  PlanetShaders.surface.vertexShader,
  PlanetShaders.surface.fragmentShader
);

const EntanglementMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color('#ffffff') },
  PlanetShaders.entanglement.vertexShader,
  PlanetShaders.entanglement.fragmentShader
);

// ✨ 新增：极光星云材质 (Aurora Nebula)
const AuroraNebulaMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color('#ffffff') },
  // Vertex Shader
  `
    uniform float time;
    attribute float size;
    attribute float opacity;
    varying float vOpacity;
    varying vec3 vColor;
    uniform vec3 color;

    void main() {
      vOpacity = opacity;
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      
      // 更加细腻的呼吸感
      float breathe = 1.0 + sin(time * 1.0 + position.x * 0.5) * 0.2;
      
      // 减小粒子尺寸，增加细腻度
      gl_PointSize = size * (150.0 / -mvPosition.z) * breathe;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  `
    uniform vec3 color;
    varying float vOpacity;
    
    void main() {
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float ll = length(xy);
      if(ll > 0.5) discard;
      
      // 更柔和的衰减
      float alpha = pow(1.0 - ll * 2.0, 2.0) * vOpacity;
      
      gl_FragColor = vec4(color, alpha * 0.8); // 提高不透明度，让星云更清晰可见
    }
  `
);

extend({ PlanetSurfaceMaterial, EntanglementMaterial, AuroraNebulaMaterial });

// ==========================================
// 🌌 组件: 星系极光 (Galaxy Aurora)
// 不规则、纤细、拟真的星云带
// ==========================================
const GalaxyAurora = ({ position, color }: { position: [number, number, number], color: string }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<any>(null);

  // 生成不规则星云数据
  const { positions, sizes, opacities } = useMemo(() => {
    const particleCount = 1200; // 增加数量以弥补尺寸变小
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);

    const radiusBase = 35; 

    for (let i = 0; i < particleCount; i++) {
      // 1. 角度分布：完全随机
      const angle = Math.random() * Math.PI * 2;
      
      // 2. 拟真干扰 (Noise Simulation)
      // 使用多重正弦波模拟云气的自然扭曲
      const radiusNoise = Math.sin(angle * 3) * 5 + Math.cos(angle * 5 + 2) * 3 + Math.sin(angle * 10) * 1.5;
      const radius = radiusBase + radiusNoise + (Math.random() - 0.5) * 4; // 基础半径 + 波动 + 随机散射
      
      // 3. 垂直高度 (Y轴)
      // 极光/银河带通常比较扁平，但有波浪起伏
      const verticalWave = Math.sin(angle * 2) * 2 + Math.cos(angle * 5) * 1;
      const y = verticalWave + (Math.random() - 0.5) * 2; // 保持纤细

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // 4. 大小与透明度变化
      // 越靠近波峰的地方可能越亮
      sizes[i] = Math.random() * 2 + 1; // 粒子更小，像尘埃
      opacities[i] = 0.4 + Math.random() * 0.6; // 随机透明度，增加层次
    }

    return { positions, sizes, opacities };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
    }
    if (pointsRef.current) {
      // 极慢速旋转，像真实的星系
      pointsRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-opacity"
          count={opacities.length}
          array={opacities}
          itemSize={1}
        />
      </bufferGeometry>
      {/* @ts-ignore */}
      <auroraNebulaMaterial
        ref={materialRef}
        color={new THREE.Color(color)}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// ==========================================
// 🕸️ 组件: 量子纠缠纽带 (Quantum Entanglement Line)
// ==========================================
const EntanglementLine = ({ start, end, color }: { start: THREE.Vector3, end: THREE.Vector3, color: string }) => {
  const lineRef = useRef<any>(null);
  
  const curve = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y += 2; // 增加一点向上的弧度
    return new THREE.CatmullRomCurve3([start, mid, end]);
  }, [start, end]);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.time = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <tubeGeometry args={[curve, 20, 0.02, 8, false]} />
      {/* @ts-ignore */}
      <entanglementMaterial 
        ref={lineRef} 
        color={new THREE.Color(color)} 
        transparent 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

// ==========================================
// ✨ 组件: 拟真星球 (Realistic Planet)
// ==========================================
const KnowledgeStar = ({ item, centerPos, color, onClick, onHover }: any) => {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<any>(null);
  const [hovered, setHover] = useState(false);

  const { orbitRadius, orbitSpeed, orbitOffset, starSize, rotationSpeed, tilt } = useMemo(() => ({
    orbitRadius: 15 + Math.random() * 25 + (item.weight || 1.0) * 4,
    orbitSpeed: 0.03 + Math.random() * 0.05,
    orbitOffset: Math.random() * Math.PI * 2,
    starSize: 1.5 + (item.weight || 1.0) * 0.4,
    rotationSpeed: 0.005 + Math.random() * 0.01,
    tilt: Math.random() * 0.5
  }), [item.weight]);

  const currentPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      const angle = t * orbitSpeed + orbitOffset;
      const x = Math.cos(angle) * orbitRadius;
      const z = Math.sin(angle) * orbitRadius;
      const y = Math.sin(angle * 0.5) * (orbitRadius * 0.2);
      
      meshRef.current.position.set(x, y, z);
      meshRef.current.rotation.y += rotationSpeed;
      
      // 更新当前位置供连线使用
      currentPos.set(x + centerPos[0], y + centerPos[1], z + centerPos[2]);
    }
    if (materialRef.current) {
      materialRef.current.time = t;
    }
  });

  return (
    <group position={centerPos}>
      <group ref={meshRef}>
        <group
          onClick={(e) => { e.stopPropagation(); onClick(item); }}
          onPointerOver={(e) => { e.stopPropagation(); setHover(true); onHover(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHover(false); onHover(false); document.body.style.cursor = 'auto'; }}
        >
          <mesh rotation={[tilt, 0, 0]}>
            <sphereGeometry args={[starSize, 64, 64]} />
            {/* @ts-ignore */}
            <planetSurfaceMaterial 
              ref={materialRef}
              color={new THREE.Color(color)}
              emissiveIntensity={hovered ? 2.0 : 1.0}
              transparent
            />
          </mesh>
          
          <mesh scale={[1.05, 1.05, 1.05]}>
            <sphereGeometry args={[starSize, 64, 64]} />
            <meshStandardMaterial 
              color={color}
              transparent
              opacity={0.15}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>

          {hovered && (
            <Html position={[0, starSize + 1, 0]} center>
              <div className="bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 rounded text-[10px] font-mono text-white/90 whitespace-nowrap">
                {item.summary?.slice(0, 20)}...
              </div>
            </Html>
          )}
        </group>
      </group>
      {/* 渲染连线：星球到核心的能量纽带 */}
      <EntanglementLine 
        start={new THREE.Vector3(0, 0, 0)} 
        end={meshRef.current?.position || new THREE.Vector3(0, 0, 0)} 
        color={color} 
      />
    </group>
  );
};

// ==========================================
// 🌀 组件: 星系核心 (Galaxy Core)
// ==========================================
const GalaxyCore = ({ position, color, label }: any) => {
  const coreRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (coreRef.current) coreRef.current.rotation.y += 0.01;
  });

  return (
    <group position={position}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={10} toneMapped={false} />
        <pointLight color={color} intensity={20} distance={100} decay={2} />
      </mesh>
      <Html position={[0, 4, 0]} center distanceFactor={25}>
        <div className="flex flex-col items-center pointer-events-none select-none">
          <div className="text-white/80 font-serif text-sm tracking-[0.4em] uppercase mb-1" style={{ textShadow: `0 0 15px ${color}` }}>
            {label}
          </div>
        </div>
      </Html>
    </group>
  );
};

// ==========================================
// ☄️ 组件: 动态星云 (Nebula Clouds) - 背景装饰
// ==========================================
const NebulaClouds = () => {
  const clouds = useMemo(() => {
    return new Array(5).fill(0).map((_, i) => ({
      position: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 200] as [number, number, number],
      scale: 50 + Math.random() * 50,
      color: ['#4338ca', '#581c87', '#1e3a8a'][i % 3],
      speed: 0.01 + Math.random() * 0.02
    }));
  }, []);

  return (
    <group>
      {clouds.map((c, i) => (
        <Float key={i} speed={c.speed * 100} rotationIntensity={0.5} floatIntensity={0.5} position={c.position}>
          <mesh scale={[c.scale, c.scale * 0.5, c.scale]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial 
              color={c.color} 
              transparent 
              opacity={0.05} 
              depthWrite={false} 
              blending={THREE.AdditiveBlending} 
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

// ==========================================
// 🛰️ 组件: 小型空间站 (NPC Station)
// ==========================================
const SpaceStation = ({ position }: any) => (
  <Float position={position} speed={1.5}>
    <mesh>
      <cylinderGeometry args={[0.5, 0.5, 3, 8]} />
      <meshStandardMaterial color="#888" metalness={0.9} />
    </mesh>
    <mesh position={[2, 0, 0]}>
      <boxGeometry args={[3, 0.1, 1]} />
      <meshStandardMaterial color="#1a3a5a" emissive="#1a3a5a" />
    </mesh>
    <mesh position={[-2, 0, 0]}>
      <boxGeometry args={[3, 0.1, 1]} />
      <meshStandardMaterial color="#1a3a5a" emissive="#1a3a5a" />
    </mesh>
  </Float>
);

// ==========================================
// ☄️ 组件: 陨石带 (Space Debris)
// ==========================================
const SpaceDebris = () => {
  const debris = useMemo(() => new Array(30).fill(0).map(() => ({
    position: [(Math.random() - 0.5) * 300, (Math.random() - 0.5) * 150, (Math.random() - 0.5) * 300] as [number, number, number],
    scale: 0.2 + Math.random() * 0.5
  })), []);
  return (
    <group>
      {debris.map((d, i) => (
        <Float key={i} position={d.position} speed={2}>
          <mesh scale={d.scale}>
            <dodecahedronGeometry />
            <meshStandardMaterial color="#444" roughness={0.8} />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

// ==========================================
// ✨ 组件: 知识尘埃 (Knowledge Dust)
// ==========================================
const KnowledgeDust = ({ count = 2000 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const r = 100 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      temp.push({
        pos: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        ),
        speed: 0.02 + Math.random() * 0.05,
        size: 0.1 + Math.random() * 0.2,
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    particles.forEach((p, i) => {
      dummy.position.copy(p.pos);
      dummy.position.y += Math.sin(t * p.speed + i) * 5;
      dummy.scale.setScalar(p.size);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
    </instancedMesh>
  );
};

// ==========================================
// 🌌 场景: 宏伟多星系宇宙 (Grand Multi-Galaxy)
// ==========================================
export default function SlowUniverse({ data, onItemClick, setIsHovering }: any) {
  const { camera } = useThree();
  const [isWarping, setIsWarping] = useState(false);
  const [warpTarget, setWarpTarget] = useState<THREE.Vector3 | null>(null);

  const handleItemClick = (item: any) => {
    const targetPos = new THREE.Vector3(...item.position);
    setWarpTarget(targetPos);
    setIsWarping(true);

    setTimeout(() => {
      onItemClick(item);
      setIsWarping(false);
      setWarpTarget(null);
    }, 800);
  };

  useFrame((state, delta) => {
    if (isWarping && warpTarget) {
      state.camera.position.lerp(warpTarget, 0.1);
      state.camera.lookAt(warpTarget);
    }
  });
  const { topTags } = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    data.forEach((item: any) => {
      const itemTags = item.tags || (item.category ? [item.category] : ['未分类']);
      itemTags.forEach((tagName: string) => {
        if (!map.has(tagName)) {
          map.set(tagName, { id: tagName, name: tagName.toUpperCase(), count: 0 });
        }
        map.get(tagName)!.count++;
      });
    });
    return { topTags: Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 3) };
  }, [data]);

  const clusterLayouts = useMemo(() => {
    const colors = ['#60a5fa', '#f87171', '#fbbf24'];
    const positions: [number, number, number][] = [[-60, 0, 30], [60, 0, -30], [0, 30, -80]];
    return topTags.map((tag, i) => ({
      id: tag.id,
      label: tag.name,
      color: colors[i % colors.length],
      position: positions[i],
    }));
  }, [topTags]);

  return (
    <>
      <color attach="background" args={['#020205']} />
      <fog attach="fog" args={['#020205', 100, 500]} />
      <Stars radius={400} depth={100} count={8000} factor={6} saturation={0} fade speed={0.5} />
      
      <ambientLight intensity={0.3} />
      
      <KnowledgeDust count={2000} />
      <NebulaClouds />
      <SpaceDebris />
      <SpaceStation position={[40, 20, -30]} />

      {clusterLayouts.map((cluster) => {
        const clusterItems = data
          .filter((item: any) => (item.tags || [item.category]).includes(cluster.id))
          .slice(0, 12);

        return (
          <group key={cluster.id}>
            <GalaxyCore position={cluster.position} color={cluster.color} label={cluster.label} />
            {/* 替换为新的极光星云组件 */}
            <GalaxyAurora position={cluster.position} color={cluster.color} />
            {clusterItems.map((item: any) => (
              <KnowledgeStar 
                key={item.id} 
                item={item} 
                centerPos={cluster.position} 
                color={cluster.color} 
                onClick={handleItemClick} 
                onHover={setIsHovering}
              />
            ))}
          </group>
        );
      })}
    </>
  );
}
