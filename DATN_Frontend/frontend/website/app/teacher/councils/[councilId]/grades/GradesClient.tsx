"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TeacherSectionHeader, TeacherPill } from '../../../_components/TeacherShell'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { teacherApi } from '@/lib/api/teacherApi'

type Student = {
  id: string
  studentId: string
  name: string
  clazz: string
  topic: string
  group: string
  scores: {
    presentation: number // 0-3
    demo: number // 0-5
    defense: number // 0-2
    report: number // report score
  }
  status: string
}

function groupBy<T, K extends string | number>(items: T[], keyFn: (t: T) => K) {
  const map = new Map<K, T[]>()
  items.forEach((it) => {
    const k = keyFn(it)
    const arr = map.get(k) || []
    arr.push(it)
    map.set(k, arr)
  })
  return map
}

export default function GradesClient({ councilId }: { councilId: string }) {
  const router = useRouter()
  const { selectedPeriod } = usePeriod()
  const [query, setQuery] = useState('')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [councilName, setCouncilName] = useState('')

  useEffect(() => {
    let mounted = true
    async function loadData() {
      setLoading(true)
      try {
        const data = await teacherApi.getGradingData({ periodId: selectedPeriod?.id })
        if (!mounted) return
        
        if (data?.councilGroups) {
          const matchedCouncil = data.councilGroups.find((c: any) => c.code === councilId)
          if (matchedCouncil) {
            setCouncilName(matchedCouncil.name)
            const groups = matchedCouncil.groups || []
            
            const scoresPromises = groups.map(async (g: any) => {
              try {
                const res = await teacherApi.getScores(g.id)
                if (res?.success && res?.data?.rows) {
                  return res.data.rows.map((row: any) => ({
                    id: row.id,
                    studentId: row.id,
                    name: row.name,
                    clazz: row.class || '—',
                    topic: g.topic,
                    group: g.groupCode || `Nhóm #${g.id}`,
                    scores: {
                      presentation: row.presentation !== null ? parseFloat(row.presentation) : 0,
                      demo: row.demo !== null ? parseFloat(row.demo) : 0,
                      defense: row.qna !== null ? parseFloat(row.qna) : 0,
                      report: row.report !== null ? parseFloat(row.report) : 0,
                    },
                    status: (row.presentation !== null || row.demo !== null || row.qna !== null) ? 'Published' : 'Draft'
                  }))
                }
              } catch (err) {
                console.error('Error fetching scores for group:', g.id, err)
              }
              
              // Fallback map
              return (g.students || []).map((s: any) => ({
                id: s.id,
                studentId: s.id,
                name: s.name,
                clazz: s.class || '—',
                topic: g.topic,
                group: g.groupCode || `Nhóm #${g.id}`,
                scores: { presentation: 0, demo: 0, defense: 0, report: 0 },
                status: 'Draft'
              }))
            })
            
            const groupsStudents = await Promise.all(scoresPromises)
            if (mounted) {
              setStudents(groupsStudents.flat())
            }
          } else {
            setStudents([])
          }
        } else {
          setStudents([])
        }
      } catch (err) {
        console.error('Error loading grades:', err)
        if (mounted) setStudents([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [selectedPeriod?.id, councilId])

  const filtered = students.filter((s) => (query ? `${s.studentId} ${s.name} ${s.topic}`.toLowerCase().includes(query.toLowerCase()) : true))
  const grouped = groupBy(filtered, (s) => s.group)

  const toggleGroup = (g: string) => setOpenGroups((p) => ({ ...p, [g]: !p[g] }))

  const computeComponentTotal = (s: Student) => {
    const a = s.scores.presentation ?? 0
    const b = s.scores.demo ?? 0
    const c = s.scores.defense ?? 0
    return +(a + b + c).toFixed(2)
  }

  const computeTotalScore = (s: Student) => {
    const comp = computeComponentTotal(s)
    const report = s.scores.report ?? 0
    return +(comp * 0.8 + report * 0.2).toFixed(2)
  }

  const exportCSV = () => {
    const headers = ['Mã SV', 'Họ tên', 'Lớp', 'Đề tài', 'Thuyết trình', 'Demo', 'Vấn đáp', 'Tổng thành phần (Hội đồng)', 'Điểm báo cáo (GVHD)', 'Điểm tổng kết', 'Trạng thái']
    const rows = students.map((s) => [
      s.studentId,
      s.name,
      s.clazz,
      s.topic,
      s.scores.presentation ?? '',
      s.scores.demo ?? '',
      s.scores.defense ?? '',
      computeComponentTotal(s),
      s.scores.report ?? '',
      computeTotalScore(s),
      s.status,
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `council-${councilId}-grades.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <TeacherSectionHeader
        title={councilName || `Hội đồng ${councilId}`}
        description="Sắp xếp theo nhóm; mở nhóm để xem chi tiết bảng điểm thực tế."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="px-4 py-2 border rounded-2xl bg-white hover:bg-slate-50 transition text-sm font-medium">Quay lại</button>
            <button onClick={exportCSV} className="px-4 py-2 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 shadow-md shadow-emerald-100 transition text-sm font-medium">Xuất CSV</button>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm mã SV hoặc tên hoặc đề tài..."
          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 pl-3 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white w-80 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-500">Đang tải bảng điểm hội đồng...</div>
      ) : students.length > 0 ? (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([group, items]) => (
            <div key={String(group)} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <button onClick={() => toggleGroup(String(group))} className="w-full text-left px-0 py-2 flex justify-between items-center outline-none">
                <div>
                  <div className="font-semibold text-slate-800 text-base">{group}</div>
                  <div className="text-sm text-slate-500 mt-1">{items.length} sinh viên</div>
                </div>
                <div className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  {openGroups[String(group)] ? 'Thu gọn ▲' : 'Chi tiết ▼'}
                </div>
              </button>
              {openGroups[String(group)] && (
                <div className="p-0 mt-4 border-t border-slate-100 pt-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-245 w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                          <th className="px-5 py-3 text-left">Mã SV</th>
                          <th className="px-5 py-3 text-left">Họ tên</th>
                          <th className="px-5 py-3 text-left">Lớp</th>
                          <th className="px-5 py-3 text-left">Đề tài</th>
                          <th className="px-5 py-3 text-right">Thuyết trình (0-3)</th>
                          <th className="px-5 py-3 text-right">Demo (0-5)</th>
                          <th className="px-5 py-3 text-right">Vấn đáp (0-2)</th>
                          <th className="px-5 py-3 text-right">Tổng HĐ (0-10)</th>
                          <th className="px-5 py-3 text-right">Báo cáo GVHD (0-10)</th>
                          <th className="px-5 py-3 text-right">Tổng kết (0-10)</th>
                          <th className="px-5 py-3 text-left">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((s) => (
                          <tr key={s.id} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                            <td className="px-5 py-4 font-semibold text-slate-800">{s.studentId}</td>
                            <td className="px-5 py-4 text-slate-900 font-medium">{s.name}</td>
                            <td className="px-5 py-4 text-slate-700">{s.clazz}</td>
                            <td className="px-5 py-4 text-slate-900">{s.topic}</td>
                            <td className="px-5 py-4 text-right">
                              <div className="inline-flex w-16 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50 text-slate-700 font-medium">{(s.scores.presentation ?? 0).toFixed(1)}</div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="inline-flex w-16 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50 text-slate-700 font-medium">{(s.scores.demo ?? 0).toFixed(1)}</div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="inline-flex w-16 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50 text-slate-700 font-medium">{(s.scores.defense ?? 0).toFixed(1)}</div>
                            </td>
                            <td className="px-5 py-4 text-right font-bold text-slate-900">{computeComponentTotal(s).toFixed(1)}</td>
                            <td className="px-5 py-4 text-right">
                              <div className="inline-flex w-20 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50 text-slate-700 font-medium">{(s.scores.report ?? 0).toFixed(1)}</div>
                            </td>
                            <td className="px-5 py-4 text-right font-extrabold text-blue-600 text-base">{computeTotalScore(s).toFixed(1)}</td>
                            <td className="px-5 py-4">
                              <TeacherPill tone={s.scores.presentation !== 0 || s.scores.demo !== 0 ? 'green' : 'orange'}>
                                {s.scores.presentation !== 0 || s.scores.demo !== 0 ? 'Đã nhập' : 'Chưa nhập'}
                              </TeacherPill>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-slate-500">
          Không tìm thấy sinh viên nào trong hội đồng này.
        </div>
      )}
    </div>
  )
}
