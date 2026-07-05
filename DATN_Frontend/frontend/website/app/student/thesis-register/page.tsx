"use client"

import { usePeriod } from '@/lib/providers/PeriodProvider'
import { topicApi } from '@/lib/api/topicApi'
import { studentApi, IThesisRegistration } from '@/lib/api/studentApi'
import Link from 'next/link'
import { CalendarDays, CheckCircle2, Clock3, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { StudentPill, StudentSectionHeader } from '../_components/StudentShell'
import { StudentButton, StudentModal } from '../_components/StudentUI'
import { COMMON_LABELS } from '@/constants/commonLabels'

type Topic = { id: string; code?: string; title: string; module: string; published: boolean; slots?: string }

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
  const { selectedPeriod } = usePeriod()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    async function load() {
      try {
        const [topicsData, regData] = await Promise.all([
          topicApi.getTopics({ periodId: selectedPeriod?.id }),
          studentApi.getMyThesisRegistration()
        ])
        if (!mounted) return
        setTopics(topicsData)
        setRegistration(regData)
      } catch (_err) {
        if (!mounted) return
        setTopics([])
        setRegistration(null)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    load()

    const handleSync = () => {
      load()
    }
    window.addEventListener('realtime-topic-updated', handleSync)
    window.addEventListener('realtime-group-updated', handleSync)

    return () => {
      mounted = false
      window.removeEventListener('realtime-topic-updated', handleSync)
      window.removeEventListener('realtime-group-updated', handleSync)
    }
  }, [selectedPeriod?.id])

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
      const topicsData = await topicApi.getTopics({ periodId: selectedPeriod?.id })
      setTopics(topicsData)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra khi đăng ký đề tài.')
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
      const topicsData = await topicApi.getTopics({ periodId: selectedPeriod?.id })
      setTopics(topicsData)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra khi giải tán nhóm.')
    } finally {
      setLoading(false)
    }
  }

  const doCancelTopic = async () => {
    try {
      setLoading(true)
      await studentApi.cancelThesisRegistration()
      const [topicsData, regData] = await Promise.all([
        topicApi.getTopics({ periodId: selectedPeriod?.id }),
        studentApi.getMyThesisRegistration()
      ])
      setTopics(topicsData)
      setRegistration(regData)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra khi hủy đăng ký đề tài.')
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
          {registration && registration.status !== 'accepted' && (
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

      <section className="rounded-[12px] p-1">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Đang tải danh sách đề tài…</div>
        ) : topics.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">Không có đề tài nào.</div>
        ) : (
          <div className="max-h-180 overflow-y-auto pr-1">
          <div className="grid gap-4 md:grid-cols-2">
            {topics.map((t) => {
              const teacher = t.module ? `GV: ${t.module}` : 'GV: Chưa phân công'
              const slotsStr = t.slots || '0/4'
              const [used, maxSlots] = slotsStr.split('/').map(Number)
              const hasSlot = used < maxSlots && t.published
              const isCurrentTopic = registration?.topicId === t.id
              return (
                <div key={t.id} className="rounded-[18px] border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <a className="text-[#2196F3] font-medium text-sm">{t.code || t.id}</a>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">{t.title}</h3>
                      <div className="mt-2 text-xs text-slate-500">{teacher} • Số lượng: {used}/{maxSlots} sinh viên</div>
                      {isCurrentTopic && registration && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <StudentPill tone={registrationTone}>{registration.status === 'accepted' ? 'Nhóm đã duyệt' : registration.status === 'rejected' ? 'Nhóm bị từ chối' : 'Nhóm đang chờ duyệt'}</StudentPill>
                          <span className="text-xs text-slate-500">{registration.groupName}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className={`rounded-full px-3 py-1 text-xs font-medium ${hasSlot ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {hasSlot ? 'Còn nhận' : 'Đủ số lượng'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <button className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Xem chi tiết</button>
                    {!isCurrentTopic ? (
                      <button 
                        disabled={!!registration && registration.status === 'accepted'}
                        onClick={() => handleRegister(t.id)} 
                        className={`flex-1 rounded-2xl px-4 py-2 text-sm font-medium shadow-sm transition ${!!registration && registration.status === 'accepted' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#2196F3] text-white hover:bg-[#1976D2]'}`}
                      >
                        Đăng ký
                      </button>
                    ) : (
                      <button
                        disabled={registration?.status === 'accepted'}
                        onClick={() => setConfirmAction({ type: 'cancelTopic' })}
                        className={`flex-1 rounded-2xl border px-4 py-2 text-sm font-medium transition ${registration?.status === 'accepted' ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
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
          </div>
        )}
      </section>

      <section className="mt-6 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Cần tạo nhóm trước khi đăng ký?</div>
            <div className="mt-1 text-sm text-slate-600">Nếu đề tài yêu cầu mời thêm thành viên, hãy chuyển sang bước tạo nhóm để đồng bộ trạng thái duyệt.</div>
          </div>
          <Link href={`/student/thesis-invite?topic=${registration?.topicId ?? 'DT001'}`} className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]">
            <Users className="h-4 w-4" />
            Tạo nhóm ĐATN
          </Link>
        </div>
      </section>

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
