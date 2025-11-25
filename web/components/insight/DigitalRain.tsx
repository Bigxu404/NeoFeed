'use client'

import { useEffect, useRef } from 'react';

export default function DigitalRain() {
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
    const characters = '日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺXYZ012345789<>'; 
    const fontSize = 14;
    const columns = width / fontSize;
    
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    // ✨ 性能优化：使用 requestAnimationFrame
    let animationFrameId: number;
    let lastTime = 0;
    const fps = 30; // 限制帧率，营造复古感并省电
    const interval = 1000 / fps;

    const draw = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;

      if (deltaTime >= interval) {
        lastTime = timestamp - (deltaTime % interval);

        // 1. 拖尾层
        ctx.fillStyle = 'rgba(5, 5, 5, 0.08)'; 
        ctx.fillRect(0, 0, width, height);

        // 2. 设置发光
        ctx.font = `bold ${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = characters.charAt(Math.floor(Math.random() * characters.length));
          
          const isHead = Math.random() > 0.98; 
          
          if (isHead) {
              ctx.fillStyle = '#ffffff'; 
              ctx.shadowColor = '#ffffff';
              ctx.shadowBlur = 15; 
          } else {
              ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0, 255, 65, 0.8)' : 'rgba(0, 184, 255, 0.8)'; 
              ctx.shadowBlur = 4; 
              ctx.shadowColor = ctx.fillStyle;
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
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none opacity-70"
    />
  );
}
