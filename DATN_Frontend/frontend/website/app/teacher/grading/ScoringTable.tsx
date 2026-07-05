import React, { useMemo, useState, useEffect } from 'react'
import { TeacherButton, TeacherInputClass } from '../_components/TeacherUI'
import { teacherApi } from '@/lib/api/teacherApi'

type Student = { id: string; name: string; class?: string }
type Score = { presentation: string; demo: string; qna: string; report: string }

export default function ScoringTable({
  groupId,
  students,
  canEditReport,
  notify,
  reportMax = 10,
}: {
  groupId: string
  students: Student[]
  canEditReport: boolean
  notify: (msg: string) => void
  reportMax?: number
}) {
  const initial = students.map((m) => ({ member: m, score: { presentation: '', demo: '', qna: '', report: '' } as Score }))
  const [rows, setRows] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const formatTotalScore = (val: number): string => {
    const parts = val.toFixed(2).split('.')
    const integerPart = parts[0].padStart(2, '0')
    return `${integerPart}.${parts[1]}`
  }

  const handleScoreChange = (rowIndex: number, fieldName: keyof Score, rawValue: string, max: number, displayName: string) => {
    let clean = rawValue.replace(/[^0-9.]/g, '')
    
    if (clean.includes('.')) {
      const parts = clean.split('.')
      if (parts.length > 2) {
        clean = parts[0] + '.' + parts.slice(1).join('')
      }
      const dec = parts[1] || ''
      if (dec.length > 2) {
        clean = parts[0] + '.' + dec.substring(0, 2)
      }
    } else {
      if (clean.length === 2) {
        const val = parseInt(clean, 10)
        if (val > max || clean[0] === '0') {
          clean = clean[0] + '.' + clean[1]
        }
      } else if (clean.length === 3) {
        const val = parseInt(clean, 10)
        if (val === max * 10) {
          clean = max.toFixed(1)
        } else if (val > max * 10) {
          clean = clean[0] + '.' + clean.substring(1)
        }
      } else if (clean.length >= 4) {
        const val = parseInt(clean, 10)
        if (val >= max * 100) {
          clean = max.toFixed(2)
        } else {
          clean = clean[0] + '.' + clean.substring(1, 3)
        }
      }
    }

    // Always update value so it is not reset
    update(rowIndex, { [fieldName]: clean })

    // Validate limits
    if (clean !== '') {
      const num = parseFloat(clean)
      if (isNaN(num) || num < 0 || num > max) {
        setErrors((prev) => ({
          ...prev,
          [`${rowIndex}-${fieldName}`]: `Tối đa ${max}đ`
        }))
        return
      }
    }

    // Clear error if valid or empty
    setErrors((prev) => {
      const next = { ...prev }
      delete next[`${rowIndex}-${fieldName}`]
      return next
    })
  }

  const update = (index: number, next: Partial<Score>) => {
    setRows((cur) => cur.map((r, i) => (i === index ? { ...r, score: { ...r.score, ...next } } : r)))
  }

  const computeTotalComp = (s: Score) => {
    const pres = s.presentation !== '' ? parseFloat(s.presentation) : 0
    const dem = s.demo !== '' ? parseFloat(s.demo) : 0
    const qn = s.qna !== '' ? parseFloat(s.qna) : 0
    return pres + dem + qn
  }

  const avg = useMemo(() => {
    if (!rows.length) return { avgComp: 0, avgReport: 0 }
    const comps = rows.map((r) => computeTotalComp(r.score))
    const reportValues = rows.map((r) => r.score.report).filter((v) => v !== '') as string[]
    const avgComp = comps.reduce((a, b) => a + b, 0) / rows.length
    const avgReport = reportValues.length ? reportValues.reduce((a, b) => a + parseFloat(b), 0) / reportValues.length : 0
    return { avgComp, avgReport }
  }, [rows])

  const finalGroup = Math.round((avg.avgComp * 0.8 + avg.avgReport * 0.2) * 100) / 100

  useEffect(() => {
    let mounted = true
    
    // Initialize/reset rows
    setRows(students.map((m) => ({ member: m, score: { presentation: '', demo: '', qna: '', report: '' } as Score })))
    setErrors({})

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
            return {
              ...r,
              score: {
                presentation: found.presentation !== null && found.presentation !== undefined ? Number(found.presentation).toFixed(2) : '',
                demo: found.demo !== null && found.demo !== undefined ? Number(found.demo).toFixed(2) : '',
                qna: found.qna !== null && found.qna !== undefined ? Number(found.qna).toFixed(2) : '',
                report: found.report !== null && found.report !== undefined ? Number(found.report).toFixed(2) : '',
              }
            }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  async function save() {
    if (Object.keys(errors).length > 0) {
      notify('Vui lòng sửa các điểm số chưa hợp lệ (ô màu đỏ) trước khi lưu!')
      return
    }
    const payload = rows.map((r) => ({
      id: r.member.id,
      presentation: r.score.presentation !== '' ? parseFloat(r.score.presentation) : null,
      demo: r.score.demo !== '' ? parseFloat(r.score.demo) : null,
      qna: r.score.qna !== '' ? parseFloat(r.score.qna) : null,
      report: r.score.report !== '' ? parseFloat(r.score.report) : null,
    }))
    setLoading(true)
    try {
      const res = await teacherApi.saveScores(groupId, payload)
      if (res?.ok || res?.success) {
        notify('Lưu điểm hội đồng thành công!')
        window.dispatchEvent(new CustomEvent('realtime-score-updated'))
      } else {
        notify('Lưu điểm thất bại!')
      }
    } catch (_) {
      notify('Lưu điểm thất bại!')
    } finally {
      setLoading(false)
    }
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

      {!canEditReport && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 flex items-center gap-2">
          <span>⚠️</span>
          <span>Bạn chỉ được xem điểm báo cáo</span>
        </div>
      )}

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
              <th className="px-5 py-3 text-left">Điểm báo cáo (0-10)</th>
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
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <input
                        placeholder="0.00"
                        className={`${TeacherInputClass('w-20')} ${errors[`${i}-presentation`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500 ring-2 ring-red-100 bg-red-50/30 font-semibold text-red-600' : ''}`}
                        value={s.presentation}
                        onChange={(e) => handleScoreChange(i, 'presentation', e.target.value, 3, 'Thuyết trình')}
                      />
                      {errors[`${i}-presentation`] && (
                        <span className="text-[10px] font-semibold text-red-500 mt-0.5 whitespace-nowrap">
                          {errors[`${i}-presentation`]}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <input
                        placeholder="0.00"
                        className={`${TeacherInputClass('w-20')} ${errors[`${i}-demo`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500 ring-2 ring-red-100 bg-red-50/30 font-semibold text-red-600' : ''}`}
                        value={s.demo}
                        onChange={(e) => handleScoreChange(i, 'demo', e.target.value, 5, 'Demo')}
                      />
                      {errors[`${i}-demo`] && (
                        <span className="text-[10px] font-semibold text-red-500 mt-0.5 whitespace-nowrap">
                          {errors[`${i}-demo`]}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <input
                        placeholder="0.00"
                        className={`${TeacherInputClass('w-20')} ${errors[`${i}-qna`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500 ring-2 ring-red-100 bg-red-50/30 font-semibold text-red-600' : ''}`}
                        value={s.qna}
                        onChange={(e) => handleScoreChange(i, 'qna', e.target.value, 2, 'Vấn đáp')}
                      />
                      {errors[`${i}-qna`] && (
                        <span className="text-[10px] font-semibold text-red-500 mt-0.5 whitespace-nowrap">
                          {errors[`${i}-qna`]}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{formatTotalScore(comp)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <input
                        placeholder="0.00"
                        disabled={!canEditReport}
                        className={`${TeacherInputClass('w-20')} ${!canEditReport ? 'opacity-60 bg-slate-50' : ''} ${errors[`${i}-report`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500 ring-2 ring-red-100 bg-red-50/30 font-semibold text-red-600' : ''}`}
                        value={s.report}
                        onChange={(e) => handleScoreChange(i, 'report', e.target.value, reportMax, 'Báo cáo')}
                      />
                      {errors[`${i}-report`] && (
                        <span className="text-[10px] font-semibold text-red-500 mt-0.5 whitespace-nowrap">
                          {errors[`${i}-report`]}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-sm text-slate-700">
        Trung bình thành phần: <strong>{formatTotalScore(avg.avgComp)}</strong> — Avg báo cáo: <strong>{formatTotalScore(avg.avgReport)}</strong> — Điểm tổng nhóm: <strong>{formatTotalScore(finalGroup)}</strong>
      </div>
    </div>
  )
}
