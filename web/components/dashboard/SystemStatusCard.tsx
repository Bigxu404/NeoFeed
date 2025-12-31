'use client';

import { Globe } from 'lucide-react';
import { BentoCard } from './BentoGrid';

export default function SystemStatusCard() {
    return (
        <BentoCard colSpan={1} rowSpan={1} className="bg-neutral-900/30">
            <div className="flex flex-row h-full items-center justify-between px-2">
                <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] uppercase text-white/60">系统正常</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Globe className="w-2.5 h-2.5 text-blue-500" />
                        <span className="text-[9px] uppercase text-white/60">网络已连接</span>
                     </div>
                </div>
                <div className="h-8 w-px bg-white/10 mx-2" />
                <div className="text-right">
                    <div className="text-[8px] text-white/30 font-mono">CPU: 12%</div>
                    <div className="text-[8px] text-white/30 font-mono">MEM: 34%</div>
                </div>
            </div>
        </BentoCard>
    );
}

