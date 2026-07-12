"use client"

import { useMemo, useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle2, Clock3, Mail, Plus, XCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StudentPill, StudentSectionHeader } from '../_components/StudentShell'
import { StudentButton, StudentModal } from '../_components/StudentUI'
import { studentApi, IThesisRegistration } from '@/lib/api/studentApi'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { COMMON_LABELS } from '@/constants/commonLabels'
import { App, Spin } from 'antd'

type Invite = {
  id: string
  inviteId?: string
  status: 'pending' | 'accepted' | 'rejected'
  from?: string
  topic?: string
}

const INVITE_STATUS_META: Record<Invite['status'], { label: string; tone: 'green' | 'red' | 'orange' }> = {
  accepted: { label: 'Đã chấp nhận', tone: 'green' },
  rejected: { label: 'Đã từ chối', tone: 'red' },
  pending: { label: 'Chờ phản hồi', tone: 'orange' },
}

export default function InvitePage() {
  const router = useRouter()
  const params = useSearchParams()
  const { message } = App.useApp()
  const { selectedPeriod } = usePeriod()
  const isPeriodLocked = selectedPeriod?.status === 'grading' || selectedPeriod?.status === 'closed'

  const [newId, setNewId] = useState('')
  const [outgoingInvites, setOutgoingInvites] = useState<Invite[]>([])
  const [incomingInvites, setIncomingInvites] = useState<Invite[]>([])
  const [registration, setRegistration] = useState<IThesisRegistration | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelInviteId, setCancelInviteId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const outgoingCount = outgoingInvites.length
  const incomingCount = incomingInvites.length
  const pendingOutgoing = useMemo(() => outgoingInvites.filter((item) => item.status === 'pending').length, [outgoingInvites])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    async function load() {
      try {
        const [outgoingData, incomingData, regData] = await Promise.all([
          studentApi.getOutgoingInvitations(selectedPeriod?.id),
          studentApi.getIncomingInvitations(selectedPeriod?.id),
          studentApi.getMyThesisRegistration(selectedPeriod?.id)
        ])
        if (!mounted) return
        setOutgoingInvites(outgoingData)
        setIncomingInvites(incomingData)
        setRegistration(regData)
      } catch (_err) {
        if (!mounted) return
        setOutgoingInvites([])
        setIncomingInvites([])
        setRegistration(null)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [selectedPeriod?.id])

  const addInvite = async () => {
    const id = newId.trim()
    if (!id) {
      message.error('Vui lòng nhập mã số sinh viên!')
      return
    }
    if (!/^[a-zA-Z0-9]{5,15}$/.test(id)) {
      message.error('Mã số sinh viên không hợp lệ (chỉ chứa chữ và số, độ dài từ 5-15 ký tự)!')
      return
    }
    if (outgoingInvites.some((item) => item.id === id && item.status === 'pending')) {
      message.warning('Sinh viên này đã được mời, đang chờ phản hồi!')
      setNewId('')
      return
    }
    try {
      setLoading(true)
      const topicIdToSend = registration?.topicId || null
      const res = await studentApi.sendInvitation(id, topicIdToSend)
      setOutgoingInvites((current) => [...current.filter((item) => item.id !== id), res])
      setNewId('')
      message.success('Gửi lời mời thành công!')
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra khi gửi lời mời.')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (inviteId: string) => {
    try {
      setLoading(true)
      await studentApi.acceptInvitation(inviteId)
      setIncomingInvites((current) =>
        current.map((invite) => (invite.id === inviteId ? { ...invite, status: 'accepted' } : invite))
      )
      message.success('Đồng ý lời mời thành công!')
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra khi đồng ý lời mời.')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (inviteId: string) => {
    try {
      setLoading(true)
      await studentApi.rejectInvitation(inviteId)
      setIncomingInvites((current) =>
        current.map((invite) => (invite.id === inviteId ? { ...invite, status: 'rejected' } : invite))
      )
      message.success('Từ chối lời mời thành công!')
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra khi từ chối lời mời.')
    } finally {
      setLoading(false)
    }
  }

  const confirmCancelInvite = async () => {
    if (!cancelInviteId) return
    setCancelling(true)
    try {
      await studentApi.cancelInvitation(cancelInviteId)
      setOutgoingInvites((current) => current.filter((item) => item.inviteId !== cancelInviteId))
      setCancelInviteId(null)
      message.success('Hủy lời mời thành công!')
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra khi hủy lời mời.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <div className="text-sm text-slate-500">Đang tải thông tin nhóm đồ án tốt nghiệp...</div>
      </div>
    )
  }

  return (
    <>
      <StudentSectionHeader
        title="Tạo nhóm ĐATN"
        description={
          registration?.topicTitle
            ? `Quản lý lời mời thành viên cho đề tài "${registration.topicTitle}" theo đợt đăng ký đang chọn.`
            : `Quản lý lời mời thành viên tạo nhóm đồ án tốt nghiệp.`
        }
      />

      {isPeriodLocked && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {selectedPeriod?.status === 'closed'
            ? 'Đợt đồ án tốt nghiệp này đã đóng, bạn không thể gửi/hủy lời mời hoặc phản hồi lời mời nữa.'
            : 'Đợt đồ án tốt nghiệp đã bắt đầu chấm điểm, bạn không thể gửi/hủy lời mời hoặc phản hồi lời mời nữa.'}
        </div>
      )}

      <div className="mb-6 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#1976D2] shadow-sm ring-1 ring-blue-100">
              <Mail className="h-3.5 w-3.5" />
              Tạo nhóm và nhận lời mời theo đợt
            </div>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              Màn này chỉ dành cho gửi lời mời thành viên và xử lý lời mời nhận được. Đợt đăng ký giúp sinh viên biết nhóm đang thuộc kỳ nào và khi nào cần hoàn tất hồ sơ.
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Lời mời gửi đi</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{outgoingCount}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Lời mời chờ</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{pendingOutgoing}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Lời mời nhận được</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{incomingCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Mời thành viên</div>
              <div className="text-xs text-slate-500">Gửi lời mời theo danh sách MSSV cho {selectedPeriod?.name || 'đợt đăng ký'}</div>
            </div>
            <StudentPill tone="blue">Chủ nhóm</StudentPill>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-slate-600">
                <ArrowLeft className="h-4 w-4" /> Quay lại
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs text-slate-500">Đợt đang chọn</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedPeriod?.name || 'Chưa chọn đợt'}</div>
                {selectedPeriod?.regDeadline && (
                  <div className="mt-1 text-xs text-slate-500">Hạn đăng ký: {selectedPeriod.regDeadline}</div>
                )}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs text-slate-500">Quy trình</div>
                <div className="mt-2 text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[#1976D2]" />
                  Chờ sinh viên hoàn tất mời
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                value={newId}
                onChange={(event) => setNewId(event.target.value)}
                placeholder="Nhập MSSV thành viên, ví dụ 20520005"
                disabled={isPeriodLocked}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                onClick={addInvite}
                disabled={isPeriodLocked}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2 text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Plus className="h-4 w-4" />
                Thêm
              </button>
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
              {outgoingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <div className="inline-flex items-center gap-3">
                    <Mail className="text-slate-400" />
                    MSSV {invite.id}
                  </div>
                  <div className="flex items-center gap-2">
                    <StudentPill tone={INVITE_STATUS_META[invite.status].tone}>
                      {INVITE_STATUS_META[invite.status].label}
                    </StudentPill>
                    {invite.status === 'pending' && invite.inviteId && !isPeriodLocked && (
                      <button
                        type="button"
                        onClick={() => setCancelInviteId(invite.inviteId!)}
                        className="rounded-lg p-1 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                        title="Hủy lời mời"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-[#eff6ff] p-4 text-sm text-slate-700 ring-1 ring-blue-100">
              Đợt đăng ký hiện tại được đồng bộ với đợt hoạt động được chọn ở thanh điều hướng phía trên.
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Lời mời nhận được</div>
              <div className="text-xs text-slate-500">Chấp nhận hoặc từ chối nếu được nhóm khác mời</div>
            </div>
            <StudentPill tone="blue">Inbox</StudentPill>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto p-5">
            {incomingInvites.map((invite) => (
              <div key={invite.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{invite.from} mời bạn vào nhóm</div>
                    <div className="mt-1 text-xs text-slate-500">Đề tài: {invite.topic}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReject(invite.id)}
                      disabled={invite.status !== 'pending' || isPeriodLocked}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAccept(invite.id)}
                      disabled={invite.status !== 'pending' || isPeriodLocked}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Đồng ý
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Trạng thái: <span className="font-medium text-slate-700">{INVITE_STATUS_META[invite.status].label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <StudentModal
        open={cancelInviteId !== null}
        title="Xác nhận hủy lời mời"
        onClose={() => setCancelInviteId(null)}
        footer={
          <>
            <StudentButton variant="secondary" disabled={cancelling} onClick={() => setCancelInviteId(null)}>{COMMON_LABELS.CLOSE}</StudentButton>
            <StudentButton variant="danger" disabled={cancelling} onClick={confirmCancelInvite}>
              {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
            </StudentButton>
          </>
        }
      >
        <div className="text-sm leading-relaxed text-slate-600">
          Bạn có chắc chắn muốn hủy lời mời này không? Hành động này không thể hoàn tác.
        </div>
      </StudentModal>
    </>
  )
}
