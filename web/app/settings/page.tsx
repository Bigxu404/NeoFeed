'use client'

import { Settings } from 'lucide-react'
import { PageLayout } from '@/components/PageLayout'

export default function SettingsPage() {
  return (
    <PageLayout>
      <div className="w-full max-w-4xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-blue-500/10 border border-gray-200/50 p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">设置</h1>
          <p className="text-gray-600 mb-8">这里将提供系统设置、偏好配置和账户管理功能</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <span className="text-sm">🚧 功能开发中，敬请期待</span>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
