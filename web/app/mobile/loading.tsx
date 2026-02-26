/**
 * 从主屏幕/桌面打开时，在路由段加载和 JS 执行前显示占位，减少长时间白屏。
 */
export default function MobileLoading() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin"
          aria-hidden
        />
        <span className="text-sm text-gray-500">加载中…</span>
      </div>
    </div>
  );
}
