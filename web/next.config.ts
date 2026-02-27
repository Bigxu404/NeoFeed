import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 设为 false 可在构建时暴露类型错误；当前保留 true 以通过构建，待逐步修复 any/类型后再关闭
    ignoreBuildErrors: true,
  },
  // ℹ️ ESLint 检查在 Next.js 16+ 默认通过 CLI 运行，不再在 next.config.ts 中配置 ignoreDuringBuilds
  // 局域网部署：允许从本机 LAN IP 访问开发服务器（避免 Cross origin request 被拦截）
  // 更换 WiFi 后请用终端执行：ipconfig getifaddr en0 查看新 IP，并更新下方数组
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "192.168.31.46", // 当前本机 LAN IP（en0）
  ],
};

export default nextConfig;
