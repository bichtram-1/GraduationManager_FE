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

// Custom Multi-select Dropdown for Directions
const DirectionSelector = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = [
    { id: 1, label: 'Lập trình di động' },
    { id: 2, label: 'Lập trình Web' },
    { id: 3, label: 'Mạng máy tính' },
  ];

  const selected = useMemo(() => {
    if (!value) return [];
    const valClean = value === 'Phát triển phần mềm' ? 'Lập trình Web' : value;
    return valClean.split(',').map(s => s.trim()).filter(Boolean);
  }, [value]);

  const handleToggleOption = (label: string) => {
    let nextSelected = [...selected];
    if (nextSelected.includes(label)) {
      nextSelected = nextSelected.filter(item => item !== label);
    } else {
      if (nextSelected.length >= 2) return;
      nextSelected.push(label);
    }
    onChange(nextSelected.join(', '));
  };

  const isWebOrMobileSelected = selected.includes('Lập trình Web') || selected.includes('Lập trình di động');
  const isNetSelected = selected.includes('Mạng máy tính');

  const getOptionDisabled = (label: string) => {
    if (label === 'Mạng máy tính') {
      return isWebOrMobileSelected;
    }
    if (label === 'Lập trình Web' || label === 'Lập trình di động') {
      return isNetSelected;
    }
    return false;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-left text-sm text-slate-700 shadow-sm outline-none focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2] flex justify-between items-center transition"
      >
        <span className="truncate">
          {selected.length > 0 ? selected.join(', ') : 'Chọn hướng đề tài (tối đa 2)'}
        </span>
        <svg className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 mt-2 z-20 rounded-2xl border border-slate-200 bg-white py-2 shadow-lg max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
            {options.map(opt => {
              const isSelected = selected.includes(opt.label);
              const isDisabled = getOptionDisabled(opt.label);
              return (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition select-none ${
                    isDisabled 
                      ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => handleToggleOption(opt.label)}
                    className="h-4 w-4 rounded border-slate-300 text-[#1976D2] focus:ring-[#1976D2] cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className={isSelected ? 'font-medium text-slate-900' : ''}>
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

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
            <DirectionSelector value={direction} onChange={onChangeDirection} />
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