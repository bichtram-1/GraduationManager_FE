'use client'

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Building2, CalendarDays, ClipboardCheck, GraduationCap, Home, LogOut, Menu, Trophy, Users } from 'lucide-react'
import { Select } from 'antd'
import { usePeriod } from '@/lib/providers/PeriodProvider'

const NAV_ITEMS = [
  { key: 'home', href: '/teacher', label: 'Trang chủ', icon: Home },
  { key: 'topics', href: '/teacher/topics', label: 'Đề tài của tôi', icon: BookOpen },
  { key: 'groups', href: '/teacher/groups', label: 'Duyệt nhóm', icon: Users },
  { key: 'review-groups', href: '/teacher/review-groups', label: 'Đánh giá', icon: ClipboardCheck },
  { key: 'students', href: '/teacher/students', label: 'Hướng dẫn sinh viên', icon: Users },
  { key: 'grading', href: '/teacher/grading', label: 'Chấm điểm', icon: Trophy },
  { key: 'councils', href: '/teacher/councils', label: 'Hội đồng', icon: Building2 },
]

function getActiveKey(pathname: string) {
  if (pathname.startsWith('/teacher/topics')) return 'topics'
  if (pathname.startsWith('/teacher/groups')) return 'groups'
  if (pathname.startsWith('/teacher/review-groups')) return 'review-groups'
  if (pathname.startsWith('/teacher/students')) return 'students'
  if (pathname.startsWith('/teacher/grading')) return 'grading'
  if (pathname.startsWith('/teacher/councils')) return 'councils'
  return 'home'
}

export function TeacherShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { periods, selectedPeriod, setSelectedPeriod } = usePeriod()
  const [profileOpen, setProfileOpen] = useState(false)

  const activeKey = useMemo(() => getActiveKey(pathname), [pathname])

  const handleLogout = () => {
    window.location.assign('/api/logout?from=/login')
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_16%,#f8fafc_100%)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/teacher" prefetch className="flex items-center gap-3 text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2196F3_0%,#2563eb_100%)] text-white shadow-lg shadow-blue-200">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[15px] font-semibold leading-tight tracking-tight">Cổng giảng viên</div>
              <div className="text-xs text-slate-500">TTTN · ĐATN · Hội đồng</div>
            </div>
          </Link>

          {/* Global Period Selector (replacing search bar) */}
          <div className="hidden max-w-sm flex-1 px-6 sm:flex items-center justify-center">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-[12px] shadow-sm w-full">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Đợt hoạt động:</span>
              <Select
                className="w-full"
                placeholder="Chọn đợt hoạt động"
                value={selectedPeriod?.id}
                onChange={(id) => {
                  const period = periods.find((p) => p.id === id)
                  setSelectedPeriod(period)
                }}
                variant="borderless"
                classNames={{ popup: { root: 'rounded-xl shadow-lg' } }}
              >
                {periods.filter(p => p.type === 'tttn').length > 0 && (
                  <Select.OptGroup label="Đợt Thực tập tốt nghiệp (TTTN)">
                    {periods.filter(p => p.type === 'tttn').map(p => (
                      <Select.Option key={p.id} value={p.id}>
                        <span className="font-medium text-slate-700 text-sm">{p.name}</span>
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                )}
                {periods.filter(p => p.type === 'datn').length > 0 && (
                  <Select.OptGroup label="Đợt Đồ án tốt nghiệp (ĐATN)">
                    {periods.filter(p => p.type === 'datn').map(p => (
                      <Select.Option key={p.id} value={p.id}>
                        <span className="font-medium text-slate-700 text-sm">{p.name}</span>
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                )}
              </Select>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-tight">TS. Nguyễn Văn X</div>
              <div className="text-xs text-slate-500">teacher@uit.edu.vn</div>
            </div>
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              title="Thông tin giảng viên"
            >
              <Menu />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              title="Đăng xuất"
            >
              <LogOut />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                <div className="bg-[linear-gradient(135deg,#1976D2_0%,#2196F3_100%)] px-5 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold">GV</div>
                    <div className="min-w-0">
                      <div className="font-semibold leading-tight">TS. Nguyễn Văn X</div>
                      <div className="text-xs opacity-90">Giảng viên hướng dẫn</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 px-5 py-4 text-sm">
                  <div className="flex items-center gap-3 text-slate-700">
                    <CalendarDays className="text-slate-400" />
                    <span>Lịch hướng dẫn: Thứ 2, Thứ 4, Thứ 6</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <BookOpen className="text-slate-400" />
                    <span>Khoa Công nghệ thông tin</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Building2 className="text-slate-400" />
                    <span>Phụ trách TTTN & ĐATN</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-0 sm:px-6 lg:px-8">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeKey === item.key
            return (
              <Link
                href={item.href}
                prefetch
                key={item.key}
                className={`flex min-w-max items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'border-[#2196F3] text-[#2196F3]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}

export function TeacherSectionHeader({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-medium text-[#1976D2]">
          <span className="h-2 w-2 rounded-full bg-[#2196F3]" />
          Giảng viên
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function TeacherStatCard({
  title,
  value,
  hint,
  accent = 'blue',
}: {
  title: string
  value: string
  hint: string
  accent?: 'blue' | 'green' | 'orange' | 'violet'
}) {
  const accents = {
    blue: 'from-[#2196F3] to-[#2563eb]',
    green: 'from-[#10b981] to-[#059669]',
    orange: 'from-[#f97316] to-[#ea580c]',
    violet: 'from-[#8b5cf6] to-[#7c3aed]',
  } as const

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className={`inline-flex rounded-2xl bg-gradient-to-br ${accents[accent]} px-3 py-2 text-white shadow-lg shadow-slate-200`}>
        <div className="text-xs font-medium uppercase tracking-[0.18em] opacity-90">{title}</div>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{hint}</div>
    </div>
  )
}

export function TeacherPill({
  children,
  tone = 'blue',
}: {
  children: ReactNode
  tone?: 'blue' | 'green' | 'orange' | 'red' | 'slate'
}) {
  const tones = {
    blue: 'bg-[#eff6ff] text-[#1976D2]',
    green: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-slate-100 text-slate-600',
  } as const

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>
}
