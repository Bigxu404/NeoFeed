import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GalaxyItem } from '@/types';

// ==========================================
// 🌟 组件: 智慧恒星 (Wisdom Star - Content Node)
// ==========================================
const WisdomStar = ({ item, onClick, onHover }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  // 颜色映射：根据分类显示不同颜色，但更纯净、高亮
  const color = useMemo(() => {
    switch (item.category) {
      case 'tech': return '#00f2ea'; // 青色
      case 'life': return '#ff0050'; // 红色
      case 'idea': return '#ffd700'; // 金色
      default: return '#ffffff';
    }
  }, [item.category]);

  // 大小映射：基于字数或权重
  const size = useMemo(() => {
    return (item.wordCount ? Math.log(item.wordCount) * 0.1 : 0.5) * (item.weight || 1);
  }, [item.wordCount, item.weight]);

  useFrame((state) => {
    if (meshRef.current) {
      // 自转
      meshRef.current.rotation.y += 0.005;
      
      // 悬停时的脉冲效果
      const targetScale = hovered ? size * 1.5 : size;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={item.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(item); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); onHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHover(false); onHover(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 2.0 : 0.5}
          roughness={0.1}
          metalness={0.8}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* 轨道环 (仅装饰) */}
      {hovered && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.8, size * 2.0, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

// ==========================================
// 🪐 组件: 星系中心 (Galaxy Cluster Center)
// ==========================================
const ClusterCenter = ({ position, color, label }: any) => {
  return (
    <group position={position}>
      {/* 核心恒星 */}
      <mesh>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* 光晕 */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>
      {/* 标签 */}
      <Html position={[0, 4, 0]} center distanceFactor={15}>
        <div className="text-white font-serif text-sm tracking-widest bg-black/50 px-2 py-1 rounded border border-white/20 backdrop-blur-sm whitespace-nowrap">
          {label}
        </div>
      </Html>
    </group>
  );
};

// ==========================================
// 🌌 场景: 慢思考宇宙 (The Slow-Thinking Universe)
// ==========================================
export default function SlowUniverse({ data, onItemClick, setIsHovering }: any) {
  // 数据处理：将数据分配到不同的星系簇
  const clusters = useMemo(() => {
    const techItems: any[] = [];
    const lifeItems: any[] = [];
    const ideaItems: any[] = [];

    data.forEach((item: any) => {
      if (item.category === 'tech') techItems.push(item);
      else if (item.category === 'life') lifeItems.push(item);
      else ideaItems.push(item);
    });

    // 辅助函数：生成螺旋轨道位置
    const generateSpiralPos = (items: any[], center: [number, number, number], radiusStart: number) => {
      return items.map((item, i) => {
        const angle = i * 0.5; // 角度步进
        const radius = radiusStart + i * 0.8; // 半径步进
        const x = center[0] + Math.cos(angle) * radius;
        const z = center[2] + Math.sin(angle) * radius;
        const y = center[1] + (Math.random() - 0.5) * 5; // Y轴轻微波动
        return { ...item, position: [x, y, z] };
      });
    };

    return [
      { 
        id: 'tech', 
        label: 'TECHNOLOGY', 
        color: '#00f2ea', 
        position: [-30, 0, 0], 
        items: generateSpiralPos(techItems, [-30, 0, 0], 8) 
      },
      { 
        id: 'life', 
        label: 'LIFESTYLE', 
        color: '#ff0050', 
        position: [30, 0, 0], 
        items: generateSpiralPos(lifeItems, [30, 0, 0], 8) 
      },
      { 
        id: 'idea', 
        label: 'IDEAS', 
        color: '#ffd700', 
        position: [0, 20, -20], 
        items: generateSpiralPos(ideaItems, [0, 20, -20], 8) 
      },
    ];
  }, [data]);

  return (
    <>
      {/* 1. 环境氛围：宁静、深邃、秩序 */}
      <color attach="background" args={['#020204']} />
      <fogExp2 attach="fog" args={['#020204', 0.01]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
      
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 50, 0]} intensity={2} color="#ffffff" />

      {/* 2. 星系簇 */}
      {clusters.map((cluster) => (
        <group key={cluster.id}>
          <ClusterCenter position={cluster.position} color={cluster.color} label={cluster.label} />
          {cluster.items.map((item: any) => (
            <WisdomStar 
              key={item.id} 
              item={item} 
              onClick={onItemClick} 
              onHover={setIsHovering} 
            />
          ))}
          {/* 轨道线示意 */}
           <mesh position={cluster.position as any} rotation={[Math.PI/2, 0, 0]}>
             <ringGeometry args={[7, 7.1, 64]} />
             <meshBasicMaterial color={cluster.color} transparent opacity={0.1} side={THREE.DoubleSide} />
           </mesh>
           <mesh position={cluster.position as any} rotation={[Math.PI/2, 0, 0]}>
             <ringGeometry args={[15, 15.1, 64]} />
             <meshBasicMaterial color={cluster.color} transparent opacity={0.05} side={THREE.DoubleSide} />
           </mesh>
        </group>
      ))}
    </>
  );
}

