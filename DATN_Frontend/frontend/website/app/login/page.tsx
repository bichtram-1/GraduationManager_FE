'use client'

import { Button, Checkbox, Form, Input, message } from 'antd'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LockKeyhole, User } from 'lucide-react'
import Image from 'next/image'

const ROLE_OPTIONS = [
  { value: 'teacher', label: 'Giảng viên', hint: 'gv@caothang.edu.vn' },
  { value: 'student', label: 'Sinh viên', hint: 'MSSV@caothang.edu.vn' },
]

export default function LoginPage() {
  const [form] = Form.useForm()
  const searchParams = useSearchParams()
  const [messageApi, messageContextHolder] = message.useMessage()
  const [role, setRole] = useState<'teacher' | 'student'>('teacher')
  const [loading, setLoading] = useState(false)
  const DEFAULT_PASSWORD = '123456'

  const SAMPLE = {
    teacher: { email: 'giangvien@gmail.com', password: DEFAULT_PASSWORD },
    student: { email: 'sinhvien@gmail.com', password: DEFAULT_PASSWORD },
  }

  const onGoogleSignIn = () => {
    // Redirect to server mock-login which sets cookie and redirects
    setLoading(true)
    const from = searchParams?.get('from') || undefined
    const url = `/api/mock-login?role=${encodeURIComponent(role)}${from ? `&from=${encodeURIComponent(from)}` : ''}`
    // Use full navigation so server can set cookie via Set-Cookie header
    window.location.assign(url)
  }

  const onFinish = (values: Record<string, unknown>) => {
    setLoading(true)

    setTimeout(() => {
      const password = typeof values.password === 'string' ? values.password : ''

      // Accept any email if password matches DEFAULT_PASSWORD, otherwise fail.
      const ok = password === DEFAULT_PASSWORD

      if (!ok) {
        // set inline form error and show message
        form.setFields([
          { name: 'password', errors: ['Mật khẩu không đúng. Mật khẩu mặc định: 123456.'] },
        ])
        messageApi.error('Đăng nhập thất bại — kiểm tra mật khẩu. Gợi ý: mật khẩu mặc định là 123456.')
        setLoading(false)
        return
      }

      // For server-side cookie handling, redirect to mock-login route
      const from = searchParams?.get('from') || undefined
      const url = `/api/mock-login?role=${encodeURIComponent(role)}${from ? `&from=${encodeURIComponent(from)}` : ''}`
      window.location.assign(url)
    }, 400)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--grayLightest) px-4">
      <div className="max-w-md w-full">
        {messageContextHolder}
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/image-3.png" alt="Logo" width={80} height={80} className="mb-4 object-contain" />
          <h2 className="m-0 text-3xl font-semibold text-slate-900">Đăng nhập</h2>
          <p className="m-0 mt-2 text-sm leading-6 text-slate-500">Chọn vai trò và nhập tài khoản</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
          {ROLE_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                const v = item.value as 'teacher' | 'student'
                setRole(v)
                // autofill sample email/password for convenience
                form.setFieldsValue({ email: SAMPLE[v].email, password: SAMPLE[v].password })
              }}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${role === item.value ? 'bg-[#1976d2] text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              {item.label}
            </button>
          ))}
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} disabled={loading}>
          <Form.Item name="email" label="Email / MSSV" rules={[{ required: true, message: 'Nhập email hoặc MSSV' }]}>
            <Input size="large" prefix={<User className="h-4 w-4 text-slate-400" />} placeholder={ROLE_OPTIONS.find(r => r.value === role)?.hint} />
          </Form.Item>

          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
            <Input.Password size="large" prefix={<LockKeyhole className="h-4 w-4 text-slate-400" />} placeholder="••••••••" />
          </Form.Item>

          <div className="mb-4 flex items-center justify-between text-sm">
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </div>

          <Form.Item>
            <Button type="primary" block size="large" htmlType="submit" loading={loading} className="!h-12 !rounded-xl">
              Đăng nhập
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              type="default"
              block
              size="large"
              onClick={onGoogleSignIn}
              loading={loading}
              className="!h-12 !rounded-xl !border !border-slate-200 bg-white text-slate-700"
            >
              <span className="inline-flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.35 11.1h-9.2v2.84h5.26c-.23 1.46-1.02 2.7-2.17 3.53v2.93h3.5c2.05-1.88 3.22-4.67 3.22-8.3 0-.56-.05-1.1-.16-1.9z" fill="#4285F4"/>
                  <path d="M12.15 22c2.92 0 5.37-.97 7.16-2.64l-3.5-2.93c-.98.66-2.24 1.05-3.66 1.05-2.81 0-5.19-1.9-6.04-4.46H2.56v2.8C4.34 19.98 8 22 12.15 22z" fill="#34A853"/>
                  <path d="M6.11 13.02A6.99 6.99 0 0 1 5.56 12c0-.4.05-.8.12-1.18V8.02H2.56A10.98 10.98 0 0 0 1 12c0 1.7.4 3.3 1.11 4.68l3-3.66z" fill="#FBBC05"/>
                  <path d="M12.15 6.6c1.58 0 3 .54 4.12 1.6l3.08-3.08C17.53 2.78 15.08 2 12.15 2 8 2 4.34 4.02 2.56 7.02l3.12 2.8c.85-2.56 3.23-4.46 6.47-4.46z" fill="#EA4335"/>
                </svg>
                Đăng nhập bằng Google
              </span>
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">© 2026 Trường Cao đẳng Kỹ thuật Cao Thắng</div>
      </div>
    </div>
  )
}
