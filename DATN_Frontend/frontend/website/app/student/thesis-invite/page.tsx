"use client"

import { useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Mail, Plus, XCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StudentPill, StudentSectionHeader } from '../_components/StudentShell'

type Invite = {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  from?: string
  topic?: string
}

const outgoingMock: Invite[] = [
  { id: '20520002', status: 'pending' },
  { id: '20520003', status: 'accepted' },
  { id: '20520004', status: 'rejected' },
]

const incomingMock = [
  { id: '20520007', from: 'Nguyễn Văn B', topic: 'DT001', status: 'pending' as const },
  { id: '20520009', from: 'Lê Thị C', topic: 'DT004', status: 'pending' as const },
]

const batches = [
  { id: '2026-1', label: 'Đợt HK2/2025-2026', note: 'Chốt danh sách trước 12/06', status: 'Đang mở' },
  { id: '2026-2', label: 'Đợt hè 2026', note: 'Mở lại sau khi kết thúc đợt hiện tại', status: 'Sắp mở' },
]

export default function InvitePage() {
  const router = useRouter()
  const params = useSearchParams()
  const topic = params?.get('topic') ?? 'DT001'

  const [selectedBatch, setSelectedBatch] = useState(batches[0].id)
  const [newId, setNewId] = useState('')
  const [outgoingInvites, setOutgoingInvites] = useState<Invite[]>(outgoingMock)
  const [incomingInvites, setIncomingInvites] = useState<Invite[]>(incomingMock)

  const currentBatch = batches.find((batch) => batch.id === selectedBatch) ?? batches[0]
  const outgoingCount = outgoingInvites.length
  const incomingCount = incomingInvites.length
  const pendingOutgoing = useMemo(() => outgoingInvites.filter((item) => item.status === 'pending').length, [outgoingInvites])

  const addInvite = () => {
    const id = newId.trim()
    if (!id) return
    if (outgoingInvites.some((item) => item.id === id)) {
      setNewId('')
      return
    }
    setOutgoingInvites((current) => [...current, { id, status: 'pending' }])
    setNewId('')
  }

  const handleAccept = (inviteId: string) => {
    setIncomingInvites((current) => current.map((invite) => (invite.id === inviteId ? { ...invite, status: 'accepted' } : invite)))
  }

  const handleReject = (inviteId: string) => {
    setIncomingInvites((current) => current.map((invite) => (invite.id === inviteId ? { ...invite, status: 'rejected' } : invite)))
  }

  return (
    <>
      <StudentSectionHeader
        title="Tạo nhóm ĐATN"
        description={`Quản lý lời mời thành viên cho đề tài ${topic} theo từng đợt đăng ký. Sinh viên có thể chọn đợt đang mở trước khi mời thêm thành viên.`}
      />

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
              <div className="text-xs text-slate-500">Gửi lời mời theo danh sách MSSV cho {currentBatch.label}</div>
            </div>
            <StudentPill tone="blue">Chủ nhóm</StudentPill>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-slate-600">
                <ArrowLeft className="h-4 w-4" /> Quay lại
              </button>
            </div>

            <div className="grid gap-3 rounded-[22px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#1976D2]">
                  <CalendarDays className="h-4 w-4" />
                  Chọn đợt đăng ký
                </div>
                <div className="mt-1 text-sm text-slate-600">Đổi đợt trực tiếp tại đây, không cần sang màn khác.</div>
              </div>
              <select
                value={selectedBatch}
                onChange={(event) => setSelectedBatch(event.target.value)}
                className="min-w-[220px] rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400"
              >
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs text-slate-500">Đợt đang chọn</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{currentBatch.label}</div>
                <div className="mt-1 text-xs text-slate-500">{currentBatch.note}</div>
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
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
              <button onClick={addInvite} className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2 text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]">
                <Plus className="h-4 w-4" />
                Thêm
              </button>
            </div>

            <div className="space-y-2">
              {outgoingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <div className="inline-flex items-center gap-3">
                    <Mail className="text-slate-400" />
                    MSSV {invite.id}
                  </div>
                  <StudentPill tone={invite.status === 'accepted' ? 'green' : invite.status === 'rejected' ? 'red' : 'orange'}>
                    {invite.status === 'accepted' ? 'Đã chấp nhận' : invite.status === 'rejected' ? 'Đã từ chối' : 'Chờ phản hồi'}
                  </StudentPill>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-[#eff6ff] p-4 text-sm text-slate-700 ring-1 ring-blue-100">
              Khi chuyển sang đợt khác, nhóm vẫn giữ danh sách lời mời hiện tại nhưng mốc thời gian và trạng thái sẽ bám theo đợt đã chọn.
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

          <div className="space-y-3 p-5">
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
                      disabled={invite.status !== 'pending'}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAccept(invite.id)}
                      disabled={invite.status !== 'pending'}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Đồng ý
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Trạng thái: <span className="font-medium text-slate-700">{invite.status === 'pending' ? 'Chờ phản hồi' : invite.status === 'accepted' ? 'Đã chấp nhận' : 'Đã từ chối'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className="text-sm font-semibold text-slate-900">Ghi chú thiết kế</div>
        <div className="mt-2 text-sm leading-6 text-slate-600">
          Với nhiều đợt đăng ký, dropdown ở khu vực mời thành viên là đủ rõ. Cách này giảm nhiễu giao diện và giúp sinh viên chọn đúng đợt ngay khi thao tác mời nhóm.
        </div>
      </section>
    </>
  )
}
