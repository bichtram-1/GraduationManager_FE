"use client"

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, Search, ShieldCheck, Users, XCircle } from 'lucide-react'
import { TeacherBadge, TeacherButton, TeacherCard, TeacherPageHeader, TeacherToolbar, TeacherModal } from '../_components/TeacherUI'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { teacherApi } from '@/lib/api/teacherApi'

type ApprovalStatus = 'pending' | 'accepted' | 'rejected'

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
  const [searchTopic, setSearchTopic] = useState('')
  const [searchMssv, setSearchMssv] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ApprovalStatus>('all')
  const [groups, setGroups] = useState<GroupApproval[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    const fetchGroups = () => {
      teacherApi.getGroups({ periodId: selectedPeriod?.id })
        .then((items) => {
          if (!mounted) return
          setGroups(items)
        })
        .finally(() => {
          if (mounted) setLoading(false)
        })
    }

    fetchGroups()

    const handleSync = () => {
      fetchGroups()
    }
    window.addEventListener('realtime-group-updated', handleSync)

    return () => {
      mounted = false
      window.removeEventListener('realtime-group-updated', handleSync)
    }
  }, [selectedPeriod?.id])

  const filteredGroups = useMemo(() => {
    const topicQuery = searchTopic.toLowerCase()
    const mssvQuery = searchMssv.toLowerCase()
    
    return groups.filter((group) => {
      const statusMatch = statusFilter === 'all' || group.status === statusFilter
      const topicMatch = !topicQuery || group.topicName.toLowerCase().includes(topicQuery)
      const mssvMatch = !mssvQuery || (group.membersList?.some(m => m.code.toLowerCase().includes(mssvQuery)) ?? false)
      
      return statusMatch && topicMatch && mssvMatch
    })
  }, [groups, searchTopic, searchMssv, statusFilter])

  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? null

  const pendingCount = groups.filter((group) => group.status === 'pending').length
  const acceptedCount = groups.filter((group) => group.status === 'accepted').length
  const rejectedCount = groups.filter((group) => group.status === 'rejected').length

  const handleAction = async (groupId: string, action: 'accept' | 'reject') => {
    setSavingId(groupId)
    try {
      const data = await teacherApi.updateGroupStatus(groupId, action)
      if (data?.group) {
        setGroups((current) => current.map((item) => (item.id === data.group?.id ? { ...item, ...data.group } : item)))
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
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-xs">
            <input
              placeholder="Tìm theo tên đề tài..."
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]/30"
            />
          </div>
          <div className="relative w-full max-w-xs">
            <input
              placeholder="Tìm theo MSSV..."
              value={searchMssv}
              onChange={(e) => setSearchMssv(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]/30"
            />
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <TeacherBadge type="info">Tất cả đề tài</TeacherBadge>
            <TeacherBadge type="warning">{pendingCount} chờ duyệt</TeacherBadge>
          </div>
        </div>

        <div className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 text-left w-12 font-semibold">STT</th>
                <th className="px-5 py-3 text-left font-semibold">Đề tài</th>
                <th className="px-5 py-3 text-left font-semibold">MSSV</th>
                <th className="px-5 py-3 text-left font-semibold">Thành viên</th>
                <th className="px-5 py-3 text-left font-semibold">Lớp</th>
                <th className="px-5 py-3 text-left font-semibold">Trạng thái</th>
                <th className="px-5 py-3 text-right font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group, index) => {
                const selected = selectedGroupId === group.id
                return (
                  <tr key={group.id} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${selected ? 'bg-blue-50/60' : ''}`}>
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {index + 1}
                    </td>
                    <td className="px-5 py-4 text-slate-900 max-w-md">
                      <div className="font-semibold text-slate-800 leading-relaxed">{group.topicName}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      <div className="flex flex-col gap-1">
                        {group.membersList?.map((member) => (
                          <span key={member.code}>{member.code}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-800 font-medium">
                      <div className="flex flex-col gap-1">
                        {group.membersList?.map((member) => (
                          <span key={member.code}>
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
                        <TeacherButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => {
                          setSelectedGroupId(group.id)
                          setModalOpen(true)
                        }}>
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
      </TeacherCard>

      <TeacherModal
        open={modalOpen}
        title="Chi tiết đăng ký nhóm"
        onClose={() => setModalOpen(false)}
        footer={
          <TeacherButton variant="secondary" onClick={() => setModalOpen(false)}>
            Đóng
          </TeacherButton>
        }
      >
        {selectedGroup ? (
          <div className="space-y-4">
            <div className="rounded-[24px] bg-slate-50 p-5 border border-slate-200">
              <div className="mb-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Đề tài đăng ký:</div>
                <div className="text-lg font-bold text-slate-900 leading-snug">{selectedGroup.topicName}</div>
              </div>

              <div className="space-y-3 text-sm text-slate-600 border-t pt-3">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[#1976D2]" />
                  <span><strong>Thời gian gửi:</strong> {selectedGroup.submittedAt}</span>
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t pt-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Danh sách thành viên:</div>
                {selectedGroup.membersList?.map((m) => (
                  <div key={m.code} className="text-sm bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">
                        {m.name} {m.la_truong_nhom === 1 && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-semibold ml-1">Trưởng nhóm</span>}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">MSSV: {m.code}</div>
                    </div>
                    <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                      Lớp: {m.className || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] bg-slate-50 p-5 border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Ghi chú</div>
              <div className="text-sm leading-6 text-slate-700">{selectedGroup.note || 'Không có ghi chú.'}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Không tìm thấy thông tin nhóm.</div>
        )}
      </TeacherModal>
    </>
  )
}