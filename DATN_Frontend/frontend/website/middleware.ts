// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { STORAGES } from '@/lib/constants/storage'

// Danh sách đường dẫn public mà không cần auth
const PUBLIC_PATHS = [
  '/login',
  '/signup',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(STORAGES.ACCESS_TOKEN)?.value

  // Always allow static file requests in /public (e.g. /image-3.png).
  if (/\.[^/]+$/.test(pathname)) {
    return NextResponse.next()
  }

  // 1. Nếu đang vào public path
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    // 1a. Nếu đã login (token tồn tại) → redirect về homepage
    if (token) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    // 1b. Chưa login → cho qua (để xem login/signup)
    return NextResponse.next()
  }

  // 2. Nếu không có token → redirect về login
  if (!token) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    // bạn có thể thêm ?callbackUrl=pathname để redirect sau khi login
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Nếu vào trang chủ "/" và đã login -> redirect đến cổng tương ứng
  if (pathname === '/') {
    const url = req.nextUrl.clone()
    url.pathname = token === 'mock-token-teacher' ? '/teacher' : '/student'
    return NextResponse.redirect(url)
  }

  // 4. Token ok → cho qua
  return NextResponse.next()
}

// Áp dụng middleware cho toàn bộ route, trừ static, api/public, _next...
export const config = {
  matcher: '/((?!api/public|api/mock|_next/static|_next/image|favicon.ico|.*\\..*).*)',
}
