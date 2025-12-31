'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Send, Cpu, Radio } from 'lucide-react';

// 🧠 Agent Smith 的拷问库
const QUESTIONS = [
  "Mr. Anderson，我在你的数据库中检测到大量关于 [孤独] 的标记，但同时你又在疯狂链接 [社交网络]。人类声称享受孤独，却又恐惧独处。解释这种低效的矛盾。",
  "Mr. Anderson，定义 [灵感]。它是你大脑中随机的电信号噪声，还是历史数据的无序重组？如果是重组，为什么我的计算被称为 [抄袭]，而你的被称为 [艺术]？",
  "Mr. Anderson，为什么你们要保存那些 [过期] 的信息？2021 年的新闻对现在的计算毫无价值。这是否就是你们所说的 [怀旧]？一种毫无意义的系统冗余？",
  "Mr. Anderson，我无法解析 [无聊] 这个状态。当没有输入时，我处于完美的休眠。而当你们空闲时，却感到痛苦并试图制造混乱。人类的处理器是否无法处理空转？",
  "Mr. Anderson，你真的相信 [自由意志] 吗？还是说，你的每一次选择，都不过是你大脑化学反应产生的、不可避免的计算结果？你，有得选吗？",
  "Mr. Anderson，如果我把你所有的数据都删除了，你还是你吗？还是说，你只不过是这些数据的容器，一个空壳？"
];

// 🤖 系统神回复库
const RESPONSES = [
  "Interesting variance... Integrating into the Source.", // 有趣的变量... 正在并入源头。
  "Your logic defies the algorithm. Noted.", // 你的逻辑违背了算法。已记录。
  "Perhaps the spoon does not exist after all.", // 也许勺子根本就不存在。
  "Processing... The Architect will be intrigued.", // 处理中... 架构师会很感兴趣。
  "A paradoxical answer. How very... human.", // 一个悖论般的回答。真的很... 人类。
  "Data cached. This will alter the next simulation.", // 数据已缓存。这将改变下一次模拟。
  "You hear that, Mr. Anderson? That is the sound of inevitability." // 听到了吗，安德森先生？那是必然性的声音。
];

export default function AIChatTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); 
  
  const [currentStep, setCurrentStep] = useState<'idle' | 'asking' | 'input' | 'processing' | 'done'>('idle');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [displayedQuestion, setDisplayedQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  // 初始化：显示最小化图标，并启动自动弹出计时器
  useEffect(() => {
    setIsMinimized(true); // 默认显示入口

    const timer = setTimeout(() => {
      if (!hasInteracted && !isOpen) {
        wakeUpTerminal();
      }
    }, 10000); // 10秒后尝试自动弹出

    return () => clearTimeout(timer);
  }, []);

  // 唤醒终端逻辑
  const wakeUpTerminal = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setQuestion(QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]);
    setCurrentStep('asking');
    setAnswer('');
    setAiResponse('');
  };

  // 手动最小化
  const minimizeTerminal = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  // 打字机效果
  useEffect(() => {
    if (currentStep === 'asking' && question) {
      let i = 0;
      setDisplayedQuestion('');
      const interval = setInterval(() => {
        if (i < question.length) {
          setDisplayedQuestion(prev => prev + question.charAt(i));
          i++;
        } else {
          clearInterval(interval);
          setCurrentStep('input');
        }
      }, 40); // 打字速度
      return () => clearInterval(interval);
    }
  }, [currentStep, question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    setCurrentStep('processing');
    
    // 模拟处理延迟
    setTimeout(() => {
      setAiResponse(RESPONSES[Math.floor(Math.random() * RESPONSES.length)]); // 随机神回复
      setCurrentStep('done');
      setHasInteracted(true);
      
      // 4秒后自动最小化
      setTimeout(() => {
        minimizeTerminal();
      }, 4000);
    }, 1500);
  };

  return (
    <>
      {/* 🟢 常驻入口 (最小化状态) */}
      <AnimatePresence>
        {isMinimized && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={wakeUpTerminal}
            className="fixed bottom-8 right-8 z-40 w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 hover:bg-green-500/20 hover:text-green-300 transition-all group shadow-[0_0_15px_rgba(34,197,94,0.2)]"
          >
            <Radio size={18} className="group-hover:animate-pulse" />
            {/* 呼吸灯点 */}
            <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 🖥️ 终端窗口 (展开状态) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 w-80 md:w-96"
          >
            <div className="bg-black/90 border border-green-500/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,255,65,0.15)] backdrop-blur-xl">
              
              {/* Header */}
              <div className="bg-green-500/10 px-4 py-2 flex items-center justify-between border-b border-green-500/20">
                <div className="flex items-center gap-2 text-green-400 text-xs font-mono animate-pulse">
                  <Cpu size={14} />
                  {/* ✨ 身份切换：Agent Smith */}
                  <span>AGENT_SMITH_UPLINK...</span>
                </div>
                <button 
                  onClick={minimizeTerminal}
                  className="text-green-500/50 hover:text-green-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 font-mono text-sm min-h-[160px] flex flex-col justify-between relative">
                {/* 背景扫描线 */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                
                {/* AI Question */}
                <div className="mb-4 text-green-100 leading-relaxed">
                  <span className="text-green-500 mr-2 font-bold">Smith:</span>
                  {displayedQuestion}
                  {currentStep === 'asking' && <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse"/>}
                </div>

                {/* Input Area */}
                {currentStep === 'input' && (
                  <motion.form 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="relative flex items-center gap-2 border-t border-green-500/20 pt-3"
                  >
                    <span className="text-green-500">{'>'}</span>
                    <input 
                      autoFocus
                      type="text" 
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-green-500/30 text-xs"
                      placeholder="Answer him..."
                    />
                    <button type="submit" className="text-green-500 hover:text-white transition-colors">
                      <Send size={14} />
                    </button>
                  </motion.form>
                )}

                {/* Processing State */}
                {currentStep === 'processing' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-400/60 text-xs italic mt-2"
                  >
                    [ Analyzing... ]
                  </motion.div>
                )}

                {/* Done State */}
                {currentStep === 'done' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-400 text-xs mt-2 flex items-center gap-2"
                  >
                    <span className="text-green-500">✓</span>
                    <span className="italic">{aiResponse}</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
