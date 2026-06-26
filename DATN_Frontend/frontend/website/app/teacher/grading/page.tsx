'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Save, Trophy, Users, LayoutDashboard, FileText, BarChart3, Sparkles } from 'lucide-react'
import { TeacherPill, TeacherSectionHeader, TeacherStatCard } from '../_components/TeacherShell'
import { TeacherButton, TeacherCard, TeacherInputClass } from '../_components/TeacherUI'
import ScoringTable from './ScoringTable'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { teacherApi } from '@/lib/api/teacherApi'

// Default fallbacks (used if mock API is unavailable)
const defaultTttnRows = [
  { id: '20520001', name: 'Nguyễn Văn A', company: 'FPT Software', score: '8.8' },
  { id: '20520002', name: 'Trần Thị B', company: 'VNG Corp', score: '7.8' },
  { id: '20520004', name: 'Phạm Thị D', company: 'Tiki', score: '' },
  { id: '20520006', name: 'Vũ Thị F', company: 'MoMo', score: '9.2' },
]

const defaultCouncilGroups = [
  {
    code: 'HD01',
    name: 'Hội đồng 1 - ĐATN HK2/2025-2026',
    date: '20/06/2026 • 08:00',
    room: 'A.102',
    role: 'Ủy viên',
    done: 1,
    total: 2,
    members: [
      { id: 'T001', name: 'TS. Nguyễn Văn GV', role: 'Chủ tịch' },
      { id: 'T002', name: 'PGS. Trần Thị GV', role: 'Ủy viên' },
      { id: 'T003', name: 'ThS. Lê Văn GV', role: 'Thư ký' },
    ],
    groups: [
      { id: '1', groupCode: 'G01', topic: 'Hệ thống IoT', students: [{ id: '20520010', name: 'Lê A' }, { id: '20520011', name: 'Trần B' }] },
      { id: '2', groupCode: 'G02', topic: 'Blockchain chuỗi cung ứng', students: [{ id: '20520012', name: 'Nguyễn C' }] },
    ],
  },
  {
    code: 'HD02',
    name: 'Hội đồng 2 - ĐATN HK2/2025-2026',
    date: '22/06/2026 • 13:00',
    room: 'B.201',
    role: 'GVPB',
    done: 0,
    total: 1,
    members: [
      { id: 'T004', name: 'TS. Phạm Thị GV', role: 'Chủ tịch' },
      { id: 'T005', name: 'ThS. Hoàng GV', role: 'Ủy viên' },
    ],
    groups: [
      { id: '3', groupCode: 'G03', topic: 'Ứng dụng ML', students: [{ id: '20520020', name: 'Hồ D' }, { id: '20520021', name: 'Phan E' }] },
    ],
  },
]

const defaultScoreRows = [
  { id: '20520004', name: 'Nguyễn Văn D', chair: '', secretary: '', member: '8.5', advisor: '', reviewer: '' },
  { id: '20520005', name: 'Trần Thị E', chair: '', secretary: '', member: '8.0', advisor: '', reviewer: '' },
]

