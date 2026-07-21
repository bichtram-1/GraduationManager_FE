'use client'

import type { ReactNode } from 'react'
import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { studentApi } from '@/lib/api/studentApi'
import { Dropdown } from 'antd'
import {
  Award,
  Bell,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Hash,
  Home,
  LogOut,
  Mail,
  Menu,
  Phone,
  User,
  Users,
  X,
  History,
} from 'lucide-react'

import { Select } from 'antd'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { formatVietnamTimeDate } from '@/lib/utils/datetime'

const NAV_ITEMS = [
  { key: 'home', href: '/student', label: 'Trang chủ', icon: Home },
    { key: 'internship', href: '/student/internship', label: 'Đăng ký TTTN', icon: ClipboardList },
    { key: 'thesis-create', href: '/student/thesis-invite', label: 'Tạo nhóm ĐATN', icon: Users },
    { key: 'thesis', href: '/student/thesis-register', label: 'Đăng ký ĐATN', icon: BookOpen },
  { key: 'reports-tttn', href: '/student/reports/tttn', label: 'Báo cáo TTTN', icon: FileText },
  { key: 'reports-datn', href: '/student/reports/datn', label: 'Báo cáo ĐATN', icon: GraduationCap },
  { key: 'results', href: '/student/results', label: 'Kết quả', icon: Award },
  { key: 'history', href: '/student/history', label: 'Lịch sử hoạt động', icon: History },
]

function getActiveKey(pathname: string) {
  if (pathname.startsWith('/student/internship')) return 'internship'
    if (pathname.startsWith('/student/thesis-register')) return 'thesis'
    if (pathname.startsWith('/student/thesis-invite')) return 'thesis-create'
  if (pathname.startsWith('/student/reports/tttn')) return 'reports-tttn'
  if (pathname.startsWith('/student/reports/datn')) return 'reports-datn'
  if (pathname.startsWith('/student/results')) return 'results'
  if (pathname.startsWith('/student/history')) return 'history'
  return 'home'
}

