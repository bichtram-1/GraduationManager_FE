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

let tttnGroups: TttnReviewGroup[] = [
  {
    id: 'ĐATN-001',
    segment: 'ĐATN',
    groupName: 'Nhóm ĐATN Alpha',
    leader: '20520021 - Nguyễn Văn K',
    company: 'FPT Software',
    mentor: 'TS. Nguyễn Văn X',
    latestReport: 'Tuần 4 - Đã nộp đúng hạn',
    topicName: 'Tuần 4 - Báo cáo tiến độ',
    members: 1,
    repo: '',
    latestSubmission: 'Tuần 4 - Đã nộp đúng hạn',
    updatedAt: '23/05/2026 09:20',
    status: 'pending',
    evaluation: '',
    note: 'Báo cáo tiến độ ổn định, cần phản hồi ngắn về nội dung tuần 4.',
  },
  {
    id: 'ĐATN-002',
    segment: 'ĐATN',
    groupName: 'Nhóm ĐATN Beta',
    leader: '20520028 - Trần Thị M',
    company: 'VNG Corp',
    mentor: 'TS. Nguyễn Văn X',
    latestReport: 'Tuần 3 - Nộp muộn 1 ngày',
    topicName: 'Tuần 3 - Báo cáo tiến độ',
    members: 1,
    repo: '',
    latestSubmission: 'Tuần 3 - Nộp muộn 1 ngày',
    updatedAt: '22/05/2026 16:45',
    status: 'reviewed',
    evaluation: 'khongdat',
    note: 'Cần nhắc nhóm chú ý tiến độ nộp báo cáo tuần.',
  },
  {
    id: 'TTTN-003',
    segment: 'TTTN',
    groupName: 'Nhóm TTTN Gamma',
    leader: '20520033 - Lê Văn H',
    company: 'TMA Solutions',
    mentor: 'TS. Nguyễn Văn X',
    latestReport: 'Tuần 4 - Có chỉnh sửa sau góp ý',
    topicName: 'Tuần 4 - Báo cáo chỉnh sửa',
    members: 1,
    repo: '',
    latestSubmission: 'Tuần 4 - Có chỉnh sửa sau góp ý',
    updatedAt: '21/05/2026 11:10',
    status: 'pending',
    evaluation: '',
    note: 'Đã có bản cập nhật theo góp ý, chờ giảng viên kết luận.',
  },
]

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