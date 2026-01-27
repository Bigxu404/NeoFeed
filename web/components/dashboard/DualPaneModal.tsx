'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Sparkles, Check } from 'lucide-react';
import { GalaxyItem } from '@/types';
import { toast } from 'sonner';

interface DualPaneModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GalaxyItem | null;
  onCrystallize: (note: string, tags: string[], weight: number) => void;
}

const DualPaneModal: React.FC<DualPaneModalProps> = ({ isOpen, onClose, item, onCrystallize }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [weight, setWeight] = useState(1.0);
  const [isCrystallized, setIsCrystallized] = useState(false);

  // 模拟用户已有的标签
  const availableTags = useMemo(() => [
    { id: 'tech', name: '技术', color: '#00f2ea' },
    { id: 'life', name: '生活', color: '#ff0050' },
    { id: 'idea', name: '灵感', color: '#ffd700' },
    { id: 'work', name: '工作', color: '#a855f7' },
    { id: 'finance', name: '金融', color: '#10b981' },
  ], []);

  // 灵感提示
  const prompts = useMemo(() => [
    '这篇文章的核心观点是什么？',
    '它对我有什么启发？',
    '我可以怎么应用它？',
    '与我已有的知识有何关联？',
  ], []);

  useEffect(() => {
    if (isOpen) {
      // 重置状态
      setNoteContent('');
      setSelectedTags([]);
      setWeight(1.0);
      setIsCrystallized(false);
    }
  }, [isOpen]);

  const handleCrystallizeClick = () => {
    if (!noteContent.trim() || selectedTags.length === 0) {
      toast.error('请填写笔记内容并选择至少一个标签。');
      return;
    }
    onCrystallize(noteContent, selectedTags, weight);
    setIsCrystallized(true);
    toast.success('知识已结晶并存入慢宇宙');
  };

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`
            w-full max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl flex flex-col relative
            ${isMaximized ? 'max-w-full h-full' : 'max-w-6xl h-[80vh]'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 顶部操作栏 */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all"
              title={isMaximized ? '缩小' : '最大化'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all"
              title="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* 左侧：原文阅读区 */}
            <div className={`
              flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar
              ${isMaximized ? 'w-1/2' : 'w-full md:w-1/2'}
              ${isMaximized ? '' : 'md:border-r md:border-white/5'}
            `}>
              <h2 className="text-3xl md:text-4xl font-serif text-white/90 leading-tight mb-6">
                {item.summary}
              </h2>
              <div className="flex items-center gap-3 text-xs font-mono text-white/40 mb-8">
                <span>ID: {item.id.slice(0, 8).toUpperCase()}</span>
                <span>//</span>
                <span>日期: {item.date}</span>
              </div>
              <div className="space-y-6 text-white/70 font-light leading-relaxed">
                {item.content?.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                )) || <p>原文内容加载中...</p>}
              </div>
            </div>

            {/* 右侧：思考总结区 */}
            <div className={`
              flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar bg-[#0e0e0e] border-l border-white/5
              ${isMaximized ? 'w-1/2' : 'hidden md:block md:w-1/2'}
            `}>
              <h3 className="text-2xl font-bold text-white mb-6">我的思考与总结</h3>
              
              {/* 灵感提示 */}
              {!noteContent.trim() && (
                <div className="mb-6 grid grid-cols-2 gap-3">
                  {prompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setNoteContent(prompt + '\n\n')}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 text-sm text-left transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              <textarea
                className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-mono text-sm"
                placeholder="写下你的思考、感悟、提炼..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />

              <div className="mt-6">
                <h4 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-3">分类标签</h4>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag.id) 
                            ? prev.filter(t => t !== tag.id) 
                            : [...prev, tag.id]
                        );
                      }}
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-medium transition-all
                        ${selectedTags.includes(tag.id) 
                          ? `bg-white text-black shadow-lg` 
                          : `bg-white/5 text-white/70 hover:bg-white/10 border border-white/10`}
                      `}
                      style={selectedTags.includes(tag.id) ? { backgroundColor: tag.color, color: '#000' } : {}}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-3">知识权重</h4>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white/50"
                />
                <div className="text-right text-white/50 text-xs mt-2">当前权重: {weight.toFixed(1)}</div>
              </div>

              <button
                onClick={handleCrystallizeClick}
                disabled={isCrystallized || !noteContent.trim() || selectedTags.length === 0}
                className={`
                  mt-8 w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all
                  ${isCrystallized 
                    ? 'bg-green-600 text-white cursor-not-allowed' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'}
                  ${(!noteContent.trim() || selectedTags.length === 0) && 'opacity-50 cursor-not-allowed'}
                `}
              >
                {isCrystallized ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>已结晶</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>存入知识库</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DualPaneModal;
