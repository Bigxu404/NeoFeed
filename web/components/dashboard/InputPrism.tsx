'use client';

import { motion } from 'framer-motion';
import { Zap, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputPrismProps {
    url: string;
    setUrl: (url: string) => void;
    status: 'idle' | 'scanning' | 'analyzing' | 'success' | 'error';
    progress: number;
    isProcessing: boolean;
    onIngest: () => void;
}

export default function InputPrism({ 
    url, 
    setUrl, 
    status, 
    progress, 
    isProcessing, 
    onIngest 
}: InputPrismProps) {
    return (
        <div className="flex flex-col h-full justify-between">
            {/* 顶部：文案对齐左上角 */}
            <div className="pt-2">
                <div className="flex items-center gap-2 mb-6">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">输入棱镜 Input Prism</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-light leading-tight mb-6 text-white/90 tracking-tight">
                    捕获 <span className="font-serif italic text-white/40">万物</span>
                </h2>
                <p className="text-sm md:text-lg text-white/30 max-w-xl leading-relaxed font-light">
                    将整个互联网作为你的数据源。粘贴 URL，记录灵感，或初始化自动化代理任务。
                </p>
            </div>

            {/* 底部：输入框下移贴合 */}
            <div className="relative group w-full pb-2">
                {status === 'scanning' && (
                    <motion.div 
                        layoutId="scanner" 
                        className="absolute left-0 right-0 top-0 h-full bg-cyan-500/10 z-0" 
                        initial={{ scaleY: 0 }} 
                        animate={{ scaleY: 1 }} 
                        transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }} 
                    />
                )}
                {isProcessing && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden rounded-t-2xl z-20">
                        <motion.div 
                            className="h-full bg-cyan-500" 
                            initial={{ width: 0 }} 
                            animate={{ width: `${progress}%` }} 
                            transition={{ duration: 0.5 }} 
                        />
                    </div>
                )}
                
                {/* 输入框背后的辉光 */}
                <div className={cn(
                    "absolute -inset-1 rounded-2xl opacity-10 group-hover:opacity-30 blur-xl transition duration-700", 
                    status === 'error' ? "bg-red-500" : status === 'success' ? "bg-green-500" : "bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500"
                )} />

                <div className="relative bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 flex items-center z-10 transition-all duration-500 group-hover:border-white/20">
                    <input 
                        type="text" 
                        value={url} 
                        onChange={(e) => setUrl(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && onIngest()} 
                        disabled={isProcessing} 
                        placeholder={
                            status === 'scanning' ? "正在初始化协议..." : 
                            status === 'analyzing' ? "神经网络处理中..." : 
                            status === 'success' ? "传输完成。" : 
                            status === 'error' ? "传输失败。" : 
                            "粘贴 URL 或输入指令..."
                        } 
                        className="w-full bg-transparent border-none outline-none text-white px-6 py-5 placeholder:text-white/10 font-mono text-sm md:text-base disabled:cursor-not-allowed" 
                    />
                    <button 
                        onClick={() => onIngest()} 
                        disabled={isProcessing} 
                        className={cn(
                            "p-4 rounded-xl transition-all duration-300 flex items-center justify-center min-w-[56px] shadow-2xl", 
                            isProcessing ? "bg-white/5 cursor-wait" : "bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20"
                        )}
                    >
                        {status === 'scanning' || status === 'analyzing' ? (
                            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                        ) : status === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : status === 'error' ? (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
