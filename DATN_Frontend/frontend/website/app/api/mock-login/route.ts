import { NextResponse } from 'next/server'
import { STORAGES } from '@/lib/constants/storage'

export function GET(req: Request) {
  const url = new URL(req.url)
  const role = url.searchParams.get('role') === 'student' ? 'student' : 'teacher'
  const token = role === 'teacher' ? 'mock-token-teacher' : 'mock-token-student'
  const redirectTo = role === 'teacher' ? '/teacher' : '/student'

  const res = NextResponse.redirect(new URL(redirectTo, req.url))
  // set cookie accessible to middleware
  // derive domain from Host header so cookie is valid when accessed via LAN IP or custom hostname
  const hostHeader = req.headers.get('host') || undefined
  const domain = hostHeader ? hostHeader.split(':')[0] : undefined
  const cookieOpts = {
    name: STORAGES.ACCESS_TOKEN,
    value: token,
    path: '/',
    maxAge: 60 * 60,
    ...(domain ? { domain } : {}),
  }
  res.cookies.set(cookieOpts)
  return res
}
