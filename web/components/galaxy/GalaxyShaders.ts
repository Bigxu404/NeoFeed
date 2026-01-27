import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// ==========================================
// 📄 深岩银河风格材质 (Deep Rock Ore Material) - 修复版
// ==========================================
export const OreMaterial = {
  uniforms: {
    time: { value: 0 },
    colorCore: { value: new THREE.Color("#ffffff") },
    hoverState: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      // 使用标准的模型视图变换
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      
      // 视线方向 (在相机空间中，相机在原点，所以视线是对着顶点的反方向)
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    uniform float time;
    uniform vec3 colorCore;
    uniform float hoverState;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // 1. 菲涅尔效应 (边缘光)
      float NdotV = dot(normal, viewDir);
      float fresnel = pow(1.0 - max(NdotV, 0.0), 2.0);
      
      // 2. 简单的内部噪声模拟 (不依赖复杂函数，保证兼容性)
      float noise = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
      float innerGlow = smoothstep(0.0, 1.0, noise) * 0.5;
      
      // 3. 颜色合成
      vec3 baseColor = colorCore * 0.3; // 基础亮度
      vec3 edgeColor = colorCore * 2.0; // 边缘高亮
      
      vec3 finalColor = baseColor + (edgeColor * fresnel) + (colorCore * innerGlow);
      
      // 4. 悬停反馈
      finalColor = mix(finalColor, colorCore * 4.0, hoverState);
      
      // 5. 呼吸效果
      float pulse = 0.8 + 0.2 * sin(time * 3.0);
      
      gl_FragColor = vec4(finalColor * pulse, 1.0);
      
      // Gamma 校正 (防止颜色过暗)
      gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0/2.2));
    }
  `
};

// 注册材质
const OreMaterialImpl = shaderMaterial(OreMaterial.uniforms, OreMaterial.vertexShader, OreMaterial.fragmentShader);
extend({ OreMaterial: OreMaterialImpl });
