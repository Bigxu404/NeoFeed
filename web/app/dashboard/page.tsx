'use client'

import { Suspense } from 'react';
import Workbench from '@/components/dashboard/Workbench';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    }>
      <Workbench />
    </Suspense>
  );
}
