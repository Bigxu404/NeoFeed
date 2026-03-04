'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { toast } from 'sonner';
import { useFeeds } from '@/hooks/useFeeds';
import { useFeedContent } from '@/hooks/useFeedContent';
import { ArrowLeft, Quote, Sparkles, ArrowUp, Pen, Loader2, Trash2, Pencil, MessageCircle, Send, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { getFeedNotes, createFeedNote, updateFeedNote, deleteFeedNote, syncFeedNotesSummaryToFeed } from '@/app/dashboard/feed-notes-actions';
import { askArticleAssistant } from '@/app/dashboard/reader-assistant-actions';
import type { FeedNote } from '@/types/database';

const LIBRARY_FEED_IDS_WITH_NOTES_KEY = 'library/feed-ids-with-notes';

function QuoteBlock({ text, expanded, onToggle }: { text: string; expanded: boolean; onToggle: () => void }) {
  const isLong = text.length > 120 || text.split(/\n/).length > 3;

  return (
    <button
      type="button"
      onClick={isLong ? onToggle : undefined}
      className={`w-full text-left rounded-xl bg-amber-50/90 border border-amber-200/60 p-4 mb-4 ${isLong ? 'cursor-pointer active:bg-amber-100/90' : ''}`}
    >
      <span className="text-amber-600 text-xl leading-none mr-0.5 align-top font-serif">"</span>
      <span className={`text-gray-700 text-[15px] leading-relaxed ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
        {text}
      </span>
      {isLong && (
        <span className="block text-amber-600/90 text-xs mt-2 font-medium">
          {expanded ? '点击收起' : '点击展开完整引用'}
        </span>
      )}
    </button>
  );
}

export default function MobileReaderPage() {
  const params = useParams();
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const id = params.id as string;
  const articleContentRef = useRef<HTMLDivElement>(null);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notes, setNotes] = useState<FeedNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<string>('');
  const [quoteExpanded, setQuoteExpanded] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantInputFocused, setAssistantInputFocused] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  // 键盘弹起时 Visual Viewport 的可视高度与顶部偏移，用于固定卡片在可视区域内
  const [visualHeight, setVisualHeight] = useState<number | null>(null);
  const [visualOffsetTop, setVisualOffsetTop] = useState(0);

  // 监听 Visual Viewport 变化（键盘弹起/收起），驱动 Neo-AI 卡片位置与高度
  useEffect(() => {
    if (!assistantOpen || typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const sync = () => {
      setVisualHeight(vv.height);
      setVisualOffsetTop(vv.offsetTop);
    };
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
    };
  }, [assistantOpen]);

  // 关闭浮层时清空，避免下次打开沿用旧值
  useEffect(() => {
    if (!assistantOpen) {
      setVisualHeight(null);
      setVisualOffsetTop(0);
    }
  }, [assistantOpen]);

  useEffect(() => {
    const handleScroll = () => {
      // 当页面向下滚动超过 300px 时显示返回顶部按钮
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadNotes = useCallback(async () => {
    if (!id) return;
    setNotesLoading(true);
    const { data } = await getFeedNotes(id);
    setNotes(data || []);
    setNotesLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) loadNotes();
  }, [id, loadNotes]);

  useEffect(() => {
    if (drawerOpen && id) {
      loadNotes();
      setQuoteExpanded(false);
      setExpandedNoteId(null);
      setEditingNoteId(null);
    }
  }, [drawerOpen, id, loadNotes]);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !articleContentRef.current) return;
      const range = sel.getRangeAt(0);
      if (!articleContentRef.current.contains(range.commonAncestorContainer)) return;
      const t = sel.toString().trim();
      if (t) setSelectedQuote(t);
    };
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  // 从列表缓存中获取元数据（标题、摘要、笔记等）
  const { feeds, loading: feedsLoading, refreshFeeds, updateFeedInCache } = useFeeds();
  const feed = feeds.find(f => f.id === id);

  const handleGenerateSummary = async () => {
    if (!id || !feed) return;
    setSummaryLoading(true);
    const res = await syncFeedNotesSummaryToFeed(id);
    setSummaryLoading(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    if (res.data) {
      updateFeedInCache({ ...feed, user_notes: res.data.user_notes });
      await refreshFeeds();
      toast.success('AI 汇总理解已更新');
    }
  };

  const handleSaveNote = async () => {
    if (!id || !noteInput.trim()) return;
    setSaving(true);
    const { error } = await createFeedNote(id, noteInput.trim(), selectedQuote || null);
    setSaving(false);
    if (error) return;
    setNoteInput('');
    setSelectedQuote('');
    await loadNotes();
    await refreshFeeds();
    globalMutate(LIBRARY_FEED_IDS_WITH_NOTES_KEY);
  };

  const handleUpdateNote = async (note: FeedNote) => {
    if (!editContent.trim()) return;
    setSaving(true);
    const { error } = await updateFeedNote(note.id, editContent.trim());
    setSaving(false);
    if (error) return;
    setEditingNoteId(null);
    await loadNotes();
    await refreshFeeds();
    globalMutate(LIBRARY_FEED_IDS_WITH_NOTES_KEY);
  };

  const handleDeleteNote = async (note: FeedNote) => {
    setDeleting(true);
    const { error } = await deleteFeedNote(note.id);
    setDeleting(false);
    if (error) return;
    setEditingNoteId(null);
    await loadNotes();
    await refreshFeeds();
    globalMutate(LIBRARY_FEED_IDS_WITH_NOTES_KEY);
  };

  const handleAskAssistant = async () => {
    if (!id || !assistantInput.trim()) return;
    const q = assistantInput.trim();
    setAssistantInput('');
    setAssistantMessages((prev) => [...prev, { role: 'user', content: q }]);
    setAssistantLoading(true);
    const { answer, error } = await askArticleAssistant(id, q);
    setAssistantLoading(false);
    if (error) {
      setAssistantMessages((prev) => [...prev, { role: 'assistant', content: `错误：${error}` }]);
      return;
    }
    setAssistantMessages((prev) => [...prev, { role: 'assistant', content: answer || '暂无回复' }]);
  };

  // 获取完整正文内容
  const { content: fullContent, loading: contentLoading } = useFeedContent(
    id, 
    feed?.content_raw || feed?.summary || ''
  );

  // 如果连基本数据都还没加载出来（比如直接刷新了阅读页）
  if (feedsLoading && !feed) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] text-black pb-12">
        {/* 顶部悬浮返回导航骨架 */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#F7F8FA]/90 backdrop-blur-xl pb-3 pt-[max(env(safe-area-inset-top),1.5rem)] px-5 flex items-center justify-between border-b border-gray-200/50">
          <div className="w-10 h-10 bg-white rounded-full shadow-sm border border-gray-200/50 animate-pulse"></div>
          <div className="w-16 h-10 bg-white rounded-full shadow-sm border border-gray-200/50 animate-pulse"></div>
        </div>

        <article className="px-5 pt-[calc(max(env(safe-area-inset-top),1.5rem)+5rem)] pb-8 max-w-prose mx-auto">
          {/* 标题区骨架 */}
          <div className="w-full h-8 bg-gray-200/60 rounded-lg mb-3 animate-pulse"></div>
          <div className="w-2/3 h-8 bg-gray-200/60 rounded-lg mb-8 animate-pulse"></div>
          
          {/* 摘要骨架 */}
          <div className="bg-white rounded-[24px] p-6 mb-10 shadow-sm border border-gray-100">
            <div className="w-24 h-4 bg-gray-200/60 rounded mb-4 animate-pulse"></div>
            <div className="w-full h-4 bg-gray-200/40 rounded mb-2 animate-pulse"></div>
            <div className="w-5/6 h-4 bg-gray-200/40 rounded mb-2 animate-pulse"></div>
            <div className="w-4/5 h-4 bg-gray-200/40 rounded animate-pulse"></div>
          </div>
          
          {/* 正文骨架 */}
          <div className="mt-10 pt-10 border-t border-gray-200/50 space-y-4">
            <div className="w-full h-4 bg-gray-200/60 rounded animate-pulse"></div>
            <div className="w-full h-4 bg-gray-200/60 rounded animate-pulse"></div>
            <div className="w-11/12 h-4 bg-gray-200/60 rounded animate-pulse"></div>
            <div className="w-full h-4 bg-gray-200/60 rounded mt-8 animate-pulse"></div>
            <div className="w-4/5 h-4 bg-gray-200/60 rounded animate-pulse"></div>
          </div>
        </article>
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center">
        <p className="text-gray-500 font-medium">未找到该文章记录</p>
        <button 
          onClick={() => router.back()} 
          className="mt-6 px-6 py-2 bg-black text-white rounded-full font-bold active:scale-95 transition-transform"
        >
          返回上一页
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-black pb-12">
      {/* 顶部悬浮返回导航 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#F7F8FA]/90 backdrop-blur-xl pb-3 pt-[max(env(safe-area-inset-top),1.5rem)] px-5 flex items-center justify-between border-b border-gray-200/50">
        <button 
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 bg-white shadow-sm border border-gray-200/50 rounded-full text-black active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setAssistantOpen(true)}
          className="text-[14px] font-bold text-gray-700 hover:text-black bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200/50 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4" />
          Neo-AI
        </button>
      </div>

      <article className="px-5 pt-[calc(max(env(safe-area-inset-top),1.5rem)+5rem)] pb-8 max-w-prose mx-auto">
        {/* 标题区 */}
        <h1 className="text-[26px] font-extrabold leading-[1.3] text-gray-900 tracking-tight mb-4">
          {feed.title || 'Untitled'}
        </h1>
        
        {/* 来源链接 */}
        {feed.url && (
          <a href={feed.url} target="_blank" rel="noreferrer" className="inline-block text-[13px] text-blue-500 font-medium mb-8 hover:text-blue-600 active:opacity-70 transition-opacity">
            查看原文 ↗
          </a>
        )}

        {/* AI 汇总理解：仅当有至少一条想法时展示，由用户点击「生成总结」更新 */}
        {notes.length > 0 && (
          <div className="bg-gradient-to-br from-[#FFF5E9] to-[#FFF0DB] rounded-[24px] p-6 mb-8 border border-[#FFE8CC]/50 shadow-sm">
            <h3 className="text-xs font-bold text-[#D49854] uppercase tracking-widest mb-3 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <Quote className="w-4 h-4" />
                AI 汇总理解
              </span>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={summaryLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E2A669]/20 text-[#A67843] hover:bg-[#E2A669]/30 text-xs font-medium disabled:opacity-50"
              >
                {summaryLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {feed?.user_notes ? '刷新总结' : '生成总结'}
              </button>
            </h3>
            {feed?.user_notes ? (
              <p className="text-[16px] text-[#A67843] leading-relaxed font-medium whitespace-pre-wrap">
                {feed.user_notes}
              </p>
            ) : (
              <p className="text-[14px] text-[#A67843]/70">点击「生成总结」根据你的想法生成 AI 汇总</p>
            )}
          </div>
        )}

        {/* 快思考：AI 总结 */}
        {feed.summary && (
          <div className="bg-white rounded-[24px] p-6 mb-10 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              AI 总结
            </h3>
            <p className="text-[15px] text-gray-600 leading-relaxed">
              {feed.summary}
            </p>
          </div>
        )}

        {/* 正文内容：用于捕获选中引用 */}
        <div ref={articleContentRef} className="mt-10 pt-10 border-t border-gray-200/50">
          <div className="prose prose-lg prose-gray max-w-none text-gray-800 leading-relaxed font-serif tracking-wide
            prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
            prose-p:mb-6 prose-p:leading-[1.8]
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-[20px] prose-img:shadow-md
            prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-gray-500
          ">
            {contentLoading && !fullContent ? (
              <div className="py-4 space-y-4">
                <div className="w-full h-4 bg-gray-200/60 rounded animate-pulse"></div>
                <div className="w-full h-4 bg-gray-200/60 rounded animate-pulse"></div>
                <div className="w-11/12 h-4 bg-gray-200/60 rounded animate-pulse"></div>
                <div className="w-full h-4 bg-gray-200/60 rounded mt-8 animate-pulse"></div>
                <div className="w-full h-4 bg-gray-200/60 rounded animate-pulse"></div>
                <div className="w-4/5 h-4 bg-gray-200/60 rounded animate-pulse"></div>
                <div className="w-full h-4 bg-gray-200/60 rounded mt-8 animate-pulse"></div>
                <div className="w-5/6 h-4 bg-gray-200/60 rounded animate-pulse"></div>
              </div>
            ) : fullContent ? (
              <ReactMarkdown>{fullContent}</ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic text-center py-10">暂无正文内容</p>
            )}
          </div>
        </div>
      </article>

      {/* 左下角：记录想法入口（点击时再次捕获当前选区，避免移动端点击清空） */}
      <button
        onClick={() => {
          const sel = typeof window !== 'undefined' ? window.getSelection()?.toString()?.trim() : '';
          if (sel) setSelectedQuote(sel);
          setDrawerOpen(true);
        }}
        className="fixed bottom-8 left-6 z-40 flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/50 text-black active:scale-95 transition-transform"
      >
        <Pen className="w-5 h-5" />
      </button>

      {/* 返回顶部悬浮按钮 */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-6 z-50 flex items-center justify-center w-12 h-12 bg-black/80 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.15)] text-white active:scale-95 transition-transform"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 底部抽屉：大卡片 + 引用区 + 左右滑动查看记录 */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl bg-[#F0F1F3] shadow-2xl flex flex-col"
              style={{ height: '72vh', paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/60 shrink-0">
                <span className="text-base font-bold text-gray-800">我的想法</span>
                <button onClick={() => setDrawerOpen(false)} className="p-2 -m-2 text-gray-500 font-medium">关闭</button>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <div
                  className={`flex overflow-x-auto snap-x snap-mandatory gap-5 px-5 py-5 flex-1 min-h-0 ${notes.length === 0 ? 'justify-center' : ''}`}
                >
                  {/* 第一张：新建想法卡片（立即展示；无笔记时仅此一卡，始终居中不跳动） */}
                  <div className="flex-shrink-0 w-[calc(100%-2rem)] max-w-lg snap-center snap-always flex flex-col min-h-0">
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex-1 flex flex-col min-h-0 overflow-hidden">
                        {selectedQuote ? (
                          <QuoteBlock
                            text={selectedQuote}
                            expanded={quoteExpanded}
                            onToggle={() => setQuoteExpanded((e) => !e)}
                          />
                        ) : (
                          <div className="mb-4 text-gray-400 text-sm">未选中引用时，直接写下你的观点或想法</div>
                        )}
                        <textarea
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="输入你的观点或想法"
                          className="flex-1 min-h-[120px] w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white resize-none"
                        />
                        {notesLoading && notes.length === 0 ? (
                          <div className="mt-3 flex items-center justify-center gap-2 text-gray-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            加载历史想法…
                          </div>
                        ) : null}
                        <button
                          onClick={handleSaveNote}
                          disabled={!noteInput.trim() || saving}
                          className="mt-4 w-full py-3.5 rounded-xl bg-black text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          保存
                        </button>
                      </div>
                    </div>
                  {/* 已有记录卡片：左右滑动查看，支持编辑/删除 */}
                  {!notesLoading && notes.map((note) => (
                      <div
                        key={note.id}
                        className="flex-shrink-0 w-[calc(100%-2rem)] max-w-lg snap-center snap-always flex flex-col min-h-0"
                      >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex-1 flex flex-col min-h-0 overflow-hidden">
                          {editingNoteId === note.id ? (
                            <>
                              {note.selected_text ? (
                                <div className="rounded-xl bg-amber-50/90 border border-amber-200/60 p-4 mb-4">
                                  <span className="text-amber-600 text-xl font-serif">"</span>
                                  <span className="text-gray-700 text-[15px] line-clamp-3">{note.selected_text}</span>
                                </div>
                              ) : null}
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="输入你的观点或想法"
                                className="flex-1 min-h-[100px] w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                              />
                              <div className="flex gap-3 mt-4">
                                <button
                                  onClick={() => handleDeleteNote(note)}
                                  disabled={deleting}
                                  className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                  删除
                                </button>
                                <button
                                  onClick={() => handleUpdateNote(note)}
                                  disabled={!editContent.trim() || saving}
                                  className="flex-1 py-3 rounded-xl bg-black text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                  保存
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-xs text-gray-400 shrink-0">
                                  {new Date(note.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNoteId(note.id);
                                      setEditContent(note.content);
                                    }}
                                    className="p-2 rounded-full text-gray-400 hover:bg-gray-100 active:bg-gray-200"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteNote(note)}
                                    disabled={deleting}
                                    className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 disabled:opacity-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              {note.selected_text ? (
                                <QuoteBlock
                                  text={note.selected_text}
                                  expanded={expandedNoteId === note.id}
                                  onToggle={() => setExpandedNoteId((id) => (id === note.id ? null : note.id))}
                                />
                              ) : null}
                              <p
                                className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap flex-1 cursor-pointer"
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setEditContent(note.content);
                                }}
                              >
                                {note.content}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 半屏 Neo-AI 对话：浮动卡片，键盘弹起时用 Visual Viewport 保证输入框在可视区内 */}
      <AnimatePresence>
        {assistantOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAssistantOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed left-4 right-4 z-[60] flex flex-col rounded-[24px] bg-[#FAFAFA] shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
              style={
                assistantInputFocused && visualHeight != null
                  ? {
                      top: `${visualOffsetTop + 16}px`,
                      bottom: 'auto',
                      maxHeight: `${Math.max(240, visualHeight - 32)}px`,
                      minHeight: '240px',
                      paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
                    }
                  : assistantInputFocused
                    ? {
                        top: 'max(env(safe-area-inset-top), 1rem)',
                        bottom: 'auto',
                        maxHeight: 'min(55vh, calc(100vh - env(safe-area-inset-top) - 2rem - 2rem))',
                        minHeight: '280px',
                        paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
                      }
                    : {
                        bottom: '1rem',
                        maxHeight: 'min(55vh, calc(100vh - env(safe-area-inset-top) - 3rem))',
                        minHeight: '280px',
                        paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
                      }
              }
            >
              {/* 拖拽条，与卡片顶边保持正常间距 */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-gray-300/80" />
              </div>
              <div className="flex items-center justify-between px-5 py-2 shrink-0">
                <span className="text-lg font-semibold text-gray-900 flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-black/5">
                    <MessageCircle className="w-5 h-5 text-gray-700" />
                  </span>
                  Neo-AI
                </span>
                <button
                  onClick={() => setAssistantOpen(false)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100/80 text-gray-600 active:bg-gray-200/80 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-2 min-h-0">
                {assistantMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200/80 flex items-center justify-center mb-4">
                      <MessageCircle className="w-7 h-7 text-gray-500" />
                    </div>
                    <p className="text-gray-500 text-[15px] leading-relaxed max-w-[260px]">
                      针对当前文章提问，我会结合文章内容和你的想法来回答。
                    </p>
                  </div>
                )}
                {assistantMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`mb-4 ${m.role === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-block max-w-[88%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-200/80'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    </div>
                  </div>
                ))}
                {assistantLoading && (
                  <div className="text-left mb-4">
                    <div className="inline-flex items-center gap-2.5 rounded-2xl px-4 py-3 bg-white border border-gray-200/80 text-gray-500 text-sm shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      思考中...
                    </div>
                  </div>
                )}
              </div>
              <div className="shrink-0 px-5 py-3 pt-2 flex gap-3">
                <input
                  type="text"
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  onFocus={() => setAssistantInputFocused(true)}
                  onBlur={() => setAssistantInputFocused(false)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAskAssistant()}
                  placeholder="输入问题..."
                  className="flex-1 px-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 shadow-sm"
                />
                <button
                  onClick={handleAskAssistant}
                  disabled={!assistantInput.trim() || assistantLoading}
                  className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-900 text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform shadow-sm"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
