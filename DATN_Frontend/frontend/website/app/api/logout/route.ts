import { NextResponse } from 'next/server'
import { STORAGES } from '@/lib/constants/storage'

function getSafeRedirect(url: URL) {
  const from = url.searchParams.get('from')
  if (from && from.startsWith('/') && !from.startsWith('//')) return from
  return '/login'
}

export function GET(req: Request) {
  const url = new URL(req.url)
  const redirectTo = getSafeRedirect(url)
  const res = NextResponse.redirect(new URL(redirectTo, req.url))
  const hostHeader = req.headers.get('host') || undefined
  const domain = hostHeader ? hostHeader.split(':')[0] : undefined

  res.cookies.set({
    name: STORAGES.ACCESS_TOKEN,
    value: '',
    path: '/',
    maxAge: 0,
  })
  res.cookies.set({
    name: 'USER_ROLE',
    value: '',
    path: '/',
    maxAge: 0,
  })

  if (domain) {
    res.cookies.set({
      name: STORAGES.ACCESS_TOKEN,
      value: '',
      path: '/',
      domain,
      maxAge: 0,
    })
    res.cookies.set({
      name: 'USER_ROLE',
      value: '',
      path: '/',
      domain,
      maxAge: 0,
    })
  }

  return res
}