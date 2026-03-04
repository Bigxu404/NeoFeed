'use client';

import React, { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { useFeeds } from '@/hooks/useFeeds';
import { useProfile } from '@/hooks/useProfile';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import DualPaneModal from '@/components/dashboard/DualPaneModal';
import { GalaxyItem } from '@/types';
import { Search, Loader2, Zap, Brain, Calendar, Hash, ArrowRight } from 'lucide-react';
import { crystallizeFeed, getFeedsByIds } from '@/app/dashboard/actions';
import { getFeedIdsWithNotes } from '@/app/dashboard/feed-notes-actions';
import { toast } from 'sonner';

type TabType = 'fast' | 'slow';

export default function LibraryPage() {
  const { feeds, loading, isOffline, updateFeedInCache } = useFeeds();
  const { profile, clearCache } = useProfile();
  
  const [activeTab, setActiveTab] = useState<TabType>('fast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGalaxyItem, setSelectedGalaxyItem] = useState<GalaxyItem | null>(null);

  const { data: feedIdsWithNotes = [], mutate: mutateFeedIdsWithNotes } = useSWR(
    'library/feed-ids-with-notes',
    async () => {
      const r = await getFeedIdsWithNotes();
      if (r.error) throw new Error(r.error);
      return r.data;
    },
    { revalidateOnFocus: true }
  );

  // 切换到慢思考 tab 时重新拉取「有笔记的 feed id」列表
  useEffect(() => {
    if (activeTab === 'slow') {
      mutateFeedIdsWithNotes();
    }
  }, [activeTab, mutateFeedIdsWithNotes]);

  // 慢思考 tab：按「有笔记的 id」单独拉取完整 feed 列表，不受 getFeeds() 的 100 条限制
  const { data: feedsWithNotes = [], isLoading: feedsWithNotesLoading } = useSWR(
    activeTab === 'slow' && feedIdsWithNotes.length > 0
      ? ['library/feeds-with-notes', feedIdsWithNotes.join(',')]
      : null,
    async () => {
      const r = await getFeedsByIds(feedIdsWithNotes);
      if (r.error) return [];
      return r.data;
    },
    { revalidateOnFocus: true }
  );

  // ── Data Processing ──
  const filteredFeeds = useMemo(() => {
    const baseList = activeTab === 'fast' ? feeds : feedsWithNotes;
    let result = baseList;

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f =>
        f.title?.toLowerCase().includes(q) ||
        f.summary?.toLowerCase().includes(q) ||
        f.user_notes?.toLowerCase().includes(q) ||
        f.tags?.some(t => t.toLowerCase().includes(q)) ||
        f.user_tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [activeTab, feeds, feedsWithNotes, searchQuery]);

  // ── Actions ──
  const handleItemClick = (item: any) => {
    const galaxyItem: GalaxyItem = {
      id: item.id,
      title: item.title || '',
      summary: item.summary || item.title || '',
      content: item.content_raw || '',
      content_original: item.content_original || '',
      date: new Date(item.created_at).toISOString().split('T')[0],
      timestamp: new Date(item.created_at).getTime(),
      category: item.category || 'other',
      tags: item.tags || [],
      color: '#a855f7',
      size: 1,
      position: [0, 0, 0],
      user_notes: item.user_notes || '',
      user_tags: item.user_tags || [],
      user_weight: item.user_weight || 1.0
    };
    setSelectedGalaxyItem(galaxyItem);
  };

  const handleCrystallize = async (note: string, tags: string[], weight: number) => {
    if (!selectedGalaxyItem) return;
    const res = await crystallizeFeed(selectedGalaxyItem.id, note, tags, weight);
    if (res.error) {
      toast.error('保存失败: ' + res.error);
    } else {
      toast.success('洞察已结晶');
      if (res.data) {
        updateFeedInCache(res.data);
        setSelectedGalaxyItem(prev => prev ? { ...prev, user_notes: res.data!.user_notes, user_tags: tags, user_weight: weight } : null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-white/20 relative flex flex-col">
      {/* ── Header ── */}
      <div className="sticky top-0 z-[100] bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 lg:px-12 2xl:px-16 py-3">
        <ErrorBoundary name="Header">
          <DashboardHeader profile={profile} clearCache={clearCache} isOffline={isOffline} />
        </ErrorBoundary>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col">
        
        {/* ── Page Title & Search ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mb-2">知识库</h1>
            <p className="text-white/40 font-mono text-sm uppercase tracking-widest">Knowledge Base</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="搜索标题、摘要、笔记或标签..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('fast')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === 'fast' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
          >
            <Zap className="w-4 h-4" />
            快思考 (Feeds)
          </button>
          <button 
            onClick={() => setActiveTab('slow')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === 'slow' ? 'bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
          >
            <Brain className="w-4 h-4" />
            慢思考 (Notes)
          </button>
        </div>

        {/* ── List Content ── */}
        <div className="flex-1">
          {(loading || (activeTab === 'slow' && feedIdsWithNotes.length > 0 && feedsWithNotesLoading)) ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-white/20 mb-4" />
              <div className="text-white/30 font-mono text-sm uppercase tracking-widest">Fetching Knowledge...</div>
            </div>
          ) : filteredFeeds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
              <div className="text-5xl mb-4 opacity-20">{activeTab === 'fast' ? '⚡️' : '🧠'}</div>
              <h3 className="text-xl font-serif text-white/80 mb-2">
                {activeTab === 'fast' ? '暂无快思考记录' : '暂无慢思考结晶'}
              </h3>
              <p className="text-white/40 text-sm max-w-md">
                {activeTab === 'fast' 
                  ? '开始在工作台投喂信息，这里将汇聚您所有的信息流。' 
                  : '在阅读文章时记录下您的思考，它们将在这里沉淀为真正的个人知识。'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredFeeds.map((feed) => (
                <div 
                  key={feed.id}
                  onClick={() => handleItemClick(feed)}
                  className="group relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 p-4 md:p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer overflow-hidden"
                >
                  {/* Left decorative line for Slow thinking */}
                  {activeTab === 'slow' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#a855f7] to-purple-900 opacity-50 group-hover:opacity-100 transition-opacity" />
                  )}

                  {/* Main Content Area */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2 w-full">
                    {activeTab === 'fast' ? (
                      // FAST THINKING VIEW
                      <>
                        <h3 className="text-base md:text-lg font-bold text-white/90 truncate">
                          {feed.title || 'Untitled'}
                        </h3>
                        {feed.summary && (
                          <p className="text-sm text-white/50 line-clamp-1">
                            {feed.summary}
                          </p>
                        )}
                      </>
                    ) : (
                      // SLOW THINKING VIEW（有 feed_notes 即展示；user_notes 可能尚未生成总结）
                      <>
                        <p className="text-base md:text-lg font-serif italic text-white/90 line-clamp-2 leading-relaxed">
                          {feed.user_notes?.trim()
                            ? `"${feed.user_notes}"`
                            : '已记录想法，点击打开可查看或生成 AI 总结'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                          <ArrowRight className="w-3 h-3" />
                          <span className="truncate">源自: {feed.title || 'Untitled'}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Meta Data Area */}
                  <div className="flex items-center gap-4 md:gap-6 shrink-0 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-white/5 md:border-none">
                    
                    {/* Tags */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      <Hash className="w-3 h-3 text-white/20" />
                      <div className="flex gap-1">
                        {activeTab === 'fast' ? (
                          feed.tags?.slice(0, 2).map((t, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 whitespace-nowrap">
                              {t}
                            </span>
                          ))
                        ) : (
                          feed.user_tags?.slice(0, 2).map((t, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 whitespace-nowrap">
                              {t}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Weight (Slow Only) */}
                    {activeTab === 'slow' && feed.user_weight && (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-purple-300/60 bg-purple-500/5 px-2 py-1 rounded border border-purple-500/10">
                        W:{feed.user_weight.toFixed(1)}
                      </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs text-white/30 font-mono w-24 justify-end">
                      <Calendar className="w-3 h-3" />
                      {new Date(feed.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DualPaneModal
        isOpen={!!selectedGalaxyItem}
        onClose={() => setSelectedGalaxyItem(null)}
        item={selectedGalaxyItem}
        onCrystallize={handleCrystallize}
        onSummaryGenerated={(feedId, userNotes) => {
          if (!selectedGalaxyItem || selectedGalaxyItem.id !== feedId) return;
          const updated = { ...selectedGalaxyItem, user_notes: userNotes ?? undefined };
          updateFeedInCache(updated);
          setSelectedGalaxyItem(updated);
        }}
      />
    </div>
  );
}
