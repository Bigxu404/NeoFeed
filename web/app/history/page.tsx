'use client'

import { useState, useEffect } from 'react'
import { Clock, ExternalLink, FileText } from 'lucide-react'
import { PageLayout } from '@/components/PageLayout'
import { getItems } from '@/lib/api'
import { motion } from 'framer-motion'

interface Item {
  id: number
  title: string | null
  content: string
  url: string | null
  source_type: string
  status: string
  created_at: string
  word_count: number
}

export default function HistoryPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 加载数据
  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await getItems({ limit: 50 })
      setItems(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  // 格式化时间
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 1) return '刚刚'
    if (hours < 24) return `${hours} 小时前`
    if (days < 7) return `${days} 天前`
    
    return date.toLocaleDateString('zh-CN')
  }

  // 截取内容预览
  const getPreview = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <PageLayout>
      <div className="w-full max-w-6xl">
        {/* 页面标题 */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">历史记录</h1>
              <p className="text-gray-600 text-sm">共 {items.length} 条记录</p>
            </div>
          </div>
        </motion.div>

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
            ❌ {error}
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && items.length === 0 && (
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-16 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">还没有保存任何内容</h3>
            <p className="text-gray-600">去首页保存你的第一条信息吧！</p>
          </motion.div>
        )}

        {/* 列表 */}
        {!loading && !error && items.length > 0 && (
          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 hover:shadow-lg hover:border-blue-200/50 transition-all duration-200 cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* 标题或内容预览 */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.title || getPreview(item.content, 50)}
                    </h3>
                    
                    {/* 内容预览（如果有标题） */}
                    {item.title && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {getPreview(item.content)}
                      </p>
                    )}

                    {/* 元信息 */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(item.created_at)}
                      </span>
                      <span>{item.word_count} 字</span>
                      {item.url && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <ExternalLink className="h-3 w-3" />
                          链接
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        item.status === 'processed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status === 'processed' ? '已处理' : '待处理'}
                      </span>
                    </div>
                  </div>

                  {/* ID 标识 */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs text-gray-400 font-mono">#{item.id}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
