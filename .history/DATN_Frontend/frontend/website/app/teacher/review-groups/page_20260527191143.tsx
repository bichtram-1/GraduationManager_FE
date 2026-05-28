"use client"

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, ClipboardCheck, Clock3, Eye, FileText, Search, ShieldCheck, Users } from 'lucide-react'
import { TeacherSectionHeader, TeacherStatCard, TeacherPill } from '../_components/TeacherShell'
import { TeacherButton, TeacherCard, TeacherInputClass, TeacherToolbar } from '../_components/TeacherUI'

type Segment = 'TTTN' | 'ĐATN'
type EvaluationValue = '' | 'dat' | 'khongdat'

type TttnGroup = {
  id: string
  segment: Segment
  groupName: string
  leader: string
  company: string
  mentor: string
  latestReport: string
  updatedAt: string
  status: 'pending' | 'reviewed'
  evaluation: EvaluationValue
  note: string
}

type DatnGroup = {
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
  tttnGroups?: TttnGroup[]
  datnGroups?: DatnGroup[]
}

const evaluationOptions: Array<{ value: EvaluationValue; label: string }> = [
  { value: '', label: 'Chọn đánh giá' },
  { value: 'dat', label: 'Đạt' },
  { value: 'khongdat', label: 'Không đạt' },
]

const defaultTttnGroups: TttnGroup[] = []
const defaultDatnGroups: DatnGroup[] = []

