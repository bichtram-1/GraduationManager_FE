"use client"

import { usePeriod } from '@/lib/providers/PeriodProvider'
import { topicApi, ITopicDirection } from '@/lib/api/topicApi'
import { studentApi, IThesisRegistration } from '@/lib/api/studentApi'
import Link from 'next/link'
import { CalendarDays, CheckCircle2, Clock3, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { StudentPill, StudentSectionHeader } from '../_components/StudentShell'
import { StudentButton, StudentModal } from '../_components/StudentUI'
import { COMMON_LABELS } from '@/constants/commonLabels'
import { getPreviewUrl } from '@/lib/utils/fileUrl'
import { App } from 'antd'
import { formatVietnamDateTime } from '@/lib/utils/datetime'

type Topic = { id: string; code?: string; title: string; module: string; published: boolean; slots?: string; description?: string; direction?: string; fileUrl?: string }

type Registration = IThesisRegistration;

type ConfirmAction =
  | { type: 'register'; topicId: string }
  | { type: 'leaveGroup' }
  | { type: 'cancelTopic' }

const CONFIRM_COPY: Record<ConfirmAction['type'], { title: string; message: string; confirmLabel: string }> = {
  register: {
    title: 'Xác nhận đổi đề tài',
    message: 'Bạn đang thay đổi đề tài cho nhóm. Đề tài cũ sẽ bị thay thế. Bạn có chắc chắn muốn thay đổi không?',
    confirmLabel: 'Xác nhận đổi',
  },
  leaveGroup: {
    title: 'Xác nhận rời/giải tán nhóm',
    message: 'Bạn có chắc chắn muốn rời nhóm hoặc giải tán nhóm không? Hành động này không thể hoàn tác.',
    confirmLabel: 'Xác nhận',
  },
  cancelTopic: {
    title: 'Xác nhận hủy đăng ký đề tài',
    message: 'Bạn có chắc chắn muốn hủy đăng ký đề tài này không? Nhóm của bạn vẫn sẽ được giữ lại.',
    confirmLabel: 'Xác nhận hủy',
  },
}

export default function ThesisRegisterPage() {
  const { message } = App.useApp()
  const { selectedPeriod } = usePeriod()
  const isPeriodLocked = selectedPeriod?.status === 'grading' || selectedPeriod?.status === 'closed'
  const isRegistrationTime = useMemo(() => {
    if (!selectedPeriod) return { isOpen: false, isClosed: false }
    const { regOpenDate, regDeadline } = selectedPeriod
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let isOpen = true
    let isClosed = false
    if (regOpenDate) {
      const parts = regOpenDate.split('/')
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1
        const year = parseInt(parts[2], 10)
        const openDate = new Date(year, month, day)
        openDate.setHours(0, 0, 0, 0)
        if (today.getTime() < openDate.getTime()) {
          isOpen = false
        }
      }
    }
    if (regDeadline) {
      const parts = regDeadline.split('/')
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1
        const year = parseInt(parts[2], 10)
        const deadlineDate = new Date(year, month, day)
        deadlineDate.setHours(23, 59, 59, 999)
        if (today.getTime() > deadlineDate.getTime()) {
          isClosed = true
        }
      }
    }
    return { isOpen, isClosed }
  }, [selectedPeriod])
  const isActionDisabled = isPeriodLocked || !isRegistrationTime.isOpen || isRegistrationTime.isClosed
  const showDeadlineWarning = useMemo(() => {
    if (!selectedPeriod?.regDeadline) return false
    const parts = selectedPeriod.regDeadline.split('/')
    if (parts.length !== 3) return false
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    const deadlineDate = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    deadlineDate.setHours(0, 0, 0, 0)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 3
  }, [selectedPeriod])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [confirming, setConfirming] = useState(false)

  const isTopicActive = !!(registration && registration.topicId && registration.topicId !== "");

  // Pagination and search/filter states
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [direction, setDirection] = useState('all')
  const [directionOptions, setDirectionOptions] = useState<ITopicDirection[]>([])
  const [teacher, setTeacher] = useState('all')
  const [teacherOptions, setTeacherOptions] = useState<string[]>([])
  const [slotsStatus, setSlotsStatus] = useState<string>('all')
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [detailTopic, setDetailTopic] = useState<Topic | null>(null)

  // Gõ tới đâu lọc tới đó, không cần bấm nút "Tìm kiếm"
  useEffect(() => {
    const handler = setTimeout(() => {
      setKeyword(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchInput])

  // Danh sách hướng đề tài để lọc, lấy đúng dữ liệu thật từ bảng huongdetai (không đoán theo tên)
  useEffect(() => {
    let mounted = true
    async function loadDirections() {
      try {
        const res = await topicApi.getDirections()
        if (!mounted) return
        setDirectionOptions(res)
      } catch (_err) {
        if (!mounted) return
        setDirectionOptions([])
      }
    }
    loadDirections()
    return () => {
      mounted = false
    }
  }, [])

  // Danh sách giảng viên để lọc, lấy từ toàn bộ đề tài của đợt (không phụ thuộc trang/bộ lọc hiện tại)
  useEffect(() => {
    let mounted = true
    async function loadTeachers() {
      try {
        const res = await topicApi.getTopics({ periodId: selectedPeriod?.id, page: 1, limit: 1000 })
        if (!mounted) return
        const names = Array.from(new Set(res.rows.map((t: Topic) => t.module).filter(Boolean))) as string[]
        setTeacherOptions(names.sort((a, b) => a.localeCompare(b)))
      } catch (_err) {
        if (!mounted) return
        setTeacherOptions([])
      }
    }
    loadTeachers()
    return () => {
      mounted = false
    }
  }, [selectedPeriod?.id])

  // Load registration
  useEffect(() => {
    let mounted = true
    async function loadRegistration() {
      try {
        const regData = await studentApi.getMyThesisRegistration(selectedPeriod?.id)
        if (!mounted) return
        setRegistration(regData)
      } catch (_err) {
        if (!mounted) return
        setRegistration(null)
      }
    }
    loadRegistration()

    const handleSync = () => {
      loadRegistration()
    }
    window.addEventListener('realtime-group-updated', handleSync)
    return () => {
      mounted = false
      window.removeEventListener('realtime-group-updated', handleSync)
    }
  }, [selectedPeriod?.id])

  // Load topics
  useEffect(() => {
    let mounted = true
    setLoading(true)
    async function loadTopics() {
      try {
        const res = await topicApi.getTopics({
          periodId: selectedPeriod?.id,
          page,
          limit: 12,
          direction,
          teacher: teacher !== 'all' ? teacher : undefined,
          keyword: keyword.trim() || undefined,
          slotsStatus: slotsStatus !== 'all' ? slotsStatus : undefined
        })
        if (!mounted) return
        setTopics(res.rows)
        setTotalPages(res.pagination.totalPages || 1)
      } catch (_err) {
        if (!mounted) return
        setTopics([])
        setTotalPages(1)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    loadTopics()

    const handleSync = () => {
      loadTopics()
    }
    window.addEventListener('realtime-topic-updated', handleSync)
    return () => {
      mounted = false
      window.removeEventListener('realtime-topic-updated', handleSync)
    }
  }, [selectedPeriod?.id, page, direction, teacher, keyword, slotsStatus])

  const handleRegister = (id: string) => {
    if (registration && registration.topicId) {
      setConfirmAction({ type: 'register', topicId: id })
      return
    }
    void doRegister(id)
  }

  const doRegister = async (id: string) => {
    try {
      setLoading(true)
      const res = await studentApi.registerThesis(Number(id))
      setRegistration(res)
      // refresh topics to update slot status if needed
      const resTopics = await topicApi.getTopics({
        periodId: selectedPeriod?.id,
        page,
        limit: 12,
        direction,
        teacher: teacher !== 'all' ? teacher : undefined,
        keyword: keyword.trim() || undefined
      })
      setTopics(resTopics.rows)
      setTotalPages(resTopics.pagination.totalPages || 1)
      message.success('Đăng ký đề tài thành công!')
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra khi đăng ký đề tài.')
    } finally {
      setLoading(false)
    }
  }

  const doLeaveGroup = async () => {
    try {
      setLoading(true)
      await studentApi.leaveGroup()
      setRegistration(null)
      // refresh topics to update slot status if needed
      const resTopics = await topicApi.getTopics({
        periodId: selectedPeriod?.id,
        page,
        limit: 12,
        direction,
        teacher: teacher !== 'all' ? teacher : undefined,
        keyword: keyword.trim() || undefined
      })
      setTopics(resTopics.rows)
      setTotalPages(resTopics.pagination.totalPages || 1)
      message.success('Rời/giải tán nhóm thành công!')
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra khi giải tán nhóm.')
    } finally {
      setLoading(false)
    }
  }

  const doCancelTopic = async () => {
    try {
      setLoading(true)
      await studentApi.cancelThesisRegistration()
      const [resTopics, regData] = await Promise.all([
        topicApi.getTopics({
          periodId: selectedPeriod?.id,
          page,
          limit: 12,
          direction,
          teacher: teacher !== 'all' ? teacher : undefined,
          keyword: keyword.trim() || undefined
        }),
        studentApi.getMyThesisRegistration(selectedPeriod?.id)
      ])
      setTopics(resTopics.rows)
      setTotalPages(resTopics.pagination.totalPages || 1)
      setRegistration(regData)
      message.success('Hủy đăng ký đề tài thành công!')
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra khi hủy đăng ký đề tài.')
    } finally {
      setLoading(false)
    }
  }

  const runConfirmAction = async () => {
    if (!confirmAction) return
    setConfirming(true)
    try {
      if (confirmAction.type === 'register') {
        await doRegister(confirmAction.topicId)
      } else if (confirmAction.type === 'leaveGroup') {
        await doLeaveGroup()
      } else {
        await doCancelTopic()
      }
    } finally {
      setConfirming(false)
      setConfirmAction(null)
    }
  }

  const REGISTRATION_TONE: Record<Registration['status'], 'green' | 'red' | 'orange'> = {
    accepted: 'green',
    rejected: 'red',
    pending: 'orange',
  }
  const registrationTone = registration ? REGISTRATION_TONE[registration.status] : 'slate'

  return (
    <>
      <StudentSectionHeader
        title="Đăng ký ĐATN"
        description="Chọn đề tài bạn muốn đăng ký hoặc chuyển sang tạo nhóm nếu cần mời thành viên."
      />

      {!isPeriodLocked && !isRegistrationTime.isOpen && (
        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 font-semibold">
          ℹ️ Cổng đăng ký đề tài ĐATN chưa mở. Thời gian mở đăng ký: {selectedPeriod?.regOpenDate}.
        </div>
      )}

      {!isPeriodLocked && isRegistrationTime.isClosed && (
        <div className="sticky top-20 sm:top-32 z-30 mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold shadow-sm">
          ⚠️ Cổng đăng ký đề tài ĐATN đã đóng do hết hạn (Hạn chót: {selectedPeriod?.regDeadline}). Bạn không thể đăng ký/hủy đề tài hoặc rời nhóm nữa.
        </div>
      )}

      {!isPeriodLocked && !isRegistrationTime.isClosed && showDeadlineWarning && registration?.status !== 'accepted' && (
        <div className="sticky top-20 sm:top-32 z-30 mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-semibold flex items-center gap-2 shadow-md">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span>Chú ý: Sắp đến hạn đăng ký đề tài đồ án tốt nghiệp! Hạn chót: {selectedPeriod?.regDeadline}. Vui lòng hoàn tất đăng ký sớm!</span>
        </div>
      )}

      {isPeriodLocked && (
        <div className="sticky top-20 sm:top-32 z-30 mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {selectedPeriod?.status === 'closed'
            ? 'Đợt đồ án tốt nghiệp này đã đóng, bạn không thể đăng ký/hủy đề tài hoặc rời nhóm nữa.'
            : 'Đợt đồ án tốt nghiệp đã bắt đầu chấm điểm, bạn không thể đăng ký/hủy đề tài hoặc rời nhóm nữa.'}
        </div>
      )}

      <section className="mb-6 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[22px] bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-4 ring-1 ring-blue-100">
          <div className="flex items-center gap-2 text-xs font-medium text-[#1976D2]">
            <Clock3 className="h-4 w-4" />
            Trạng thái nhóm hiện tại
          </div>
          <div className="mt-3 text-lg font-semibold text-slate-900">
            {registration ? 'Đã ghép nhóm thành công' : 'Chưa có nhóm/đề tài được gửi'}
          </div>
          {registration && (
            <div className="mt-2 text-sm font-semibold text-blue-700">
              {registration.topicTitle ? `Đề tài đăng ký: ${registration.topicTitle}` : 'Đã có nhóm (Chưa đăng ký đề tài)'}
            </div>
          )}
          {!registration && (
            <div className="mt-2 text-sm text-slate-600">
              Sau khi đăng ký, trạng thái duyệt của giảng viên sẽ xuất hiện tại đây.
            </div>
          )}
          {registration && registration.members && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {registration.members.map((m) => (
                <span key={m.studentCode} className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-700 font-medium">
                  {m.name} ({m.studentCode})
                  {m.isLeader && (
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-1 rounded ml-1.5">Trưởng nhóm</span>
                  )}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StudentPill tone={registrationTone}>{registration ? (registration.status === 'accepted' ? 'Đã duyệt' : registration.status === 'rejected' ? 'Đã từ chối' : 'Chờ giảng viên duyệt') : 'Chưa đăng ký'}</StudentPill>
            {registration && <StudentPill tone="blue">{registration.batch}</StudentPill>}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Đã gửi lúc</div>
              <div className="mt-2 text-sm font-medium text-slate-900 inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#1976D2]" />
                {registration ? formatVietnamDateTime(registration.submittedAt) : 'Chưa có dữ liệu'}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Phản hồi</div>
              <div className="mt-2 text-sm font-medium text-slate-900 inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1976D2]" />
                {registration ? registration.note : 'Chờ sinh viên hoàn tất đăng ký'}
              </div>
            </div>
          </div>
          {registration && !isActionDisabled && (registration.members?.length ?? 0) > 1 && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                disabled={isTopicActive}
                onClick={() => setConfirmAction({ type: 'leaveGroup' })}
                className={`rounded-2xl border px-4 py-2 text-xs font-medium transition ${
                  isTopicActive
                    ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                    : 'border-red-200 text-red-600 hover:bg-red-50'
                }`}
                title={isTopicActive ? "Không thể rời/giải tán nhóm khi đang đăng ký đề tài (chờ duyệt hoặc đã duyệt)" : ""}
              >
                Giải tán / Rời nhóm
              </button>
            </div>
          )}
        </div>

        <div className="rounded-[22px] bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Trạng thái hiện tại</div>
          <div className="mt-3 text-sm text-slate-700">
            {registration ? (
              <>
                <div className="font-medium text-slate-900">Bạn đã có nhóm</div>
                <div className="mt-2 text-sm text-slate-600">{registration.topicTitle ? `Đề tài: ${registration.topicTitle}` : 'Nhóm đã được tạo nhưng chưa có đề tài'}</div>
                <div className="mt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {registration.members?.map((m) => (
                      <span key={m.studentCode} className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-700 font-medium">
                        {m.name} ({m.studentCode})
                        {m.isLeader && <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-1 rounded ml-1">Trưởng nhóm</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="font-medium text-slate-900">Chưa có nhóm</div>
                <div className="mt-2 text-sm text-slate-600">Bạn chưa tạo nhóm hoặc chưa nhận lời mời từ nhóm khác.</div>
              </>
            )}
          </div>

          <div className="mt-4">
            {/* Show create group button only when student needs it: no registration and period allows actions */}
            {!registration && !isActionDisabled && (
              <Link href={`/student/thesis-invite`} className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]">
                <Users className="h-4 w-4" />
                Tạo nhóm ĐATN
              </Link>
            )}

            {/* Show requirement hint when there's no group or group is missing members (<2) */}
            {(!registration || (registration.members?.length ?? 0) < 2) && (
              <div className="mt-3 rounded-lg border border-yellow-100 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                Yêu cầu nhóm đủ hai người mới được đăng ký đề tài
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Banner removed - create group button moved into status card */}

      {/* BỘ LỌC ĐỀ TÀI & TÌM KIẾM */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-slate-50 p-4 rounded-[22px] border border-slate-200">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Direction Filter */}
          <div className="w-64">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Hướng đề tài</label>
            <select
              value={direction}
              onChange={(e) => {
                setDirection(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 transition"
            >
              <option value="all">Tất cả hướng đề tài</option>
              {directionOptions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Teacher Filter */}
          <div className="w-64">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Giảng viên hướng dẫn</label>
            <select
              value={teacher}
              onChange={(e) => {
                setTeacher(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 transition"
            >
              <option value="all">Tất cả giảng viên</option>
              {teacherOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Tìm kiếm đề tài</label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nhập tên đề tài, tên giảng viên..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 transition"
            />
          </div>

          {/* Slots Status Filter */}
          <div className="w-56">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Trạng thái đề tài</label>
            <select
              value={slotsStatus}
              onChange={(e) => {
                setSlotsStatus(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 transition"
            >
              <option value="all">Tất cả đề tài</option>
              <option value="available">Có thể đăng ký</option>
              <option value="full">Không thể đăng ký</option>
            </select>
          </div>
        </div>
      </div>

      <section className="rounded-[12px] p-1">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Đang tải danh sách đề tài…</div>
        ) : topics.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">Không có đề tài nào.</div>
        ) : (
          <div>
            <div className="grid gap-4 md:grid-cols-2">
              {topics.map((t) => {
                const teacher = t.module ? `GV: ${t.module}` : 'GV: Chưa phân công'
                const slotsStr = t.slots || '0/4'
                const [used, maxSlots] = slotsStr.split('/').map(Number)
                const safeUsed = Number.isFinite(used) ? used : 0
                const safeMaxSlots = Number.isFinite(maxSlots) ? maxSlots : 0
                const hasSlot = safeUsed < safeMaxSlots && t.published
                const isCurrentTopic = registration?.topicId === t.id
                return (
                  <div key={t.id} className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="text-xs text-[#2196F3] font-medium">{t.code || t.id}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 line-clamp-2" title={t.title}>{t.title}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span>{teacher}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-medium text-slate-600">{safeUsed}/{safeMaxSlots}</span>
                          {t.direction && <span className="ml-2 text-xs text-blue-600">{t.direction}</span>}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {isCurrentTopic && registration && (
                            <StudentPill tone={registrationTone}>
                              {registration.status === 'accepted' ? 'Đã duyệt' : registration.status === 'rejected' ? 'Đã từ chối' : 'Chờ duyệt'}
                            </StudentPill>
                          )}
                          {isCurrentTopic && <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">Nhóm của bạn</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setDetailTopic(t)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        Xem
                      </button>
                      {!isCurrentTopic ? (
                        <button
                          disabled={(!!registration && registration.status === 'accepted') || isActionDisabled || !hasSlot || !registration || (registration.members?.length ?? 0) < 2}
                          onClick={() => handleRegister(t.id)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${((!!registration && registration.status === 'accepted') || isActionDisabled || !hasSlot || !registration || (registration.members?.length ?? 0) < 2) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#2196F3] text-white hover:bg-[#1976D2]'}`}
                        >
                          Đăng ký
                        </button>
                      ) : (
                        <button
                          disabled={registration?.status === 'accepted' || isActionDisabled}
                          onClick={() => setConfirmAction({ type: 'cancelTopic' })}
                          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${registration?.status === 'accepted' || isActionDisabled ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                          {registration?.status === 'accepted' ? 'Đã khóa' : 'Hủy'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* PHÂN TRANG CHO 200+ ĐỀ TÀI */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm w-fit mx-auto">
                <button
                  disabled={page === 1}
                  onClick={() => {
                    setPage((p) => Math.max(p - 1, 1))
                    window.scrollTo({ top: 400, behavior: 'smooth' })
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang trước
                </button>
                <span className="text-sm font-bold text-slate-600">
                  Trang {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => {
                    setPage((p) => Math.min(p + 1, totalPages))
                    window.scrollTo({ top: 400, behavior: 'smooth' })
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* MODAL XEM CHI TIẾT ĐỀ TÀI */}
      <StudentModal
        open={detailTopic !== null}
        title="Chi tiết đề tài đồ án tốt nghiệp"
        onClose={() => setDetailTopic(null)}
        footer={
          <div className="flex justify-end">
            <StudentButton variant="secondary" onClick={() => setDetailTopic(null)}>
              Đóng
            </StudentButton>
          </div>
        }
      >
        {detailTopic && (
          <div className="space-y-4 py-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mã đề tài</span>
              <div className="mt-1 text-sm font-bold text-slate-800">{detailTopic.code || detailTopic.id}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tên đề tài</span>
              <div className="mt-1 text-base font-bold text-[#1976D2]">{detailTopic.title}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Giảng viên hướng dẫn</span>
                <div className="mt-1 text-sm font-semibold text-slate-800">{detailTopic.module || 'Chưa phân công'}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hướng đề tài</span>
                <div className="mt-1 text-sm font-semibold text-indigo-600">{detailTopic.direction || 'Phát triển phần mềm'}</div>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mô tả chi tiết</span>
              <div className="mt-1 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-60 overflow-y-auto">
                {detailTopic.description || 'Không có mô tả chi tiết cho đề tài này.'}
              </div>
            </div>
            {detailTopic.fileUrl && (
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Tài liệu đính kèm</span>
                <a
                  href={getPreviewUrl(detailTopic.fileUrl) || detailTopic.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-600 border border-blue-100 transition hover:bg-blue-100 shadow-sm"
                >
                  📂 Xem tài liệu mô tả đề tài
                </a>
              </div>
            )}
          </div>
        )}
      </StudentModal>

      <StudentModal
        open={confirmAction !== null}
        title={confirmAction ? CONFIRM_COPY[confirmAction.type].title : ''}
        onClose={() => setConfirmAction(null)}
        closeDisabled={confirming}
        footer={
          <>
            <StudentButton variant="secondary" disabled={confirming} onClick={() => setConfirmAction(null)}>{COMMON_LABELS.CANCEL}</StudentButton>
            <StudentButton variant="danger" disabled={confirming} onClick={runConfirmAction}>
              {confirming ? 'Đang xử lý...' : confirmAction ? CONFIRM_COPY[confirmAction.type].confirmLabel : ''}
            </StudentButton>
          </>
        }
      >
        <div className="text-sm leading-relaxed text-slate-600">
          {confirmAction ? CONFIRM_COPY[confirmAction.type].message : ''}
        </div>
      </StudentModal>
    </>
  )
}
