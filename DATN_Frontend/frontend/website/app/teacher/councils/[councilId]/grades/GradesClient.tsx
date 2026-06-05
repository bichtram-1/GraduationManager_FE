"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TeacherSectionHeader, TeacherPill } from '../../../_components/TeacherShell'

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

const mockStudents: Student[] = [
  { id: 's1', studentId: 'SV001', name: 'Nguyễn A', clazz: 'CNTT01', topic: 'Topic A', group: 'Nhóm 1', scores: { presentation: 2.5, demo: 4.0, defense: 1.5, report: 7.0 }, status: 'Published' },
  { id: 's2', studentId: 'SV002', name: 'Trần B', clazz: 'CNTT01', topic: 'Topic B', group: 'Nhóm 1', scores: { presentation: 2.0, demo: 3.5, defense: 1.0, report: 6.0 }, status: 'Draft' },
  { id: 's3', studentId: 'SV003', name: 'Lê C', clazz: 'CNTT02', topic: 'Topic C', group: 'Nhóm 2', scores: { presentation: 3.0, demo: 5.0, defense: 2.0, report: 8.5 }, status: 'Published' },
]

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
  const [query, setQuery] = useState('')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [students] = useState<Student[]>(mockStudents)

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
    return +(comp + report).toFixed(2)
  }

  const exportCSV = () => {
    const headers = ['Mã SV', 'Họ tên', 'Lớp', 'Đề tài', 'Thuyết trình', 'Demo', 'Vấn đáp', 'Tổng thành phần', 'Điểm báo cáo', 'Điểm tổng', 'Trạng thái']
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
        title="Danh sách sinh viên"
        description="Sắp xếp theo nhóm; mở nhóm để xem chi tiết."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="px-3 py-1 border rounded">Quay lại</button>
            <button onClick={exportCSV} className="px-3 py-1 bg-green-600 text-white rounded">Export CSV</button>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm mã SV hoặc tên"
          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 pl-3 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white w-80"
        />
      </div>

      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([group, items]) => (
          <div key={String(group)} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <button onClick={() => toggleGroup(String(group))} className="w-full text-left px-0 py-2 flex justify-between items-center">
              <div>
                <div className="font-medium">{group}</div>
                <div className="text-sm text-gray-500">{items.length} sinh viên</div>
              </div>
              <div className="text-sm text-gray-600">{openGroups[String(group)] ? 'Ẩn' : 'Mở'}</div>
            </button>
            {openGroups[String(group)] && (
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-245 w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-5 py-3 text-left">Mã SV</th>
                        <th className="px-5 py-3 text-left">Họ tên</th>
                        <th className="px-5 py-3 text-left">Lớp</th>
                        <th className="px-5 py-3 text-left">Đề tài</th>
                        <th className="px-5 py-3 text-right">Thuyết trình (0-3)</th>
                        <th className="px-5 py-3 text-right">Demo (0-5)</th>
                        <th className="px-5 py-3 text-right">Vấn đáp (0-2)</th>
                        <th className="px-5 py-3 text-right">Tổng thành phần</th>
                        <th className="px-5 py-3 text-right">Điểm báo cáo</th>
                        <th className="px-5 py-3 text-right">Điểm tổng</th>
                        <th className="px-5 py-3 text-left">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((s) => (
                        <tr key={s.id} className={`border-t border-slate-100 transition hover:bg-slate-50/80`}>
                          <td className="px-5 py-4">{s.studentId}</td>
                          <td className="px-5 py-4">{s.name}</td>
                          <td className="px-5 py-4">{s.clazz}</td>
                          <td className="px-5 py-4 text-slate-900">{s.topic}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex w-20 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50">{(s.scores.presentation ?? 0).toFixed(2)}</div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex w-20 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50">{(s.scores.demo ?? 0).toFixed(2)}</div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex w-20 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50">{(s.scores.defense ?? 0).toFixed(2)}</div>
                          </td>
                          <td className="px-5 py-4 text-right font-semibold">{computeComponentTotal(s)}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex w-24 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50">{(s.scores.report ?? 0).toFixed(2)}</div>
                          </td>
                          <td className="px-5 py-4 text-right font-semibold">{computeTotalScore(s)}</td>
                          <td className="px-5 py-4">
                            <TeacherPill tone={s.status === 'Published' ? 'green' : 'orange'}>{s.status}</TeacherPill>
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
    </div>
  )
}
