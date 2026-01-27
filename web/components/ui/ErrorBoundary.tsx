'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error caught by Boundary [${this.props.name || 'Unknown'}]:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-full w-full min-h-[100px] rounded-3xl bg-red-500/5 border border-red-500/20 p-6 flex flex-col items-center justify-center text-center space-y-3 backdrop-blur-sm">
          <AlertCircle className="w-6 h-6 text-red-500/50" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest">系统模块异常</h3>
            <p className="text-[10px] text-white/30 font-mono">
              {this.props.name || 'Module'} Encountered a Fault
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-white/50 transition-colors"
          >
            <RefreshCcw className="w-3 h-3" />
            尝试重连
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
