'use client'

import { message, Spin } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Script from 'next/script'
import { STORAGES } from '@/lib/constants/storage'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (res: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [messageApi, messageContextHolder] = message.useMessage()
  const [loading, setLoading] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement>(null)

  const clearSessionCookies = () => {
    if (typeof window === 'undefined') return
    const domains = ['', 'localhost', '.localhost', '127.0.0.1', window.location.hostname]
    const cookiesToClear = [STORAGES.ACCESS_TOKEN, 'WEBSITE_USER_ROLE']
    cookiesToClear.forEach((name) => {
      domains.forEach((dom) => {
        const domainPart = dom ? `; domain=${dom}` : ''
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainPart}`
      })
    })
  }

  const renderGoogleButton = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId || !window.google || !googleButtonRef.current) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (res) => {
        setLoading(true)
        clearSessionCookies()
        try {
          const r = await fetch('/api/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: res.credential }),
          })
          const json = await r.json()
          if (r.ok && json.success) {
            const from = searchParams?.get('from') || undefined
            window.location.assign(from || json.redirectTo)
          } else {
            messageApi.error(json.message || 'Đăng nhập bằng Google thất bại!')
            setLoading(false)
          }
        } catch (err) {
          console.error('Google login error:', err)
          messageApi.error('Không thể kết nối đến máy chủ xác thực!')
          setLoading(false)
        }
      },
    })
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 360,
    })
  }

  useEffect(() => {
    if (window.google) renderGoogleButton()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--grayLightest) px-4">
      <div className="max-w-md w-full">
        {messageContextHolder}
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/image-3.png" alt="Logo" width={80} height={80} className="mb-4 object-contain" />
          <h2 className="m-0 text-3xl font-semibold text-slate-900">Đăng nhập</h2>
          <p className="m-0 mt-2 text-sm leading-6 text-slate-500">Đăng nhập bằng tài khoản Google của bạn</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div ref={googleButtonRef} />
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Spin size="small" />
              Đang đăng nhập...
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">© 2026 Trường Cao đẳng Kỹ thuật Cao Thắng</div>
      </div>

      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={renderGoogleButton}
      />
    </div>
  )
}
