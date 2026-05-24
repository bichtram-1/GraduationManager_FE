import { NextResponse } from 'next/server'

const tttnRows = [
  { id: '20520001', name: 'Nguyễn Văn A', company: 'FPT Software', score: '8.8' },
  { id: '20520002', name: 'Trần Thị B', company: 'VNG Corp', score: '7.8' },
  { id: '20520004', name: 'Phạm Thị D', company: 'Tiki', score: '' },
  { id: '20520006', name: 'Vũ Thị F', company: 'MoMo', score: '9.2' },
]

const councilGroups = [
  { code: 'HD01', name: 'Hội đồng 1 - ĐATN HK2/2025-2026', date: '20/06/2026 • 08:00', room: 'A.102', role: 'Ủy viên', done: 1, total: 2 },
  { code: 'HD02', name: 'Hội đồng 2 - ĐATN HK2/2025-2026', date: '22/06/2026 • 13:00', room: 'B.201', role: 'GVPB', done: 0, total: 1 },
]

const scoreRows = [
  { id: '20520004', name: 'Nguyễn Văn D', chair: '', secretary: '', member: '8.5', advisor: '', reviewer: '' },
  { id: '20520005', name: 'Trần Thị E', chair: '', secretary: '', member: '8.0', advisor: '', reviewer: '' },
]

export function GET() {
  return NextResponse.json({ tttnRows, councilGroups, scoreRows })
}
