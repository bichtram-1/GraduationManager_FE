import { NextResponse } from 'next/server'

type ReviewValue = '' | 'dat' | 'khongdat'
type ReviewSegment = 'TTTN' | 'ĐATN'



type DatnReviewGroup = {
  id: string
  segment: ReviewSegment
  groupName: string
  topicName: string
  members: number
  repo: string
  latestSubmission: string
  updatedAt: string
  status: 'pending' | 'reviewed'
  evaluation: ReviewValue
  note: string
}


let datnGroups: DatnReviewGroup[] = [
  {
    id: 'DATN-001',
    segment: 'ĐATN',
    groupName: 'Nhóm ĐATN Alpha',
    topicName: 'Hệ thống quản lý thư viện điện tử',
    members: 3,
    repo: 'github.com/user/library-system',
    latestSubmission: 'Bản thảo Chương 2',
    updatedAt: '23/05/2026 08:00',
    status: 'pending',
    evaluation: '',
    note: 'Cần xác nhận lại phạm vi chương 2 và giao diện demo.',
  },
  {
    id: 'DATN-002',
    segment: 'ĐATN',
    groupName: 'Nhóm ĐATN Beta',
    topicName: 'Ứng dụng AI nhận diện hình ảnh',
    members: 3,
    repo: 'github.com/user/ai-image-recognition',
    latestSubmission: 'Bản thảo Chương 1',
    updatedAt: '22/05/2026 14:15',
    status: 'reviewed',
    evaluation: 'dat',
    note: 'Nhóm đã đạt yêu cầu ở bản thảo hiện tại.',
  },
  {
    id: 'DATN-003',
    segment: 'ĐATN',
    groupName: 'Nhóm ĐATN Gamma',
    topicName: 'Hệ thống bán hàng trực tuyến',
    members: 2,
    repo: 'github.com/user/ecommerce-system',
    latestSubmission: 'Bản demo chức năng thanh toán',
    updatedAt: '20/05/2026 17:30',
    status: 'pending',
    evaluation: '',
    note: 'Đã có demo, cần hoàn thiện phần kiểm thử và báo cáo.',
  },
]

export function GET() {
  return NextResponse.json({ tttnGroups, datnGroups })
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { segment?: ReviewSegment; groupId?: string; evaluation?: ReviewValue }
  const { segment, groupId, evaluation } = body

  if (!segment || !groupId || (evaluation !== 'dat' && evaluation !== 'khongdat')) {
    return NextResponse.json({ message: 'Thiếu segment, groupId hoặc evaluation' }, { status: 400 })
  }

  if (segment === 'TTTN') {
    const index = tttnGroups.findIndex((item) => item.id === groupId)
    if (index === -1) return NextResponse.json({ message: 'Không tìm thấy nhóm' }, { status: 404 })

    tttnGroups = tttnGroups.map((item) =>
      item.id === groupId
        ? {
            ...item,
            evaluation,
            status: 'reviewed',
            note: evaluation === 'dat' ? 'Nhóm TTTN đã đạt yêu cầu đánh giá.' : 'Nhóm TTTN chưa đạt yêu cầu, cần chỉnh sửa thêm.',
          }
        : item
    )

    return NextResponse.json({ group: tttnGroups[index] })
  }

  const index = datnGroups.findIndex((item) => item.id === groupId)
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy nhóm' }, { status: 404 })

  datnGroups = datnGroups.map((item) =>
    item.id === groupId
      ? {
          ...item,
          evaluation,
          status: 'reviewed',
          note: evaluation === 'dat' ? 'Nhóm ĐATN đã đạt yêu cầu đánh giá.' : 'Nhóm ĐATN chưa đạt yêu cầu, cần chỉnh sửa thêm.',
        }
      : item
  )

  return NextResponse.json({ group: datnGroups[index] })
}