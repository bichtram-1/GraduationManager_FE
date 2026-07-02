import { NextResponse } from 'next/server'
import { STORAGES } from '@/lib/constants/storage'

const USE_MOCK = false;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function GET(req: Request) {
  const url = new URL(req.url)
  const role = url.searchParams.get('role') === 'student' ? 'student' : 'teacher'
  const from = url.searchParams.get('from') || undefined
  const emailInput = url.searchParams.get('email')

  let token = role === 'teacher' ? 'mock-token-teacher' : 'mock-token-student'
  let redirectTo = from || (role === 'teacher' ? '/teacher' : '/student')
  let resolvedRole = role

  if (!USE_MOCK) {
    let email = emailInput || '';
    if (!email) {
      email = role === 'student' ? '0306231001@caothang.edu.vn' : 'thoa@caothang.edu.vn';
    }

    try {
      const backendRes = await fetch(`${API_URL}/api/dang-nhap-gia-lap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (backendRes.ok) {
        const json = await backendRes.json();
        if (json.success && json.data?.access_token) {
          token = json.data.access_token;
          const userRole = json.data.role;
          resolvedRole = userRole === 'SINH_VIEN' ? 'student' : 'teacher';
          
          if (!from) {
            redirectTo = resolvedRole === 'student' ? '/student' : '/teacher';
          }
        }
      } else {
        console.error('Backend login failed with status:', backendRes.status);
      }
    } catch (err) {
      console.error('Error logging in to backend:', err);
    }
  }

  const hostHeader = req.headers.get('host') || undefined
  const host = hostHeader ? hostHeader.split(':')[0] : undefined
  const isIPOrLocalhost = host === 'localhost' || host === '127.0.0.1' || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host || '')
  const domain = (host && !isIPOrLocalhost) ? host : undefined

  const response = NextResponse.redirect(new URL(redirectTo, req.url))

  // Set ACCESS_TOKEN cookie directly on NextResponse to ensure it is sent during redirect
  response.cookies.set({
    name: STORAGES.ACCESS_TOKEN,
    value: token,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
    httpOnly: false,
    ...(domain ? { domain } : {}),
  })

  // Set WEBSITE_USER_ROLE cookie directly on NextResponse
  const roleCookieVal = token === 'mock-token-teacher' ? 'teacher' : (token === 'mock-token-student' ? 'student' : resolvedRole)
  response.cookies.set({
    name: 'WEBSITE_USER_ROLE',
    value: roleCookieVal,
    path: '/',
    maxAge: 60 * 60 * 8,
    httpOnly: false,
    ...(domain ? { domain } : {}),
  })

  // Prevent caching of the redirect response
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')

  return response
}

