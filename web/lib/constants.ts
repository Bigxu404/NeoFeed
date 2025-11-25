import { Infinity, Orbit, Spline, Fingerprint, Settings } from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Capture', href: '/', icon: Infinity }, // 首页：无限符号
  { label: 'Memories', href: '/history', icon: Orbit }, // 历史：轨道星球
  { label: 'Insights', href: '/insight', icon: Spline }, // 洞察：S形数据曲线 (Spline)
  { label: 'Identity', href: '/profile', icon: Fingerprint }, // 身份：生物指纹 (原 Profile)
  { label: 'Settings', href: '/settings', icon: Settings }, // 设置：齿轮
];
