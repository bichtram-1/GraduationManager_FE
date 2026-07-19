"use client"

import { useEffect, useMemo, useState } from 'react'
import { Clock3 } from 'lucide-react'
import { TeacherBadge, TeacherButton, TeacherCard, TeacherPageHeader, TeacherModal, TeacherPagination } from '../_components/TeacherUI'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { teacherApi } from '@/lib/api/teacherApi'

type ApprovalStatus = 'pending' | 'accepted' | 'rejected'

const APPROVAL_STATUS_META: Record<ApprovalStatus, { badge: 'success' | 'danger' | 'warning'; label: string }> = {
  accepted: { badge: 'success', label: 'Đã chấp nhận' },
  rejected: { badge: 'danger', label: 'Đã từ chối' },
  pending: { badge: 'warning', label: 'Chờ duyệt' },
}

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
  const isPeriodClosed = selectedPeriod?.status === 'closed'
  const [searchTopic, setSearchTopic] = useState('')
  const [searchMssv, setSearchMssv] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ApprovalStatus>('all')
  const [groups, setGroups] = useState<GroupApproval[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTopic, searchMssv, statusFilter, selectedPeriod?.id])

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

  const itemsPerPage = 10
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredGroups.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredGroups, currentPage])

  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? null

  const pendingCount = groups.filter((group) => group.status === 'pending').length
  const acceptedCount = groups.filter((group) => group.status === 'accepted').length
  const rejectedCount = groups.filter((group) => group.status === 'rejected').length

  const handleAction = async (groupId: string, action: 'accept' | 'reject') => {
    if (isPeriodClosed) return
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

      {isPeriodClosed && (
        <div className="sticky top-20 z-30 mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm">
          ⚠️ Đợt &quot;{selectedPeriod?.name}&quot; đã đóng — bạn chỉ có thể xem, không thể duyệt nhóm.
        </div>
      )}

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
          <div className="relative w-full max-w-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]/30 cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_16px_center] bg-no-repeat"
            >
              <option value="all">Tất cả ({groups.length})</option>
              <option value="pending">Chờ duyệt ({pendingCount})</option>
              <option value="accepted">Đã chấp nhận ({acceptedCount})</option>
              <option value="rejected">Đã từ chối ({rejectedCount})</option>
            </select>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <TeacherBadge type="info">Tất cả đề tài</TeacherBadge>
            <TeacherBadge type="warning">{pendingCount} chờ duyệt</TeacherBadge>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10 shadow-[0_1px_0_rgba(226,232,240,1)]">
              <tr>
                <th className="px-5 py-3 text-center w-12 font-semibold">STT</th>
                <th className="px-5 py-3 text-left font-semibold">Đề tài</th>
                <th className="px-5 py-3 text-left font-semibold">MSSV</th>
                <th className="px-5 py-3 text-left font-semibold">SVTH</th>
                <th className="px-5 py-3 text-left font-semibold">Lớp</th>
                <th className="px-5 py-3 text-center font-semibold">Trạng thái</th>
                <th className="px-5 py-3 text-center font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400 italic bg-white">
                    Danh sách trống
                  </td>
                </tr>
              ) : (
                paginatedGroups.map((group, index) => {
                  const selected = selectedGroupId === group.id
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1
                  return (
                    <tr key={group.id} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${selected ? 'bg-blue-50/60' : ''}`}>
                      <td className="px-5 py-4 text-center font-semibold text-slate-600">
                        {globalIndex}
                      </td>
                      <td className="px-5 py-4 text-slate-900 max-w-md">
                        <div className="font-semibold text-slate-800 leading-relaxed text-left">{group.topicName}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium text-left">
                        <div className="flex flex-col gap-1 items-start text-left">
                          {group.membersList?.map((member) => (
                            <span key={member.code} className="whitespace-nowrap">{member.code}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-800 font-medium text-left">
                        <div className="flex flex-col items-start gap-1 text-left">
                          {group.membersList?.map((member) => {
                            const isLeader = member.la_truong_nhom === 1
                            return (
                              <span
                                key={member.code}
                                className={`whitespace-nowrap inline-flex items-center gap-1 ${isLeader ? 'font-bold text-blue-600' : 'text-slate-700 font-medium'}`}
                              >
                                {member.name}
                              </span>
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-left whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1 text-left">
                          {group.membersList?.map((member, mIdx) => (
                            <span key={member.code || mIdx} className="whitespace-nowrap">
                              {member.className || '—'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <TeacherBadge type={APPROVAL_STATUS_META[group.status].badge}>
                          {APPROVAL_STATUS_META[group.status].label}
                        </TeacherBadge>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <TeacherButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => {
                            setSelectedGroupId(group.id)
                            setModalOpen(true)
                          }}>
                            Xem
                          </TeacherButton>
                          <TeacherButton
                            variant="success"
                            className="px-3 py-1.5 text-xs"
                            disabled={isPeriodClosed || group.status !== 'pending' || savingId === group.id}
                            onClick={() => handleAction(group.id, 'accept')}
                          >
                            Chấp nhận
                          </TeacherButton>
                          <TeacherButton
                            variant="danger"
                            className="px-3 py-1.5 text-xs"
                            disabled={isPeriodClosed || group.status !== 'pending' || savingId === group.id}
                            onClick={() => handleAction(group.id, 'reject')}
                          >
                            Từ chối
                          </TeacherButton>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <TeacherPagination
          currentPage={currentPage}
          totalItems={filteredGroups.length}
          itemsPerPage={itemsPerPage}
          onChangePage={setCurrentPage}
        />
      </TeacherCard>

      <TeacherModal
        open={modalOpen}
        title="Chi tiết đăng ký nhóm"
        onClose={() => setModalOpen(false)}
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
          </div>
        ) : (
          <div className="text-sm text-slate-500">Không tìm thấy thông tin nhóm.</div>
        )}
      </TeacherModal>
    </>
  )
}