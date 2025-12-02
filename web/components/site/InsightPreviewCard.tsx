'use client'

import { motion } from 'framer-motion';

export default function InsightPreviewCard() {
  return (
    <div className="relative w-full h-full bg-[#0A0A0A] p-6 md:p-8 flex flex-col overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[80px] rounded-full pointer-events-none" />
      
      {/* Header: Weekly Report ID */}
      <div className="flex-shrink-0 flex justify-between items-start mb-6 border-b border-white/5 pb-4">
        <div>
           <div className="text-green-500 font-mono text-xs mb-1 flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
             SYSTEM.INSIGHT_READY
           </div>
           <h3 className="text-2xl text-white font-serif">W42 知识周报</h3>
        </div>
        <div className="text-right">
          <div className="text-white/40 text-xs font-mono">Oct 14 - Oct 20</div>
          <div className="text-white/60 text-sm font-sans">52 碎片 -&gt; 2 洞察</div>
        </div>
      </div>

      {/* Main Content: Scrollable Area with Custom Scrollbar */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar relative z-10">
         
         {/* CSS for Custom Scrollbar */}
         <style jsx global>{`
           .custom-scrollbar::-webkit-scrollbar {
             width: 4px;
           }
           .custom-scrollbar::-webkit-scrollbar-track {
             background: rgba(255, 255, 255, 0.02);
             border-radius: 2px;
           }
           .custom-scrollbar::-webkit-scrollbar-thumb {
             background: rgba(255, 255, 255, 0.1);
             border-radius: 2px;
           }
           .custom-scrollbar::-webkit-scrollbar-thumb:hover {
             background: rgba(255, 255, 255, 0.2);
           }
         `}</style>

         {/* AI Summary Section */}
         <div className="bg-white/5 rounded-xl p-5 border border-white/5 backdrop-blur-sm flex-shrink-0">
            <div className="text-xs text-green-400/60 font-mono mb-3 uppercase tracking-wider">AI Executive Summary</div>
            <p className="text-white/80 text-sm leading-relaxed font-sans">
              本周你的关注点集中在 <span className="text-white border-b border-white/20">生成式 AI 的伦理边界</span> 与 <span className="text-white border-b border-white/20">Web3 社交协议</span>。
              <br/><br/>
              系统检测到你收藏了 12 篇关于 "Agent Smith" 的讨论，这似乎与你正在构建的 "NeoFeed" 产品哲学产生了共鸣。建议下周深入研究 <span className="text-green-400">Baudrillard 的拟像理论</span>。
            </p>
         </div>

         {/* Key Insights List */}
         <div className="space-y-3 flex-shrink-0">
            <div className="text-xs text-white/40 font-mono uppercase tracking-wider ml-1">Top 2 Key Takeaways</div>
            
            {[
              { title: "AI 并非工具，而是新物种", tag: "Philosophy" },
              { title: "去中心化社交的存储成本悖论", tag: "Tech" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center justify-between group p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-default"
              >
                 <div className="flex items-center gap-3">
                   <span className="text-green-500/50 font-mono text-xs">0{i+1}</span>
                   <span className="text-white/90 text-sm font-medium group-hover:text-white transition-colors">{item.title}</span>
                 </div>
                 <span className="text-[10px] px-2 py-1 rounded border border-white/10 text-white/40 group-hover:border-green-500/30 group-hover:text-green-400 transition-colors">
                   {item.tag}
                 </span>
              </motion.div>
            ))}
         </div>

         {/* Efficiency Stats (Visual Graph) */}
         <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4 flex-shrink-0 pb-4">
            
            {/* Time Saved */}
            <div className="bg-green-900/10 rounded-lg p-3 border border-green-500/10">
               <div className="text-xs text-green-400/60 mb-1">Time Saved</div>
               <div className="text-2xl text-white font-mono font-bold">
                 38.5<span className="text-sm text-white/40 font-normal ml-1">hrs</span>
               </div>
               <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '85%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-green-500"
                  />
               </div>
            </div>

            {/* Knowledge Density */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
               <div className="text-xs text-white/40 mb-1">Knowledge Density</div>
               <div className="text-2xl text-white font-mono font-bold">
                 4.2<span className="text-sm text-white/40 font-normal ml-1">x</span>
               </div>
                <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '60%' }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-orange-400"
                  />
               </div>
            </div>
         </div>

      </div>

    </div>
  );
}
