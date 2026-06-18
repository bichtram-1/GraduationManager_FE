import { NextResponse } from 'next/server'

const students = [
  { id: '20520001', name: 'Nguyễn Văn A', program: 'Kỹ thuật phần mềm', class: 'K20', company: 'FPT' },
  { id: '20520002', name: 'Trần Thị B', program: 'Mạng máy tính', class: 'K20', company: 'VNG' },
  { id: '20520003', name: 'Lê Văn C', program: 'Điện tử', class: 'K21', company: '' },
]

export function GET() {
  return NextResponse.json({ students })
}
