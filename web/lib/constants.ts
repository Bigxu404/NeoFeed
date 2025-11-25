import { Infinity, Orbit, Eye, Dna, Settings } from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Capture', href: '/', icon: Infinity }, // 首页：无限 (奇点)
  { label: 'Memories', href: '/history', icon: Orbit }, // 历史：轨道 (星系)
  { label: 'Insights', href: '/insight', icon: Eye }, // 洞察：全知之眼 (觉醒)
  { label: 'Identity', href: '/profile', icon: Dna }, // 身份：数字基因 (本质)
  { label: 'Settings', href: '/settings', icon: Settings }, // 设置：齿轮 (系统)
];
