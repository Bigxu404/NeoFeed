import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent.toLowerCase())
  const host = request.nextUrl.hostname
  const isLocalhost = host === 'localhost' || host === '127.0.0.1'

  // 局域网访问：不跑 Supabase updateSession，避免手机端因会话校验/网络挂起一直加载；只做根路径重定向
  if (!isLocalhost) {
    if (request.nextUrl.pathname === '/') {
      const path = isMobile ? '/mobile' : '/landing'
      // 显式带上端口，避免部分手机浏览器只显示/请求 10.23.x.x 不带 :3000 导致连错端口白屏
      const port = request.nextUrl.port || '3000'
      const origin = `${request.nextUrl.protocol}//${host}:${port}`
      const redirectUrl = `${origin}${path}`
      return NextResponse.redirect(redirectUrl, 307)
    }
    return NextResponse.next({ request })
  }

  const response = await updateSession(request)

  if (request.nextUrl.pathname === '/' && !isMobile) {
    const url = request.nextUrl.clone()
    url.pathname = '/landing'
    const redirectResponse = NextResponse.redirect(url, 307)
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  if (isMobile && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/mobile'
    const rewriteResponse = NextResponse.rewrite(url)
    response.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie.name, cookie.value)
    })
    return rewriteResponse
  }

  return response
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (图标)
     * - api/inngest (Inngest 内部接口)
     * - 所有的图片资源
     */
    '/((?!_next/static|_next/image|favicon.ico|api/inngest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
