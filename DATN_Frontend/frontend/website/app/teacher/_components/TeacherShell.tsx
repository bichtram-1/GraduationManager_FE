'use client'

import type { ReactNode } from 'react'
import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Building2, CalendarDays, ClipboardCheck, GraduationCap, Home, LogOut, Menu, ShieldCheck, Trophy, Users, Clock, Bell } from 'lucide-react'
import { Select, Dropdown } from 'antd'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { teacherApi } from '@/lib/api/teacherApi'

const NAV_ITEMS = [
  { key: 'home', href: '/teacher', label: 'Trang chủ', icon: Home },
  { key: 'topics', href: '/teacher/topics', label: 'Đề tài của tôi', icon: BookOpen },
  { key: 'groups', href: '/teacher/groups', label: 'Duyệt nhóm', icon: Users },
  { key: 'students', href: '/teacher/students', label: 'Hướng dẫn sinh viên', icon: Users },
  { key: 'review-groups', href: '/teacher/review-groups', label: 'Đánh giá', icon: ClipboardCheck },
  { key: 'grading', href: '/teacher/grading', label: 'Chấm điểm', icon: Trophy },
  { key: 'councils', href: '/teacher/councils', label: 'Hội đồng', icon: Building2 },
  { key: 'history', href: '/teacher/history', label: 'Lịch sử', icon: Clock },
]

function getActiveKey(pathname: string) {
  if (pathname.startsWith('/teacher/topics')) return 'topics'
  if (pathname.startsWith('/teacher/groups')) return 'groups'
  if (pathname.startsWith('/teacher/review-groups')) return 'review-groups'
  if (pathname.startsWith('/teacher/students')) return 'students'
  if (pathname.startsWith('/teacher/grading')) return 'grading'
  if (pathname.startsWith('/teacher/councils')) return 'councils'
  if (pathname.startsWith('/teacher/history')) return 'history'
  return 'home'
}

