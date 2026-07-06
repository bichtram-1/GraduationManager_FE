import { NextResponse } from 'next/server'
import { STORAGES } from '@/lib/constants/storage'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const credential = body?.credential as string | undefined

  if (!credential) {
    return NextResponse.json({ success: false, message: 'Thiếu token Google.' }, { status: 400 })
  }

  const backendRes = await fetch(`${API_URL}/api/dang-nhap-google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  })

  const json = await backendRes.json().catch(() => ({}))

  if (!backendRes.ok || !json?.success || !json?.data?.access_token) {
    return NextResponse.json(
      { success: false, message: json?.message || 'Đăng nhập bằng Google thất bại.' },
      { status: backendRes.status || 401 }
    )
  }

  // Admin có quyền hạn cao nhất (bao gồm cả quyền giảng viên) nên vẫn được vào website với vai trò giảng viên
  const token = json.data.access_token as string
  const resolvedRole = json.data.role === 'SINH_VIEN' ? 'student' : 'teacher'
  const redirectTo = resolvedRole === 'student' ? '/student' : '/teacher'

  const hostHeader = req.headers.get('host') || undefined
  const host = hostHeader ? hostHeader.split(':')[0] : undefined
  const isIPOrLocalhost = host === 'localhost' || host === '127.0.0.1' || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host || '')
  const domain = (host && !isIPOrLocalhost) ? host : undefined

  const response = NextResponse.json({ success: true, redirectTo })

  response.cookies.set({
    name: STORAGES.ACCESS_TOKEN,
    value: token,
    path: '/',
    maxAge: 60 * 60 * 8,
    httpOnly: false,
    ...(domain ? { domain } : {}),
  })

  response.cookies.set({
    name: 'WEBSITE_USER_ROLE',
    value: resolvedRole,
    path: '/',
    maxAge: 60 * 60 * 8,
    httpOnly: false,
    ...(domain ? { domain } : {}),
  })

  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')

  return response
}
