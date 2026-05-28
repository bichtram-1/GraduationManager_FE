"use client"

import { useEffect, useMemo, useState } from 'react'
import { ClipboardCheck, Clock3, Eye, FileText, Search, ShieldCheck, Users } from 'lucide-react'
import { TeacherSectionHeader, TeacherStatCard, TeacherPill } from '../_components/TeacherShell'
import { TeacherButton, TeacherCard, TeacherInputClass, TeacherToolbar } from '../_components/TeacherUI'

type Segment = 'Nhóm hướng dẫn' | 'Nhóm phản biện'
type EvaluationValue = '' | 'dat' | 'khongdat'

type GuidanceGroup = {
  id: string
  segment: Segment
  groupName: string
  // unify with ReviewGroup fields used by the mock API
  topicName?: string
  members?: number
  repo?: string
  latestSubmission?: string
  updatedAt: string
  status: 'pending' | 'reviewed'
  evaluation: EvaluationValue
  note: string
}

type ReviewGroup = {
  id: string
  segment: Segment
  groupName: string
  topicName: string
  members: number
  repo: string
  latestSubmission: string
  updatedAt: string
  status: 'pending' | 'reviewed'
  evaluation: EvaluationValue
  note: string
}

type ReviewApiResponse = {
  guidanceGroups?: GuidanceGroup[]
  reviewGroups?: ReviewGroup[]
  // legacy/mock API keys
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
  const [segment, setSegment] = useState<Segment>('Nhóm hướng dẫn')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed'>('all')
  const [query, setQuery] = useState('')
  const [guidanceGroups, setGuidanceGroups] = useState<GuidanceGroup[]>(defaultGuidanceGroups)
  const [reviewGroups, setReviewGroups] = useState<ReviewGroup[]>(defaultReviewGroups)
  const [selectedGuidanceId, setSelectedGuidanceId] = useState<string | null>(null)
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/mock/teacher/review-groups')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: ReviewApiResponse | null) => {
        // Support both shapes: { guidanceGroups, reviewGroups } (new) and
        // { tttnGroups, datnGroups } (mock API current).
        const nextGuidanceGroups: GuidanceGroup[] = data?.guidanceGroups ?? data?.tttnGroups ?? []
        const nextReviewGroups: ReviewGroup[] = data?.reviewGroups ?? data?.datnGroups ?? []

        setGuidanceGroups(nextGuidanceGroups)
        setReviewGroups(nextReviewGroups)
        setSelectedGuidanceId((current) => current ?? nextGuidanceGroups[0]?.id ?? null)
        setSelectedReviewId((current) => current ?? nextReviewGroups[0]?.id ?? null)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredGuidanceGroups = useMemo(() => {
    const search = query.toLowerCase()
    return guidanceGroups.filter((group) => {
      const statusMatch = statusFilter === 'all' || group.status === statusFilter
      const searchMatch = [group.id, group.groupName, group.topicName ?? group.latestSubmission ?? '', group.repo ?? '', String(group.members ?? ''), group.note].some((value) => value.toLowerCase().includes(search))
      return statusMatch && searchMatch
    })
  }, [query, statusFilter, guidanceGroups])

  const filteredReviewGroups = useMemo(() => {
    const search = query.toLowerCase()
    return reviewGroups.filter((group) => {
      const statusMatch = statusFilter === 'all' || group.status === statusFilter
      const searchMatch = [group.id, group.groupName, group.topicName, group.repo, group.latestSubmission, group.note].some((value) => value.toLowerCase().includes(search))
      return statusMatch && searchMatch
    })
  }, [query, statusFilter, reviewGroups])

  const selectedGuidanceGroup = filteredGuidanceGroups.find((group) => group.id === selectedGuidanceId) ?? filteredGuidanceGroups[0] ?? null
  const selectedReviewGroup = filteredReviewGroups.find((group) => group.id === selectedReviewId) ?? filteredReviewGroups[0] ?? null

  const totalCount = guidanceGroups.length + reviewGroups.length
  const reviewedCount = [...guidanceGroups, ...reviewGroups].filter((group) => group.status === 'reviewed').length
  const pendingCount = [...guidanceGroups, ...reviewGroups].filter((group) => group.status === 'pending').length
  const passCount = [...guidanceGroups, ...reviewGroups].filter((group) => group.evaluation === 'dat').length

  const handleEvaluationChange = (segmentType: Segment, groupId: string, evaluation: EvaluationValue) => {
    if (segmentType === 'Nhóm hướng dẫn') {
      setGuidanceGroups((current) => current.map((group) => (group.id === groupId ? { ...group, evaluation } : group)))
      return
    }

    setReviewGroups((current) => current.map((group) => (group.id === groupId ? { ...group, evaluation } : group)))
  }

  const handleSave = async (segmentType: Segment, groupId: string, evaluation: EvaluationValue) => {
    if (evaluation !== 'dat' && evaluation !== 'khongdat') return

    setSavingId(groupId)
    try {
      const response = await fetch('/api/mock/teacher/review-groups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segment: segmentType, groupId, evaluation }),
      })

      if (!response.ok) return

      const data = (await response.json()) as { group?: GuidanceGroup | ReviewGroup }
      if (!data.group) return

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
        description="Theo dõi và đánh giá các nhóm Nhóm hướng dẫn, Nhóm phản biện do giảng viên đang quản lý. Danh sách này chỉ lấy dữ liệu thuộc phạm vi của giảng viên, không mở rộng theo toàn bộ tuần báo cáo."
        actions={(
          <>
            <TeacherPill tone="blue">Nhóm hướng dẫn: {guidanceGroups.length}</TeacherPill>
            <TeacherPill tone="green">Nhóm phản biện: {reviewGroups.length}</TeacherPill>
          </>
        )}
      />

      <section className="mb-5 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <TeacherPill tone="blue">Đánh giá nhóm tập trung</TeacherPill>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">Chuyển giữa Nhóm hướng dẫn và Nhóm phản biện, chọn <span className="text-[#1976D2]">Đạt</span> hoặc <span className="text-[#F44336]">Không đạt</span> ngay trên bảng.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Giao diện bám theo trang Hướng dẫn sinh viên nhưng rút gọn về đúng thao tác đánh giá.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-115">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Tổng nhóm</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{totalCount}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Đã đánh giá</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{reviewedCount}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Chờ xử lý</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{pendingCount}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <TeacherStatCard title="Nhóm hướng dẫn" value={`${guidanceGroups.length}`} hint="Nhóm thực tập do giảng viên quản lý" accent="blue" />
        <TeacherStatCard title="Nhóm phản biện" value={`${reviewGroups.length}`} hint="Nhóm đồ án đang theo dõi" accent="green" />
        <TeacherStatCard title="Đã đạt" value={`${passCount}`} hint="Số nhóm được đánh giá đạt" accent="orange" />
        <TeacherStatCard title="Trạng thái" value={loading ? 'Đang tải' : 'Sẵn sàng'} hint="Dữ liệu mock theo giảng viên" accent="violet" />
      </div>

      <section className="mb-5 flex flex-wrap gap-2 rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        {([
          { key: 'Nhóm hướng dẫn', label: 'Nhóm hướng dẫn', count: guidanceGroups.length, icon: ShieldCheck },
          { key: 'Nhóm phản biện', label: 'Nhóm phản biện', count: reviewGroups.length, icon: ClipboardCheck },
        ] as const).map((item) => {
          const active = segment === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setSegment(item.key)}
              className={`inline-flex items-center gap-2 rounded-[20px] px-4 py-2.5 text-sm font-medium transition ${active ? 'bg-[#2196F3] text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{item.count}</span>
            </button>
          )
        })}
        <div className="ml-auto w-full max-w-md">
          <TeacherToolbar placeholder="Tìm nhóm, đề tài, mentor, repo..." value={query} onChange={setQuery}>
            <TeacherPill tone="blue">{segment === 'Nhóm hướng dẫn' ? `${filteredGuidanceGroups.length} nhóm` : `${filteredReviewGroups.length} nhóm`}</TeacherPill>
            <TeacherPill tone="green">{passCount} đạt</TeacherPill>
          </TeacherToolbar>
        </div>
      </section>

      <section className="mb-5 flex flex-wrap gap-2 rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
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
              className={`inline-flex items-center gap-2 rounded-[20px] px-4 py-2.5 text-sm font-medium transition ${active ? 'bg-[#2196F3] text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{tab.count}</span>
            </button>
          )
        })}
      </section>

      {segment === 'Nhóm hướng dẫn' ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
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
                  <th className="px-5 py-3 text-left">Nhóm</th>
                  <th className="px-5 py-3 text-left">Đề tài</th>
                  <th className="px-5 py-3 text-left">SV</th>
                  <th className="px-5 py-3 text-left">Cập nhật</th>
                  <th className="px-5 py-3 text-left">Đánh giá</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuidanceGroups.map((group) => {
                  const selected = selectedGuidanceId === group.id
                  return (
                    <tr key={group.id} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${selected ? 'bg-blue-50/60' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#1976D2]">{group.groupName}</div>
                        <div className="mt-1 text-xs text-slate-500">{group.id}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-900">
                        <div className="font-medium">{group.topicName ?? group.latestSubmission ?? ''}</div>
                        <div className="mt-1 text-xs text-slate-500">{group.repo ?? ''}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div>{group.members ? `${group.members} thành viên` : ''}</div>
                        <div className="mt-1 text-xs text-slate-500">{group.latestSubmission ?? ''}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="flex flex-col gap-1">
                          <span>{group.updatedAt}</span>
                          <TeacherPill tone={group.status === 'reviewed' ? 'green' : 'orange'}>{group.status === 'reviewed' ? 'Đã đánh giá' : 'Chờ đánh giá'}</TeacherPill>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={group.evaluation}
                          onChange={(event) => handleEvaluationChange('Nhóm hướng dẫn', group.id, event.target.value as EvaluationValue)}
                          className={TeacherInputClass('min-w-37.5')}
                        >
                          {evaluationOptions.map((option) => (
                            <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <TeacherButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setSelectedGuidanceId(group.id)}>
                            <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> Xem</span>
                          </TeacherButton>
                          <TeacherButton
                            variant="primary"
                            className="px-3 py-1.5 text-xs"
                            disabled={savingId === group.id || (group.evaluation !== 'dat' && group.evaluation !== 'khongdat')}
                            onClick={() => handleSave('Nhóm hướng dẫn', group.id, group.evaluation)}
                          >
                            <span className="inline-flex items-center gap-1"><ClipboardCheck className="h-4 w-4" /> Lưu</span>
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

          <TeacherCard className="space-y-4 p-5">
            <div className="text-sm font-semibold text-slate-900">Xem nhanh nhóm hướng dẫn</div>
            {selectedGuidanceGroup ? (
              <>
                <div className="rounded-3xl bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-4">
                  <div className="text-xs text-slate-500">Đang chọn</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{selectedGuidanceGroup.groupName}</div>
                  <div className="mt-1 text-sm text-slate-600">{selectedGuidanceGroup.topicName ?? selectedGuidanceGroup.latestSubmission}</div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#1976D2]" /> {selectedGuidanceGroup.members ? `${selectedGuidanceGroup.members} thành viên` : ''}</div>
                    <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#1976D2]" /> {selectedGuidanceGroup.latestSubmission ?? ''}</div>
                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Cập nhật: {selectedGuidanceGroup.updatedAt}</div>
                  </div>
                </div>
                <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><ShieldCheck className="h-4 w-4 text-[#1976D2]" /> Cách đánh giá</div>
                  <div className="mt-3 text-sm leading-6 text-slate-600">Chọn một giá trị trong cột Đánh giá rồi bấm Lưu để ghi nhận kết quả của nhóm.</div>
                </div>
              </>
            ) : (
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">Không có nhóm phù hợp với bộ lọc hiện tại.</div>
            )}
          </TeacherCard>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
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
                  <th className="px-5 py-3 text-left">Nhóm</th>
                  <th className="px-5 py-3 text-left">Đề tài</th>
                  <th className="px-5 py-3 text-left">SV</th>
                  <th className="px-5 py-3 text-left">Cập nhật</th>
                  <th className="px-5 py-3 text-left">Đánh giá</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviewGroups.map((group) => {
                  const selected = selectedReviewId === group.id
                  return (
                    <tr key={group.id} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${selected ? 'bg-blue-50/60' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#1976D2]">{group.groupName}</div>
                        <div className="mt-1 text-xs text-slate-500">{group.id}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-900">
                        <div className="font-medium">{group.topicName}</div>
                        <div className="mt-1 text-xs text-slate-500">{group.repo}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div>{group.members} thành viên</div>
                        <div className="mt-1 text-xs text-slate-500">{group.latestSubmission}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="flex flex-col gap-1">
                          <span>{group.updatedAt}</span>
                          <TeacherPill tone={group.status === 'reviewed' ? 'green' : 'orange'}>{group.status === 'reviewed' ? 'Đã đánh giá' : 'Chờ đánh giá'}</TeacherPill>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={group.evaluation}
                          onChange={(event) => handleEvaluationChange('Nhóm phản biện', group.id, event.target.value as EvaluationValue)}
                          className={TeacherInputClass('min-w-37.5')}
                        >
                          {evaluationOptions.map((option) => (
                            <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <TeacherButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setSelectedReviewId(group.id)}>
                            <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> Xem</span>
                          </TeacherButton>
                          <TeacherButton
                            variant="primary"
                            className="px-3 py-1.5 text-xs"
                            disabled={savingId === group.id || (group.evaluation !== 'dat' && group.evaluation !== 'khongdat')}
                            onClick={() => handleSave('Nhóm phản biện', group.id, group.evaluation)}
                          >
                            <span className="inline-flex items-center gap-1"><ClipboardCheck className="h-4 w-4" /> Lưu</span>
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

          <TeacherCard className="space-y-4 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5">
            <div className="text-sm font-semibold text-slate-900">Xem nhanh nhóm phản biện</div>
            {selectedReviewGroup ? (
              <>
                <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200">
                  <div className="text-xs text-slate-500">Đang chọn</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{selectedReviewGroup.groupName}</div>
                  <div className="mt-1 text-sm text-slate-600">{selectedReviewGroup.topicName}</div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#1976D2]" /> {selectedReviewGroup.members} thành viên</div>
                    <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#1976D2]" /> {selectedReviewGroup.latestSubmission}</div>
                    <div className="flex items-center gap-2"><Search className="h-4 w-4 text-[#1976D2]" /> {selectedReviewGroup.repo}</div>
                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Cập nhật: {selectedReviewGroup.updatedAt}</div>
                  </div>
                </div>
                <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><ShieldCheck className="h-4 w-4 text-[#1976D2]" /> Cách đánh giá</div>
                  <div className="mt-3 text-sm leading-6 text-slate-600">Chọn một giá trị trong cột Đánh giá rồi bấm Lưu để ghi nhận kết quả của nhóm.</div>
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