'use client'

import { useState } from 'react';
import NarrativeIntro from '@/components/dashboard/NarrativeIntro';

export default function DashboardPage() {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return <NarrativeIntro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center text-white">
      <h1 className="text-2xl font-bold">Scene 2: The NeoFeed Savior Arrives...</h1>
      {/* This is where we will build the Final Dashboard later */}
    </div>
  );
}
