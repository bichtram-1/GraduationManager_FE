import { NextResponse } from 'next/server'

type ApprovalStatus = 'pending' | 'accepted' | 'rejected'

type GroupApproval = {
  id: string
  topicCode: string
  topicName: string
  groupName: string
  leader: string
  members: number
  submittedAt: string
  status: ApprovalStatus
  note: string
}

let approvalGroups: GroupApproval[] = [
  {
    id: 'GRP-001',
    topicCode: 'DA001',
    topicName: 'Hệ thống IoT giám sát nông nghiệp',
    groupName: 'Nhóm Alpha',
    leader: '20520021 - Nguyễn Văn K',
    members: 3,
    submittedAt: '23/05/2026 09:20',
    status: 'pending',
    note: 'Đã mời đủ thành viên, chờ giảng viên duyệt',
  },
  {
    id: 'GRP-002',
    topicCode: 'DA001',
    topicName: 'Hệ thống IoT giám sát nông nghiệp',
    groupName: 'Nhóm Beta',
    leader: '20520028 - Trần Thị M',
    members: 2,
    submittedAt: '22/05/2026 16:45',
    status: 'pending',
    note: 'Đã nộp form đăng ký đề tài',
  },
  {
    id: 'GRP-003',
    topicCode: 'DA012',
    topicName: 'Ứng dụng ML dự đoán giá chứng khoán',
    groupName: 'Nhóm Gamma',
    leader: '20520033 - Lê Văn H',
    members: 3,
    submittedAt: '21/05/2026 11:10',
    status: 'accepted',
    note: 'Đã duyệt vào đề tài, chờ cập nhật lần cuối',
  },
]

export function GET() {
  return NextResponse.json({ groups: approvalGroups })
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { groupId?: string; action?: 'accept' | 'reject' }
  const { groupId, action } = body

  if (!groupId || !action) {
    return NextResponse.json({ message: 'Thiếu groupId hoặc action' }, { status: 400 })
  }

  const index = approvalGroups.findIndex((item) => item.id === groupId)
  if (index === -1) {
    return NextResponse.json({ message: 'Không tìm thấy nhóm' }, { status: 404 })
  }

  approvalGroups = approvalGroups.map((item) =>
    item.id === groupId
      ? {
          ...item,
          status: action === 'accept' ? 'accepted' : 'rejected',
          note: action === 'accept' ? 'Giảng viên đã chấp nhận nhóm vào đề tài' : 'Giảng viên đã từ chối nhóm',
        }
      : item
  )

  return NextResponse.json({ group: approvalGroups[index] })
}