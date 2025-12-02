'use client'

import SiteHeader from '@/components/site/SiteHeader';
import SiteHero from '@/components/site/SiteHero';
import FeatureGrid from '@/components/site/FeatureGrid';
import FlowStream from '@/components/site/FlowStream';
import FinalCTA from '@/components/site/FinalCTA';
import AboutSection from '@/components/site/AboutSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-green-500/30 selection:text-black overflow-x-hidden">
      
      {/* Deep Noise Texture */}
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none bg-[url('/noise.svg')] z-50 mix-blend-overlay" />
      
      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] bg-repeat" />

      <SiteHeader />
      
      <main className="relative z-10 flex flex-col">
        <SiteHero />
        <FlowStream />
        <FeatureGrid />
        <FinalCTA />
        <AboutSection />
      </main>
    </div>
  );
}
