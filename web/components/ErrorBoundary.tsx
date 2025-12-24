'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6 font-sans">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
              <AlertCircle className="w-20 h-20 text-red-500 relative z-10 mx-auto" strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white/90 uppercase font-mono">
                Neural Interface Fracture
              </h1>
              <p className="text-white/40 text-sm leading-relaxed">
                系统检测到神经网络异常波动。部分现实已坍塌。
              </p>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-[10px] text-red-400/60 break-all text-left">
              ERROR_LOG: {this.state.error?.message || 'Unknown synaptic failure'}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-neutral-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                重启接口
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors text-white/60"
              >
                <Home className="w-4 h-4" />
                返回母体
              </button>
            </div>
          </div>

          <div className="mt-12 text-[10px] text-white/10 uppercase tracking-[0.3em] font-mono">
            NeoFeed Intelligence System v0.1.0
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

