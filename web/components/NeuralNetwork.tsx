import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Connection {
  from: number;
  to: number;
  pulseProgress: number;
  pulseSpeed: number;
}

export default function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 优化：根据屏幕面积动态调整节点数量，避免大屏卡顿或小屏太稀疏
    const area = canvas.width * canvas.height;
    const nodeCount = Math.floor(area / 25000); // 每 25000px² 一个节点
    
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2, // 降低速度，更优雅
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.5 + 0.5, // 稍微调小粒子，更精致
      });
    }
    nodesRef.current = nodes;

    const connections: Connection[] = [];
    const maxDistance = 180; // 连接距离
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance && Math.random() > 0.75) { // 减少连接概率，让网络更稀疏透气
          connections.push({
            from: i,
            to: j,
            pulseProgress: Math.random(),
            pulseSpeed: 0.002 + Math.random() * 0.004,
          });
        }
      }
    }
    connectionsRef.current = connections;

    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. 绘制连接线 (先画线，让线在点下面)
      connections.forEach((conn) => {
        const fromNode = nodes[conn.from];
        const toNode = nodes[conn.to];

        // 距离检查：如果点跑太远了，不画线 (虽然建立连接时检查了，但点会动)
        // 为了性能，这里简化，假设连接一直存在，视觉上用透明度控制
        const dx = fromNode.x - toNode.x;
        const dy = fromNode.y - toNode.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > maxDistance * maxDistance) return;

        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        // 颜色调整为：淡靛青/白色，匹配黑洞余晖
        ctx.strokeStyle = 'rgba(199, 210, 254, 0.1)'; // indigo-200 like
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // 脉冲
        conn.pulseProgress += conn.pulseSpeed;
        if (conn.pulseProgress > 1) conn.pulseProgress = 0;

        const pulseX = fromNode.x + (toNode.x - fromNode.x) * conn.pulseProgress;
        const pulseY = fromNode.y + (toNode.y - fromNode.y) * conn.pulseProgress;

        const pulseGradient = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 4);
        pulseGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        pulseGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 4, 0, Math.PI * 2);
        ctx.fillStyle = pulseGradient;
        ctx.fill();
      });

      // 2. 绘制节点
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(224, 231, 255, 0.6)'; // indigo-100
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      // 整体稍微淡一点，作为背景
      style={{ opacity: 0.8, mixBlendMode: 'screen' }} 
    />
  );
}
