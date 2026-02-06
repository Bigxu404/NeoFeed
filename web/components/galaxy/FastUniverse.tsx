import { useRef, useMemo, useState, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Outlines, Trail, Sparkles, Line } from '@react-three/drei';
import * as THREE from 'three';

// ==========================================
// 🌌 经典 Manga 风格快宇宙 (Classic Manga Fast Universe)
// 恢复线上版本的视觉效果，保留围绕核心的聚集感
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
          color="#6b21a8" 
          emissive="#581c87" 
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
      
      <pointLight color="#a855f7" intensity={12} distance={50} decay={2} />
      {/* 紫色氛围粒子：数量减半，更清爽 */}
      <Sparkles 
        count={30} 
        scale={5} 
        size={3} 
        speed={0.6} 
        opacity={0.6} 
        color="#d8b4fe" 
      />
      {/* 白色核心星火：数量减半，尺寸精细 */}
      <Sparkles 
        count={20} 
        scale={1.5} 
        size={2} 
        speed={1.5} 
        opacity={0.8} 
        color="#ffffff" 
      />
    </group>
  );
};

// 2. 日漫风碎片晶体 (MangaShard)
const MangaShard = ({ item, onClick, onHover }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  
  const { speed, rotationSpeed, scale, color } = useMemo(() => {
    const randomScale = [
      item.size * (0.8 + Math.random() * 0.4), 
      item.size * (0.8 + Math.random() * 0.4), 
      item.size * (0.8 + Math.random() * 0.4)  
    ] as [number, number, number];

    return {
      speed: 0.1 + Math.random() * 0.3,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      scale: randomScale,
      color: new THREE.Color(item.color),
    };
  }, [item.size, item.color]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    const orbitX = Math.sin(t * speed * 0.5 + item.timestamp) * 2;
    const orbitY = Math.cos(t * speed * 0.3 + item.timestamp) * 2;
    const orbitZ = Math.sin(t * speed * 0.7 + item.timestamp) * 2;

    meshRef.current.position.set(
      item.position[0] + orbitX,
      item.position[1] + orbitY,
      item.position[2] + orbitZ
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
            emissiveIntensity={hovered ? 6.0 : 2.5} // 🌟 保持强荧光
            gradientMap={null}
          />
          
          <Outlines 
            thickness={hovered ? 0.2 : 0.12} // 🌟 保持厚边缘
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
const SpaceBeams = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();
  const count = 15;

  const beams = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      const colors = [new THREE.Color('#00ffff'), new THREE.Color('#ffffff'), new THREE.Color('#a855f7')];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const thickness = 0.05 + Math.random() * 0.2; 
      const length = 2000; 
      
      return { 
        position: new THREE.Vector3((Math.random()-0.5)*300, (Math.random()-0.5)*200, (Math.random()-0.5)*100),
        rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0),
        scale: new THREE.Vector3(thickness, length, thickness), 
        color: color,
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
      <meshBasicMaterial transparent opacity={0.3} toneMapped={false} />
    </instancedMesh>
  );
};

// 5. 外侧尖锐穿刺线 (Outer Piercing Beams)
const OuterPiercingBeams = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();
  const count = 60; 

  const beams = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 150 + Math.random() * 250;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 400;

      const thickness = 0.01 + Math.random() * 0.02; 
      const length = 3000; 
      
      const colors = ['#ffffff', '#a855f7', '#00ffff'];
      const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);

      return { 
        position: new THREE.Vector3(x, y, z),
        scale: new THREE.Vector3(thickness, length, thickness),
        color: color,
        opacity: 0.05 + Math.random() * 0.15
      };
    });
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    beams.forEach((beam, i) => {
      dummy.position.copy(beam.position);
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
      <meshBasicMaterial transparent opacity={0.2} toneMapped={false} />
    </instancedMesh>
  );
};

export default function FastUniverse({ data, onItemClick, setIsHovering }: any) {
  return (
    <>
      <color attach="background" args={['#050508']} />
      <fogExp2 attach="fog" args={['#050508', 0.01]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={2} />
      <directionalLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />

      <group>
        <Core />
        {data.map((item: any) => (
          <MangaShard 
            key={item.id} 
            item={item} 
            onClick={onItemClick} 
            onHover={setIsHovering} 
          />
        ))}
        <ClearParticles />
        <SpaceBeams />
        <OuterPiercingBeams />
      </group>
    </>
  );
}
