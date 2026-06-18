import { NextResponse } from 'next/server'

type ReviewValue = '' | 'dat' | 'khongdat'
// Use UI-friendly segment labels to match `review-groups/page.tsx`
type ReviewSegment = 'Nhóm hướng dẫn' | 'Nhóm phản biện'
// Unified review group type used for both TTTN and ĐATN mock data
type ReviewGroup = {
  id: string
  segment: ReviewSegment
  groupName: string
  // DATN fields
  topicName?: string
  members?: number
  repo?: string
  latestSubmission?: string
  // removed TTTN-only fields: leader/company/mentor/latestReport
  updatedAt: string
  status: 'pending' | 'reviewed'
  evaluation: ReviewValue
  note: string
}

// Use a single data source: `datnGroups`. Do not use `tttnGroups`.
let datnGroups: ReviewGroup[] = [
  {
    id: 'DATN-001',
    segment: 'Nhóm phản biện',
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
    segment: 'Nhóm phản biện',
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
    segment: 'Nhóm phản biện',
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
  // Return both lists. Both use the same underlying mock data (`datnGroups`).
  // `guidanceGroups` items have the segment set to 'TTTN' so clients can
  // distinguish segments while consuming identical records.
  const guidanceGroups = datnGroups.map((g) => ({ ...g, segment: 'TTTN' as ReviewSegment }))
  const reviewGroups = datnGroups.map((g) => ({ ...g, segment: 'ĐATN' as ReviewSegment }))
  return NextResponse.json({ guidanceGroups, reviewGroups })
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { segment?: ReviewSegment; groupId?: string; evaluation?: ReviewValue }
  const { segment, groupId, evaluation } = body

  if (!segment || !groupId || (evaluation !== 'dat' && evaluation !== 'khongdat')) {
    return NextResponse.json({ message: 'Thiếu segment, groupId hoặc evaluation' }, { status: 400 })
  }

  // Update whichever group matches `groupId` in `datnGroups`.
  const index = datnGroups.findIndex((item) => item.id === groupId)
  if (index === -1) return NextResponse.json({ message: 'Không tìm thấy nhóm' }, { status: 404 })

  datnGroups = datnGroups.map((item) =>
    item.id === groupId
      ? {
          ...item,
          evaluation,
          status: 'reviewed',
          note: evaluation === 'dat' ? 'Nhóm đã đạt yêu cầu đánh giá.' : 'Nhóm chưa đạt yêu cầu, cần chỉnh sửa thêm.',
        }
      : item
  )

  return NextResponse.json({ group: datnGroups[index] })
}