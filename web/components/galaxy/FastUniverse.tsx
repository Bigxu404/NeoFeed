import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Outlines, Trail, Sparkles, Line } from '@react-three/drei';
import * as THREE from 'three';

// ==========================================
// 🌌 冷冽几何快宇宙 (Cold Geometric Fast Universe)
// ==========================================

// 1. 核心能量体 (The Core)
const Core = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current && ringRef1.current && ringRef2.current) {
      meshRef.current.rotation.y += 0.05;
      meshRef.current.rotation.z += 0.02;
      const jitter = Math.sin(t * 20) * 0.02;
      meshRef.current.scale.setScalar(0.8 + jitter);

      ringRef1.current.rotation.x = t * 0.5;
      ringRef1.current.rotation.y = t * 0.3;
      ringRef2.current.rotation.x = -t * 0.3;
      ringRef2.current.rotation.z = t * 0.2;
      
      const ringPulse = 1 + Math.sin(t * 2) * 0.1;
      ringRef1.current.scale.setScalar(ringPulse);
      ringRef2.current.scale.setScalar(ringPulse * 1.1);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.6, 0]} />
        <meshToonMaterial 
          color="#6b21a8" // 更深的紫色 (purple-800)
          emissive="#581c87" // 自发光也加深 (purple-900)
          emissiveIntensity={2}
        />
        <Outlines thickness={0.1} color="#d8b4fe" />
      </mesh>

      <mesh ref={ringRef1}>
        <torusGeometry args={[1.2, 0.02, 16, 100]} />
        <meshBasicMaterial color="#d8b4fe" transparent opacity={0.8} />
      </mesh>

      <mesh ref={ringRef2}>
        <torusGeometry args={[1.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>
      
      <pointLight color="#a855f7" intensity={8} distance={40} decay={2} />
      <Sparkles count={20} scale={3} size={4} speed={0.4} opacity={0.8} color="#d8b4fe" />
    </group>
  );
};

// 2. 日漫风碎片晶体 (MangaShard)
const MangaShard = ({ item, onClick, onHover }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  
  const { offset, speed, rotationSpeed, scale, color } = useMemo(() => {
    const r = 6 + Math.random() * 18; 
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    const pos = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );

    let c = '#ffffff';
    if (item.category === 'tech') c = '#00ffff'; 
    else if (item.category === 'life') c = '#ff0055'; 
    else if (item.category === 'idea') c = '#ffcc00'; 

    const randomScale = [
      0.5 + Math.random() * 1.0, 
      0.5 + Math.random() * 1.0, 
      0.5 + Math.random() * 1.0  
    ] as [number, number, number];

    return {
      offset: pos,
      speed: 0.1 + Math.random() * 0.3,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      scale: randomScale,
      color: new THREE.Color(c),
    };
  }, [item.category]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    const orbitX = Math.sin(t * speed * 0.5) * 3;
    const orbitY = Math.cos(t * speed * 0.3) * 3;
    const orbitZ = Math.sin(t * speed * 0.7) * 3;

    meshRef.current.position.set(
      offset.x + orbitX,
      offset.y + orbitY,
      offset.z + orbitZ
    );

    meshRef.current.rotation.x += rotationSpeed * 0.01;
    meshRef.current.rotation.y += rotationSpeed * 0.02;
  });

  return (
    <group>
      <Trail
        width={hovered ? 1.5 : 0} 
        length={3}
        color={color}
        attenuation={(t) => t * t}
      >
        <mesh
          ref={meshRef}
          // @ts-ignore
          scale={scale}
          onClick={(e) => { e.stopPropagation(); onClick(item); }}
          onPointerOver={(e) => { e.stopPropagation(); setHover(true); onHover(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHover(false); onHover(false); document.body.style.cursor = 'auto'; }}
        >
          <tetrahedronGeometry args={[1, 0]} />
          
          <meshToonMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.8 : 0.1}
            gradientMap={null}
          />
          
          <Outlines 
            thickness={hovered ? 0.15 : 0.08} 
            color={hovered ? "#ffffff" : color} 
            screenspace={false} 
            opacity={1} 
            transparent={false}
            angle={0} 
          />
        </mesh>
      </Trail>
    </group>
  );
};

// 3. 清晰光粒子 (Clear Particles)
const ClearParticles = () => {
  const count = 500;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();

  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 200,
      z: (Math.random() - 0.5) * 150,
      speed: 0.2 + Math.random() * 0.5, 
      size: 0.1 + Math.random() * 0.3
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      const xMove = t * p.speed * 8;
      const yMove = t * p.speed * 5;
      
      const width = 400;  
      const height = 300; 
      
      let x = ((p.x + xMove + 200) % width);
      if (x < 0) x += width;
      x -= 200;

      let y = ((p.y - yMove + 150) % height);
      if (y < 0) y += height;
      y -= 150;

      dummy.position.set(x, y, p.z);
      dummy.rotation.x = t * p.speed;
      dummy.rotation.y = t * p.speed;
      
      dummy.scale.setScalar(p.size); 
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} toneMapped={false} />
    </instancedMesh>
  );
};

// 4. 空间穿刺线 (Piercing Beams)
// 使用 BoxGeometry 模拟具有体积感的穿刺线
const SpaceBeams = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();
  const count = 15;

  const beams = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      // 随机方向
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const direction = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      ).normalize();

      // 颜色
      const colors = [new THREE.Color('#00ffff'), new THREE.Color('#ffffff'), new THREE.Color('#a855f7')];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // 粗细与长度
      const thickness = 0.05 + Math.random() * 0.25; // 0.05 - 0.3 (上限)
      const length = 100 + Math.random() * 150;
      
      return { 
        position: new THREE.Vector3((Math.random()-0.5)*200, (Math.random()-0.5)*150, (Math.random()-0.5)*100),
        rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0),
        scale: new THREE.Vector3(thickness, length, thickness), // Y轴拉长
        color: color,
        opacity: 0.1 + Math.random() * 0.4
      };
    });
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    beams.forEach((beam, i) => {
      dummy.position.copy(beam.position);
      dummy.rotation.copy(beam.rotation);
      dummy.scale.copy(beam.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, beam.color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      {/* 
         用户要求透明
      */}
      <meshBasicMaterial transparent opacity={0.3} toneMapped={false} />
    </instancedMesh>
  );
};

export default function FastUniverse({ data, onItemClick, setIsHovering }: any) {
  const displayData = useMemo(() => {
    if (data && data.length > 0) return data;
    return Array(15).fill(0).map((_, i) => ({
      id: `mock-${i}`,
      category: ['tech', 'life', 'idea'][i % 3]
    }));
  }, [data]);

  return (
    <>
      <color attach="background" args={['#050508']} />
      <fogExp2 attach="fog" args={['#050508', 0.01]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={2} />
      <directionalLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />

      <group>
        <Core />
        
        {displayData.map((item: any, i: number) => (
          <MangaShard 
            key={item.id || i} 
            item={item} 
            onClick={onItemClick} 
            onHover={setIsHovering} 
          />
        ))}

        <ClearParticles />
        <SpaceBeams />
        
        {/* 辅助网格 */}
        <gridHelper 
          args={[200, 20, 0x333333, 0x111111]} 
          position={[0, -40, 0]} 
        />
        <gridHelper 
          args={[200, 20, 0x333333, 0x111111]} 
          position={[0, 40, 0]} 
        />
      </group>
    </>
  );
}
