import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent.toLowerCase())
  const host = request.nextUrl.hostname
  const isLocalhost = host === 'localhost' || host === '127.0.0.1'
  // 是否为局域网 IP（非 localhost）。公网域名（如 www.neofeed.cn）为 false
  const isLanIp =
    /^10\.|^172\.(1[6-9]|2\d|3[01])\.|^192\.168\./.test(host)

  // 局域网访问：不跑 Supabase updateSession，避免手机端因会话校验/网络挂起一直加载；只做根路径重定向
  if (!isLocalhost) {
    if (request.nextUrl.pathname === '/') {
      const path = isMobile ? '/mobile' : '/landing'
      const port = request.nextUrl.port || '3000'
      const protocol = request.nextUrl.protocol
      // 公网域名（如 www.neofeed.cn）或标准端口：URL 中不带端口，避免出现 https://www.neofeed.cn:3000
      // 仅局域网 IP + 非标准端口时显式带端口，避免手机浏览器连错端口白屏
      const isDefaultPort =
        !isLanIp ||
        (protocol === 'https:' && (port === '443' || port === '')) ||
        (protocol === 'http:' && (port === '80' || port === ''))
      const origin = isDefaultPort
        ? `${protocol}//${host}`
        : `${protocol}//${host}:${port}`
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
