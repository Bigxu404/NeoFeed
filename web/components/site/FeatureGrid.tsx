'use client'

import { motion } from 'framer-motion';
import GalaxyCard from './GalaxyCard';
import InsightPreviewCard from './InsightPreviewCard';

export default function FeatureGrid() {
  return (
    <section id="features" className="w-full py-64 relative"> {/* Increased section padding */}
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 2xl:px-24 relative z-10">
        
        {/* Grid Layout with Adjusted Gap (Tighter Horizontal, Loose Vertical) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32 md:gap-x-24">
          
          {/* ----------------------------------------------------------
             LEFT COLUMN: THE CHAOS (Galaxy)
             ---------------------------------------------------------- */}
          <motion.div 
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="flex flex-col space-y-32" // Massive internal spacing
          >
            {/* Sticky Header Content */}
            <div className="md:sticky md:top-32">
               <h2 className="text-6xl md:text-9xl font-serif font-bold text-white mb-12 tracking-tighter">
                 THE<br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">CHAOS</span>
               </h2>
               
               <div className="h-[1px] w-32 bg-white/30 mb-12" />

               <h3 className="text-4xl md:text-5xl text-white font-serif mb-10 leading-tight">
                 不要整理信息，<br/>
                 <span className="text-orange-400">要捕获它们。</span>
               </h3>

               <p className="text-xl md:text-2xl text-white/60 max-w-lg leading-relaxed font-sans font-light">
                 互联网是噪音之流。NeoFeed 赋予你引力。<br/><br/>
                 你的每一个兴趣都是一个质心。把信息扔进去，它们会自动绕着核心旋转，聚合成结构化的星系。<br/><br/>
                 告别线性的列表，构建你的<span className="text-white border-b border-white/30">个人知识宇宙</span>。
               </p>
            </div>

            {/* Visual Component (Galaxy Card) */}
            <div className="w-full h-[500px] md:h-[800px] rounded-3xl overflow-hidden border border-white/10 bg-black/50 backdrop-blur-sm relative group mt-12">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10 pointer-events-none" />
               <GalaxyCard />
               
               {/* Caption */}
               <div className="absolute bottom-12 left-12 z-20">
                  <div className="text-sm font-mono text-orange-400 mb-3 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"/>
                    GRAVITY WELL ACTIVE
                  </div>
                  <div className="text-white/80 font-serif italic text-lg">
                    "Every star is a thought you kept."
                  </div>
               </div>
            </div>
          </motion.div>


          {/* ----------------------------------------------------------
             RIGHT COLUMN: THE ORDER (Insight)
             ---------------------------------------------------------- */}
          <motion.div 
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="flex flex-col-reverse md:flex-col space-y-32 md:mt-96" // Massive stagger offset
          >
             {/* Visual Component (Insight Card) */}
             <div className="w-full h-[500px] md:h-[800px] rounded-3xl overflow-hidden border border-white/10 bg-black/50 backdrop-blur-sm relative group md:mb-32">
                <InsightPreviewCard />
                
                 {/* Caption */}
                 <div className="absolute bottom-12 left-12 z-20 pointer-events-none">
                  <div className="text-sm font-mono text-green-400 mb-3 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                    INTELLIGENCE SYNTHESIZED
                  </div>
                  <div className="text-white/80 font-serif italic text-lg">
                    "Order is not created. It emerges."
                  </div>
               </div>
             </div>

             {/* Sticky Header Content */}
             <div className="md:sticky md:top-32 md:pl-12">
                <h2 className="text-6xl md:text-9xl font-serif font-bold text-white mb-12 tracking-tighter text-right md:text-left">
                 THE<br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-900">ORDER</span>
               </h2>

               <div className="h-[1px] w-32 bg-green-500/30 mb-12 ml-auto md:ml-0" />

               <h3 className="text-4xl md:text-5xl text-white font-serif mb-10 leading-tight text-right md:text-left">
                 被动输入，<br/>
                 <span className="text-green-400">主动智慧。</span>
               </h3>

               <p className="text-xl md:text-2xl text-white/60 max-w-lg leading-relaxed font-sans font-light ml-auto md:ml-0 text-right md:text-left">
                 停止做笔记的苦力活。你只管“投喂”碎片，系统会回馈你智慧。<br/><br/>
                 AI 就像你的第二大脑，在后台默默消化一切，然后主动向你推送<span className="text-white border-b border-white/30">结构化的洞察周报</span>。<br/><br/>
                 从熵增到熵减，只需一步：Feed。
               </p>
             </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
