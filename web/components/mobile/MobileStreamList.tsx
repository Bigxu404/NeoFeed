'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import MobileSwipeCard from './MobileSwipeCard';
import { DiscoveryItem, discardDiscoveryItem, saveDiscoveryItemToFeeds } from '@/app/dashboard/discovery-actions';
import { Send, X, Sparkles } from 'lucide-react';

interface MobileStreamListProps {
  initialItems: DiscoveryItem[];
}

export default function MobileStreamList({ initialItems }: MobileStreamListProps) {
  const [items, setItems] = useState<DiscoveryItem[]>(initialItems);
  const [savingItem, setSavingItem] = useState<DiscoveryItem | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initialItems if they change from server
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleDiscard = async (id: string) => {
    // Optimistic UI update
    setItems((prev) => prev.filter(item => item.id !== id));
    
    // Server action
    const res = await discardDiscoveryItem(id);
    if (res.error) {
      toast.error('Failed to discard: ' + res.error);
      // Revert if failed
      setItems(initialItems);
    } else {
      toast.success('Discarded');
    }
  };

  const handleSaveIntent = (id: string) => {
    const itemToSave = items.find(item => item.id === id);
    if (itemToSave) {
      // Optimistic remove from list
      setItems((prev) => prev.filter(item => item.id !== id));
      // Open drawer
      setSavingItem(itemToSave);
      setNotes('');
      // Focus textarea on next tick
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const submitSave = async () => {
    if (!savingItem) return;
    setIsSubmitting(true);
    
    const id = savingItem.id;
    const currentNotes = notes;
    
    // Close drawer
    setSavingItem(null);
    setNotes('');
    setIsSubmitting(false);

    toast.promise(saveDiscoveryItemToFeeds(id, currentNotes), {
      loading: 'Saving to Galaxy...',
      success: 'Saved to Galaxy!',
      error: (err) => {
        // Revert on error
        setItems(initialItems);
        return 'Failed to save: ' + err.message;
      }
    });
  };

  const cancelSave = () => {
    if (savingItem) {
      // Put it back
      setItems((prev) => [savingItem, ...prev]);
      setSavingItem(null);
    }
  };

  return (
    <div className="w-full pb-32">
      <AnimatePresence mode="popLayout">
        {items.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center pt-32 px-6 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
              <Sparkles className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-medium text-white mb-3 tracking-tight">欢迎来到 NeoFeed</h2>
            <p className="text-white/50 text-[15px] leading-relaxed max-w-[280px]">
              你的信息流目前是空的。<br/>
              请在电脑端添加 RSS 订阅源，AI 将会自动为你捕获和总结最新内容。
            </p>
          </motion.div>
        )}
        
        {items.map((item) => (
          <MobileSwipeCard 
            key={item.id} 
            item={item} 
            onDiscard={handleDiscard}
            onSave={handleSaveIntent}
          />
        ))}
      </AnimatePresence>

      {/* Save Note Drawer (Half-screen) */}
      <AnimatePresence>
        {savingItem && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={cancelSave}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-[#161618] rounded-t-[32px] border-t border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Add Note</h3>
                <button 
                  onClick={cancelSave}
                  className="p-2 rounded-full bg-white/5 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-white/50 line-clamp-1 mb-2">
                  Saving: <span className="text-white/80">{savingItem.title}</span>
                </p>
                <textarea
                  ref={textareaRef}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Why is this interesting? (Optional)"
                  className="w-full h-32 p-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 resize-none"
                />
              </div>
              
              <button
                onClick={submitSave}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black font-semibold rounded-xl active:scale-95 transition-transform"
              >
                <Send className="w-4 h-4" />
                Save to Galaxy
              </button>
              
              {/* Safe area padding for bottom of drawer */}
              <div className="h-6 w-full" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
