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

  // Create HTML response for safe client-side redirection to write cookies first
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Chuyển hướng...</title>
        <meta http-equiv="refresh" content="0;url=${redirectTo}" />
        <script>
          window.location.href = ${JSON.stringify(redirectTo)};
        </script>
      </head>
      <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #64748b;">
        <div style="text-align: center;">
          <div style="border: 3px solid #e2e8f0; border-top: 3px solid #3b82f6; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
          <p style="margin: 0; font-size: 14px; font-weight: 500;">Đang chuyển hướng vào hệ thống...</p>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </body>
    </html>
  `;
  const res = new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
  
  const hostHeader = req.headers.get('host') || undefined
  const host = hostHeader ? hostHeader.split(':')[0] : undefined
  const isIPOrLocalhost = host === 'localhost' || host === '127.0.0.1' || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host || '')
  const domain = (host && !isIPOrLocalhost) ? host : undefined
  
  // Set ACCESS_TOKEN cookie
  const cookieOpts = {
    name: STORAGES.ACCESS_TOKEN,
    value: token,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
    httpOnly: false,
    ...(domain ? { domain } : {}),
  }
  res.cookies.set(cookieOpts)

  // Set WEBSITE_USER_ROLE cookie
  const roleCookieVal = token === 'mock-token-teacher' ? 'teacher' : (token === 'mock-token-student' ? 'student' : resolvedRole)
  const roleCookieOpts = {
    name: 'WEBSITE_USER_ROLE',
    value: roleCookieVal,
    path: '/',
    maxAge: 60 * 60 * 8,
    httpOnly: false,
    ...(domain ? { domain } : {}),
  }
  res.cookies.set(roleCookieOpts)

  return res
}
