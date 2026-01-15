'use client'

import { useEffect, useRef } from 'react';

export default function DigitalRain({ opacity = 0.7 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // ✨ 字符集：片假名 + 倒置字母 + 数字
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ[]{}<>/\\|-_+=$#@!%'; 
    const fontSize = 14;
    const columns = width / fontSize;
    
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    // ✨ 性能优化：使用 requestAnimationFrame
    let animationFrameId: number;
    let lastTime = 0;
    const fps = 24; // 更低的帧率营造更复古的终端感
    const interval = 1000 / fps;

    const draw = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;

      if (deltaTime >= interval) {
        lastTime = timestamp - (deltaTime % interval);

        // 1. 拖尾层：更深的绿黑色背景
        ctx.fillStyle = 'rgba(2, 8, 2, 0.12)'; 
        ctx.fillRect(0, 0, width, height);

        // 2. 设置发光
        ctx.font = `bold ${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = characters.charAt(Math.floor(Math.random() * characters.length));
          
          const isHead = Math.random() > 0.98; 
          
          if (isHead) {
              ctx.fillStyle = '#ffffff'; 
              ctx.shadowColor = '#1ff40a';
              ctx.shadowBlur = 10; 
          } else {
              // 经典 Pip-boy 绿
              ctx.fillStyle = '#1ff40a'; 
              ctx.shadowBlur = 2; 
              ctx.shadowColor = '#1ff40a';
          }

          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > height && Math.random() > 0.985) {
            drops[i] = 0;
          }

          drops[i]++;
        }
        
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // 启动循环
    animationFrameId = requestAnimationFrame(draw);

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        const newColumns = width / fontSize;
        if (newColumns > drops.length) {
             for (let i = drops.length; i < newColumns; i++) {
                 drops[i] = Math.random() * -100;
             }
        }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId); // ✨ 正确清理 rAF
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ opacity: opacity * 0.5, filter: 'blur(0.5px)' }}
      />
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_4px,4px_100%] opacity-40 pointer-events-none" />
      {/* Screen Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-10 pointer-events-none" />
      {/* Slight Screen Flicker Overlay */}
      <div className="absolute inset-0 bg-[#1ff40a]/[0.02] animate-[flicker_0.15s_infinite] z-20 pointer-events-none" />
    </div>
  );
}
