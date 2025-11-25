'use client'

import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Float, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { GalaxyItem } from '@/lib/mockData';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

// 🛠️ 修复 TypeScript 类型报错
declare global {
  namespace JSX {
    interface IntrinsicElements {
      terrestrialMaterial: any;
      gaseousMaterial: any;
      lavaMaterial: any;
    }
  }
}

// ==========================================
// 🟢 Shader 1: 类地行星 (Terrestrial) - Life
// ==========================================
const TerrestrialMaterial = shaderMaterial(
  {
    time: 0,
    colorLand: new THREE.Color('#66bb6a'), // 更亮的绿色
    colorOcean: new THREE.Color('#29b6f6'), // 更亮的海蓝
    colorCloud: new THREE.Color('#ffffff'),
    lightDir: new THREE.Vector3(1, 0.5, 1).normalize(),
  },
  // Vertex... (保持不变)
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment... (保持不变)
  `
    uniform float time;
    uniform vec3 colorLand;
    uniform vec3 colorOcean;
    uniform vec3 colorCloud;
    uniform vec3 lightDir;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // ... (噪声函数保持不变)
    float hash(vec3 p) {
      p  = fract( p*0.3183099+.1 );
      p *= 17.0;
      return fract( p.x*p.y*p.z*(p.x+p.y+p.z) );
    }

    float noise( in vec3 x ) {
      vec3 p = floor(x);
      vec3 f = fract(x);
      f = f*f*(3.0-2.0*f);
      return mix(mix(mix( hash(p+vec3(0,0,0)), hash(p+vec3(1,0,0)),f.x),
                     mix( hash(p+vec3(0,1,0)), hash(p+vec3(1,1,0)),f.x),f.y),
                 mix(mix( hash(p+vec3(0,0,1)), hash(p+vec3(1,0,1)),f.x),
                     mix( hash(p+vec3(0,1,1)), hash(p+vec3(1,1,1)),f.x),f.y),f.z);
    }

    void main() {
      vec3 pos = vPosition;
      float rot = time * 0.05;
      mat2 m = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
      pos.xz = m * pos.xz;

      float diffuse = max(dot(vNormal, lightDir), 0.3); // 提高最小光照，避免太黑
      
      float n = noise(pos * 2.5);
      vec3 surfaceColor = mix(colorOcean, colorLand, smoothstep(0.45, 0.55, n));
      
      float cloudNoise = noise(pos * 4.0 + vec3(time * 0.1, 0.0, 0.0));
      float cloudCover = smoothstep(0.6, 0.7, cloudNoise);
      surfaceColor = mix(surfaceColor, colorCloud, cloudCover * 0.8);

      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.0);
      
      // 增强边缘光
      vec3 finalColor = surfaceColor * diffuse + (colorOcean * 0.8 * fresnel);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// ==========================================
// 🔵 Shader 2: 气态巨行星 (Gas Giant) - Tech (现在是橙色)
// ==========================================
const GaseousMaterial = shaderMaterial(
  {
    time: 0,
    colorA: new THREE.Color('#ff9800'), // 橙色
    colorB: new THREE.Color('#ffcc80'), // 浅橙色
  },
// ... Vertex 保持不变
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
// ... Fragment 保持不变
  `
    uniform float time;
    uniform vec3 colorA;
    uniform vec3 colorB;
    
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
      float bands = sin(vPosition.y * 6.0 + sin(vPosition.x * 2.0 + time * 0.2) * 0.5);
      bands = smoothstep(-0.2, 0.2, bands);
      
      vec3 color = mix(colorA, colorB, bands);
      
      float intensity = dot(vNormal, vec3(0.0, 0.0, 1.0));
      color *= pow(intensity + 0.4, 0.5);

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// ==========================================
// 🟣 Shader 3: 熔岩/能量星 (Lava) - Idea (现在是白色)
// ==========================================
const LavaMaterial = shaderMaterial(
  {
    time: 0,
    colorCore: new THREE.Color('#e0e0e0'), // 银灰
    colorMagma: new THREE.Color('#ffffff'), // 亮白
  },
// ... Vertex 保持不变
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
// ... Fragment 保持不变
  `
    uniform float time;
    uniform vec3 colorCore;
    uniform vec3 colorMagma;
    varying vec3 vPosition;

    float hash(vec3 p) {
      p  = fract( p*0.3183099+.1 );
      p *= 17.0;
      return fract( p.x*p.y*p.z*(p.x+p.y+p.z) );
    }
    float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x),
                     mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
                 mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
                     mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
    }

    void main() {
      float n = noise(vPosition * 3.0 + vec3(time * 0.2));
      float cracks = smoothstep(0.4, 0.5, n);
      float pulse = (sin(time * 2.0) * 0.5 + 0.5) * 0.3;
      
      vec3 color = mix(colorCore, colorMagma, cracks + pulse);
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ TerrestrialMaterial, GaseousMaterial, LavaMaterial });

// ==========================================
// 🌟 通用星球组件
// ==========================================
function Star({ item, onClick, glowTexture }: { item: GalaxyItem; onClick: (item: GalaxyItem) => void; glowTexture: THREE.Texture | null }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    // ☁️ 让整个组（星球+光晕）一起浮动
    if (groupRef.current) {
      groupRef.current.position.y = item.position[1] + Math.sin(state.clock.elapsedTime + item.position[0]) * 0.2;
    }

    if (meshRef.current) {
      // 🪐 星球自转 (只转球体，不转光晕)
      meshRef.current.rotation.y += 0.005; 
      
      // 统一的悬浮动画 (缩放)
      const targetScale = hovered ? 1.5 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
    
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
    }
  });

  // 根据分类选择不同的星球渲染逻辑
  const renderPlanet = () => {
    const geometryArgs: [number, number, number] = [item.size, 32, 32]; // 降低精度到 32x32

    switch (item.category) {
      case 'life': // 🌍 类地行星
        return (
          <mesh ref={meshRef}>
            <sphereGeometry args={geometryArgs} />
            <terrestrialMaterial 
              ref={materialRef} 
              colorLand={new THREE.Color('#81c784')}
              colorOcean={new THREE.Color('#0277bd')}
              colorCloud={new THREE.Color('#ffffff')}
            />
          </mesh>
        );
      case 'tech': // 🔵 气态巨行星
        return (
          <mesh ref={meshRef}>
            <sphereGeometry args={geometryArgs} />
            <gaseousMaterial 
              ref={materialRef}
              colorA={new THREE.Color('#ff9800')}
              colorB={new THREE.Color('#ffcc80')}
            />
            {/* 气态行星加一个淡淡的光环 */}
            <mesh rotation={[Math.PI/3, 0, 0]}>
               <torusGeometry args={[item.size * 1.6, 0.05, 16, 64]} />
               <meshBasicMaterial color="#ffb74d" transparent opacity={0.3} />
            </mesh>
          </mesh>
        );
      case 'idea': // 🟣 能量星球
        return (
          <mesh ref={meshRef}>
            <sphereGeometry args={geometryArgs} />
            <lavaMaterial 
              ref={materialRef}
              colorCore={new THREE.Color('#e0e0e0')}
              colorMagma={new THREE.Color('#ffffff')}
            />
          </mesh>
        );
      default:
        return null;
    }
  };

  // 获取星球主色调用于光晕
  const glowColor = useMemo(() => {
    switch (item.category) {
      case 'tech': return '#ff9800';
      case 'life': return '#81c784';
      case 'idea': return '#ffffff';
      default: return '#ffffff';
    }
  }, [item.category]);

  return (
    <group 
      ref={groupRef}
      position={item.position}
      onClick={(e) => {
        e.stopPropagation();
        onClick(item);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {renderPlanet()}
      
      {/* ✨ 物理发光光晕 (Sprite Glow) */}
      {glowTexture && (
        <sprite scale={[item.size * 5, item.size * 5, 1]}>
          <spriteMaterial 
            map={glowTexture} 
            color={glowColor} 
            transparent 
            opacity={hovered ? 0.8 : 0.4} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} // 防止光晕遮挡其他物体
          />
        </sprite>
      )}
      
      {/* 仅 Hover 时显示的粒子，提升性能 */}
      {hovered && (
        <Sparkles count={10} scale={item.size * 3} size={3} speed={0.4} color="#ffffff" />
      )}
    </group>
  );
}

// 中心恒星 (原黑洞改造)
function CentralSingularity({ glowTexture }: { glowTexture: THREE.Texture | null }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
      if (meshRef.current) {
        // 太阳自转
        meshRef.current.rotation.y += 0.002;
        // 太阳脉动
        const scale = 1.2 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
        meshRef.current.scale.set(scale, scale, scale);
      }
      
      // 恢复交错旋转的星环动态 - 🚀 速度提升版
      if (ring1Ref.current) {
        ring1Ref.current.rotation.z -= 0.02; // 转速加快 (0.005 -> 0.02)
        ring1Ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3 + (Math.PI / 2.5); // 倾斜摇摆加快
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.z -= 0.015; // 转速加快 (0.003 -> 0.015)
        ring2Ref.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.4) * 0.3; // 倾斜摇摆加快
      }
    });
  
    return (
      <group>
        {/* 🌞 太阳核心 */}
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <sphereGeometry args={[1.5, 64, 64]} />
          <meshBasicMaterial color="#ff3d00" />
        </mesh>

        {/* ☀️ 太阳日冕 (巨大光晕) - 确保使用 AdditiveBlending */}
        {glowTexture && (
          <sprite scale={[20, 20, 1]}>
             <spriteMaterial 
               map={glowTexture} 
               color="#ff5722" 
               transparent 
               opacity={0.6} 
               blending={THREE.AdditiveBlending} 
               depthWrite={false}
             />
          </sprite>
        )}

        {/* 星环 1 - 交错轨道 */}
        <group rotation={[0.5, 0, 0]}> {/* 基础倾斜 */}
            <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[3.2, 0.05, 16, 100]} />
              <meshStandardMaterial color="#ffb74d" emissive="#ff9100" emissiveIntensity={3} transparent opacity={0.9} />
            </mesh>
        </group>

        {/* 星环 2 - 交错轨道 */}
        <group rotation={[-0.5, 0, 0]}> {/* 反向倾斜 */}
            <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[4.5, 0.03, 16, 100]} />
              <meshStandardMaterial color="#ff5252" emissive="#d50000" emissiveIntensity={2} transparent opacity={0.7} />
            </mesh>
        </group>
      </group>
    );
}

// ✨ 纯净的星空背景 (替代 drei 的 Stars，消除黑点)
function SimpleStars() {
  const points = useMemo(() => {
    const p = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const r = 80 + Math.random() * 60; // 半径 80-140
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);
    }
    return p;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={3000} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.5} color="#ffffff" sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

interface GalaxySceneProps {
  data: GalaxyItem[];
  onItemClick: (item: GalaxyItem) => void;
}

export default function GalaxyScene({ data, onItemClick }: GalaxySceneProps) {
  // ✨ 生成光晕纹理 (只需生成一次，全局复用)
  const glowTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');     // 中心极亮
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.6)'); // 高亮区
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');     // 边缘完全透明
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <div className="w-full h-full relative bg-black">
      <Canvas 
        camera={{ position: [0, 15, 25], fov: 60 }} 
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, powerPreference: 'high-performance' }} 
        dpr={[1, 2]} 
      >
        <color attach="background" args={['#05020a']} />
        <fog attach="fog" args={['#05020a', 35, 90]} />

        <ambientLight intensity={0.5} />
        {/* 中心暖色主光 - 模拟太阳光 */}
        <pointLight position={[0, 0, 0]} intensity={5} color="#ffab91" decay={2} distance={100} />
        <pointLight position={[15, 10, 10]} intensity={2} color="#6366f1" decay={2} />
        <pointLight position={[-15, -10, -10]} intensity={2} color="#8b5cf6" decay={2} />
        
        {/* 替换原本的 Stars 和 Sparkles，使用纯净星空 */}
        <SimpleStars />

        <CentralSingularity glowTexture={glowTexture} />

        <group>
          {data.map((item) => (
            <Star key={item.id} item={item} onClick={onItemClick} glowTexture={glowTexture} />
          ))}
        </group>
        
        {/* 关闭 Bloom，使用 Sprite Glow 代替 */}
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true} 
          autoRotate={true} 
          autoRotateSpeed={0.8} // 🚀 星系整体旋转加速 (0.25 -> 0.8)
          minDistance={8} 
          maxDistance={60} 
        />
      </Canvas>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-sm pointer-events-none text-center">
        <p>🖱️ 拖拽旋转 | 滚轮缩放 | 点击星球查看详情</p>
        <p className="text-xs mt-1 text-white/20 space-x-4">
          <span className="text-orange-400">●</span> Tech (橙色气态)
          <span className="ml-3 text-green-400">●</span> Life (绿色生态)
          <span className="ml-3 text-white">●</span> Idea (梦幻白星)
        </p>
      </div>
    </div>
  );
}
