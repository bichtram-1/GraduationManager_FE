import { NextResponse } from 'next/server'

export async function GET() {
  const payload = {
    tttnRows: [
      { id: '20520001', name: 'Nguyễn Văn A', company: 'FPT Software', score: '8.8' },
      { id: '20520002', name: 'Trần Thị B', company: 'VNG Corp', score: '7.8' },
      { id: '20520004', name: 'Phạm Thị D', company: 'Tiki', score: '' },
      { id: '20520006', name: 'Vũ Thị F', company: 'MoMo', score: '9.2' },
    ],
    councilGroups: [
      {
        code: 'HD01',
        name: 'Hội đồng 1 - ĐATN HK2/2025-2026',
        date: '20/06/2026 • 08:00',
        room: 'A.102',
        role: 'Ủy viên',
        done: 1,
        total: 2,
        members: [
          { id: 'T001', name: 'TS. Nguyễn Văn X', role: 'Chủ tịch' },
          { id: 'T002', name: 'PGS. Trần Văn Y', role: 'Ủy viên' },
        ],
        groups: [
          {
            groupCode: 'G01',
            topic: 'Hệ thống IoT giám sát nông nghiệp',
            students: [
              { id: '20520004', name: 'Nguyễn Văn D' },
              { id: '20520005', name: 'Trần Thị E' },
            ],
            supervisor: 'TS. Nguyễn Văn X',
          },
          {
            groupCode: 'G02',
            topic: 'Ứng dụng AI nhận diện hình ảnh',
            students: [
              { id: '20520010', name: 'Lê A' },
            ],
            supervisor: 'PGS. Trần Văn Y',
          },
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
          { id: 'T004', name: 'TS. Phạm Thị Z', role: 'Chủ tịch' },
          { id: 'T005', name: 'ThS. Hoàng GV', role: 'Ủy viên' },
        ],
        groups: [
          {
            groupCode: 'G05',
            topic: 'Hệ thống quản lý bán hàng trực tuyến',
            students: [
              { id: '20520020', name: 'Hồ D' },
            ],
            supervisor: 'TS. Lê Thị Z',
          },
        ],
      },
    ],
    scoreRows: [
      { id: '20520004', name: 'Nguyễn Văn D', chair: '', secretary: '', member: '8.5', advisor: '', reviewer: '' },
      { id: '20520005', name: 'Trần Thị E', chair: '', secretary: '', member: '8.0', advisor: '', reviewer: '' },
    ],
  }

  return NextResponse.json(payload)
}
