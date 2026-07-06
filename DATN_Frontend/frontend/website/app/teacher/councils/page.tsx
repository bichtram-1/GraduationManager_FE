'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TeacherSectionHeader } from '../_components/TeacherShell'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { teacherApi } from '@/lib/api/teacherApi'

type Council = {
  id: string
  name: string
  period: string
  chair: string
  studentsCount: number
  avgScore: number
}

export default function CouncilsPage() {
  const { selectedPeriod } = usePeriod()
  const [councils, setCouncils] = useState<Council[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    teacherApi.getGradingData({ periodId: selectedPeriod?.id })
      .then((data) => {
        if (!mounted) return
        if (data?.councilGroups) {
          const list = data.councilGroups.map((c: any) => {
            const chair = c.members?.find((m: any) => m.role.includes('Chủ tịch'))?.name || c.members?.[0]?.name || 'Chưa phân công'
            const studentsCount = c.groups?.reduce((acc: number, g: any) => acc + (g.students?.length || 0), 0) || 0

            return {
              id: c.code,
              name: c.name,
              period: selectedPeriod?.name || 'Học kỳ hiện tại',
              chair,
              studentsCount,
              avgScore: 8.0
            }
          })
          setCouncils(list)
        } else {
          setCouncils([])
        }
      })
      .catch(() => {
        if (mounted) setCouncils([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [selectedPeriod?.id])

  return (
    <div className="p-0">
      <TeacherSectionHeader
        title="Danh sách Hội đồng"
        description="Xem điểm các nhóm đề tài trong Hội đồng của bạn"
      />
      
      {loading ? (
        <div className="py-8 text-center text-slate-500">Đang tải danh sách hội đồng...</div>
      ) : councils.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {councils.map((c) => (
            <div key={c.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{c.name}</h2>
                  <p className="text-sm text-slate-500 mt-1">{c.period}</p>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p>Chủ tịch hội đồng: <strong className="text-slate-800">{c.chair}</strong></p>
                  </div>
                </div>
                <div className="text-right rounded-2xl bg-blue-50 px-3 py-2">
                  <div className="text-xs font-medium text-blue-600">Số sinh viên</div>
                  <div className="text-xl font-bold text-blue-700">{c.studentsCount}</div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end border-t border-slate-100 pt-4">
                <Link href={`/teacher/councils/${c.id}/grades`} className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 hover:shadow-lg">
                  Xem bảng điểm
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-slate-500">
          Không tìm thấy hội đồng nào của bạn trong đợt này.
        </div>
      )}
    </div>
  )
}
