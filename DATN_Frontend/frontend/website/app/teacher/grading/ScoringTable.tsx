import React, { useMemo, useState, useEffect } from 'react'
import { TeacherButton, TeacherInputClass } from '../_components/TeacherUI'
import { teacherApi } from '@/lib/api/teacherApi'

type Student = { id: string; name: string; class?: string }
type Score = { presentation: number | null; demo: number | null; qna: number | null; report: number | null }

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export default function ScoringTable({
  groupId,
  students,
  canEditReport,
  reportMax = 10,
}: {
  groupId: string
  students: Student[]
  canEditReport: boolean
  reportMax?: number
}) {
  const initial = students.map((m) => ({ member: m, score: { presentation: null, demo: null, qna: null, report: null } as Score }))
  const [rows, setRows] = useState(initial)

  const update = (index: number, next: Partial<Score>) => {
    setRows((cur) => cur.map((r, i) => (i === index ? { ...r, score: { ...r.score, ...next } } : r)))
  }

  const computeTotalComp = (s: Score) => (s.presentation || 0) + (s.demo || 0) + (s.qna || 0)

  const avg = useMemo(() => {
    if (!rows.length) return { avgComp: 0, avgReport: 0 }
    const comps = rows.map((r) => computeTotalComp(r.score))
    // average report only over non-null reports
    const reportValues = rows.map((r) => r.score.report).filter((v) => v != null) as number[]
    const avgComp = comps.reduce((a, b) => a + b, 0) / rows.length
    const avgReport = reportValues.length ? reportValues.reduce((a, b) => a + b, 0) / reportValues.length : 0
    return { avgComp, avgReport }
  }, [rows])

  const finalGroup = Math.round((avg.avgComp * 0.8 + avg.avgReport * 0.2) * 100) / 100

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // initialize rows when students change
    setRows(students.map((m) => ({ member: m, score: { presentation: null, demo: null, qna: null, report: null } as Score })))
  }, [students])

  useEffect(() => {
    // load saved scores by groupId
    let mounted = true
    async function load() {
      if (!groupId) return
      setLoading(true)
      try {
        const j = await teacherApi.getScores(groupId)
        if (!mounted) return
        if (j?.data?.rows) {
          const loaded = j.data.rows as { id: string; presentation?: number | null; demo?: number | null; qna?: number | null; report?: number | null }[]
          setRows((cur) => cur.map((r) => {
            const found = loaded.find((x) => x.id === r.member.id)
            if (!found) return r
            return { ...r, score: { presentation: found.presentation ?? null, demo: found.demo ?? null, qna: found.qna ?? null, report: found.report ?? null } }
          }))
        }
      } catch (_) {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [groupId])

  async function save() {
    const payload = rows.map((r) => ({ id: r.member.id, ...r.score }))
    setLoading(true)
    try {
      const res = await teacherApi.saveScores(groupId, payload)
      if (res?.ok || res?.success) {
        alert('Lưu thành công.')
      } else {
        alert('Lưu thất bại.')
      }
    } catch (_) {
      alert('Lưu thất bại.')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">Danh sách sinh viên</div>
          <div className="text-xs text-slate-500">Nhập điểm theo vai trò của bạn trong hội đồng</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 px-2 py-1 text-xs">Đang chấm</div>
          <TeacherButton onClick={() => save()}>{loading ? 'Đang lưu...' : 'Lưu điểm'}</TeacherButton>
        </div>
      </div>

      <div className="overflow-auto rounded-md border border-slate-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 text-left">MSSV</th>
              <th className="px-5 py-3 text-left">Họ tên</th>
              <th className="px-5 py-3 text-left">Lớp</th>
              <th className="px-5 py-3 text-left">Thuyết trình (0-3)</th>
              <th className="px-5 py-3 text-left">Demo (0-5)</th>
              <th className="px-5 py-3 text-left">Vấn đáp (0-2)</th>
              <th className="px-5 py-3 text-left">Tổng thành phần</th>
              <th className="px-5 py-3 text-left">Điểm báo cáo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const s = r.score
              const comp = computeTotalComp(s)
              return (
                <tr key={r.member.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-medium text-[#1976D2]">{r.member.id}</td>
                  <td className="px-5 py-4 text-slate-900">{r.member.name}</td>
                  <td className="px-5 py-4 text-slate-700">{r.member.class ?? '—'}</td>
                  <td className="px-5 py-4"><input className={TeacherInputClass('w-20')} value={s.presentation ?? ''} onChange={(e) => update(i, { presentation: e.target.value === '' ? null : clamp(Number(e.target.value), 0, 3) })} /></td>
                  <td className="px-5 py-4"><input className={TeacherInputClass('w-20')} value={s.demo ?? ''} onChange={(e) => update(i, { demo: e.target.value === '' ? null : clamp(Number(e.target.value), 0, 5) })} /></td>
                  <td className="px-5 py-4"><input className={TeacherInputClass('w-20')} value={s.qna ?? ''} onChange={(e) => update(i, { qna: e.target.value === '' ? null : clamp(Number(e.target.value), 0, 2) })} /></td>
                  <td className="px-5 py-4">{comp}</td>
                  <td className="px-5 py-4"><input disabled={!canEditReport} className={`${TeacherInputClass('w-20')} ${!canEditReport ? 'opacity-60' : ''}`} value={s.report ?? ''} onChange={(e) => update(i, { report: e.target.value === '' ? null : clamp(Number(e.target.value), 0, reportMax) })} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-sm text-slate-700">Trung bình thành phần: {Math.round(avg.avgComp * 100) / 100} — Avg báo cáo: {Math.round(avg.avgReport * 100) / 100} — Điểm tổng nhóm: <strong>{finalGroup}</strong></div>
    </div>
  )
}
