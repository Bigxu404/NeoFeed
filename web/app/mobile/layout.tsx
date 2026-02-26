import { Metadata, Viewport } from 'next';
import MobileNav from '@/components/mobile/MobileNav';
import MobileAuthGuard from '@/components/mobile/MobileAuthGuard';
import { Suspense } from 'react';

export const viewport: Viewport = {
  themeColor: '#ffffff', // 修改为白色，以适配搜索弹窗和顶部导航的背景
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // 确保内容可以延伸到刘海屏区域
};

export const metadata: Metadata = {
  title: 'NeoFeed Mobile',
  description: 'Feed the Singularity on the go.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NeoFeed',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileAuthGuard>
      <div className="min-h-screen bg-gray-50 text-black selection:bg-black/10 pb-28">
        {/* 
          pb-28 ensures content is not hidden behind the floating capsule.
          We add it here to wrap all mobile pages with safe bottom padding.
        */}
        {children}
        <Suspense fallback={null}>
          <MobileNav />
        </Suspense>
      </div>
    </MobileAuthGuard>
  );
}
