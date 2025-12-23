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

export function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 初始化神经元节点
    const nodeCount = 40;
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
      });
    }
    nodesRef.current = nodes;

    // 初始化连接
    const connections: Connection[] = [];
    const maxDistance = 200;
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance && Math.random() > 0.7) {
          connections.push({
            from: i,
            to: j,
            pulseProgress: Math.random(),
            pulseSpeed: 0.002 + Math.random() * 0.003,
          });
        }
      }
    }
    connectionsRef.current = connections;

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制节点
      nodes.forEach((node) => {
        // 更新位置
        node.x += node.vx;
        node.y += node.vy;

        // 边界反弹
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // 绘制节点
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.5)'; // blue-500
        ctx.fill();

        // 节点光晕
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.radius * 3
        );
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // 绘制连接和脉冲
      connections.forEach((conn) => {
        const fromNode = nodes[conn.from];
        const toNode = nodes[conn.to];

        // 绘制连接线
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 更新脉冲进度
        conn.pulseProgress += conn.pulseSpeed;
        if (conn.pulseProgress > 1) {
          conn.pulseProgress = 0;
        }

        // 绘制脉冲
        const pulseX = fromNode.x + (toNode.x - fromNode.x) * conn.pulseProgress;
        const pulseY = fromNode.y + (toNode.y - fromNode.y) * conn.pulseProgress;

        const pulseGradient = ctx.createRadialGradient(
          pulseX,
          pulseY,
          0,
          pulseX,
          pulseY,
          8
        );
        pulseGradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        pulseGradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.4)');
        pulseGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 8, 0, Math.PI * 2);
        ctx.fillStyle = pulseGradient;
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
      style={{ opacity: 0.6 }}
    />
  );
}
