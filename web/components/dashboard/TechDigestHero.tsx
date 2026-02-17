'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import HeroScene from './HeroScene';

interface DigestData {
  digest: {
    focus_areas: string[];
    thoughts: string[];
    viewpoints: string[];
    preferences: string[];
    overview: string;
    owner_name: string;
    feed_count: number;
  };
  imageUrl: string | null;
  cachedAt: string;
  feedCountAtGen: number;
}

const CACHE_KEY = 'neofeed_knowledge_digest';
const REGEN_THRESHOLD = 10;

export default function TechDigestHero({ feedCount }: { feedCount: number }) {
  const [data, setData] = useState<DigestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitRef = useRef(false);

  const generateDigest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateImage: true }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || '生成失败');
      }

      const result = await res.json();
      const cacheData: DigestData = {
        digest: result.digest,
        imageUrl: result.imageUrl,
        cachedAt: new Date().toISOString(),
        feedCountAtGen: feedCount,
      };

      setData(cacheData);
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (e: any) {
      console.error('❌ [TechDigestHero] Error:', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [feedCount]);

  useEffect(() => {
    if (feedCount < 3 || hasInitRef.current) return;
    hasInitRef.current = true;

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as DigestData;
        setData(parsed);
        if (feedCount - parsed.feedCountAtGen >= REGEN_THRESHOLD) {
          generateDigest();
        }
      } catch (e) {
        generateDigest();
      }
    } else {
      generateDigest();
    }
  }, [feedCount, generateDigest]);

  if (feedCount < 3 && !data) return null;

  // 骨架屏
  if (loading && !data) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-[#1A1A1C] to-[#141416] p-8 mb-8 animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-3">
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-5/6 bg-white/5 rounded" />
            <div className="h-3 w-2/3 bg-white/5 rounded mt-4" />
          </div>
          <div className="hidden md:block w-[220px] h-[220px] rounded-xl bg-white/5 shrink-0" />
        </div>
      </div>
    );
  }

  if (!data && !loading) return null;

  const { digest, imageUrl } = data || { digest: null, imageUrl: null };
  if (!digest) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full mb-24 relative group/digest overflow-hidden rounded-sm min-h-[600px] flex items-center"
    >
      {/* ── 背景层：3D 场景或 AI 图片 ── */}
      {imageUrl ? (
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full"
          >
            <img
              src={imageUrl}
              alt="知识库封面"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).parentElement!.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-[#0A0A0B]/80 to-[#0A0A0B]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent" />
          </motion.div>
        </div>
      ) : (
        <HeroScene />
      )}

      {/* ── 内容层：右侧文字排版 ── */}
      <div className="relative z-10 w-full px-8 md:px-16 flex justify-end py-20">
        <div className="w-full md:w-1/2 flex flex-col items-center text-center md:items-center">
          
          {/* Eyebrow */}
          <div className="mb-6">
             <span className="text-[11px] font-serif tracking-[0.2em] text-white/60 uppercase">
               NeoFeed Intelligence
             </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white tracking-wide leading-tight mb-8 text-center">
            WELCOME,<br />
            HUMAN.
          </h1>

          {/* Body */}
          <p className="text-base md:text-lg text-white/80 leading-loose font-serif font-light mb-10 max-w-md text-center">
            {digest.overview}
          </p>

          {/* Footer / Actions */}
          <div className="flex flex-col items-center gap-6">
             <div className="text-xs font-bold text-white/50 tracking-wide">
                By AI Curator
             </div>
             
             {/* Refresh Button styled like "Listen" pill */}
             <button
               onClick={() => generateDigest()}
               disabled={loading}
               className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 transition-all group/btn backdrop-blur-sm"
             >
               <RefreshCw className={cn("w-3.5 h-3.5 text-white/70 group-hover/btn:text-white transition-colors", loading && "animate-spin")} />
               <span className="text-[11px] font-medium text-white/70 group-hover/btn:text-white transition-colors tracking-widest uppercase">Regenerate</span>
             </button>
          </div>
          
          {/* Updating State */}
          {loading && (
            <div className="mt-6 flex items-center gap-2 text-[10px] text-white/40 font-mono tracking-wider">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>UPDATING...</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
