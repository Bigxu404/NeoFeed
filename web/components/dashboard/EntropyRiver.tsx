'use client'

import { useRef, useEffect } from 'react';

export default function EntropyRiver() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 200;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      time += 0.005; // Slower, more majestic
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = 100; // More detail
      const step = canvas.width / cols;

      // Create a gradient for the lines
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)'); // Chaotic White
      gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.1)'); // Processing Green
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)'); // Orderly Blue

      // Draw Flow Lines
      for (let j = 0; j < 8; j++) {
        ctx.beginPath();
        ctx.lineWidth = j === 0 ? 2 : 1;
        ctx.strokeStyle = gradient;

        for (let i = 0; i <= cols; i++) {
          const x = i * step;
          const progress = i / cols;
          
          // Entropy factor: 1 -> 0
          // Non-linear easing for more dramatic transition
          const entropy = Math.pow(1 - progress, 3); 

          // Chaos (Left)
          const chaos = Math.sin(x * 0.1 + time * (j + 2) + Math.cos(time)) * 40 * entropy;
          const jitter = (Math.random() - 0.5) * 10 * entropy;
          
          // Order (Right) - Sine wave becomes flat line
          const order = Math.sin(x * 0.05 + time) * 5 * (1 - entropy);
          
          // Vertical spread converges
          const spread = (j - 4) * 15 * (1 - entropy * 0.5);

          const y = canvas.height / 2 + chaos + jitter + order + spread;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw Data Particles
      // Only on the left (Chaotic input) and Right (Structured output packets)
      for (let k = 0; k < 15; k++) {
          // Left side chaos particles
          const lx = (Math.random() * canvas.width * 0.3);
          const ly = canvas.height / 2 + (Math.random() - 0.5) * 100;
          if (Math.random() > 0.95) {
              ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
              ctx.fillRect(lx, ly, 2, 2);
          }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[250px] z-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full opacity-60 mix-blend-screen" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
    </div>
  );
}
