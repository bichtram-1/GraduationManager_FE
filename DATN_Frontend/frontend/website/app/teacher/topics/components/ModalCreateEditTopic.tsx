import { useState, useMemo, useEffect } from 'react'
import { Upload, FileText, Trash2 } from 'lucide-react'
import { TeacherButton, TeacherField, TeacherInputClass, TeacherModal, getTopicStatusTone } from '../../_components/TeacherUI'
import { TeacherPill } from '../../_components/TeacherShell'
import { topicApi } from '@/lib/api/topicApi'
import { COMMON_LABELS } from '@/constants/commonLabels'

type ModalCreateEditTopicProps = {
  open: boolean
  submitting: boolean
  editingCode: string | null
  name: string
  description: string
  slots: string
  direction: string
  fileUrl: string
  status: string
  rejectReason: string
  onChangeName: (value: string) => void
  onChangeDescription: (value: string) => void
  onChangeSlots: (value: string) => void
  onChangeDirection: (value: string) => void
  onChangeFileUrl: (value: string) => void
  onClose: () => void
  onSave: (overrideFileUrl?: string) => void
  onImportFile?: (file: File) => void
}

export default function ModalCreateEditTopic(props: ModalCreateEditTopicProps) {
  const {
    open,
    submitting,
    editingCode,
    name,
    description,
    slots,
    direction,
    fileUrl,
    status,
    rejectReason,
    onChangeName,
    onChangeDescription,
    onChangeSlots,
    onChangeDirection,
    onChangeFileUrl,
    onClose,
    onSave,
    onImportFile,
  } = props

  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Chỉ giữ file cục bộ ở đây, chưa gửi lên server — file thật sự chỉ được tải lên
  // ngay lúc bấm nút lưu (handleSaveClick), tránh trường hợp file mồ côi trên storage
  // nếu giảng viên chọn file rồi đóng modal mà không lưu.
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
  }

  const [hasTriedSave, setHasTriedSave] = useState(false)

  useEffect(() => {
    if (open) {
      setHasTriedSave(false)
      setSelectedFile(null)
    }
  }, [open])

  const nameError = useMemo(() => {
    if (!open) return null
    if (name.trim() === '') {
      return 'Vui lòng nhập tên đề tài!'
    }
    if (name.length > 255) {
      return 'Tên đề tài không được vượt quá 255 ký tự!'
    }
    return null
  }, [name, open])

  const slotsError = useMemo(() => {
    if (!open) return null
    if (slots.trim() === '') {
      return 'Vui lòng nhập số lượng thành viên tối đa!'
    }
    const val = Number(slots)
    if (!/^\d+$/.test(slots)) {
      return 'Số lượng phải là số nguyên dương!'
    }
    if (val < 2) {
      return 'Số lượng thành viên tối đa phải từ 2 trở lên!'
    }
    if (val % 2 !== 0) {
      return 'Số lượng thành viên tối đa phải là số chẵn!'
    }
    return null
  }, [slots, open])

  const descriptionError = useMemo(() => {
    if (!open) return null
    if (description.trim() === '') {
      return 'Vui lòng nhập mô tả đề tài!'
    }
    if (description.length > 5000) {
      return 'Mô tả đề tài không được vượt quá 5000 ký tự!'
    }
    return null
  }, [description, open])

  const fileError = useMemo(() => {
    if (!open) return null
    if (!editingCode && !fileUrl && !selectedFile) {
      return 'Vui lòng tải lên file tài liệu mô tả đính kèm!'
    }
    return null
  }, [fileUrl, selectedFile, editingCode, open])

  const handleSaveClick = async () => {
    setHasTriedSave(true)
    if (nameError || slotsError || descriptionError || fileError) {
      return
    }

    if (!selectedFile) {
      onSave()
      return
    }

    // Gộp việc tải file lên cùng lúc với lưu đề tài — chỉ thật sự upload khi bấm nút lưu
    setUploadingFile(true)
    try {
      const res = await topicApi.uploadFile(selectedFile)
      if (!res?.cloudFrontUrl) {
        alert('Tải file lên thất bại!')
        return
      }
      onSave(res.cloudFrontUrl)
    } catch {
      alert('Có lỗi xảy ra khi tải file!')
    } finally {
      setUploadingFile(false)
    }
  }

  return (
    <TeacherModal
      open={open}
      title={editingCode ? 'Cập nhật đề tài' : 'Tạo đề tài'}
      onClose={onClose}
    >
      <div className="mt-2 space-y-4 overflow-y-auto max-h-[75vh] pr-1">

        {/* Display Status & Reject Reason if editing */}
        {editingCode && (
          <div className="flex flex-wrap items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="text-sm font-medium text-slate-700">
              Mã đề tài: <span className="font-bold text-[#1976D2]">{editingCode}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Trạng thái hiện tại:</span>
              <TeacherPill tone={getTopicStatusTone(status)}>
                {status}
              </TeacherPill>
            </div>
          </div>
        )}

        {editingCode && status === 'Từ chối' && (
          <div className="rounded-[24px] bg-red-50/50 p-4 border border-red-100">
            <div className="text-xs font-semibold uppercase tracking-wider text-red-600">Lý do bị từ chối trước đó</div>
            <div className="mt-1 text-sm font-medium text-red-700 leading-relaxed">
              {rejectReason || 'Cần cập nhật và làm rõ nội dung đề tài.'}
            </div>
          </div>
        )}

        <TeacherField label="Tên đề tài" required>
          <input
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            className={TeacherInputClass(
              nameError && (name.trim() !== '' || hasTriedSave)
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : ''
            )}
            placeholder="VD: Hệ thống chatbot hỗ trợ tuyển sinh"
          />
          {nameError && (name.trim() !== '' || hasTriedSave) && (
            <div className="text-red-500 text-xs mt-1 font-medium">{nameError}</div>
          )}
        </TeacherField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TeacherField label="Hướng đề tài" required>
            <select
              value={direction}
              onChange={(e) => onChangeDirection(e.target.value)}
              className={TeacherInputClass()}
            >
              <option value="Phát triển phần mềm">Phát triển phần mềm</option>
              <option value="Mạng máy tính">Mạng máy tính</option>
            </select>
          </TeacherField>

          <TeacherField label="Số lượng thành viên tối đa" required>
            <input
              value={slots}
              onChange={(e) => onChangeSlots(e.target.value)}
              type="number"
              min="2"
              step="2"
              className={TeacherInputClass(
                slotsError && (slots.trim() !== '' || hasTriedSave)
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : ''
              )}
              placeholder="Nhập số lượng sinh viên"
            />
            {slotsError && (slots.trim() !== '' || hasTriedSave) && (
              <div className="text-red-500 text-xs mt-1 font-medium">{slotsError}</div>
            )}
          </TeacherField>
        </div>

        <TeacherField label="Mô tả đề tài" required>
          <textarea
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            rows={4}
            className={TeacherInputClass(
              'resize-none ' + (
                descriptionError && (description.trim() !== '' || hasTriedSave)
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : ''
              )
            )}
            placeholder="Mô tả chi tiết mục tiêu, công nghệ và nội dung chính của đề tài"
          />
          {descriptionError && (description.trim() !== '' || hasTriedSave) && (
            <div className="text-red-500 text-xs mt-1 font-medium">{descriptionError}</div>
          )}
        </TeacherField>

        <TeacherField label="File mô tả đính kèm (.pdf, .docx, .doc)" required={!editingCode}>
          <div className="mt-1 space-y-2">
            {selectedFile ? (
              <div className="flex items-center justify-between rounded-2xl bg-blue-50/50 px-4 py-3 border border-blue-100">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[#1976D2] max-w-[85%] truncate">
                  <FileText className="h-4.5 w-4.5 shrink-0" />
                  Đã chọn: {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="rounded-xl p-1.5 text-red-500 hover:bg-red-50 transition shrink-0"
                  title="Bỏ chọn file"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : fileUrl ? (
              <div className="flex items-center justify-between rounded-2xl bg-blue-50/50 px-4 py-3 border border-blue-100">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#1976D2] hover:underline max-w-[85%] truncate"
                >
                  <FileText className="h-4.5 w-4.5 shrink-0" />
                  <span>
                    {decodeURIComponent(fileUrl.split('/').pop() || '').replace(/^\d+_/, '') || 'Xem tài liệu đính kèm'}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => onChangeFileUrl('')}
                  className="rounded-xl p-1.5 text-red-500 hover:bg-red-50 transition shrink-0"
                  title="Xóa file đính kèm"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed bg-slate-50 px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-100 ${
                fileError && hasTriedSave ? 'border-red-500 bg-red-50/10' : 'border-slate-300'
              }`}>
                <Upload className="h-4 w-4 text-[#1976D2]" />
                <span>Chọn file tài liệu mô tả (sẽ tải lên khi lưu)</span>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleUploadFile}
                  disabled={uploadingFile}
                />
              </label>
            )}
            {fileError && hasTriedSave && (
              <div className="text-red-500 text-xs mt-1 font-medium">{fileError}</div>
            )}
          </div>
        </TeacherField>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <TeacherButton variant="secondary" onClick={onClose}>{COMMON_LABELS.CANCEL}</TeacherButton>
          <TeacherButton variant="primary" onClick={handleSaveClick} disabled={submitting || uploadingFile}>
            {uploadingFile ? 'Đang tải file lên...' : submitting ? 'Đang lưu...' : editingCode ? 'Lưu cập nhật' : 'Gửi yêu cầu duyệt'}
          </TeacherButton>
        </div>
      </div>
    </TeacherModal>
  )
}