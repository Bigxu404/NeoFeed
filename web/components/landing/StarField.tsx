'use client'

import { useEffect, useRef } from 'react';
import { motion, MotionValue } from 'framer-motion';

interface StarFieldProps {
  isHovering: boolean;
  isFocused: boolean;
  starMoveX: MotionValue<number>;
  starMoveY: MotionValue<number>;
}

// ✨ 重构：使用 Canvas 实现的高性能、交互式星场 (带星座连线)
export default function StarField({ isHovering, isFocused, starMoveX, starMoveY }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 初始化画布
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // 生成星星数据
    const starCount = 400;
    // 🌟 星座节点：标记为“可连接”的星星
    const stars = Array.from({ length: starCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      baseOpacity: Math.random() * 0.2 + 0.1,
      targetOpacity: Math.random() * 0.6 + 0.4,
      blinkSpeed: Math.random() * 0.02 + 0.005,
      blinkOffset: Math.random() * Math.PI * 2,
      isConnector: Math.random() > 0.6, // 🔥 增加比例：40% 的星星是星座节点 (1 - 0.6)
    }));

    let animationFrameId: number;
    let hoverProgress = 0; 

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 💡 平滑过渡 hover 状态
      const targetProgress = isHovering ? 1 : 0;
      hoverProgress += (targetProgress - hoverProgress) * 0.05;

      // 获取视差位移
      const dx = starMoveX.get();
      const dy = starMoveY.get();

      const time = Date.now() * 0.001;

      // 🌌 绘制星座连线 (先画线，再画点，这样线在点下面)
      ctx.lineWidth = 0.8; // 🔥 加粗线条 (0.5 -> 0.8)
      stars.forEach((star, i) => {
        if (!star.isConnector) return;

        // 应用视差计算当前位置
        const parallaxFactor = star.size * 0.2;
        const x1 = star.x + dx * parallaxFactor;
        const y1 = star.y + dy * parallaxFactor;

        // 寻找临近的连接点
        for (let j = i + 1; j < stars.length; j++) {
          const other = stars[j];
          if (!other.isConnector) continue;

          const otherParallax = other.size * 0.2;
          const x2 = other.x + dx * otherParallax;
          const y2 = other.y + dy * otherParallax;

          const dist = Math.hypot(x2 - x1, y2 - y1);

          // 连线距离阈值 (放宽距离 150 -> 180)
          if (dist < 180) {
            // 线条透明度 = 基础 (0.1) + 能量激发 (0.6) - 距离衰减
            let lineOpacity = 0.1 + hoverProgress * 0.6; // 🔥 大幅提升亮度
            lineOpacity *= (1 - dist / 180); // 越远越淡

            if (lineOpacity > 0) {
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
              ctx.stroke();
            }
          }
        }
      });

      // ✨ 绘制星星
      stars.forEach(star => {
        const blink = Math.sin(time * 2 + star.blinkOffset) * 0.1;
        let currentOpacity = star.baseOpacity + blink; 
        currentOpacity = currentOpacity + (star.targetOpacity - currentOpacity) * hoverProgress;
        currentOpacity = Math.max(0, Math.min(1, currentOpacity));

        const parallaxFactor = star.size * 0.2;
        const x = star.x + dx * parallaxFactor;
        const y = star.y + dy * parallaxFactor;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      stars.forEach(star => {
        star.x = Math.random() * width;
        star.y = Math.random() * height;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isHovering, starMoveX, starMoveY]);

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: isFocused ? 0 : 1 }}
      transition={{ duration: 1 }}
    />
  );
}
