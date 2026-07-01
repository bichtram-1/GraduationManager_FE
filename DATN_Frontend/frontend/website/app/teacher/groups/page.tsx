"use client"

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, Search, ShieldCheck, Users, XCircle } from 'lucide-react'
import { TeacherBadge, TeacherButton, TeacherCard, TeacherPageHeader, TeacherToolbar } from '../_components/TeacherUI'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { teacherApi } from '@/lib/api/teacherApi'

type Member = {
  name: string
  code: string
  className: string
  la_truong_nhom: number
}

type GroupApproval = {
  id: string
  topicCode: string
  topicName: string
  groupName: string
  leader: string
  members: number
  membersList?: Member[]
  submittedAt: string
  status: ApprovalStatus
  note: string
}

export default function TeacherGroupsPage() {
  const { selectedPeriod } = usePeriod()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ApprovalStatus>('all')
  const [groups, setGroups] = useState<GroupApproval[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    teacherApi.getGroups({ periodId: selectedPeriod?.id })
      .then((items) => {
        if (!mounted) return
        setGroups(items)
        setSelectedGroupId((current) => current ?? items[0]?.id ?? null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [selectedPeriod?.id])

  const filteredGroups = useMemo(() => {
    const search = query.toLowerCase()
    return groups.filter((group) => {
      const statusMatch = statusFilter === 'all' || group.status === statusFilter
      const searchMatch = [
        group.id,
        group.topicCode,
        group.topicName,
        group.groupName,
        group.leader,
        group.status,
        ...(group.membersList?.map(m => m.name) || []),
        ...(group.membersList?.map(m => m.code) || []),
        ...(group.membersList?.map(m => m.className) || [])
      ].some((value) => value?.toLowerCase().includes(search))
      return statusMatch && searchMatch
    })
  }, [groups, query, statusFilter])

  const selectedGroup = filteredGroups.find((group) => group.id === selectedGroupId) ?? filteredGroups[0] ?? null

  const pendingCount = groups.filter((group) => group.status === 'pending').length
  const acceptedCount = groups.filter((group) => group.status === 'accepted').length
  const rejectedCount = groups.filter((group) => group.status === 'rejected').length

  const handleAction = async (groupId: string, action: 'accept' | 'reject') => {
    setSavingId(groupId)
    try {
      const data = await teacherApi.updateGroupStatus(groupId, action)
      if (data?.group) {
        setGroups((current) => current.map((item) => (item.id === data.group?.id ? data.group! : item)))
      }
    } finally {
      setSavingId(null)
    }
  }

  return (
    <>
      <TeacherPageHeader
        title="Duyệt nhóm"
        description="Duyệt các nhóm sinh viên đăng ký vào đề tài của giảng viên."
        actions={<TeacherBadge type="info">{pendingCount} nhóm chờ duyệt</TeacherBadge>}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <TeacherCard className="p-5">
          <div className="inline-flex rounded-2xl bg-gradient-to-br from-[#2196F3] to-[#2563eb] px-3 py-2 text-white shadow-lg shadow-blue-100">
            <Users className="h-4 w-4" />
          </div>
          <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{pendingCount}</div>
          <div className="mt-1 text-sm font-medium text-slate-700">Nhóm chờ duyệt</div>
          <div className="mt-2 text-xs text-slate-500">Sinh viên đã nộp form đăng ký vào đề tài</div>
        </TeacherCard>
        <TeacherCard className="p-5">
          <div className="inline-flex rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-3 py-2 text-white shadow-lg shadow-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{acceptedCount}</div>
          <div className="mt-1 text-sm font-medium text-slate-700">Đã chấp nhận</div>
          <div className="mt-2 text-xs text-slate-500">Nhóm đã được gắn vào đề tài</div>
        </TeacherCard>
        <TeacherCard className="p-5">
          <div className="inline-flex rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 px-3 py-2 text-white shadow-lg shadow-rose-100">
            <XCircle className="h-4 w-4" />
          </div>
          <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{rejectedCount}</div>
          <div className="mt-1 text-sm font-medium text-slate-700">Đã từ chối</div>
          <div className="mt-2 text-xs text-slate-500">Nhóm không phù hợp với đề tài</div>
        </TeacherCard>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        {[
          { key: 'all', label: 'Tất cả', count: groups.length },
          { key: 'pending', label: 'Chờ duyệt', count: pendingCount },
          { key: 'accepted', label: 'Đã chấp nhận', count: acceptedCount },
          { key: 'rejected', label: 'Đã từ chối', count: rejectedCount },
        ].map((tab) => {
          const active = statusFilter === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key as typeof statusFilter)}
              className={`inline-flex items-center gap-2 rounded-[20px] px-4 py-2.5 text-sm font-medium transition ${active ? 'bg-[#2196F3] text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{tab.count}</span>
            </button>
          )
        })}
      </div>

      <TeacherCard>
        <TeacherToolbar placeholder="Tìm mã đề tài, tên đề tài, mssv, thành viên..." value={query} onChange={setQuery}>
          <TeacherBadge type="info">Tất cả đề tài</TeacherBadge>
          <TeacherBadge type="warning">{pendingCount} chờ duyệt</TeacherBadge>
        </TeacherToolbar>

        <div className="grid gap-0 xl:grid-cols-[1.45fr_0.9fr]">
          <div className="overflow-hidden border-b border-slate-200 xl:border-b-0 xl:border-r">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 text-left w-12">STT</th>
                  <th className="px-5 py-3 text-left">Đề tài</th>
                  <th className="px-5 py-3 text-left">MSSV</th>
                  <th className="px-5 py-3 text-left">Thành viên</th>
                  <th className="px-5 py-3 text-left">Lớp</th>
                  <th className="px-5 py-3 text-left">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((group, index) => {
                  const selected = selectedGroupId === group.id
                  return (
                    <tr key={group.id} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${selected ? 'bg-blue-50/60' : ''}`}>
                      <td className="px-5 py-4 font-medium text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-5 py-4 text-slate-900">
                        <div className="font-medium text-[#1976D2]">{group.topicCode}</div>
                        <div className="mt-1 text-xs text-slate-500">{group.topicName}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="flex flex-col gap-1">
                          {group.membersList?.map((member) => (
                            <span key={member.code}>{member.code}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="flex flex-col gap-1">
                          {group.membersList?.map((member) => (
                            <span key={member.code} className={member.la_truong_nhom === 1 ? 'font-medium text-slate-800' : ''}>
                              {member.name} {member.la_truong_nhom === 1 && <span className="text-xs font-semibold text-amber-500">(TN)</span>}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="flex flex-col gap-1">
                          {group.membersList?.map((member) => (
                            <span key={member.code}>{member.className || '—'}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <TeacherBadge type={group.status === 'accepted' ? 'success' : group.status === 'rejected' ? 'danger' : 'warning'}>
                          {group.status === 'accepted' ? 'Đã chấp nhận' : group.status === 'rejected' ? 'Đã từ chối' : 'Chờ duyệt'}
                        </TeacherBadge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <TeacherButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setSelectedGroupId(group.id)}>
                            Xem
                          </TeacherButton>
                          <TeacherButton
                            variant="success"
                            className="px-3 py-1.5 text-xs"
                            disabled={group.status !== 'pending' || savingId === group.id}
                            onClick={() => handleAction(group.id, 'accept')}
                          >
                            Nhận
                          </TeacherButton>
                          <TeacherButton
                            variant="danger"
                            className="px-3 py-1.5 text-xs"
                            disabled={group.status !== 'pending' || savingId === group.id}
                            onClick={() => handleAction(group.id, 'reject')}
                          >
                            Từ chối
                          </TeacherButton>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5">
            <div className="text-sm font-semibold text-slate-900">Chi tiết nhóm</div>

            {selectedGroup ? (
              <>
                <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200">
                  <div className="text-xs text-slate-500">Mã nhóm đăng ký</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{selectedGroup.groupName}</div>
                  
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Gửi lúc {selectedGroup.submittedAt}</div>
                    <div className="flex items-center gap-2"><Search className="h-4 w-4 text-[#1976D2]" /> {selectedGroup.topicCode} · {selectedGroup.topicName}</div>
                  </div>

                  <div className="mt-4 space-y-2 border-t pt-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Danh sách thành viên:</div>
                    {selectedGroup.membersList?.map((m) => (
                      <div key={m.code} className="text-sm bg-slate-50/75 p-2.5 rounded-xl border border-slate-100">
                        <div className="font-medium text-slate-800">
                          {m.name} {m.la_truong_nhom === 1 && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-semibold ml-1">Trưởng nhóm</span>}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">MSSV: {m.code} · Lớp: {m.className || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200">
                  <div className="text-xs text-slate-500">Ghi chú</div>
                  <div className="mt-1 text-sm leading-6 text-slate-700">{selectedGroup.note || 'Không có ghi chú.'}</div>
                </div>

                <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-900">Hành động nhanh</div>
                      <div className="text-xs text-slate-500">Nhận hoặc từ chối nhóm chờ duyệt</div>
                    </div>
                    <TeacherBadge type={selectedGroup.status === 'accepted' ? 'success' : selectedGroup.status === 'rejected' ? 'danger' : 'warning'}>
                      {selectedGroup.status === 'accepted' ? 'Đã duyệt' : selectedGroup.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                    </TeacherBadge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <TeacherButton
                      variant="success"
                      disabled={selectedGroup.status !== 'pending' || savingId === selectedGroup.id}
                      onClick={() => handleAction(selectedGroup.id, 'accept')}
                    >
                      Chấp nhận nhóm
                    </TeacherButton>
                    <TeacherButton
                      variant="danger"
                      disabled={selectedGroup.status !== 'pending' || savingId === selectedGroup.id}
                      onClick={() => handleAction(selectedGroup.id, 'reject')}
                    >
                      Từ chối nhóm
                    </TeacherButton>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-[24px] bg-white/90 p-4 text-sm text-slate-500 ring-1 ring-slate-200">Không có nhóm phù hợp với bộ lọc hiện tại.</div>
            )}
          </div>
        </div>
      </TeacherCard>
    </>
  )
}