'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Save, Trophy, Users, LayoutDashboard, FileText, BarChart3, Sparkles, CalendarDays, Building2 } from 'lucide-react'
import { TeacherPill, TeacherSectionHeader, TeacherStatCard } from '../_components/TeacherShell'
import { TeacherButton, TeacherCard, TeacherInputClass } from '../_components/TeacherUI'
import ScoringTable from './ScoringTable'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { teacherApi } from '@/lib/api/teacherApi'

// Default fallbacks (used if mock API is unavailable)
const defaultTttnRows = [
  { id: '20520001', name: 'Nguyễn Văn A', class: 'KTPM2022', dob: '15/01/2004', company: 'FPT Software', score: '8.8' },
  { id: '20520002', name: 'Trần Thị B', class: 'KTPM2022', dob: '22/03/2004', company: 'VNG Corp', score: '7.8' },
  { id: '20520004', name: 'Phạm Thị D', class: 'KHMT2022', dob: '10/07/2003', company: 'Chưa có công ty thực tập', score: '' },
  { id: '20520006', name: 'Vũ Thị F', class: 'HTTT2022', dob: '12/12/2004', company: 'MoMo', score: '9.2' },
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

type CouncilMember = { id: string; name: string; role: string }
type GroupStudent = { id: string; name: string; class?: string }
interface CouncilGroupItem {
  id?: string
  groupCode: string
  topic: string
  advisorId?: string | null
  advisorName?: string | null
  reviewerId?: string | null
  students: GroupStudent[]
}
interface Council {
  code: string
  name: string
  date: string
  room: string
  role: string
  done: number
  total: number
  members: CouncilMember[]
  groups: CouncilGroupItem[]
}

export default function TeacherGradingPage() {
  const formatVietnamTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    let hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    const strHours = String(hours).padStart(2, '0')
    return `${strHours}:${minutes} ${ampm} ${day}/${month}/${year}`
  }

  const { selectedPeriod, gradingTab, setGradingTab } = usePeriod()
  const [tttnScores, setTttnScores] = useState(defaultTttnRows)
  const [toast, setToast] = useState<string | null>(null)
  const [selectedCouncil, setSelectedCouncil] = useState<Council | null>(defaultCouncilGroups[0] as any)
  const [selectedGroup, setSelectedGroup] = useState<CouncilGroupItem | null>(null)
  const [selectedTttnId, setSelectedTttnId] = useState(defaultTttnRows[0].id)
  const [councilList, setCouncilList] = useState<Council[]>(defaultCouncilGroups as any)
  const [currentTeacherId, setCurrentTeacherId] = useState<string>('')
  const [scoreList, setScoreList] = useState(defaultScoreRows)
  const [_loading, setLoading] = useState(false)
  const [showScoringModal, setShowScoringModal] = useState(false)
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Chưa cập nhật')
  const [datnFilter, setDatnFilter] = useState<'all' | 'graded' | 'grading' | 'ungraded'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'reviewer' | 'member' | 'advisor'>('all')

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
          if (data.teacherId) {
            setCurrentTeacherId(String(data.teacherId))
          }
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
          if (data.lastUpdatedAt) {
            setLastUpdatedTime(formatVietnamTime(new Date(data.lastUpdatedAt.replace(/-/g, '/'))))
          } else {
            setLastUpdatedTime('Chưa cập nhật')
          }
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

  // Listen for realtime score updates to re-fetch
  useEffect(() => {
    const handleRealtimeUpdate = () => {
      teacherApi.getGradingData({ periodId: selectedPeriod?.id })
        .then((data) => {
          if (data) {
            setTttnScores(data.tttnRows ?? defaultTttnRows)
            setCouncilList(data.councilGroups ?? defaultCouncilGroups)
            setScoreList(data.scoreRows ?? defaultScoreRows)
            if (data.lastUpdatedAt) {
              setLastUpdatedTime(formatVietnamTime(new Date(data.lastUpdatedAt.replace(/-/g, '/'))))
            } else {
              setLastUpdatedTime('Chưa cập nhật')
            }
          }
        })
        .catch(() => {})
    }

    window.addEventListener('realtime-score-updated', handleRealtimeUpdate)
    return () => {
      window.removeEventListener('realtime-score-updated', handleRealtimeUpdate)
    }
  }, [selectedPeriod?.id])

  const isPeriodEditable = () => {
    if (!selectedPeriod) return false
    if (selectedPeriod.status === 'closed') return false

    if (selectedPeriod.endDate) {
      const parts = selectedPeriod.endDate.split('/')
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1
        const year = parseInt(parts[2], 10)
        const endDateObj = new Date(year, month, day, 23, 59, 59)
        return new Date() <= endDateObj
      }
      
      const parsedDate = new Date(selectedPeriod.endDate)
      if (!isNaN(parsedDate.getTime())) {
        return new Date() <= parsedDate
      }
    }
    return true
  }

  const editable = isPeriodEditable()

  const formatGradingInput = (value: string) => {
    let clean = value.replace(/[^0-9.]/g, '')
    
    if (clean.includes('.')) {
      const parts = clean.split('.')
      if (parts.length > 2) {
        clean = parts[0] + '.' + parts.slice(1).join('')
      }
      const dec = parts[1] || ''
      if (dec.length > 2) {
        clean = parts[0] + '.' + dec.substring(0, 2)
      }
      return clean
    }
    
    if (clean.length === 2) {
      const val = parseInt(clean, 10)
      if (val > 10 || clean[0] === '0') {
        return clean[0] + '.' + clean[1]
      }
    } else if (clean.length === 3) {
      const val = parseInt(clean, 10)
      if (val === 100) {
        return '10.0'
      } else if (val > 100) {
        return clean[0] + '.' + clean.substring(1)
      }
    } else if (clean.length >= 4) {
      const val = parseInt(clean, 10)
      if (val >= 1000) {
        return '10.00'
      }
      return clean[0] + '.' + clean.substring(1, 3)
    }
    
    return clean
  }

  const updateTttn = (index: number, value: string) => {
    const formatted = formatGradingInput(value)
    if (formatted !== '') {
      const num = parseFloat(formatted)
      if (!isNaN(num) && (num < 0 || num > 10)) return
    }
    setTttnScores((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, score: formatted } : row)))
  }

  const [savingTttn, setSavingTttn] = useState(false)

  const handleSaveTttn = async () => {
    setSavingTttn(true)
    try {
      const payload = tttnScores.map(row => {
        let cleanScore = row.score;
        if (cleanScore !== '') {
          const parsed = parseFloat(cleanScore);
          cleanScore = isNaN(parsed) ? '' : parsed.toFixed(2);
        }
        return {
          id: row.id,
          score: cleanScore
        }
      })
      const res = await teacherApi.saveTttnScores({
        periodId: selectedPeriod?.id,
        scores: payload
      })
      if (res?.success) {
        notify('Đã lưu điểm thực tập tốt nghiệp thành công!')
        setLastUpdatedTime(formatVietnamTime(new Date()))
        window.dispatchEvent(new CustomEvent('realtime-score-updated'))
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

  // Calculate statistics
  const totalStudents = tttnScores.length
  let countXuatSac = 0
  let countGioi = 0
  let countKha = 0
  let countTrungBinh = 0
  let countKem = 0

  tttnScores.forEach(s => {
    if (s.score !== '') {
      const val = parseFloat(s.score)
      if (!isNaN(val)) {
        if (val >= 9.0) countXuatSac++
        else if (val >= 8.0) countGioi++
        else if (val >= 7.0) countKha++
        else if (val >= 5.0) countTrungBinh++
        else countKem++
      }
    }
  })

  const getPercent = (count: number) => {
    if (totalStudents === 0) return '0%'
    return `${((count / totalStudents) * 100).toFixed(0)}%`
  }

  // Calculate DATN statistics
  const totalCouncils = councilList.length
  let advisingGroupsCount = 0
  let reviewingGroupsCount = 0

  councilList.forEach((c) => {
    (c.groups || []).forEach((g) => {
      if (g.advisorId === currentTeacherId) {
        advisingGroupsCount++
      }
      if (g.reviewerId === currentTeacherId) {
        reviewingGroupsCount++
      }
    })
  })

  return (
    <>
      <TeacherSectionHeader
        title="Chấm điểm"
        description="Chấm điểm TTTN sinh viên hướng dẫn và chấm điểm sinh viên trong Hội động tham gia."
        actions={
          <TeacherPill tone="orange">Quy trình chấm điểm</TeacherPill>
        }
      />

      {gradingTab === 'DATN' && (
        <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm text-center flex flex-col justify-center items-center">
            <div className="text-xs font-medium text-blue-600">Tổng hội đồng</div>
            <div className="mt-2 text-2xl font-bold text-blue-900">{totalCouncils}</div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm text-center flex flex-col justify-center items-center">
            <div className="text-xs font-medium text-emerald-600">Nhóm Hướng dẫn</div>
            <div className="mt-2 text-2xl font-bold text-emerald-900">{advisingGroupsCount}</div>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm text-center flex flex-col justify-center items-center">
            <div className="text-xs font-medium text-indigo-600">Nhóm Phản biên</div>
            <div className="mt-2 text-2xl font-bold text-indigo-900">{reviewingGroupsCount}</div>
          </div>
        </div>
      )}

      {gradingTab === 'TTTN' && (
        <div className="mb-6 grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm text-center flex flex-col justify-center items-center">
            <div className="text-xs font-medium text-blue-600">Tổng sinh viên</div>
            <div className="mt-2 text-2xl font-bold text-blue-900">{totalStudents}</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center flex flex-col justify-center items-center">
            <div className="text-xs font-medium text-emerald-600">Xuất sắc (9.0 - 10.0)</div>
            <div className="mt-2 text-xl font-bold text-emerald-700">{countXuatSac} ({getPercent(countXuatSac)})</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center flex flex-col justify-center items-center">
            <div className="text-xs font-medium text-teal-600">Giỏi (8.0 - 8.9)</div>
            <div className="mt-2 text-xl font-bold text-teal-700">{countGioi} ({getPercent(countGioi)})</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center flex flex-col justify-center items-center">
            <div className="text-xs font-medium text-indigo-600">Khá (7.0 - 7.9)</div>
            <div className="mt-2 text-xl font-bold text-indigo-700">{countKha} ({getPercent(countKha)})</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center flex flex-col justify-center items-center">
            <div className="text-xs font-medium text-orange-600">Trung bình (5.0 - 6.9)</div>
            <div className="mt-2 text-xl font-bold text-orange-700">{countTrungBinh} ({getPercent(countTrungBinh)})</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center flex flex-col justify-center items-center">
            <div className="text-xs font-medium text-red-600">Kém (&lt; 5.0)</div>
            <div className="mt-2 text-xl font-bold text-red-700">{countKem} ({getPercent(countKem)})</div>
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2 rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <button
          type="button"
          onClick={() => setGradingTab('TTTN')}
          className={`inline-flex items-center gap-2 rounded-[20px] px-4 py-2.5 text-sm font-medium transition ${gradingTab === 'TTTN' ? 'bg-[#2196F3] text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Trophy />
          Chấm điểm TTTN
        </button>
        <button
          type="button"
          onClick={() => setGradingTab('DATN')}
          className={`inline-flex items-center gap-2 rounded-[20px] px-4 py-2.5 text-sm font-medium transition ${gradingTab === 'DATN' ? 'bg-[#2196F3] text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Users />
          Chấm điểm Hội đồng ĐATN
        </button>
      </div>

      {gradingTab === 'TTTN' ? (
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <TeacherCard>
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Chấm điểm TTTN</div>
                <div className="text-xs text-slate-500">Nhập điểm tổng trực tiếp trên bảng</div>
              </div>
              <div className="flex items-center gap-2">
                <TeacherPill tone="blue">{selectedPeriod?.name || 'Đợt TTTN'}</TeacherPill>
                {selectedPeriod?.status && (
                  <TeacherPill
                    tone={
                      selectedPeriod.status === 'open'
                        ? 'green'
                        : selectedPeriod.status === 'grading'
                        ? 'orange'
                        : selectedPeriod.status === 'published'
                        ? 'blue'
                        : 'slate'
                    }
                  >
                    {
                      selectedPeriod.status === 'open'
                        ? 'Mở đăng ký'
                        : selectedPeriod.status === 'grading'
                        ? 'Đang chấm điểm'
                        : selectedPeriod.status === 'published'
                        ? 'Đã công bố'
                        : 'Đã đóng'
                    }
                  </TeacherPill>
                )}
              </div>
            </div>
            {!editable && (
              <div className="mx-5 mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                ⚠️ Đợt thực tập này đã kết thúc thời gian chấm điểm hoặc đã đóng. Bạn không thể chỉnh sửa điểm.
              </div>
            )}
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 text-left w-12">STT</th>
                  <th className="px-5 py-3 text-left">MSSV</th>
                  <th className="px-5 py-3 text-left">Họ tên</th>
                  <th className="px-5 py-3 text-left">Lớp</th>
                  <th className="px-5 py-3 text-left">Điểm tổng</th>
                </tr>
              </thead>
              <tbody>
                {tttnScores.map((row, index) => (
                  <tr key={row.id} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${selectedTttnId === row.id ? 'bg-blue-50/60' : ''}`}>
                    <td className="px-5 py-4 text-slate-500 font-medium">{index + 1}</td>
                    <td className="px-5 py-4 font-medium text-[#1976D2]">{row.id}</td>
                    <td className="px-5 py-4 text-slate-900">{row.name}</td>
                    <td className="px-5 py-4 text-slate-600">{row.class}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          value={row.score}
                          onChange={(e) => updateTttn(index, e.target.value)}
                          onFocus={() => setSelectedTttnId(row.id)}
                          placeholder="0.00 - 10.00"
                          className={`${TeacherInputClass()} w-28`}
                          disabled={!editable}
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
              <TeacherButton variant="primary" disabled={!anyValid || savingTttn || !editable} onClick={handleSaveTttn}>
                <span className="inline-flex items-center gap-2"><Save className="h-4 w-4" /> {savingTttn ? 'Đang lưu...' : 'Lưu điểm'}</span>
              </TeacherButton>
            </div>
          </TeacherCard>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <div className="text-sm font-semibold text-slate-900">Sinh viên đang chọn</div>
              <div className="mt-4 rounded-[22px] bg-white/90 p-4">
                <div className="text-xs text-slate-500">Hồ sơ nhanh</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{selectedTttn?.name}</div>
                <div className="mt-1 text-sm text-slate-600">Lớp: {selectedTttn?.class}</div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#1976D2]" />
                    <span>Ngày sinh: {selectedTttn?.dob || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#1976D2]" />
                    <span className="truncate" title={selectedTttn?.company}>Công ty: {selectedTttn?.company || 'Chưa có công ty thực tập'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#1976D2]" />
                    <span>Điểm hiện tại: {selectedTttn?.score || 'Chưa nhập'}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <div className="text-sm font-semibold text-slate-900">Trạng thái phiên</div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#1976D2]" /> {tttnScores.filter((row) => row.score).length} / {tttnScores.length} sinh viên đã có điểm</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#1976D2]" /> Cập nhật lần cuối: {lastUpdatedTime}</div>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCouncil(council);
                              setSelectedGroup(g);
                              setShowScoringModal(true);
                            }}
                            className="flex items-center justify-between gap-3 rounded-md bg-white p-3 ring-1 ring-slate-100 hover:bg-slate-50 cursor-pointer"
                          >
                            <div>
                              <div className="font-medium text-slate-800">
                                {(g.students || []).map((s) => s.name).join(', ')}
                              </div>
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
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="reviewer">Đề tài Phản biện</option>
                  <option value="advisor">Đề tài Hướng dẫn</option>
                  <option value="member">Đề tài Ủy viên/Chủ tịch</option>
                </select>
                <select
                  value={datnFilter}
                  onChange={(e) => setDatnFilter(e.target.value as any)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Tất cả đề tài</option>
                  <option value="graded">Đã chấm</option>
                  <option value="grading">Đang chấm</option>
                  <option value="ungraded">Chưa chấm</option>
                </select>
                <TeacherPill tone="green">Đang chấm</TeacherPill>
              </div>
            </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-5 py-3 text-left w-12">STT</th>
                      <th className="px-5 py-3 text-left">Tên đề tài</th>
                      <th className="px-5 py-3 text-left">Thành viên nhóm</th>
                      <th className="px-5 py-3 text-left">GVHD</th>
                      <th className="px-5 py-3 text-left">Trạng thái</th>
                      <th className="px-5 py-3 text-left">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const list = (selectedCouncil?.groups || []).filter((g) => {
                        const gradedCount = (g.students || []).filter((s) => !!(scoreList.find((r) => r.id === s.id)?.member)).length;
                        const totalMembers = (g.students || []).length;
                        
                        let currentStatus: 'ungraded' | 'grading' | 'graded' = 'ungraded';
                        if (gradedCount === totalMembers && totalMembers > 0) {
                          currentStatus = 'graded';
                        } else if (gradedCount > 0) {
                          currentStatus = 'grading';
                        }

                        if (datnFilter !== 'all' && datnFilter !== currentStatus) return false;
                        
                        const isReviewer = g.reviewerId === currentTeacherId;
                        const isAdvisor = g.advisorId === currentTeacherId;
                        const isMember = selectedCouncil?.role === 'Ủy viên' || selectedCouncil?.role === 'Chủ tịch';
                        
                        if (roleFilter === 'reviewer' && !isReviewer) return false;
                        if (roleFilter === 'advisor' && !isAdvisor) return false;
                        if (roleFilter === 'member' && !isMember) return false;
                        return true;
                      });

                      if (list.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                              Không tìm thấy đề tài nào phù hợp với bộ lọc.
                            </td>
                          </tr>
                        );
                      }

                      return list.map((g, index) => {
                        const gradedCount = (g.students || []).filter((s) => !!(scoreList.find((r) => r.id === s.id)?.member)).length;
                        const totalMembers = (g.students || []).length;
                        
                        let statusBadge = (
                          <span className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-2 py-1 text-amber-700 text-xs">Chưa chấm</span>
                        );
                        let hasScore = false;
                        if (gradedCount === totalMembers && totalMembers > 0) {
                          statusBadge = (
                            <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 text-emerald-700 text-xs">Đã chấm</span>
                          );
                          hasScore = true;
                        } else if (gradedCount > 0) {
                          statusBadge = (
                            <span className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-2 py-1 text-blue-700 text-xs">Đang chấm</span>
                          );
                          hasScore = true;
                        }

                        return (
                          <tr key={g.groupCode} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                            <td className="px-5 py-4 text-slate-500 font-medium">{index + 1}</td>
                            <td className="px-5 py-4 text-slate-900">
                              <div className="text-sm font-semibold text-[#1976D2]">{g.topic}</div>
                            </td>
                            <td className="px-5 py-4 text-slate-700">
                              <div className="space-y-1">
                                {(g.students || []).map((s) => (
                                  <div key={s.id} className="text-xs">
                                    <span className="font-semibold text-slate-600">{s.id}</span> - <span className="text-slate-900">{s.name}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-700">{g.advisorName ?? '—'}</td>
                            <td className="px-5 py-4">
                              {statusBadge}
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
                      });
                    })()}
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
        <div className="fixed right-6 top-20 z-[9999] rounded-2xl bg-emerald-500 px-4 py-3 text-sm text-white shadow-lg">
          ✓ {toast}
        </div>
      )}

      {showScoringModal && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowScoringModal(false)} />
          <div className="relative w-[95%] max-w-5xl rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">Chấm điểm hội đồng</div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowScoringModal(false)} className="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">Đóng</button>
              </div>
            </div>
            <ScoringTable
              groupId={selectedGroup.id || selectedGroup.groupCode}
              students={(selectedGroup.students || []).map((s) => ({ id: s.id, name: s.name, class: s.class }))}
              canEditReport={selectedGroup.reviewerId === currentTeacherId || selectedGroup.advisorId === currentTeacherId}
              notify={(msg) => notify(msg)}
            />
          </div>
        </div>
      )}
    </>
  )
}
