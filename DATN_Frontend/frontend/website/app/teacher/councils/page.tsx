import Link from 'next/link'
import { TeacherSectionHeader } from '../_components/TeacherShell'

type Council = {
  id: string
  name: string
  period: string
  chair: string
  secretary: string
  studentsCount: number
  avgScore: number
}

const mockCouncils: Council[] = [
  { id: 'c-1', name: 'Hội đồng A', period: 'Kỳ 1 - 2026', chair: 'PGS. A', secretary: 'TS. B', studentsCount: 18, avgScore: 7.8 },
  { id: 'c-2', name: 'Hội đồng B', period: 'Kỳ 1 - 2026', chair: 'TS. C', secretary: 'ThS. D', studentsCount: 22, avgScore: 8.1 },
  { id: 'c-3', name: 'Hội đồng C', period: 'Kỳ 2 - 2026', chair: 'TS. E', secretary: 'ThS. F', studentsCount: 12, avgScore: 7.2 },
]

export default function CouncilsPage() {
  return (
    <div className="p-6">
      <TeacherSectionHeader title="Danh sách Hội đồng" description="Quản lý và xem điểm theo từng hội đồng" />
      <div className="grid gap-4 md:grid-cols-2">
        {mockCouncils.map((c) => (
          <div key={c.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium">{c.name}</h2>
                <p className="text-sm text-gray-600">{c.period}</p>
                <p className="text-sm">Trưởng: {c.chair} • Thư ký: {c.secretary}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">SV</div>
                <div className="text-xl font-semibold">{c.studentsCount}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">Trung bình: <strong>{c.avgScore.toFixed(2)}</strong></div>
              <Link href={`/teacher/councils/${c.id}/grades`} className="text-sm text-white bg-blue-600 px-3 py-1 rounded">
                Xem điểm
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