export function TeacherShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { periods, selectedPeriod, setSelectedPeriod, studentsTab, gradingTab } = usePeriod()
  const [profileOpen, setProfileOpen] = useState(false)
  const [teacher, setTeacher] = useState<{
    id: number
    name: string
    email: string
    phone: string
    degree: string
    specialty: string
  } | null>(null)

  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      // Chuông chỉ hiển thị top gần nhất nên chỉ cần xin backend đúng số dòng đó
      // (không tải toàn bộ lịch sử) — trang "Lịch sử" đầy đủ vẫn gọi getHistory()
      // không giới hạn.
      const data = await teacherApi.getHistory(20)
      setNotifications(data)
      const lastSeen = localStorage.getItem('teacher_last_seen_notif')
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
    return () => {
      window.removeEventListener('realtime-group-updated', fetchNotifications)
      window.removeEventListener('realtime-topic-updated', fetchNotifications)
      window.removeEventListener('realtime-score-updated', fetchNotifications)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    async function loadProfile() {
      try {
        const data = await teacherApi.getProfile()
        if (mounted && data?.teacher) {
          setTeacher(data.teacher)
        }
      } catch (err) {
        console.error('Failed to load teacher profile:', err)
      }
    }
    loadProfile()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (pathname.startsWith('/teacher/topics')) {
      const datnPeriods = periods.filter(p => p.type === 'datn');
      if (datnPeriods.length > 0 && (!selectedPeriod || selectedPeriod.type !== 'datn')) {
        const activePeriod = datnPeriods.find(p => p.status === 'open' || p.status === 'published') || datnPeriods[0];
        setSelectedPeriod(activePeriod);
      }
    } else if (pathname.startsWith('/teacher/review-groups')) {
      const datnPeriods = periods.filter(p => p.type === 'datn');
      if (datnPeriods.length > 0 && (!selectedPeriod || selectedPeriod.type !== 'datn')) {
        const activePeriod = datnPeriods.find(p => p.status === 'open' || p.status === 'published' || p.status === 'grading') || datnPeriods[0];
        setSelectedPeriod(activePeriod);
      }
    } else if (pathname.startsWith('/teacher/students')) {
      if (studentsTab === 'TTTN') {
        const tttnPeriods = periods.filter(p => p.type === 'tttn');
        if (tttnPeriods.length > 0 && (!selectedPeriod || selectedPeriod.type !== 'tttn')) {
          const activePeriod = tttnPeriods.find(p => p.status === 'open' || p.status === 'published') || tttnPeriods[0];
          setSelectedPeriod(activePeriod);
        }
      } else if (studentsTab === 'DATN') {
        const datnPeriods = periods.filter(p => p.type === 'datn');
        if (datnPeriods.length > 0 && (!selectedPeriod || selectedPeriod.type !== 'datn')) {
          const activePeriod = datnPeriods.find(p => p.status === 'open' || p.status === 'published') || datnPeriods[0];
          setSelectedPeriod(activePeriod);
        }
      }
    } else if (pathname.startsWith('/teacher/grading')) {
      if (gradingTab === 'TTTN') {
        const tttnPeriods = periods.filter(p => p.type === 'tttn');
        if (tttnPeriods.length > 0 && (!selectedPeriod || selectedPeriod.type !== 'tttn')) {
          const activePeriod = tttnPeriods.find(p => p.status === 'open' || p.status === 'published') || tttnPeriods[0];
          setSelectedPeriod(activePeriod);
        }
      } else if (gradingTab === 'DATN') {
        const datnPeriods = periods.filter(p => p.type === 'datn');
        if (datnPeriods.length > 0 && (!selectedPeriod || selectedPeriod.type !== 'datn')) {
          const activePeriod = datnPeriods.find(p => p.status === 'open' || p.status === 'published') || datnPeriods[0];
          setSelectedPeriod(activePeriod);
        }
      }
    } else if (pathname.startsWith('/teacher/councils')) {
      const datnPeriods = periods.filter(p => p.type === 'datn');
      if (datnPeriods.length > 0 && (!selectedPeriod || selectedPeriod.type !== 'datn')) {
        const activePeriod = datnPeriods.find(p => p.status === 'open' || p.status === 'published' || p.status === 'grading') || datnPeriods[0];
        setSelectedPeriod(activePeriod);
      }
    }
  }, [pathname, periods, selectedPeriod, setSelectedPeriod, studentsTab, gradingTab]);

  const activeKey = useMemo(() => getActiveKey(pathname), [pathname])

  const shortName = useMemo(() => {
    if (!teacher?.name) return 'GV'
    const parts = teacher.name.trim().split(/\s+/)
    const lastWord = parts[parts.length - 1]
    return lastWord.substring(0, 2).toUpperCase()
  }, [teacher])

  const [currentSegment, setCurrentSegment] = useState<'guidance' | 'review'>('guidance')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const segmentParam = params.get('segment')
      if (segmentParam === 'review') {
        setCurrentSegment('review')
      } else {
        setCurrentSegment('guidance')
      }
    }
  }, [pathname])

  useEffect(() => {
    const handleSegmentEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail === 'review') {
        setCurrentSegment('review')
      } else if (customEvent.detail === 'guidance') {
        setCurrentSegment('guidance')
      }
    }
    window.addEventListener('segment-changed', handleSegmentEvent)
    return () => {
      window.removeEventListener('segment-changed', handleSegmentEvent)
    }
  }, [])

  const handleLogout = () => {
    window.location.assign('/api/logout?from=/login')
  }

  const handleNavSegment = (e: React.MouseEvent, segmentVal: 'guidance' | 'review') => {
    e.preventDefault()
    if (window.location.pathname.startsWith('/teacher/review-groups')) {
      const url = new URL(window.location.href)
      url.searchParams.set('segment', segmentVal)
      window.history.replaceState({}, '', url.toString())
      window.dispatchEvent(new CustomEvent('segment-changed', { detail: segmentVal }))
    } else {
      window.location.assign(`/teacher/review-groups?segment=${segmentVal}`)
    }
  }

  const [currentStudentSegment, setCurrentStudentSegment] = useState<'TTTN' | 'DATN'>('TTTN')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('studentsTab')
      if (tabParam === 'DATN') {
        setCurrentStudentSegment('DATN')
      } else {
        setCurrentStudentSegment('TTTN')
      }
    }
  }, [pathname])

  useEffect(() => {
    const handleStudentSegmentEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail === 'DATN') {
        setCurrentStudentSegment('DATN')
      } else if (customEvent.detail === 'TTTN') {
        setCurrentStudentSegment('TTTN')
      }
    }
    window.addEventListener('student-segment-changed', handleStudentSegmentEvent)
    return () => {
      window.removeEventListener('student-segment-changed', handleStudentSegmentEvent)
    }
  }, [])

  const handleNavStudentSegment = (e: React.MouseEvent, tabVal: 'TTTN' | 'DATN') => {
    e.preventDefault()
    if (window.location.pathname.startsWith('/teacher/students')) {
      const url = new URL(window.location.href)
      url.searchParams.set('studentsTab', tabVal)
      window.history.replaceState({}, '', url.toString())
      window.dispatchEvent(new CustomEvent('student-segment-changed', { detail: tabVal }))
    } else {
      window.location.assign(`/teacher/students?studentsTab=${tabVal}`)
    }
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
          <div className="hidden max-w-lg flex-1 px-6 sm:flex items-center justify-center min-w-0" title={selectedPeriod?.name}>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-[12px] shadow-sm w-full min-w-0">
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
                popupMatchSelectWidth={false}
                styles={{ popup: { root: { minWidth: 'max-content' } } }}
                classNames={{ popup: { root: 'rounded-xl shadow-lg' } }}
              >
                {periods.filter(p => p.type === 'tttn').length > 0 && !pathname.startsWith('/teacher/topics') && !pathname.startsWith('/teacher/groups') && !pathname.startsWith('/teacher/review-groups') && !pathname.startsWith('/teacher/councils') && (!pathname.startsWith('/teacher/students') || studentsTab === 'TTTN') && (!pathname.startsWith('/teacher/grading') || gradingTab === 'TTTN') && (
                  <Select.OptGroup label="Đợt Thực tập tốt nghiệp (TTTN)">
                    {periods.filter(p => p.type === 'tttn').map(p => (
                      <Select.Option key={p.id} value={p.id}>
                        <span className="font-medium text-slate-700 text-sm whitespace-nowrap">{p.name}</span>
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                )}
                {periods.filter(p => p.type === 'datn').length > 0 && (!pathname.startsWith('/teacher/students') || studentsTab === 'DATN') && (!pathname.startsWith('/teacher/grading') || gradingTab === 'DATN') && (
                  <Select.OptGroup label="Đợt Đồ án tốt nghiệp (ĐATN)">
                    {periods
                      .filter(p => p.type === 'datn')
                      .map(p => (
                        <Select.Option key={p.id} value={p.id}>
                          <span className="font-medium text-slate-700 text-sm whitespace-nowrap">{p.name}</span>
                        </Select.Option>
                      ))}
                  </Select.OptGroup>
                )}
              </Select>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-tight">{teacher ? `${teacher.degree ? teacher.degree + '. ' : ''}${teacher.name}` : 'Đang tải...'}</div>
              <div className="text-xs text-slate-500">{teacher?.email || ''}</div>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  if (!notifOpen) {
                    localStorage.setItem('teacher_last_seen_notif', new Date().toISOString());
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
                            {new Date(n.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(n.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
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
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold">{shortName}</div>
                    <div className="min-w-0">
                      <div className="font-semibold leading-tight">{teacher ? `${teacher.degree ? teacher.degree + ' ' : ''}${teacher.name}` : 'Đang tải...'}</div>
                      <div className="text-xs opacity-90">Giảng viên</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 px-5 py-4 text-sm">
                  <div className="flex items-center gap-3 text-slate-700">
                    <CalendarDays className="text-slate-400" />
                    <span>SĐT: {teacher?.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <BookOpen className="text-slate-400" />
                    <span>{teacher?.specialty || 'Khoa Công nghệ thông tin'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Building2 className="text-slate-400" />
                    <span>Mã GV: {teacher?.id || '—'}</span>
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
            
            if (item.key === 'review-groups') {
              const isOnReviewPage = pathname.startsWith('/teacher/review-groups')
              const isGuidanceActive = isOnReviewPage && currentSegment === 'guidance'
              const isReviewActive = isOnReviewPage && currentSegment === 'review'

              return (
                <Dropdown
                  popupRender={() => (
                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.12)] p-1.5 w-[220px] z-50 space-y-0.5">
                      <a
                        href="/teacher/review-groups?segment=guidance"
                        onClick={(e) => handleNavSegment(e, 'guidance')}
                        className={`flex items-center gap-2.5 px-3 py-2 text-sm transition duration-150 rounded-xl cursor-pointer ${
                          isGuidanceActive 
                            ? 'bg-blue-50/80' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <Users className={`h-4 w-4 ${isGuidanceActive ? 'text-[#1976D2]' : 'text-slate-400'}`} />
                        <span className={isGuidanceActive ? 'text-[#1976D2] font-bold' : 'text-slate-700 hover:text-blue-600 font-semibold'}>
                          Nhóm hướng dẫn
                        </span>
                      </a>
                      <a
                        href="/teacher/review-groups?segment=review"
                        onClick={(e) => handleNavSegment(e, 'review')}
                        className={`flex items-center gap-2.5 px-3 py-2 text-sm transition duration-150 rounded-xl cursor-pointer ${
                          isReviewActive 
                            ? 'bg-blue-50/80' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <ClipboardCheck className={`h-4 w-4 ${isReviewActive ? 'text-[#1976D2]' : 'text-slate-400'}`} />
                        <span className={isReviewActive ? 'text-[#1976D2] font-bold' : 'text-slate-700 hover:text-blue-600 font-semibold'}>
                          Nhóm phản biện
                        </span>
                      </a>
                    </div>
                  )}
                  trigger={['hover', 'click']}
                  placement="bottomLeft"
                  key={item.key}
                >
                  <Link
                    href="/teacher/review-groups"
                    prefetch
                    className={`flex min-w-max items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'border-[#2196F3] text-[#2196F3]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    <svg className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </Dropdown>
              )
            }

            if (item.key === 'students') {
              const isOnStudentsPage = pathname.startsWith('/teacher/students')
              const isTTTNActive = isOnStudentsPage && currentStudentSegment === 'TTTN'
              const isDATNActive = isOnStudentsPage && currentStudentSegment === 'DATN'

              return (
                <Dropdown
                  popupRender={() => (
                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.12)] p-1.5 w-[220px] z-50 space-y-0.5">
                      <a
                        href="/teacher/students?studentsTab=TTTN"
                        onClick={(e) => handleNavStudentSegment(e, 'TTTN')}
                        className={`flex items-center gap-2.5 px-3 py-2 text-sm transition duration-150 rounded-xl cursor-pointer ${
                          isTTTNActive 
                            ? 'bg-blue-50/80' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <ShieldCheck className={`h-4 w-4 ${isTTTNActive ? 'text-[#1976D2]' : 'text-slate-400'}`} />
                        <span className={isTTTNActive ? 'text-[#1976D2] font-bold' : 'text-slate-700 hover:text-blue-600 font-semibold'}>
                          Sinh viên thực tập
                        </span>
                      </a>
                      <a
                        href="/teacher/students?studentsTab=DATN"
                        onClick={(e) => handleNavStudentSegment(e, 'DATN')}
                        className={`flex items-center gap-2.5 px-3 py-2 text-sm transition duration-150 rounded-xl cursor-pointer ${
                          isDATNActive 
                            ? 'bg-blue-50/80' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <Users className={`h-4 w-4 ${isDATNActive ? 'text-[#1976D2]' : 'text-slate-400'}`} />
                        <span className={isDATNActive ? 'text-[#1976D2] font-bold' : 'text-slate-700 hover:text-blue-600 font-semibold'}>
                          Sinh viên đồ án
                        </span>
                      </a>
                    </div>
                  )}
                  trigger={['hover', 'click']}
                  placement="bottomLeft"
                  key={item.key}
                >
                  <Link
                    href="/teacher/students"
                    prefetch
                    className={`flex min-w-max items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'border-[#2196F3] text-[#2196F3]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    <svg className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </Dropdown>
              )
            }

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
  accent?: 'blue' | 'green' | 'orange' | 'violet' | 'red'
}) {
  const accents = {
    blue: 'from-[#2196F3] to-[#2563eb]',
    green: 'from-[#10b981] to-[#059669]',
    orange: 'from-[#f97316] to-[#ea580c]',
    violet: 'from-[#8b5cf6] to-[#7c3aed]',
    red: 'from-[#ef4444] to-[#dc2626]',
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
