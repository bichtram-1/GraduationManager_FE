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

  let response: NextResponse

  // 1. Nếu đang vào public path
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    // 1a. Nếu đã login (token tồn tại) → redirect về homepage
    if (token) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      response = NextResponse.redirect(url)
    } else {
      response = NextResponse.next()
    }
  }
  // 2. Nếu không có token → redirect về login
  else if (!token) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('from', pathname)
    response = NextResponse.redirect(loginUrl)
  }
  else {
    const roleCookie = req.cookies.get('WEBSITE_USER_ROLE')?.value
    const userRole = (roleCookie === 'teacher' || token === 'mock-token-teacher') ? 'teacher' : 'student'

    // 3. Nếu vào trang chủ "/" và đã login -> redirect đến cổng tương ứng
    if (pathname === '/') {
      const url = req.nextUrl.clone()
      url.pathname = userRole === 'teacher' ? '/teacher' : '/student'
      response = NextResponse.redirect(url)
    }
    // 3b. Kiểm tra quyền truy cập theo Route để tránh trường hợp vai trò này vào route của vai trò kia
    else if (pathname.startsWith('/teacher') && userRole !== 'teacher') {
      const url = req.nextUrl.clone()
      url.pathname = '/student'
      response = NextResponse.redirect(url)
    }
    else if (pathname.startsWith('/student') && userRole !== 'student') {
      const url = req.nextUrl.clone()
      url.pathname = '/teacher'
      response = NextResponse.redirect(url)
    }
    else {
      response = NextResponse.next()
    }
  }

  // Prevent caching of middleware redirects/responses
  response.headers.set('x-middleware-cache', 'no-cache')
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
  return response
}

// Áp dụng middleware cho toàn bộ route, trừ static, api, _next...
export const config = {
  matcher: '/((?!api/|_next/static|_next/image|favicon.ico|.*\\..*).*)',
}

