'use client'

import { motion } from 'framer-motion';

export default function FlowStream() {
  return (
    <div className="w-full h-48 relative overflow-hidden pointer-events-none">
       {/* Central Data Stream */}
       <div className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-green-500/50 to-transparent">
          <motion.div 
            className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white to-transparent opacity-50"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
       </div>

       {/* Ambient Glow */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-green-500/5 blur-[100px] rounded-full" />
    </div>
  );
}


