"use client"

import { useEffect, useMemo, useState } from 'react'
import { Search, ShieldCheck, Users } from 'lucide-react'
import { App } from 'antd'
import { TeacherSectionHeader, TeacherPill } from '../_components/TeacherShell'
import { TeacherCard, TeacherInputClass } from '../_components/TeacherUI'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { teacherApi } from '@/lib/api/teacherApi'

type Segment = 'Nhóm hướng dẫn' | 'Nhóm phản biện'
type EvaluationValue = '' | 'dat' | 'khongdat'

interface IGroupMemberInfo {
  id: string
  name: string
  is_leader?: boolean
  class_name?: string
}

type GuidanceGroup = {
  id: string
  segment: Segment
  groupName: string
  topicName?: string
  members?: number
  repo?: string
  latestSubmission?: string
  updatedAt: string
  status: 'pending' | 'reviewed'
  evaluation: EvaluationValue
  note: string
  members_list?: IGroupMemberInfo[]
  reviewerEvaluation?: string | null
}

type ReviewGroup = {
  id: string
  segment: Segment
  groupName: string
  topicName: string
  advisorName?: string
  members: number
  repo: string
  latestSubmission: string
  updatedAt: string
  status: 'pending' | 'reviewed'
  evaluation: EvaluationValue
  note: string
  members_list?: IGroupMemberInfo[]
}

type ReviewApiResponse = {
  guidanceGroups?: GuidanceGroup[]
  reviewGroups?: ReviewGroup[]
  tttnGroups?: GuidanceGroup[]
  datnGroups?: ReviewGroup[]
}

const evaluationOptions: Array<{ value: EvaluationValue; label: string }> = [
  { value: '', label: 'Chọn đánh giá' },
  { value: 'dat', label: 'Đạt' },
  { value: 'khongdat', label: 'Không đạt' },
]

const defaultGuidanceGroups: GuidanceGroup[] = []
const defaultReviewGroups: ReviewGroup[] = []