export default function TeacherReviewGroupsPage() {
  const [segment, setSegment] = useState<Segment>('TTTN')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed'>('all')
  const [query, setQuery] = useState('')
  const [tttnGroups, setTttnGroups] = useState<TttnGroup[]>(defaultTttnGroups)
  const [datnGroups, setDatnGroups] = useState<DatnGroup[]>(defaultDatnGroups)
  const [selectedTttnId, setSelectedTttnId] = useState<string | null>(null)
  const [selectedDatnId, setSelectedDatnId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/mock/teacher/review-groups')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: ReviewApiResponse | null) => {
        const nextTttn = data?.tttnGroups ?? []
        const nextDatn = data?.datnGroups ?? []
        setTttnGroups(nextTttn)
        setDatnGroups(nextDatn)
        setSelectedTttnId((current) => current ?? nextTttn[0]?.id ?? null)
        setSelectedDatnId((current) => current ?? nextDatn[0]?.id ?? null)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredTttn = useMemo(() => {
    const search = query.toLowerCase()
    return tttnGroups.filter((group) => {
      const statusMatch = statusFilter === 'all' || group.status === statusFilter
      const searchMatch = [group.id, group.groupName, group.leader, group.company, group.mentor, group.latestReport, group.note].some((value) => value.toLowerCase().includes(search))
      return statusMatch && searchMatch
    })
  }, [query, statusFilter, tttnGroups])

  const filteredDatn = useMemo(() => {
    const search = query.toLowerCase()
    return datnGroups.filter((group) => {
      const statusMatch = statusFilter === 'all' || group.status === statusFilter
      const searchMatch = [group.id, group.groupName, group.topicName, group.repo, group.latestSubmission, group.note].some((value) => value.toLowerCase().includes(search))
      return statusMatch && searchMatch
    })
  }, [query, statusFilter, datnGroups])

  const selectedTttn = filteredTttn.find((group) => group.id === selectedTttnId) ?? filteredTttn[0] ?? null
  const selectedDatn = filteredDatn.find((group) => group.id === selectedDatnId) ?? filteredDatn[0] ?? null

  const totalCount = tttnGroups.length + datnGroups.length
  const reviewedCount = [...tttnGroups, ...datnGroups].filter((group) => group.status === 'reviewed').length
  const pendingCount = [...tttnGroups, ...datnGroups].filter((group) => group.status === 'pending').length
  const passCount = [...tttnGroups, ...datnGroups].filter((group) => group.evaluation === 'dat').length

  const handleEvaluationChange = (segmentType: Segment, groupId: string, evaluation: EvaluationValue) => {
    if (segmentType === 'TTTN') {
      setTttnGroups((current) => current.map((group) => (group.id === groupId ? { ...group, evaluation } : group)))
      return
    }

    setDatnGroups((current) => current.map((group) => (group.id === groupId ? { ...group, evaluation } : group)))
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

      const data = (await response.json()) as { group?: TttnGroup | DatnGroup }
      if (!data.group) return

      if (segmentType === 'TTTN') {
        setTttnGroups((current) => current.map((group) => (group.id === groupId ? (data.group as TttnGroup) : group)))
      } else {
        setDatnGroups((current) => current.map((group) => (group.id === groupId ? (data.group as DatnGroup) : group)))
      }
    } finally {
      setSavingId(null)
    }
  }

  return (
    <>
      <TeacherSectionHeader
        title="Đánh giá"
        description="Theo dõi và đánh giá các nhóm TTTN, ĐATN do giảng viên đang quản lý. Danh sách này chỉ lấy dữ liệu thuộc phạm vi của giảng viên, không mở rộng theo toàn bộ tuần báo cáo."
        actions={(
          <>
            <TeacherPill tone="blue">TTTN: {tttnGroups.length}</TeacherPill>
            <TeacherPill tone="green">ĐATN: {datnGroups.length}</TeacherPill>
          </>
        )}
      />

      <section className="mb-5 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <TeacherPill tone="blue">Đánh giá nhóm tập trung</TeacherPill>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">Chuyển giữa TTTN và ĐATN, chọn <span className="text-[#1976D2]">Đạt</span> hoặc <span className="text-[#F44336]">Không đạt</span> ngay trên bảng.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Giao diện bám theo trang Hướng dẫn sinh viên nhưng rút gọn về đúng thao tác đánh giá nhóm.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[460px]">
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
        <TeacherStatCard title="TTTN" value={`${tttnGroups.length}`} hint="Nhóm thực tập do giảng viên quản lý" accent="blue" />
        <TeacherStatCard title="ĐATN" value={`${datnGroups.length}`} hint="Nhóm đồ án đang theo dõi" accent="green" />
        <TeacherStatCard title="Đã đạt" value={`${passCount}`} hint="Số nhóm được đánh giá đạt" accent="orange" />
        <TeacherStatCard title="Trạng thái" value={loading ? 'Đang tải' : 'Sẵn sàng'} hint="Dữ liệu mock theo giảng viên" accent="violet" />
      </div>

      <section className="mb-5 flex flex-wrap gap-2 rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        {([
          { key: 'TTTN', label: 'TTTN', count: tttnGroups.length, icon: ShieldCheck },
          { key: 'ĐATN', label: 'ĐATN', count: datnGroups.length, icon: ClipboardCheck },
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
            <TeacherPill tone="blue">{segment === 'TTTN' ? `${filteredTttn.length} nhóm` : `${filteredDatn.length} nhóm`}</TeacherPill>
            <TeacherPill tone="green">{passCount} đạt</TeacherPill>
          </TeacherToolbar>
        </div>
      </section>

      <section className="mb-5 flex flex-wrap gap-2 rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        {([
          { key: 'all', label: 'Tất cả', count: segment === 'TTTN' ? tttnGroups.length : datnGroups.length },
          { key: 'pending', label: 'Chờ đánh giá', count: segment === 'TTTN' ? tttnGroups.filter((group) => group.status === 'pending').length : datnGroups.filter((group) => group.status === 'pending').length },
          { key: 'reviewed', label: 'Đã đánh giá', count: segment === 'TTTN' ? tttnGroups.filter((group) => group.status === 'reviewed').length : datnGroups.filter((group) => group.status === 'reviewed').length },
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

      {segment === 'TTTN' ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
          <TeacherCard className="min-w-0">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Nhóm TTTN</div>
                <div className="text-xs text-slate-500">Mỗi nhóm chỉ hiện dữ liệu thuộc giảng viên đang quản lý</div>
              </div>
              <TeacherPill tone="orange">{filteredTttn.length} nhóm</TeacherPill>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 text-left">Nhóm</th>
                  <th className="px-5 py-3 text-left">Sinh viên đại diện</th>
                  <th className="px-5 py-3 text-left">Đơn vị</th>
                  <th className="px-5 py-3 text-left">Cập nhật</th>
                  <th className="px-5 py-3 text-left">Đánh giá</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredTttn.map((group) => {
                  const selected = selectedTttnId === group.id
                  return (
                    <tr key={group.id} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${selected ? 'bg-blue-50/60' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#1976D2]">{group.groupName}</div>
                        <div className="mt-1 text-xs text-slate-500">{group.id}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-900">
                        <div className="font-medium">{group.leader}</div>
                        <div className="mt-1 text-xs text-slate-500">{group.mentor}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div>{group.company}</div>
                        <div className="mt-1 text-xs text-slate-500">{group.latestReport}</div>
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
                          onChange={(event) => handleEvaluationChange('TTTN', group.id, event.target.value as EvaluationValue)}
                          className={TeacherInputClass('min-w-[150px]')}
                        >
                          {evaluationOptions.map((option) => (
                            <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <TeacherButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setSelectedTttnId(group.id)}>
                            <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> Xem</span>
                          </TeacherButton>
                          <TeacherButton
                            variant="primary"
                            className="px-3 py-1.5 text-xs"
                            disabled={savingId === group.id || (group.evaluation !== 'dat' && group.evaluation !== 'khongdat')}
                            onClick={() => handleSave('TTTN', group.id, group.evaluation)}
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
            <div className="text-sm font-semibold text-slate-900">Xem nhanh nhóm TTTN</div>
            {selectedTttn ? (
              <>
                <div className="rounded-[24px] bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-4">
                  <div className="text-xs text-slate-500">Đang chọn</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{selectedTttn.groupName}</div>
                  <div className="mt-1 text-sm text-slate-600">{selectedTttn.leader}</div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#1976D2]" /> {selectedTttn.company}</div>
                    <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#1976D2]" /> {selectedTttn.latestReport}</div>
                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Cập nhật: {selectedTttn.updatedAt}</div>
                  </div>
                </div>
                <div className="rounded-[24px] bg-white/85 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><ShieldCheck className="h-4 w-4 text-[#1976D2]" /> Cách đánh giá</div>
                  <div className="mt-3 text-sm leading-6 text-slate-600">Chọn một giá trị trong cột Đánh giá rồi bấm Lưu để ghi nhận kết quả của nhóm.</div>
                </div>
              </>
            ) : (
              <div className="rounded-[24px] bg-slate-50 p-4 text-sm text-slate-500">Không có nhóm phù hợp với bộ lọc hiện tại.</div>
            )}
          </TeacherCard>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
          <TeacherCard className="min-w-0">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Nhóm ĐATN</div>
                <div className="text-xs text-slate-500">Danh sách nhóm đồ án thuộc giảng viên đang phụ trách</div>
              </div>
              <TeacherPill tone="green">{filteredDatn.length} nhóm</TeacherPill>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-sm">
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
                {filteredDatn.map((group) => {
                  const selected = selectedDatnId === group.id
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
                          onChange={(event) => handleEvaluationChange('ĐATN', group.id, event.target.value as EvaluationValue)}
                          className={TeacherInputClass('min-w-[150px]')}
                        >
                          {evaluationOptions.map((option) => (
                            <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <TeacherButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setSelectedDatnId(group.id)}>
                            <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> Xem</span>
                          </TeacherButton>
                          <TeacherButton
                            variant="primary"
                            className="px-3 py-1.5 text-xs"
                            disabled={savingId === group.id || (group.evaluation !== 'dat' && group.evaluation !== 'khongdat')}
                            onClick={() => handleSave('ĐATN', group.id, group.evaluation)}
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
            <div className="text-sm font-semibold text-slate-900">Xem nhanh nhóm ĐATN</div>
            {selectedDatn ? (
              <>
                <div className="rounded-[24px] bg-white/85 p-4 ring-1 ring-slate-200">
                  <div className="text-xs text-slate-500">Đang chọn</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{selectedDatn.groupName}</div>
                  <div className="mt-1 text-sm text-slate-600">{selectedDatn.topicName}</div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#1976D2]" /> {selectedDatn.members} thành viên</div>
                    <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#1976D2]" /> {selectedDatn.latestSubmission}</div>
                    <div className="flex items-center gap-2"><Search className="h-4 w-4 text-[#1976D2]" /> {selectedDatn.repo}</div>
                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Cập nhật: {selectedDatn.updatedAt}</div>
                  </div>
                </div>
                <div className="rounded-[24px] bg-white/85 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><ShieldCheck className="h-4 w-4 text-[#1976D2]" /> Cách đánh giá</div>
                  <div className="mt-3 text-sm leading-6 text-slate-600">Chọn một giá trị trong cột Đánh giá rồi bấm Lưu để ghi nhận kết quả của nhóm.</div>
                </div>
              </>
            ) : (
              <div className="rounded-[24px] bg-slate-50 p-4 text-sm text-slate-500">Không có nhóm phù hợp với bộ lọc hiện tại.</div>
            )}
          </TeacherCard>
        </div>
      )}
    </>
  )
}