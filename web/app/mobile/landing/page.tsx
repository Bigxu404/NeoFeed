'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Search } from 'lucide-react'

export default function MobileLandingPage() {
  // 定义悬浮的 app 图标
  const apps = [
    { src: 'https://api.iconify.design/logos:safari.svg', alt: 'Safari', top: '15%', left: '10%', delay: 0 },
    { src: 'https://api.iconify.design/mdi:wechat.svg?color=%2307C160', alt: 'Wechat', top: '25%', right: '12%', delay: 0.2 },
    { src: 'https://api.iconify.design/simple-icons:xiaohongshu.svg?color=%23FF2442', alt: 'Xiaohongshu', top: '48%', right: '8%', delay: 0.4 },
    { src: 'https://api.iconify.design/ri:douban-fill.svg?color=%23007722', alt: 'Douban', top: '65%', left: '12%', delay: 0.6 },
    { src: 'https://api.iconify.design/ri:zhihu-fill.svg?color=%230084FF', alt: 'Zhihu', top: '80%', left: '15%', delay: 0.8 },
    { src: 'https://api.iconify.design/mdi:github.svg?color=%23181717', alt: 'Github', top: '82%', right: '12%', delay: 1.0 },
    { src: 'https://api.iconify.design/logos:notion-icon.svg', alt: 'Notion', top: '42%', left: '8%', delay: 1.4 },
  ]

  // 模拟真实的阅读列表数据
  const articles = [
    {
      title: '有了DeepSeek，写作还有意义吗？',
      source: 'mp.weixin.qq.com',
      summary: '这篇文章主要讲述了DeepSeek大模型出现引发人们对写作的思考，然后引出三联写作课。该课程有豪华的主讲阵容...',
      icon: 'https://api.iconify.design/mdi:wechat.svg?color=%2307C160'
    },
    {
      title: '拥抱新浪潮：协同办公工具的四个新范式与无限未来',
      source: 'sspai.com',
      summary: '这篇文章主要讲述了作者对未来办公工具和工作流的期待与想象，包括四个范式浪潮（基础概念的一体化、灵活视图的多样化...',
      icon: 'https://api.iconify.design/ri:article-fill.svg?color=%23D71A1B'
    },
    {
      title: 'GitHub - reycn/cubox-to-notion: A slight but fast...',
      source: 'github.com',
      summary: '这篇文章主要讲了一个名为Cubox to Notion的工具。它是为Notion用户整合Cubox服务的小工具，由于官方产品有类似功能...',
      icon: 'https://api.iconify.design/mdi:github.svg?color=%23181717'
    }
  ]

  return (
    <div className="fixed inset-0 bg-white flex flex-col overflow-hidden font-sans">
      
      {/* 顶部中央的主要文案 */}
      <div className="pt-20 px-6 text-center relative z-20">
        <h1 className="text-4xl font-extrabold tracking-tighter text-black">
          随时随地，捕捉一切
        </h1>
        <p className="mt-4 text-xl text-gray-500 font-medium tracking-tight">
          所有阅读，汇聚一处
        </p>
      </div>

      {/* 中间的手机 Mockup 和悬浮图标区域 */}
      <div className="flex-1 relative w-full flex items-center justify-center mt-10">
        
        {/* 中心手机 Mockup */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative z-10 w-[240px] h-[500px] bg-white rounded-[36px] border-[8px] border-black shadow-[0_20px_50px_rgb(0,0,0,0.15)] overflow-hidden flex flex-col"
        >
          {/* 手机顶部刘海/灵动岛 */}
          <div className="absolute top-0 w-full flex justify-center z-20 pt-2">
            <div className="w-[80px] h-[22px] bg-black rounded-full flex items-center justify-end px-2">
              {/* 模拟摄像头 */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] border border-[#333]"></div>
            </div>
          </div>

          {/* 手机内示意内容 */}
          <div className="flex-1 px-3 pt-10 pb-4 overflow-hidden bg-gray-50/50">
            <div className="flex items-center justify-between mb-4 px-1">
              {/* 药丸形状的 Tab 切换 (Segmented Control) */}
              <div className="flex items-center bg-gray-200/80 p-0.5 rounded-lg">
                <div className="bg-white px-2.5 py-1 rounded-md shadow-[0_1px_3px_rgb(0,0,0,0.1)] text-[11px] font-bold text-gray-900 tracking-tight">
                  快知识库
                </div>
                <div className="px-2.5 py-1 text-[11px] font-medium text-gray-500 tracking-tight">
                  慢知识库
                </div>
              </div>
              <Search className="w-[18px] h-[18px] text-gray-500" />
            </div>
            
            {/* 真实文章卡片 */}
            <div className="space-y-3">
              {articles.map((article, i) => (
                <div key={i} className="bg-white p-3 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100/80">
                  <div className="mb-2">
                    <div className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2">
                      {article.title}
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-gray-500 leading-relaxed line-clamp-3">
                    <span className="text-blue-500 font-medium mr-1">AI 总结 /</span>
                    {article.summary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 悬浮的应用图标 */}
        {apps.map((app, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{ 
              opacity: { duration: 0.5, delay: app.delay },
              scale: { duration: 0.5, delay: app.delay, type: "spring" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: app.delay }
            }}
            className="absolute z-0 w-14 h-14 bg-white rounded-[18px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center border border-gray-100"
            style={{ top: app.top, left: app.left, right: app.right }}
          >
            {/* 真实图标展示 */}
            <img src={app.src} alt={app.alt} className="w-8 h-8 object-contain" />
          </motion.div>
        ))}

      </div>

      {/* 底部按钮区域 */}
      <div className="relative pb-14 px-6 bg-gradient-to-t from-white via-white to-transparent pt-10">
        <div className="w-full flex gap-3">
          <Link 
            href="/mobile/login?mode=login"
            className="flex-1 bg-[#3b82f6] text-white rounded-full font-bold text-lg h-14 flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-[#3b82f6]/20"
          >
            登录
          </Link>
          <Link 
            href="/mobile/login?mode=signup"
            className="flex-1 bg-black text-white rounded-full font-bold text-lg h-14 flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-black/20"
          >
            注册
          </Link>
        </div>
        <p className="text-center text-sm text-gray-400 mt-4 font-medium">准备好搭建你的个人专属知识库了吗？</p>
      </div>

    </div>
  )
}