export default function TeacherReviewGroupsPage() {
  const { message } = App.useApp()
  const { selectedPeriod } = usePeriod()
  const [segment, setSegment] = useState<Segment>('Nhóm hướng dẫn')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed'>('all')
  const [searchName, setSearchName] = useState('')
  const [searchTopic, setSearchTopic] = useState('')
  const [guidanceGroups, setGuidanceGroups] = useState<GuidanceGroup[]>(defaultGuidanceGroups)
  const [reviewGroups, setReviewGroups] = useState<ReviewGroup[]>(defaultReviewGroups)
  const [selectedGuidanceId, setSelectedGuidanceId] = useState<string | null>(null)
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const reviewedCount = useMemo(() => {
    return guidanceGroups.filter((g) => g.status === 'reviewed').length + reviewGroups.filter((g) => g.status === 'reviewed').length
  }, [guidanceGroups, reviewGroups])

  const pendingCount = useMemo(() => {
    return guidanceGroups.filter((g) => g.status === 'pending').length + reviewGroups.filter((g) => g.status === 'pending').length
  }, [guidanceGroups, reviewGroups])

  useEffect(() => {
    let mounted = true
    const load = () => {
      teacherApi.getReviewGroups({ periodId: selectedPeriod?.id })
        .then((data: ReviewApiResponse | null) => {
          if (!mounted) return
          const nextGuidanceGroups: GuidanceGroup[] = data?.guidanceGroups ?? data?.tttnGroups ?? []
          const nextReviewGroups: ReviewGroup[] = data?.reviewGroups ?? data?.datnGroups ?? []

          setGuidanceGroups(nextGuidanceGroups)
          setReviewGroups(nextReviewGroups)
          setSelectedGuidanceId((current) => {
            if (current && nextGuidanceGroups.some((g) => g.id === current)) return current
            return nextGuidanceGroups[0]?.id ?? null
          })
          setSelectedReviewId((current) => {
            if (current && nextReviewGroups.some((g) => g.id === current)) return current
            return nextReviewGroups[0]?.id ?? null
          })
        })
    }

    load()

    const handleSync = () => {
      load()
    }
    window.addEventListener('realtime-group-updated', handleSync)
    window.addEventListener('realtime-topic-updated', handleSync)

    return () => {
      mounted = false
      window.removeEventListener('realtime-group-updated', handleSync)
      window.removeEventListener('realtime-topic-updated', handleSync)
    }
  }, [selectedPeriod?.id])

  const filteredGuidanceGroups = useMemo(() => {
    const nameQ = searchName.trim().toLowerCase()
    const topicQ = searchTopic.trim().toLowerCase()
    return guidanceGroups.filter((group) => {
      const statusMatch = statusFilter === 'all' || group.status === statusFilter
      
      const memberMatch = !nameQ || (group.members_list && group.members_list.some((m: IGroupMemberInfo) => {
        const mssv = (m.id || '').toLowerCase()
        const name = (m.name || '').toLowerCase()
        const cls = (m.class_name || '').toLowerCase()
        return mssv.includes(nameQ) || name.includes(nameQ) || cls.includes(nameQ)
      }))

      const topicMatch = !topicQ || [group.id, group.groupName, group.topicName ?? group.latestSubmission ?? '', group.repo ?? '', group.note].some((value) => value.toLowerCase().includes(topicQ))

      return statusMatch && memberMatch && topicMatch
    })
  }, [searchName, searchTopic, statusFilter, guidanceGroups])

  const filteredReviewGroups = useMemo(() => {
    const nameQ = searchName.trim().toLowerCase()
    const topicQ = searchTopic.trim().toLowerCase()
    return reviewGroups.filter((group) => {
      const statusMatch = statusFilter === 'all' || group.status === statusFilter
      
      const memberMatch = !nameQ || (group.members_list && group.members_list.some((m: IGroupMemberInfo) => {
        const mssv = (m.id || '').toLowerCase()
        const name = (m.name || '').toLowerCase()
        const cls = (m.class_name || '').toLowerCase()
        return mssv.includes(nameQ) || name.includes(nameQ) || cls.includes(nameQ)
      }))

      const topicMatch = !topicQ || [group.id, group.groupName, group.topicName, group.repo, group.latestSubmission, group.note].some((value) => value.toLowerCase().includes(topicQ))

      return statusMatch && memberMatch && topicMatch
    })
  }, [searchName, searchTopic, statusFilter, reviewGroups])

  const selectedGuidanceGroup = filteredGuidanceGroups.find((group) => group.id === selectedGuidanceId) ?? filteredGuidanceGroups[0] ?? null
  const selectedReviewGroup = filteredReviewGroups.find((group) => group.id === selectedReviewId) ?? filteredReviewGroups[0] ?? null

  const handleEvaluationChange = (segmentType: Segment, groupId: string, evaluation: EvaluationValue) => {
    if (segmentType === 'Nhóm hướng dẫn') {
      setGuidanceGroups((current) => current.map((group) => (group.id === groupId ? { ...group, evaluation } : group)))
      return
    }

    setReviewGroups((current) => current.map((group) => (group.id === groupId ? { ...group, evaluation } : group)))
  }

  const handleSave = async (segmentType: Segment, groupId: string, evaluation: EvaluationValue) => {
    if (selectedPeriod?.status === 'closed') {
      message.warning('Đợt học/tốt nghiệp đã đóng, không thể chỉnh sửa đánh giá!')
      return
    }
    if (evaluation !== 'dat' && evaluation !== 'khongdat') return

    setSavingId(groupId)
    try {
      const data = await teacherApi.updateReviewGroupStatus(groupId, evaluation === 'dat' ? 'accept' : 'reject')
      if (!data?.group) return

      if (segmentType === 'Nhóm hướng dẫn') {
        setGuidanceGroups((current) => current.map((group) => (group.id === groupId ? (data.group as GuidanceGroup) : group)))
      } else {
        setReviewGroups((current) => current.map((group) => (group.id === groupId ? (data.group as ReviewGroup) : group)))
      }
    } finally {
      setSavingId(null)
    }
  }

  return (
    <>
      <TeacherSectionHeader
        title="Đánh giá"
        description="Theo dõi và đánh giá các nhóm Nhóm hướng dẫn, Nhóm phản biện do giảng viên đang quản lý."
      />

      {/* Main segment tabs (Nhóm hướng dẫn / Nhóm phản biện) in Pill style */}
      <section className="mb-5 flex flex-wrap items-center gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.05)] mt-4">
        {([
          { key: 'Nhóm hướng dẫn', label: 'Nhóm hướng dẫn', count: guidanceGroups.length, icon: <Users className="h-4 w-4" /> },
          { key: 'Nhóm phản biện', label: 'Nhóm phản biện', count: reviewGroups.length, icon: <ShieldCheck className="h-4 w-4" /> },
        ] as const).map((item) => {
          const active = segment === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setSegment(item.key)}
              className={`inline-flex items-center gap-2 rounded-[20px] px-4 py-2.5 text-sm font-medium transition ${
                active 
                  ? 'bg-[#2196F3] text-white shadow-lg shadow-blue-200' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              {item.label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{item.count}</span>
            </button>
          )
        })}
      </section>

      {/* Sub-filters & Search Toolbar */}
      <section className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl">
          {([
            { key: 'all', label: 'Tất cả', count: segment === 'Nhóm hướng dẫn' ? guidanceGroups.length : reviewGroups.length },
            { key: 'pending', label: 'Chờ đánh giá', count: segment === 'Nhóm hướng dẫn' ? guidanceGroups.filter((group) => group.status === 'pending').length : reviewGroups.filter((group) => group.status === 'pending').length },
            { key: 'reviewed', label: 'Đã đánh giá', count: segment === 'Nhóm hướng dẫn' ? guidanceGroups.filter((group) => group.status === 'reviewed').length : reviewGroups.filter((group) => group.status === 'reviewed').length },
          ] as const).map((tab) => {
            const active = statusFilter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${active ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 border border-transparent'}`}
              >
                {tab.label}
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${active ? 'bg-blue-50 text-blue-600' : 'bg-slate-200/60 text-slate-500'}`}>{tab.count}</span>
              </button>
            )
          })}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          {/* Search by Student Name / MSSV */}
          <div className="relative w-44 sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Tìm sinh viên, MSSV..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </div>

          {/* Search by Topic Name / Repo */}
          <div className="relative w-44 sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              placeholder="Tìm đề tài, nhóm, repo..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </div>
        </div>
      </section>

      {segment === 'Nhóm hướng dẫn' ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
          <TeacherCard className="min-w-0">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Nhóm hướng dẫn</div>
                <div className="text-xs text-slate-500">Mỗi nhóm chỉ hiện dữ liệu thuộc giảng viên đang quản lý</div>
              </div>
              <TeacherPill tone="orange">{filteredGuidanceGroups.length} nhóm</TeacherPill>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-245 w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3 text-left w-16">STT</th>
                    <th className="px-5 py-3 text-left">Đề tài</th>
                    <th className="px-5 py-3 text-left">Thành viên</th>
                    <th className="px-5 py-3 text-left w-32">Trạng thái</th>
                    <th className="px-5 py-3 text-left w-48">Đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuidanceGroups.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400 italic bg-white">
                        Không có dữ liệu nhóm hướng dẫn
                      </td>
                    </tr>
                  ) : (
                    filteredGuidanceGroups.map((group, index) => {
                      const selected = selectedGuidanceId === group.id
                      return (
                        <tr
                          key={group.id}
                          onClick={() => setSelectedGuidanceId(group.id)}
                          className={`border-t border-slate-100 transition-all duration-150 cursor-pointer ${
                            selected ? 'bg-blue-100/70 text-blue-900 font-semibold shadow-sm' : 'hover:bg-blue-50/50'
                          }`}
                        >
                          <td className="px-5 py-4 font-medium text-slate-500">{index + 1}</td>
                          <td className="px-5 py-4 text-slate-800 font-medium">
                            {group.topicName ?? group.latestSubmission ?? ''}
                          </td>
                          <td className="px-5 py-4 text-slate-655 font-medium">
                            {group.members_list && group.members_list.length > 0 ? (
                              <div className="space-y-1">
                                {group.members_list.map((m) => (
                                  <div key={m.id} className="text-xs text-slate-700 font-medium whitespace-nowrap">
                                    {m.name}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {!group.evaluation ? (
                              <TeacherPill tone="orange">Chờ đánh giá</TeacherPill>
                            ) : group.evaluation === 'dat' ? (
                              <TeacherPill tone="green">Đạt</TeacherPill>
                            ) : (
                              <TeacherPill tone="red">Không đạt</TeacherPill>
                            )}
                          </td>
                          <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-start">
                              <select
                                value={group.evaluation}
                                disabled={savingId === group.id || !!group.reviewerEvaluation}
                                onChange={(event) => {
                                  if (selectedPeriod?.status === 'closed') {
                                    message.warning('Đợt học/tốt nghiệp đã đóng, không thể chỉnh sửa đánh giá!')
                                    return
                                  }
                                  if (group.reviewerEvaluation) {
                                    message.warning('Không thể đánh giá vì giảng viên phản biện đã đánh giá trước đó!')
                                    return
                                  }
                                  const val = event.target.value as EvaluationValue
                                  handleEvaluationChange('Nhóm hướng dẫn', group.id, val)
                                  if (val === 'dat' || val === 'khongdat') {
                                    handleSave('Nhóm hướng dẫn', group.id, val)
                                  }
                                }}
                                className={TeacherInputClass('min-w-37.5')}
                              >
                                {evaluationOptions.map((option) => (
                                  <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </TeacherCard>

          <TeacherCard className="space-y-4 p-5 bg-[linear-gradient(135deg,#f0fdf4_0%,#ffffff_100%)] h-fit">
            <div className="text-sm font-semibold text-slate-900">Xem nhanh nhóm hướng dẫn</div>
            {selectedGuidanceGroup ? (
              <>
                <div className="rounded-3xl bg-white/80 p-4 shadow-sm border border-emerald-50">
                  <div className="text-xs text-slate-500">Đang chọn</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{selectedGuidanceGroup.topicName ?? '—'}</div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#2e7d32]" /> {selectedGuidanceGroup.members || 0} thành viên</div>
                    
                    {selectedGuidanceGroup.members_list && selectedGuidanceGroup.members_list.length > 0 && (
                      <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-2">
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Thành viên:</div>
                        {selectedGuidanceGroup.members_list.map((m: IGroupMemberInfo) => (
                          <div key={m.id} className="text-sm font-semibold text-slate-800 flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                              <span className="truncate">{m.name}</span>
                              {m.is_leader && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full shrink-0">Trưởng nhóm</span>}
                            </div>
                            <span className="text-xs text-slate-400 font-normal shrink-0">{m.id} · {m.class_name || '—'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">Không có nhóm phù hợp với bộ lọc hiện tại.</div>
            )}
          </TeacherCard>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
          <TeacherCard className="min-w-0">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Nhóm phản biện</div>
                <div className="text-xs text-slate-500">Danh sách nhóm đồ án thuộc giảng viên đang phụ trách</div>
              </div>
              <TeacherPill tone="green">{filteredReviewGroups.length} nhóm</TeacherPill>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-245 w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3 text-left w-16">STT</th>
                    <th className="px-5 py-3 text-left">Đề tài</th>
                    <th className="px-5 py-3 text-left w-44">GVHD</th>
                    <th className="px-5 py-3 text-left">Thành viên</th>
                    <th className="px-5 py-3 text-left w-32">Trạng thái</th>
                    <th className="px-5 py-3 text-left w-48">Đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviewGroups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400 italic bg-white">
                        Không có dữ liệu nhóm phản biện
                      </td>
                    </tr>
                  ) : (
                    filteredReviewGroups.map((group, index) => {
                      const selected = selectedReviewId === group.id
                      return (
                        <tr
                          key={group.id}
                          onClick={() => setSelectedReviewId(group.id)}
                          className={`border-t border-slate-100 transition-all duration-150 cursor-pointer ${
                            selected ? 'bg-blue-100/70 text-blue-900 font-semibold shadow-sm' : 'hover:bg-blue-50/50'
                          }`}
                        >
                          <td className="px-5 py-4 font-medium text-slate-500">{index + 1}</td>
                          <td className="px-5 py-4 text-slate-800 font-medium">
                            <span
                              className="hover:text-[#1976D2] hover:underline cursor-pointer transition-colors"
                              title="Click để xem chi tiết nhóm"
                            >
                              {group.topicName}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-700 font-medium">
                            {group.advisorName || '—'}
                          </td>
                          <td className="px-5 py-4 text-slate-655 font-medium">
                            {group.members_list && group.members_list.length > 0 ? (
                              <div className="space-y-1">
                                {group.members_list.map((m) => (
                                  <div key={m.id} className="text-xs text-slate-700 font-medium whitespace-nowrap">
                                    {m.name}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {!group.evaluation ? (
                              <TeacherPill tone="orange">Chờ đánh giá</TeacherPill>
                            ) : group.evaluation === 'dat' ? (
                              <TeacherPill tone="green">Đạt</TeacherPill>
                            ) : (
                              <TeacherPill tone="red">Không đạt</TeacherPill>
                            )}
                          </td>
                          <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-start">
                              <select
                                value={group.evaluation}
                                disabled={savingId === group.id}
                                onChange={(event) => {
                                  if (selectedPeriod?.status === 'closed') {
                                    message.warning('Đợt học/tốt nghiệp đã đóng, không thể chỉnh sửa đánh giá!')
                                    return
                                  }
                                  const val = event.target.value as EvaluationValue
                                  handleEvaluationChange('Nhóm phản biện', group.id, val)
                                  if (val === 'dat' || val === 'khongdat') {
                                    handleSave('Nhóm phản biện', group.id, val)
                                  }
                                }}
                                className={TeacherInputClass('min-w-37.5')}
                              >
                                {evaluationOptions.map((option) => (
                                  <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </TeacherCard>

          <TeacherCard className="space-y-4 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 h-fit">
            <div className="text-sm font-semibold text-slate-900">Xem nhanh nhóm phản biện</div>
            {selectedReviewGroup ? (
              <>
                <div className="rounded-3xl bg-white/80 p-4 shadow-sm border border-blue-50">
                  <div className="text-xs text-slate-500">Đang chọn</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{selectedReviewGroup.topicName ?? '—'}</div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#1976D2]" /> {selectedReviewGroup.members || 0} thành viên</div>
                    
                    {selectedReviewGroup.members_list && selectedReviewGroup.members_list.length > 0 && (
                      <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-2">
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Thành viên:</div>
                        {selectedReviewGroup.members_list.map((m: IGroupMemberInfo) => (
                          <div key={m.id} className="text-sm font-semibold text-slate-800 flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0"></span>
                              <span className="truncate">{m.name}</span>
                              {m.is_leader && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full shrink-0">Trưởng nhóm</span>}
                            </div>
                            <span className="text-xs text-slate-400 font-normal shrink-0">{m.id} · {m.class_name || '—'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">Không có nhóm phù hợp với bộ lọc hiện tại.</div>
            )}
          </TeacherCard>
        </div>
      )}
    </>
  )
}