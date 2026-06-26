import { Upload } from 'lucide-react'
import { TeacherButton, TeacherField, TeacherInputClass, TeacherModal } from '../../_components/TeacherUI'

type ModalCreateEditTopicProps = {
  open: boolean
  submitting: boolean
  editingCode: string | null
  name: string
  description: string
  slots: string
  onChangeName: (value: string) => void
  onChangeDescription: (value: string) => void
  onChangeSlots: (value: string) => void
  onClose: () => void
  onSave: () => void
}

export default function ModalCreateEditTopic(props: ModalCreateEditTopicProps) {
  const {
    open,
    submitting,
    editingCode,
    name,
    description,
    slots,
    onChangeName,
    onChangeDescription,
    onChangeSlots,
    onClose,
    onSave,
  } = props

  return (
    <TeacherModal
      open={open}
      title={editingCode ? 'Cập nhật đề tài ĐATN' : 'Tạo đề tài ĐATN mới'}
      onClose={onClose}
    >
      <div className="mt-2">
        <label className="mb-4 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
          <span className="inline-flex items-center gap-2 font-medium text-slate-700">
            <Upload className="h-4 w-4 text-[#1976D2]" />
            Import file đề tài
          </span>
          <span className="text-xs text-slate-500">.xlsx, .xls</span>
          <input type="file" accept=".xlsx,.xls" className="hidden" />
        </label>

        <TeacherField label="Tên đề tài" required>
          <input
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            className={TeacherInputClass()}
            placeholder="VD: Hệ thống chatbot hỗ trợ tuyển sinh"
          />
        </TeacherField>

        <TeacherField label="Mô tả ngắn" required>
          <textarea
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            rows={4}
            className={TeacherInputClass('resize-none')}
            placeholder="Mô tả mục tiêu và nội dung chính"
          />
        </TeacherField>

        <TeacherField label="Số slot tối đa" required>
          <input
            value={slots}
            onChange={(e) => onChangeSlots(e.target.value)}
            type="number"
            className={TeacherInputClass()}
          />
        </TeacherField>

        <div className="flex justify-end gap-2 pt-2">
          <TeacherButton variant="secondary" onClick={onClose}>Hủy</TeacherButton>
          <TeacherButton variant="primary" onClick={onSave}>
            {submitting ? 'Đang lưu...' : editingCode ? 'Lưu cập nhật' : 'Gửi yêu cầu duyệt'}
          </TeacherButton>
        </div>
      </div>
    </TeacherModal>
  )
}