export function StudentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { periods, selectedPeriod, setSelectedPeriod, loading } = usePeriod()
  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [student, setStudent] = useState<{
    id: number
    studentCode: string
    name: string
    email: string
    phone: string
    className: string
  } | null>(null)

  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)

  const fetchNotifications = async () => {
    if (!selectedPeriod) {
      setNotifications([])
      setUnreadCount(0)
      return
    }
    try {
      // Chuông chỉ hiển thị top gần nhất nên chỉ cần xin backend đúng số dòng đó
      // (không tải toàn bộ lịch sử) — trang "Lịch sử hoạt động" đầy đủ vẫn gọi
      // getHistory() không giới hạn.
      const data = await studentApi.getHistory(20, selectedPeriod.id)
      setNotifications(data)
      const lastSeen = localStorage.getItem('student_last_seen_notif')
      if (lastSeen) {
        const count = data.filter(n => new Date(n.created_at) > new Date(lastSeen)).length
        setUnreadCount(count)
      } else {
        setUnreadCount(data.length)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    window.addEventListener('realtime-group-updated', fetchNotifications)
    window.addEventListener('realtime-topic-updated', fetchNotifications)
    window.addEventListener('realtime-score-updated', fetchNotifications)
    window.addEventListener('realtime-assignment-published', fetchNotifications)
    return () => {
      window.removeEventListener('realtime-group-updated', fetchNotifications)
      window.removeEventListener('realtime-topic-updated', fetchNotifications)
      window.removeEventListener('realtime-score-updated', fetchNotifications)
      window.removeEventListener('realtime-assignment-published', fetchNotifications)
    }
  }, [selectedPeriod])

  useEffect(() => {
    let mounted = true
    async function loadProfile() {
      try {
        const data = await studentApi.getDashboard()
        if (mounted && data?.student) {
          setStudent(data.student)
        }
      } catch (err) {
        console.error('Failed to load student profile in Shell:', err)
      }
    }
    loadProfile()
    return () => {
      mounted = false
    }
  }, [])

  const isInternshipPage = pathname.startsWith('/student/internship') || pathname.startsWith('/student/reports/tttn');
  const isThesisPage = pathname.startsWith('/student/thesis-register') || pathname.startsWith('/student/thesis-invite') || pathname.startsWith('/student/reports/datn');

  useEffect(() => {
    if (periods.length === 0) return;

    if (isInternshipPage) {
      const tttnPeriods = periods.filter(p => p.type === 'tttn');
      if (tttnPeriods.length > 0) {
        const isCurrentTttn = selectedPeriod && selectedPeriod.type === 'tttn';
        if (!isCurrentTttn) {
          const activeTttn = tttnPeriods.find(p => p.status === 'open' || p.status === 'published') || tttnPeriods[0];
          setSelectedPeriod(activeTttn);
        }
      }
    } else if (isThesisPage) {
      const datnPeriods = periods.filter(p => p.type === 'datn');
      if (datnPeriods.length > 0) {
        const isCurrentDatn = selectedPeriod && selectedPeriod.type === 'datn';
        if (!isCurrentDatn) {
          const activeDatn = datnPeriods.find(p => p.status === 'open' || p.status === 'published') || datnPeriods[0];
          setSelectedPeriod(activeDatn);
        }
      }
    }
  }, [periods, selectedPeriod, setSelectedPeriod, isInternshipPage, isThesisPage]);

  // Trang chỉ dùng 1 loại đợt thì chỉ cho chọn đúng loại đó trong dropdown
  const showTttnGroup = !isThesisPage;
  const showDatnGroup = !isInternshipPage;

  // Chỉ hiện dropdown ở các trang thực sự dùng selectedPeriod để lọc dữ liệu
  // (trang chủ, kết quả, báo cáo TTTN/ĐATN đều tự lấy đợt hiện tại phía backend, không nhận periodId)
  const showPeriodSelector = pathname.startsWith('/student/internship')
    || pathname.startsWith('/student/thesis-register')
    || pathname.startsWith('/student/thesis-invite');

  const activeKey = useMemo(() => getActiveKey(pathname), [pathname])

  const handleResultSegment = (type: 'tttn' | 'datn') => {
    window.location.assign(`/student/results?view=${type}`)
  }

  const handleLogout = () => {
    window.location.assign('/api/logout?from=/login')
  }

  // Extract student short name for avatar
  const shortName = useMemo(() => {
    if (!student?.name) return 'SV'
    const parts = student.name.trim().split(/\s+/)
    const lastWord = parts[parts.length - 1]
    return lastWord.substring(0, 2).toUpperCase()
  }, [student])

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_18%,#f8fafc_100%)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/student" prefetch className="flex items-center gap-3 text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2196F3_0%,#2563eb_100%)] text-white shadow-lg shadow-blue-200">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[15px] font-semibold leading-tight tracking-tight">Cổng sinh viên</div>
              <div className="text-xs text-slate-500">TTTN · ĐATN · Kết quả</div>
            </div>
          </Link>

          {showPeriodSelector && (
            <div className="hidden max-w-sm flex-1 px-6 sm:flex items-center justify-center min-w-0">
              {loading || !selectedPeriod ? (
                <div className="h-8 w-full bg-slate-50 border border-slate-200 px-3 rounded-[12px] flex items-center justify-center animate-pulse">
                  <div className="h-2 w-1/3 bg-slate-200 rounded" />
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-[12px] shadow-sm w-full min-w-0" title={selectedPeriod?.name}>
                  <span className="text-xs font-semibold text-slate-500 shrink-0">Đợt hoạt động:</span>
                  <Select
                    className="w-full min-w-0"
                    placeholder="Chọn đợt hoạt động"
                    value={selectedPeriod?.id}
                    labelRender={() => selectedPeriod?.name ?? 'Chọn đợt hoạt động'}
                    onChange={(id) => {
                      const period = periods.find((p) => p.id === id)
                      setSelectedPeriod(period)
                    }}
                    variant="borderless"
                    classNames={{ popup: { root: 'rounded-xl shadow-lg' } }}
                  >
                    {showTttnGroup && periods.filter(p => p.type === 'tttn').length > 0 && (
                      <Select.OptGroup label="Đợt Thực tập tốt nghiệp (TTTN)">
                        {periods.filter(p => p.type === 'tttn').map(p => (
                          <Select.Option key={p.id} value={p.id}>
                            <span className="font-medium text-slate-700 text-sm">{p.name}</span>
                          </Select.Option>
                        ))}
                      </Select.OptGroup>
                    )}
                    {showDatnGroup && periods.filter(p => p.type === 'datn').length > 0 && (
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
              )}
            </div>
          )}

          <div className="relative flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-tight">{student?.name || 'Đang tải...'}</div>
              <div className="text-xs text-slate-500">{student ? `${student.studentCode} · ${student.className}` : ''}</div>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  if (!notifOpen) {
                    localStorage.setItem('student_last_seen_notif', new Date().toISOString());
                    setUnreadCount(0);
                  }
                }}
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                title="Thông báo"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-sm font-semibold text-slate-900">Thông báo quan trọng</span>
                    <button 
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-[#1976D2] hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                  <div className="mt-2 max-h-72 overflow-y-auto space-y-2.5 pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 py-6">Chưa có thông báo nào.</div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div key={n.log_id} className="text-xs leading-normal border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                          <div className="font-medium text-slate-800">{n.description}</div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                            {formatVietnamTimeDate(n.created_at)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              title="Thông tin sinh viên"
            >
              <User className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 sm:hidden"
              aria-label="Mở menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                <div className="bg-[linear-gradient(135deg,#1976D2_0%,#2196F3_100%)] px-5 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold">{shortName}</div>
                    <div className="min-w-0">
                      <div className="font-semibold leading-tight">{student?.name || 'Đang tải...'}</div>
                      <div className="text-xs opacity-90">Sinh viên</div>
                    </div>
                    <button onClick={() => setProfileOpen(false)} className="ml-auto rounded-full p-1 text-white/90 hover:bg-white/15" aria-label="Đóng">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3 px-5 py-4 text-sm">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Hash className="text-slate-400" />
                    <span>MSSV: {student?.studentCode || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Users className="text-slate-400" />
                    <span>Lớp: {student?.className || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="text-slate-400" />
                    <span>Email: {student?.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone className="text-slate-400" />
                    <span>SĐT: {student?.phone || '—'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="mx-auto hidden max-w-7xl gap-1 overflow-x-auto px-4 pb-0 sm:flex sm:px-6 lg:px-8">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeKey === item.key
            if (item.key === 'results') {
              const currentSearch = typeof window !== 'undefined' ? window.location.search : ''
              const viewParam = new URLSearchParams(currentSearch).get('view')
              const isTttnActive = pathname.startsWith('/student/results') && (viewParam === 'tttn' || viewParam === null)
              const isDatnActive = pathname.startsWith('/student/results') && viewParam === 'datn'

              return (
                <Dropdown
                  key={item.key}
                  trigger={['hover', 'click']}
                  placement="bottomLeft"
                  popupRender={() => (
                    <div className="w-56 space-y-0.5 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_12px_40px_rgba(15,23,42,0.12)] z-50">
                      <a
                        href="/student/results?view=tttn"
                        onClick={(e) => {
                          e.preventDefault()
                          handleResultSegment('tttn')
                        }}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition duration-150 ${isTttnActive ? 'bg-blue-50/80' : 'hover:bg-slate-50'}`}
                      >
                        <FileText className={`h-4 w-4 ${isTttnActive ? 'text-[#1976D2]' : 'text-slate-400'}`} />
                        <span className={isTttnActive ? 'font-bold text-[#1976D2]' : 'font-semibold text-slate-700 hover:text-blue-600'}>Điểm TTTN</span>
                      </a>
                      <a
                        href="/student/results?view=datn"
                        onClick={(e) => {
                          e.preventDefault()
                          handleResultSegment('datn')
                        }}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition duration-150 ${isDatnActive ? 'bg-blue-50/80' : 'hover:bg-slate-50'}`}
                      >
                        <GraduationCap className={`h-4 w-4 ${isDatnActive ? 'text-[#1976D2]' : 'text-slate-400'}`} />
                        <span className={isDatnActive ? 'font-bold text-[#1976D2]' : 'font-semibold text-slate-700 hover:text-blue-600'}>Điểm ĐATN</span>
                      </a>
                    </div>
                  )}
                >
                  <button
                    type="button"
                    className={`flex min-w-max items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition ${isActive ? 'border-[#2196F3] text-[#2196F3]' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    <svg className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Dropdown>
              )
            }
            return (
              <Link
                href={item.href}
                prefetch
                key={item.key}
                className={`flex min-w-max items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${isActive ? 'border-[#2196F3] text-[#2196F3]' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white sm:hidden">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeKey === item.key
              if (item.key === 'results') {
                const currentSearch = typeof window !== 'undefined' ? window.location.search : ''
                const view = new URLSearchParams(currentSearch).get('view')
                const isTttnActive = pathname.startsWith('/student/results') && (view === 'tttn' || view === null)
                const isDatnActive = pathname.startsWith('/student/results') && view === 'datn'

                return (
                  <div key={item.key} className="border-b border-slate-100">
                    <button
                      type="button"
                      className={`flex w-full items-center gap-3 px-6 py-3 text-sm ${isActive ? 'bg-blue-50 text-[#1976D2]' : 'text-slate-700'}`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                    <div className="space-y-0.5 bg-slate-50/60 px-3 py-2">
                      <a
                        href="/student/results?view=tttn"
                        onClick={(e) => {
                          e.preventDefault()
                          handleResultSegment('tttn')
                          setMenuOpen(false)
                        }}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${isTttnActive ? 'bg-blue-50 text-[#1976D2]' : 'text-slate-700 hover:bg-white'}`}
                      >
                        <FileText className="h-4 w-4" />
                        Điểm TTTN
                      </a>
                      <a
                        href="/student/results?view=datn"
                        onClick={(e) => {
                          e.preventDefault()
                          handleResultSegment('datn')
                          setMenuOpen(false)
                        }}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${isDatnActive ? 'bg-blue-50 text-[#1976D2]' : 'text-slate-700 hover:bg-white'}`}
                      >
                        <GraduationCap className="h-4 w-4" />
                        Điểm ĐATN
                      </a>
                    </div>
                  </div>
                )
              }
              return (
                <Link
                  href={item.href}
                  prefetch
                  key={item.key}
                  className={`flex w-full items-center gap-3 border-b border-slate-100 px-6 py-3 text-sm ${isActive ? 'bg-blue-50 text-[#1976D2]' : 'text-slate-700'}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 px-6 py-3 text-sm text-[#F44336]">
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}

export function StudentSectionHeader({
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
          Sinh viên
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function StudentStatCard({
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

export function StudentPill({
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