export default function TeacherGradingPage() {
  const { selectedPeriod } = usePeriod()
  const [mode, setMode] = useState<'tttn' | 'council'>('tttn')
  const [tttnScores, setTttnScores] = useState(defaultTttnRows)
  const [toast, setToast] = useState<string | null>(null)
  const [selectedCouncil, setSelectedCouncil] = useState<typeof defaultCouncilGroups[0] | null>(defaultCouncilGroups[0])
  const [selectedGroup, setSelectedGroup] = useState<null | { id?: string; groupCode: string; topic: string; students: { id: string; name: string }[] }>(null)
  const [selectedTttnId, setSelectedTttnId] = useState(defaultTttnRows[0].id)
  const [councilList, setCouncilList] = useState(defaultCouncilGroups)
  const [scoreList, setScoreList] = useState(defaultScoreRows)
  const [_loading, setLoading] = useState(false)
  const [showScoringModal, setShowScoringModal] = useState(false)

  const notify = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  // Load mock data from server if available
  useEffect(() => {
    let mounted = true
    setLoading(true)
    teacherApi.getGradingData({ periodId: selectedPeriod?.id })
      .then((data) => {
        if (!mounted) return
        console.log('grading data:', data)
        if (data) {
          const newTttnRows = data.tttnRows ?? defaultTttnRows
          setTttnScores(newTttnRows)
          if (newTttnRows.length > 0) {
            setSelectedTttnId(newTttnRows[0].id)
          } else {
            setSelectedTttnId('')
          }

          const newCouncilList = data.councilGroups ?? defaultCouncilGroups
          setCouncilList(newCouncilList)
          if (newCouncilList.length > 0) {
            setSelectedCouncil(newCouncilList[0])
            setSelectedGroup(null)
          } else {
            setSelectedCouncil(null)
            setSelectedGroup(null)
          }

          setScoreList(data.scoreRows ?? defaultScoreRows)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [selectedPeriod?.id])

  const updateTttn = (index: number, value: string) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return
    setTttnScores((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, score: value } : row)))
  }

  const [savingTttn, setSavingTttn] = useState(false)

  const handleSaveTttn = async () => {
    setSavingTttn(true)
    try {
      const payload = tttnScores.map(row => ({
        id: row.id,
        score: row.score
      }))
      const res = await teacherApi.saveTttnScores({
        periodId: selectedPeriod?.id,
        scores: payload
      })
      if (res?.success) {
        notify('Đã lưu điểm thực tập tốt nghiệp thành công!')
      } else {
        alert('Lưu điểm thất bại!')
      }
    } catch (e) {
      console.error(e)
      alert('Lưu điểm thất bại!')
    } finally {
      setSavingTttn(false)
    }
  }

  const anyValid = tttnScores.some((row) => row.score !== '' && !Number.isNaN(Number.parseFloat(row.score)))
  const selectedTttn = tttnScores.find((row) => row.id === selectedTttnId) ?? tttnScores[0]
  const filledCount = tttnScores.filter((row) => row.score !== '').length

  return (
    <>
      <TeacherSectionHeader
        title="Chấm điểm"
        description="Một màn hình gộp cả chấm điểm TTTN và chấm điểm hội đồng ĐATN theo kiểu trình bày của bộ giao diện tham chiếu."
        actions={
          <TeacherPill tone="orange">Quy trình chấm điểm</TeacherPill>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TeacherStatCard title="TTTN" value={`${tttnScores.length}`} hint="Sinh viên đang chờ chấm" accent="blue" />
        <TeacherStatCard title="Hội đồng" value={`${councilList.length}`} hint="Phiên chấm đang mở" accent="green" />
        <TeacherStatCard title="Đã lưu" value="04" hint="Bài đã ghi nhận kết quả" accent="orange" />
        <TeacherStatCard title="Tiến độ" value="78%" hint="Khối lượng chấm của tuần" accent="violet" />
      </div>

      <section className="mb-5 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#1976D2] shadow-sm ring-1 ring-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Bảng chấm tập trung
            </div>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              Chuyển giữa TTTN và ĐATN, nhập điểm trực tiếp trên bảng và giữ mọi thao tác trong một luồng duy nhất như thiết kế gốc.
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-105">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Chấm nhanh</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">1 click</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Điểm hợp lệ</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">0 - 10</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Tự động lưu</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">Khi bấm Lưu</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TeacherCard className="p-5">
          <div className="text-xs text-slate-500">TTTN đã nhập</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{filledCount}/{tttnScores.length}</div>
          <div className="mt-2 text-sm text-slate-500">Các dòng đã có điểm tổng</div>
        </TeacherCard>
        <TeacherCard className="p-5">
          <div className="text-xs text-slate-500">Phiên hội đồng</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{selectedCouncil?.code || '—'}</div>
          <div className="mt-2 text-sm text-slate-500">{selectedCouncil?.room || '—'}</div>
        </TeacherCard>
        <TeacherCard className="p-5">
          <div className="text-xs text-slate-500">Sinh viên đang xem</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{selectedTttn?.id || '—'}</div>
          <div className="mt-2 text-sm text-slate-500">{selectedTttn?.name || '—'}</div>
        </TeacherCard>
        <TeacherCard className="p-5">
          <div className="text-xs text-slate-500">Trạng thái lưu</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Tự động</div>
          <div className="mt-2 text-sm text-slate-500">Khi bấm nút lưu</div>
        </TeacherCard>
      </div>

      <div className="mb-5 flex flex-wrap gap-2 rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <button
          type="button"
          onClick={() => setMode('tttn')}
          className={`inline-flex items-center gap-2 rounded-[20px] px-4 py-2.5 text-sm font-medium transition ${mode === 'tttn' ? 'bg-[#2196F3] text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Trophy />
          Chấm điểm TTTN
        </button>
        <button
          type="button"
          onClick={() => setMode('council')}
          className={`inline-flex items-center gap-2 rounded-[20px] px-4 py-2.5 text-sm font-medium transition ${mode === 'council' ? 'bg-[#2196F3] text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Users />
          Chấm điểm Hội đồng ĐATN
        </button>
      </div>

      {mode === 'tttn' ? (
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <TeacherCard>
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Chấm điểm TTTN</div>
                <div className="text-xs text-slate-500">Nhập điểm tổng trực tiếp trên bảng</div>
              </div>
              <TeacherPill tone="blue">Đợt TTTN HK2/2025-2026</TeacherPill>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 text-left">MSSV</th>
                  <th className="px-5 py-3 text-left">Họ tên</th>
                  <th className="px-5 py-3 text-left">Công ty</th>
                  <th className="px-5 py-3 text-left">Điểm tổng</th>
                </tr>
              </thead>
              <tbody>
                {tttnScores.map((row, index) => (
                  <tr key={row.id} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${selectedTttnId === row.id ? 'bg-blue-50/60' : ''}`}>
                    <td className="px-5 py-4 font-medium text-[#1976D2]">{row.id}</td>
                    <td className="px-5 py-4 text-slate-900">{row.name}</td>
                    <td className="px-5 py-4 text-slate-600">{row.company}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          value={row.score}
                          onChange={(e) => updateTttn(index, e.target.value)}
                          onFocus={() => setSelectedTttnId(row.id)}
                          placeholder="0.0 - 10.0"
                          className={`${TeacherInputClass()} w-28`}
                        />
                        <TeacherButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setSelectedTttnId(row.id)}>
                          Xem
                        </TeacherButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
              <div className="text-xs text-slate-500">Điểm chỉ được lưu khi hợp lệ từ 0 đến 10.</div>
              <TeacherButton variant="primary" disabled={!anyValid || savingTttn} onClick={handleSaveTttn}>
                <span className="inline-flex items-center gap-2"><Save className="h-4 w-4" /> {savingTttn ? 'Đang lưu...' : 'Lưu điểm'}</span>
              </TeacherButton>
            </div>
          </TeacherCard>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <div className="text-sm font-semibold text-slate-900">Quy tắc chấm nhanh</div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Điểm hợp lệ từ 0 đến 10</div>
                <div className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4 text-[#1976D2]" /> Nhập trực tiếp trên bảng</div>
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#1976D2]" /> Mỗi SV có một dòng dữ liệu</div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <div className="text-sm font-semibold text-slate-900">Sinh viên đang chọn</div>
              <div className="mt-4 rounded-[22px] bg-white/90 p-4">
                <div className="text-xs text-slate-500">Hồ sơ nhanh</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{selectedTttn?.name}</div>
                <div className="mt-1 text-sm text-slate-600">{selectedTttn?.company}</div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#1976D2]" /> Điểm hiện tại: {selectedTttn?.score || 'Chưa nhập'}</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#1976D2]" /> Chờ xác nhận hội đồng</div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <div className="text-sm font-semibold text-slate-900">Trạng thái phiên</div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#1976D2]" /> {tttnScores.filter((row) => row.score).length} / {tttnScores.length} sinh viên đã có điểm</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#1976D2]" /> Cập nhật lần cuối: vừa xong</div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#1976D2]" /> Giao diện đang ở chế độ chấm nhanh</div>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
          <TeacherCard className="p-5">
            <div className="text-sm font-semibold text-slate-900">Hội đồng ĐATN</div>
            <div className="mt-4 space-y-3">
              {councilList.map((council) => {
                const active = selectedCouncil?.code === council.code
                return (
                  <button
                    key={council.code}
                    type="button"
                        onClick={() => { setSelectedCouncil(council); setSelectedGroup(null) }}
                    className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${active ? 'border-[#2196F3] bg-[#eff6ff]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{council.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{council.date}</div>
                        <div className="mt-1 text-xs text-slate-500">{council.room}</div>
                      </div>
                      <TeacherPill tone={active ? 'blue' : 'slate'}>{council.role}</TeacherPill>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <Clock />
                      {council.done}/{council.total} nhóm đã chấm
                    </div>
                      {/* show groups inside the council card for quick scan */}
                      <div className="mt-3 space-y-2 text-sm">
                        {(council.groups || []).map((g) => (
                          <div
                            key={g.groupCode}
                            role="button"
                            onClick={() => { setSelectedCouncil(council); setSelectedGroup(g); setShowScoringModal(true) }}
                            className="flex items-center justify-between gap-3 rounded-md bg-white p-3 ring-1 ring-slate-100 hover:bg-slate-50 cursor-pointer"
                          >
                            <div>
                              <div className="font-medium text-slate-800">Nhóm {g.groupCode}</div>
                              <div className="text-xs text-slate-500">{g.topic}</div>
                            </div>
                            <div className="text-xs text-slate-500">{(g.students || []).length} SV</div>
                          </div>
                        ))}
                      </div>
                  </button>
                )
              })}
            </div>
          </TeacherCard>

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Chấm điểm hội đồng</div>
                  <div className="text-xs text-slate-500">Thang điểm và vai trò được hiển thị như thiết kế mẫu</div>
                  <div className="text-xs text-slate-400">debug: groups={selectedCouncil?.groups?.length ?? 0}</div>
              </div>
              <TeacherPill tone="green">Đang chấm</TeacherPill>
            </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-5 py-3 text-left">Mã nhóm</th>
                      <th className="px-5 py-3 text-left">Tên đề tài</th>
                      <th className="px-5 py-3 text-left">Thành viên nhóm</th>
                      <th className="px-5 py-3 text-left">GVHD</th>
                      <th className="px-5 py-3 text-left">Trạng thái</th>
                      <th className="px-5 py-3 text-left">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedCouncil?.groups || []).map((g) => {
                      const membersStr = (g.students || []).map((s) => `${s.id} - ${s.name}`).join(', ')
                      const hasScore = (g.students || []).some((s) => !!(scoreList.find((r) => r.id === s.id)?.member))
                      return (
                        <tr key={g.groupCode} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                          <td className="px-5 py-4">
                            <button type="button" onClick={() => { setSelectedGroup(g); setSelectedCouncil(selectedCouncil); setShowScoringModal(true) }} className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs text-[#1976D2] hover:bg-slate-100">
                              {g.groupCode}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-slate-900">
                            <div className="text-sm text-[#1976D2]">{g.topic}</div>
                            <div className="text-xs text-slate-500"></div>
                          </td>
                          <td className="px-5 py-4 text-slate-700 max-w-[320px] truncate">{membersStr}</td>
                          <td className="px-5 py-4 text-slate-700">{selectedCouncil?.members?.[0]?.name ?? '—'}</td>
                          <td className="px-5 py-4">
                            {hasScore ? <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 text-emerald-700 text-xs">Đã chấm</span> : <span className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-2 py-1 text-amber-700 text-xs">Chưa chấm</span>}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <TeacherButton variant={hasScore ? 'secondary' : 'primary'} onClick={() => { setSelectedGroup(g); setSelectedCouncil(selectedCouncil); setShowScoringModal(true) }}>
                                {hasScore ? 'Chấm lại' : 'Vào chấm điểm'}
                              </TeacherButton>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
              <div className="text-xs text-slate-500">Điểm theo từng vai trò của hội đồng sẽ được cập nhật khi bạn vào phiên chấm.</div>
            </div>
          </section>

          {/* Chi tiết phiên chấm removed as requested */}
        </div>
      )}

      {toast && (
        <div className="fixed right-6 top-20 z-50 rounded-2xl bg-emerald-500 px-4 py-3 text-sm text-white shadow-lg">
          ✓ {toast}
        </div>
      )}

      {showScoringModal && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowScoringModal(false)} />
          <div className="relative w-[95%] max-w-5xl rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">Chấm điểm hội đồng — Nhóm {selectedGroup.groupCode}</div>
                <div className="text-sm text-slate-500">{selectedGroup.topic}</div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowScoringModal(false)} className="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">Đóng</button>
              </div>
            </div>
            <ScoringTable
              groupId={selectedGroup.id || selectedGroup.groupCode}
              students={(selectedGroup.students || []).map((s) => ({ id: s.id, name: s.name }))}
              canEditReport={selectedCouncil?.members?.some((m) => m.role.toLowerCase().includes('hướng dẫn') || m.role.toLowerCase().includes('phản biện')) || selectedCouncil?.role === 'GVPB'}
            />
          </div>
        </div>
      )}
    </>
  )
}
