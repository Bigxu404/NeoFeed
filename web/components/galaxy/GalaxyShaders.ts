import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// ==========================================
// 🛠️ Shader Utils
// ==========================================
export const shaderUtils = `
  // Simplex 3D Noise 
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }
`;

// ==========================================
// 💎 Shader: 崎岖矿石 (Jagged Ore Material)
// ==========================================
export const OreMaterial = shaderMaterial(
  {
    time: 0,
    colorRock: new THREE.Color('#0a0a0a'), 
    colorCore: new THREE.Color('#00ffcc'), 
    hoverState: 0, 
    viewVector: new THREE.Vector3(0, 0, 1),
  },
  // Vertex
  `
    uniform float time;
    uniform vec3 colorRock;
    uniform vec3 colorCore;
    uniform float hoverState;
    uniform vec3 viewVector;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying float vNoise;
    
    ${shaderUtils}

    void main() {
      vUv = uv;
      vec3 objectNormal = normalize(normalMatrix * normal);
      
      // 强烈的顶点置换：制造破碎感 (Shattered Look)
      vec3 pos = position;
      
      // 低频噪声：改变整体形状 - 增加时间流速
      float n1 = snoise(pos * 1.2 + time * 0.2);
      // 高频噪声：增加岩石表面粗糙度
      float n2 = snoise(pos * 5.0 + time * 0.05);
      
      // 挤出顶点，使其不再是规则几何体
      float displacement = n1 * 0.4 + n2 * 0.1;
      pos += normal * displacement;
      
      vNoise = n1;
      vNormal = objectNormal; 

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      
      vViewPosition = -mvPosition.xyz;
      vWorldPosition = worldPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment
  `
    uniform float time;
    uniform vec3 colorRock;
    uniform vec3 colorCore;
    uniform float hoverState;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying float vNoise;

    ${shaderUtils}

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      vec3 normal = normalize(vNormal);
      
      // 1. 岩石纹理 (Rock Texture)
      float grain = snoise(vWorldPosition * 15.0);
      vec3 rockColor = mix(colorRock, colorRock * 1.8, grain * 0.4);
      
      // 2. 能量脉冲 (Energy Pulse) - 像岩浆一样在裂缝中涌动
      float flow = snoise(vWorldPosition * 1.5 + vec3(0, time * 0.8, 0));
      float cracks = smoothstep(0.35, 0.45, flow); // 锐利的裂缝边缘
      
      // 3. 菲涅尔效应 (Fresnel)
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
      
      // 4. 交互高亮
      float scan = smoothstep(0.0, 1.0, hoverState);
      
      // 合成
      vec3 emission = colorCore * (cracks * 2.5 + fresnel * 2.0);
      vec3 finalColor = mix(rockColor, emission, cracks * 0.6 + scan * 0.9);
      
      // 增加一些随机的高光点 (Glints)
      float glint = step(0.92, snoise(vWorldPosition * 25.0 + viewDir * 8.0));
      finalColor += glint * colorCore * 3.0;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// ==========================================
// 🌫️ Shader: 湍流迷雾 (Turbulent Fog)
// ==========================================
export const AbyssalFogMaterial = shaderMaterial(
  {
    colorBg: new THREE.Color('#050508'),
    time: 0,
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform vec3 colorBg;
    uniform float time;
    varying vec2 vUv;
    
    ${shaderUtils}

    void main() {
      // 动态的烟雾背景
      float n = snoise(vec3(vUv * 2.0, time * 0.1));
      float n2 = snoise(vec3(vUv * 5.0, time * 0.2));
      
      vec3 color = colorBg + vec3(0.02, 0.02, 0.04) * (n + n2 * 0.5);
      
      // 暗角
      float dist = distance(vUv, vec2(0.5));
      color *= smoothstep(0.8, 0.2, dist);

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// ==========================================
// 🌊 Shader: 定向能量流材质 (Directional Stream Material)
// ==========================================
export const DirectionalStreamMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color('#ffffff') },
  // vertex
  `
    uniform float time;
    attribute float size;
    attribute float speed;
    attribute float offset;
    varying float vAlpha;
    
    void main() {
      vec3 pos = position;
      
      // 流动方向: 左上(-X, +Y) -> 右下(+X, -Y)
      // 我们定义一个流动的进度 t
      float t = time * speed * 10.0 + offset;
      
      // 沿对角线移动
      pos.x += t;
      pos.y -= t * 0.8; // Y轴速度稍慢
      
      // 空间循环逻辑
      // 定义空间边界
      float range = 200.0;
      pos.x = mod(pos.x + range/2.0, range) - range/2.0;
      pos.y = mod(pos.y + range/2.0, range) - range/2.0;
      
      // 增加波动
      pos.z += sin(t * 0.1 + pos.x * 0.05) * 5.0;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      gl_PointSize = size * (200.0 / -mvPosition.z);
      
      // 边缘淡出 (基于Z深度)
      vAlpha = 1.0 - smoothstep(40.0, 80.0, abs(pos.z));
    }
  `,
  // fragment
  `
    uniform vec3 color;
    varying float vAlpha;
    void main() {
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;
      float glow = 1.0 - (r * 2.0);
      gl_FragColor = vec4(color, vAlpha * glow);
    }
  `
);

// ==========================================
// ☄️ Shader: 多彩流星材质 (Colorful Meteor Material)
// ==========================================
export const MeteorMaterial = shaderMaterial(
  { time: 0 },
  // vertex
  `
    uniform float time;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    ${shaderUtils}

    void main() {
      vColor = instanceColor; 
      vNormal = normalize(normalMatrix * normal);
      
      vec3 pos = position;
      // 动态形变
      float n = snoise(pos * 1.5 + time * 0.5);
      pos += normal * n * 0.3;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // fragment
  `
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // 基础光照
      float NdotL = max(dot(normal, vec3(0.5, 0.8, 0.5)), 0.0);
      
      // 强烈的边缘发光 (Fresnel)
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.0);
      
      // 合成: 固有色 + 高光 + 边缘光
      // 确保颜色非常鲜艳，不受环境光太暗的影响
      vec3 finalColor = vColor * (0.4 + NdotL * 0.6); 
      finalColor += vColor * fresnel * 3.0; // 强烈的自发光边缘
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// 注册材质
extend({ OreMaterial, AbyssalFogMaterial, DirectionalStreamMaterial, MeteorMaterial });

// 类型定义
declare module '@react-three/fiber' {
  interface ThreeElements {
    oreMaterial: any;
    abyssalFogMaterial: any;
    directionalStreamMaterial: any;
    meteorMaterial: any;
  }
}

