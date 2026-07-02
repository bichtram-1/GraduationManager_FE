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
  const host = hostHeader ? hostHeader.split(':')[0] : undefined
  const isIPOrLocalhost = host === 'localhost' || host === '127.0.0.1' || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host || '')
  const domain = (host && !isIPOrLocalhost) ? host : undefined

  const cookiesToClear = [STORAGES.ACCESS_TOKEN, 'WEBSITE_USER_ROLE']

  cookiesToClear.forEach((cookieName) => {
    // 1. Clear host-only cookie (without domain)
    res.headers.append('Set-Cookie', `${cookieName}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`)

    // 2. Clear explicit domain 'localhost'
    res.headers.append('Set-Cookie', `${cookieName}=; Path=/; Domain=localhost; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`)

    // 3. Clear explicit domain '.localhost'
    res.headers.append('Set-Cookie', `${cookieName}=; Path=/; Domain=.localhost; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`)

    // 4. Clear explicit domain '127.0.0.1'
    res.headers.append('Set-Cookie', `${cookieName}=; Path=/; Domain=127.0.0.1; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`)

    // 5. Clear dynamic resolved domain if present
    if (domain) {
      res.headers.append('Set-Cookie', `${cookieName}=; Path=/; Domain=${domain}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`)
    }
  })

  return res
}