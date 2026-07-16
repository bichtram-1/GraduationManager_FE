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
import { App } from 'antd'

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

  // Pagination and search/filter states
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [direction, setDirection] = useState('all')
  const [directionOptions, setDirectionOptions] = useState<ITopicDirection[]>([])
  const [teacher, setTeacher] = useState('all')
  const [teacherOptions, setTeacherOptions] = useState<string[]>([])
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
          keyword: keyword.trim() || undefined
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
  }, [selectedPeriod?.id, page, direction, teacher, keyword])

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
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold">
          ⚠️ Cổng đăng ký đề tài ĐATN đã đóng do hết hạn (Hạn chót: {selectedPeriod?.regDeadline}). Bạn không thể đăng ký/hủy đề tài hoặc rời nhóm nữa.
        </div>
      )}

      {!isPeriodLocked && !isRegistrationTime.isClosed && showDeadlineWarning && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span>Chú ý: Sắp đến hạn đăng ký đề tài đồ án tốt nghiệp! Hạn chót: {selectedPeriod?.regDeadline}. Vui lòng hoàn tất đăng ký sớm!</span>
        </div>
      )}

      {isPeriodLocked && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
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
            {registration ? registration.groupName : 'Chưa có nhóm/đề tài được gửi'}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            {registration ? registration.topicTitle : 'Sau khi đăng ký, trạng thái duyệt của giảng viên sẽ xuất hiện tại đây.'}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StudentPill tone={registrationTone}>{registration ? (registration.status === 'accepted' ? 'Đã duyệt' : registration.status === 'rejected' ? 'Đã từ chối' : 'Chờ giảng viên duyệt') : 'Chưa đăng ký'}</StudentPill>
            {registration && <StudentPill tone="blue">{registration.batch}</StudentPill>}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Đã gửi lúc</div>
              <div className="mt-2 text-sm font-medium text-slate-900 inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#1976D2]" />
                {registration ? registration.submittedAt : 'Chưa có dữ liệu'}
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
          {registration && registration.status !== 'accepted' && !isActionDisabled && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setConfirmAction({ type: 'leaveGroup' })}
                className="rounded-2xl border border-red-200 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
              >
                Giải tán / Rời nhóm
              </button>
            </div>
          )}
        </div>

        <div className="rounded-[22px] bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Cách đọc trạng thái</div>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-white p-4">
              <div className="font-medium text-slate-900">Chờ giảng viên duyệt</div>
              <div className="mt-1">Nhóm đã gửi đề tài nhưng chưa có kết luận chính thức.</div>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <div className="font-medium text-slate-900">Đã duyệt</div>
              <div className="mt-1">Sinh viên biết ngay đề tài đã được giảng viên chấp thuận.</div>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <div className="font-medium text-slate-900">Đã từ chối</div>
              <div className="mt-1">Cần đổi đề tài hoặc cập nhật nhóm trước khi gửi lại.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CỐ ĐỊNH BANNER TẠO NHÓM Ở ĐÂY CHO DỄ XEM */}
      <section className="mb-6 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Cần tạo nhóm trước khi đăng ký?</div>
            <div className="mt-1 text-sm text-slate-600">Nếu đề tài yêu cầu mời thêm thành viên, hãy chuyển sang bước tạo nhóm để đồng bộ trạng thái duyệt.</div>
          </div>
          {isActionDisabled ? (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed"
            >
              <Users className="h-4 w-4" />
              Tạo nhóm ĐATN
            </button>
          ) : (
            <Link href={`/student/thesis-invite?topic=${registration?.topicId ?? 'DT001'}`} className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]">
              <Users className="h-4 w-4" />
              Tạo nhóm ĐATN
            </Link>
          )}
        </div>
      </section>

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
                const hasSlot = used < maxSlots && t.published
                const isCurrentTopic = registration?.topicId === t.id
                return (
                  <div key={t.id} className="rounded-[18px] border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <a className="text-[#2196F3] font-medium text-sm">{t.code || t.id}</a>
                          <h3 className="mt-2 text-lg font-semibold text-slate-900 line-clamp-2" title={t.title}>{t.title}</h3>
                          <div className="mt-2 text-xs text-slate-500">{teacher} • Số lượng: {used}/{maxSlots} sinh viên</div>
                          <div className="mt-1 text-xs text-blue-600 font-semibold">Hướng đề tài: {t.direction || 'Phát triển phần mềm'}</div>
                          {isCurrentTopic && registration && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <StudentPill tone={registrationTone}>{registration.status === 'accepted' ? 'Nhóm đã duyệt' : registration.status === 'rejected' ? 'Nhóm bị từ chối' : 'Nhóm đang chờ duyệt'}</StudentPill>
                              <span className="text-xs text-slate-500">{registration.groupName}</span>
                            </div>
                          )}
                        </div>
                        <div className="shrink-0">
                          <div className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${hasSlot ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {hasSlot ? 'Còn nhận' : 'Đủ số lượng'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <button
                        onClick={() => setDetailTopic(t)}
                        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        Xem chi tiết
                      </button>
                      {!isCurrentTopic ? (
                        <button
                          disabled={(!!registration && registration.status === 'accepted') || isActionDisabled}
                          onClick={() => handleRegister(t.id)}
                          className={`flex-1 rounded-2xl px-4 py-2 text-sm font-medium shadow-sm transition ${(!!registration && registration.status === 'accepted') || isActionDisabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#2196F3] text-white hover:bg-[#1976D2]'}`}
                        >
                          Đăng ký
                        </button>
                      ) : (
                        <button
                          disabled={registration?.status === 'accepted' || isActionDisabled}
                          onClick={() => setConfirmAction({ type: 'cancelTopic' })}
                          className={`flex-1 rounded-2xl border px-4 py-2 text-sm font-medium transition ${registration?.status === 'accepted' || isActionDisabled ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                          {registration?.status === 'accepted' ? 'Đã khóa đề tài' : 'Hủy đăng ký'}
                        </button>
                      )}
                    </div>
                    {isCurrentTopic && registration && (
                      <div className="mt-4 rounded-2xl bg-[#eff6ff] px-4 py-3 text-xs leading-6 text-slate-600 ring-1 ring-blue-100">
                        Hồ sơ nhóm của bạn đang ở trạng thái <span className="font-semibold text-slate-900">{registration.status === 'accepted' ? 'đã duyệt' : registration.status === 'rejected' ? 'đã từ chối' : 'chờ duyệt'}</span>. Khi giảng viên cập nhật, badge ở đây sẽ đổi ngay.
                      </div>
                    )}
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
                  href={detailTopic.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-600 border border-blue-100 transition hover:bg-blue-100 shadow-sm"
                >
                  📂 Tải xuống tài liệu mô tả đề tài
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
