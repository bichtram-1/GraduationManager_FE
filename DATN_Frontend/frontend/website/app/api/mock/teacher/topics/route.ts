import { NextResponse } from 'next/server'

const topics = [
  { id: 'TP01', title: 'Giới thiệu TTTN', module: 'Cơ bản', published: true },
  { id: 'TP02', title: 'Kỹ năng phỏng vấn', module: 'Nâng cao', published: false },
  { id: 'TP03', title: 'Quy trình chấm điểm', module: 'Quản lý', published: true },
]

export function GET() {
  return NextResponse.json({ topics })
}
