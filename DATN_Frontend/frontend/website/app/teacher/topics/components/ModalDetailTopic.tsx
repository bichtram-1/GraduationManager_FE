import { FileText } from 'lucide-react'
import { TeacherPill } from '../../_components/TeacherShell'
import { TeacherModal, getTopicStatusTone } from '../../_components/TeacherUI'
import { getPreviewUrl } from '@/lib/utils/fileUrl'

type Topic = {
  id?: string
  code: string
  name: string
  slots: string
  status: 'Đã duyệt' | 'Chờ duyệt' | 'Từ chối'
  note: string
  semester: string
  summary: string
  progress: number
  direction?: string
  fileUrl?: string
}

type ModalDetailTopicProps = {
  open: boolean
  topic: Topic | null
  onClose: () => void
}

export default function ModalDetailTopic({ open, topic, onClose }: ModalDetailTopicProps) {
  if (!open || !topic) return null

  const maxMembers = topic.slots.split('/')[1] || topic.slots;

  return (
    <TeacherModal
      open={open}
      title="Chi tiết đề tài"
      onClose={onClose}
    >
      <div className="mt-2 space-y-5 overflow-y-auto max-h-[75vh] pr-1">
        
        {/* Display Status */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3">
          <div className="text-sm font-semibold text-slate-600">
            Mã đề tài: <span className="font-bold text-[#1976D2]">{topic.code}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Trạng thái:</span>
            <TeacherPill tone={getTopicStatusTone(topic.status)}>
              {topic.status}
            </TeacherPill>
          </div>
        </div>

        {topic.status === 'Từ chối' && (
          <div className="rounded-[24px] bg-red-50/50 p-4 border border-red-100">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-red-600 mb-1">
              Lý do bị từ chối
            </label>
            <div className="text-sm font-medium text-red-700 leading-relaxed">
              {topic.note || 'Cần cập nhật và làm rõ nội dung đề tài.'}
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Tên đề tài
          </label>
          <div className="text-sm font-semibold text-slate-800 bg-slate-50 px-4 py-3 rounded-2xl">
            {topic.name}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Hướng đề tài
            </label>
            <div className="text-sm font-semibold text-slate-800 bg-slate-50 px-4 py-3 rounded-2xl">
              {topic.direction || 'Chưa cập nhật'}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Số lượng thành viên tối đa
            </label>
            <div className="text-sm font-semibold text-slate-800 bg-slate-50 px-4 py-3 rounded-2xl">
              {maxMembers} thành viên
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Mô tả chi tiết đề tài
          </label>
          <div className="text-sm text-slate-700 bg-slate-50 px-4 py-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
            {topic.summary || 'Không có mô tả chi tiết.'}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Tài liệu mô tả đề tài đính kèm
          </label>
          <div className="mt-1">
            {topic.fileUrl ? (
              <div className="flex items-center justify-between rounded-2xl bg-blue-50/50 px-4 py-3 border border-blue-100">
                <a
                  href={getPreviewUrl(topic.fileUrl) || topic.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#1976D2] hover:underline max-w-[90%] truncate"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span>
                    {decodeURIComponent(topic.fileUrl.split('/').pop() || '').replace(/^\d+_/, '') || 'Xem tài liệu đính kèm'}
                  </span>
                </a>
              </div>
            ) : (
              <div className="text-sm text-slate-400 italic px-4 py-3 bg-slate-50 rounded-2xl">
                Không có file tài liệu đính kèm
              </div>
            )}
          </div>
        </div>

      </div>
    </TeacherModal>
  )
}
