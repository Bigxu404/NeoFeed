/**
 * 🌌 NeoFeed 宇宙着色器库 (Cosmic Shader Library)
 * 包含星球地表、大气层、星云等高级渲染逻辑
 */

export const PlanetShaders = {
  // 1. 🪐 拟真星球地表着色器 (Realistic Surface Shader)
  // 特性：多层噪声地形、动态城市灯光、菲涅尔边缘光
  surface: {
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      uniform float emissiveIntensity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewPosition;

      // 经典 3D 噪声函数
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2  C = vec2(1.0/6.0, 1.0/3.0);
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute( permute( permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
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
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
      }

      void main() {
        // 1. 基础地形噪声
        float n1 = snoise(vPosition * 0.5 + time * 0.05);
        float n2 = snoise(vPosition * 2.0 - time * 0.1);
        float crust = mix(n1, n2, 0.4) * 0.5 + 0.5;
        
        vec3 baseColor = mix(color * 0.3, color, crust);

        // 2. 动态城市灯光 (暗面效果)
        vec3 viewDir = normalize(vViewPosition);
        float dotNL = dot(vNormal, vec3(1.0, 1.0, 1.0)); // 假设光源方向
        float nightMask = smoothstep(0.2, -0.2, dotNL);
        
        // 模拟流动的能量裂缝
        float flow = smoothstep(0.45, 0.5, crust) * smoothstep(0.55, 0.5, crust);
        vec3 flowColor = color * (2.0 + sin(time * 2.0 + crust * 20.0));
        
        float lights = pow(snoise(vPosition * 10.0), 10.0) * nightMask;
        vec3 lightColor = vec3(1.0, 0.8, 0.5) * lights * 5.0;

        // 3. 菲涅尔边缘光 (大气感)
        float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
        vec3 atmosphereColor = color * fresnel * 2.0;

        vec3 finalColor = mix(baseColor, flowColor, flow * 0.5) + lightColor + atmosphereColor;
        gl_FragColor = vec4(finalColor * emissiveIntensity, 1.0);
      }
    `
  },

  // 2. 🕸️ 量子纠缠连线着色器 (Quantum Entanglement Shader)
  // 特性：流动的能量脉冲，带有点点星光感
  entanglement: {
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      varying vec2 vUv;

      void main() {
        // 1. 基础线条
        float strength = smoothstep(0.1, 0.5, vUv.x) * smoothstep(0.9, 0.5, vUv.x);
        
        // 2. 流动的能量脉冲
        float pulse = step(0.98, fract(vUv.x - time * 0.5));
        
        // 3. 呼吸感
        float glow = sin(time * 2.0) * 0.2 + 0.8;
        
        vec3 finalColor = mix(color * 0.3, color * 2.0, pulse);
        gl_FragColor = vec4(finalColor, strength * glow * 0.4);
      }
    `
  },

  // 4. 🌫️ 思维之雾着色器 (Cognition Fog Shader)
  // 特性：体积感流体、动态明暗、随星系旋转的拖拽感
  cognitionFog: {
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      void main() {
        vUv = uv;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      varying vec2 vUv;
      varying vec3 vWorldPosition;

      // 快速 3D 噪声
      float hash(float n) { return fract(sin(n) * 43758.5453123); }
      float noise(vec3 x) {
        vec3 p = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        float n = p.x + p.y * 57.0 + 113.0 * p.z;
        return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                       mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
               mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                   mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
      }

      void main() {
        // 1. 多层噪声叠加模拟流体
        vec3 pos = vWorldPosition * 0.05;
        float n = noise(pos + time * 0.1);
        n += noise(pos * 2.0 - time * 0.05) * 0.5;
        n += noise(pos * 4.0 + time * 0.2) * 0.25;
        
        // 2. 边缘淡出 (基于 UV)
        float dist = distance(vUv, vec2(0.5));
        float alpha = smoothstep(0.5, 0.2, dist) * n * 0.3;
        
        // 3. 动态光泽
        vec3 finalColor = mix(color * 0.5, color * 1.5, n);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `
  }
};

