'use client'

import { useMemo, useState, useEffect, ChangeEvent } from 'react'
import Link from 'next/link'
import { CheckCircle2, FileText, Plus, Upload, Clock3, MessageSquareQuote, Rocket } from 'lucide-react'
import { StudentPill, StudentSectionHeader } from '../../_components/StudentShell'
import { StudentButton, StudentField, StudentFilterTabs, StudentInputClass, StudentModal, getReportStatusTone } from '../../_components/StudentUI'
import { studentApi, IDatnProgressReport } from '@/lib/api/studentApi'
import { uploadApi } from '@/lib/api/uploadApi'
import { COMMON_LABELS } from '@/constants/commonLabels'

type StatusFilter = 'all' | 'Đã duyệt' | 'Bị từ chối' | 'Đang chấm điểm'

export default function StudentReportsDATNPage() {
  const [milestones, setMilestones] = useState<IDatnProgressReport[]>([])
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [submitOpen, setSubmitOpen] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [submitForm, setSubmitForm] = useState({
    name: '',
    fileName: '',
    fileUrl: '',
    note: '',
  })
  const [loading, setLoading] = useState(true)
  const [registration, setRegistration] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    async function load() {
      try {
        const [reportsData, regData] = await Promise.all([
          studentApi.getDatnReports(),
          studentApi.getMyThesisRegistration()
        ])
        if (!mounted) return
        setMilestones(reportsData)
        setRegistration(regData)
        if (reportsData.length > 0) {
          setSelectedMilestone(reportsData[0].name)
        }
      } catch (_err) {
        if (!mounted) return
        setMilestones([])
        setRegistration(null)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    const handleSync = () => {
      load()
    }
    window.addEventListener('realtime-group-updated', handleSync)
    window.addEventListener('realtime-topic-updated', handleSync)

    return () => {
      mounted = false
      window.removeEventListener('realtime-group-updated', handleSync)
      window.removeEventListener('realtime-topic-updated', handleSync)
    }
  }, [])

  const selected = useMemo(() => {
    return milestones.find((milestone) => milestone.name === selectedMilestone) 
      ?? milestones[0] 
      ?? { name: 'Chưa có bản thảo', status: 'Chưa nộp', file: 'Chưa có', note: 'Chưa có bản thảo nào được nộp.', updated: 'Chưa cập nhật' }
  }, [selectedMilestone, milestones])

  const approvedCount = milestones.filter((milestone) => milestone.status === 'Đã duyệt').length
  const rejectedCount = milestones.filter((milestone) => milestone.status === 'Bị từ chối').length
  const reviewCount = milestones.filter((milestone) => milestone.status === 'Đang chấm điểm').length

  const filteredMilestones = useMemo(() => {
    if (statusFilter === 'all') return milestones
    return milestones.filter((milestone) => milestone.status === statusFilter)
  }, [milestones, statusFilter])

  const openSubmitModal = () => {
    setSubmitForm({
      name: '',
      fileName: '',
      fileUrl: '',
      note: '',
    })
    setSubmitOpen(true)
  }

  const handleUploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFile(true)
    try {
      const res = await uploadApi.uploadFile(file)
      if (res?.cloudFrontUrl) {
        setSubmitForm((current) => ({ ...current, fileName: file.name, fileUrl: res.cloudFrontUrl }))
      } else {
        alert('Tải file lên thất bại!')
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Tải file lên thất bại!')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmitDraft = async () => {
    if (!submitForm.name.trim() || !submitForm.note.trim()) {
      alert('Vui lòng nhập tên bản thảo và nội dung.')
      return
    }

    try {
      setLoading(true)
      const nextMilestone = await studentApi.submitDatnReport({
        name: submitForm.name.trim(),
        note: submitForm.note.trim(),
        file: submitForm.fileUrl || undefined
      })

      setMilestones((current) => {
        const withoutMilestone = current.filter((item) => item.name !== nextMilestone.name)
        return [...withoutMilestone, nextMilestone]
      })
      setSelectedMilestone(nextMilestone.name)
      setSubmitOpen(false)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra khi gửi bản thảo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <StudentSectionHeader
        title="Báo cáo ĐATN"
        description="Nộp bản thảo từng giai đoạn, theo dõi phản hồi và trạng thái chấm của giảng viên theo bố cục chi tiết hơn."
        actions={registration?.status === 'accepted' ? (
          <button
            type="button"
            onClick={openSubmitModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]"
          >
            <Plus className="h-4 w-4" />
            Nộp bản thảo
          </button>
        ) : undefined}
      />

      {!loading && registration?.status !== 'accepted' && (
        <div className="mb-5 p-5 rounded-[22px] border border-amber-200 bg-amber-50 text-amber-900 shadow-sm flex flex-col gap-2">
          <h3 className="font-semibold text-base text-amber-950 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-amber-700" />
            Yêu cầu phê duyệt đề tài
          </h3>
          <p className="text-sm m-0">
            {registration?.status === 'rejected'
              ? 'Đề tài đồ án tốt nghiệp của bạn đã bị giảng viên TỪ CHỐI. Bạn không được phép tham gia làm đồ án này và thực hiện các tác vụ liên quan (như nộp báo cáo tiến độ).'
              : registration?.status === 'pending'
              ? 'Đề tài đồ án tốt nghiệp của bạn đang CHỜ DUYỆT. Bạn chỉ có thể tham gia làm đồ án và nộp báo cáo tiến độ sau khi giảng viên phê duyệt chấp nhận đề tài.'
              : 'Bạn CHƯA ĐĂNG KÝ đề tài đồ án tốt nghiệp hoặc chưa gia nhập nhóm đồ án tốt nghiệp nào. Vui lòng hoàn tất đăng ký đề tài trước.'}
          </p>
          <div className="mt-2">
            <Link 
              href="/student/thesis-register" 
              className="inline-flex items-center gap-1 text-sm font-medium text-[#1976D2] hover:text-[#1565C0] hover:underline"
            >
              Đi tới trang Đăng ký ĐATN &rarr;
            </Link>
          </div>
        </div>
      )}

      <StudentFilterTabs
        tabs={[
          { key: 'all', label: 'Tất cả', count: milestones.length },
          { key: 'Đã duyệt', label: 'Đã duyệt', count: approvedCount },
          { key: 'Bị từ chối', label: 'Bị từ chối', count: rejectedCount },
          { key: 'Đang chấm điểm', label: 'Đang chấm', count: reviewCount },
        ]}
        activeKey={statusFilter}
        onChange={(key) => setStatusFilter(key as StatusFilter)}
      />

      <section className="mb-5 grid gap-4 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#1976D2] ring-1 ring-blue-100">
            <Rocket className="h-3.5 w-3.5" />
            Luồng nộp đồ án
          </div>
          <div className="mt-3 text-lg font-semibold text-slate-900">Theo dõi tiến độ từng mốc</div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Mỗi bản thảo có file, nhận xét và thời điểm cập nhật để bạn nắm nhanh trạng thái đồ án.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Lần cập nhật</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{selected.updated}</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Trạng thái</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{selected.status}</div>
          </div>
        </div>
      </section>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="text-xs text-slate-500">Mốc đang xem</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{selected.name}</div>
          <div className="mt-2 text-sm text-slate-500">{selected.note}</div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] min-w-0">
          <div className="text-xs text-slate-500">File nộp</div>
          <div className="mt-2 truncate text-3xl font-semibold tracking-tight text-slate-900" title={selected.file}>{selected.file}</div>
          <div className="mt-2 text-sm text-slate-500">Tài liệu đính kèm</div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="text-xs text-slate-500">Cập nhật</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{selected.updated}</div>
          <div className="mt-2 text-sm text-slate-500">Lần chỉnh cuối</div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Bản thảo đồ án</div>
              <div className="text-xs text-slate-500">Theo dõi trạng thái chấm của giảng viên</div>
            </div>
            <StudentPill tone="blue">{filteredMilestones.length} mốc nộp</StudentPill>
          </div>
          <div className="max-h-120 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 text-left">Giai đoạn</th>
                <th className="px-5 py-3 text-left">File</th>
                <th className="px-5 py-3 text-left">Trạng thái</th>
                <th className="px-5 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredMilestones.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">Không có bản thảo nào phù hợp bộ lọc.</td>
                </tr>
              )}
              {filteredMilestones.map((milestone) => {
                const active = selectedMilestone === milestone.name
                return (
                  <tr key={milestone.name} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${active ? 'bg-blue-50/60' : ''}`}>
                    <td className="px-5 py-4 text-slate-700">
                      <div className="space-y-1">
                        <div className="font-medium text-slate-900">{milestone.name}</div>
                        <div className="text-xs text-slate-500">{milestone.note}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#1976D2] max-w-40">
                      {milestone.fileUrl ? (
                        <a href={milestone.fileUrl} target="_blank" rel="noopener noreferrer" title={milestone.file} className="flex min-w-0 items-center gap-1 hover:underline">
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 truncate">{milestone.file}</span>
                        </a>
                      ) : (
                        <span className="flex min-w-0 items-center gap-1" title={milestone.file}>
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 truncate">{milestone.file}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StudentPill tone={getReportStatusTone(milestone.status)}>
                        {milestone.status}
                      </StudentPill>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedMilestone(milestone.name)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Upload className="h-4 w-4" />
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="text-sm font-semibold text-slate-900">Xem nhanh mốc nộp</div>
            <div className="mt-4 rounded-[22px] bg-white/90 p-4">
              <div className="text-xs text-slate-500">Đang chọn</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{selected.name}</div>
              <div className="mt-1 text-sm text-slate-600">{selected.note}</div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-[#1976D2] shrink-0" />
                  <span className="shrink-0">File: </span>
                  {selected.fileUrl ? (
                    <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer" title={selected.file} className="min-w-0 truncate text-[#1976D2] hover:underline font-semibold">
                      {selected.file}
                    </a>
                  ) : (
                    <span className="min-w-0 truncate" title={selected.file}>{selected.file}</span>
                  )}
                </div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#1976D2]" /> {selected.status}</div>
                <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Cập nhật: {selected.updated}</div>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-white/80 p-4">Nộp file bản thảo sớm để giảng viên có thể xem lịch sử và chấm điểm.</div>
              <div className="rounded-2xl bg-white/80 p-4">Bản chính thức nên đính kèm đầy đủ tài liệu thuyết minh.</div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="text-sm font-semibold text-slate-900">Ghi chú phản hồi của giảng viên</div>
            <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1 text-sm text-slate-600">
              {milestones.filter((milestone) => milestone.teacherComment).length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-slate-500">Chưa có nhận xét nào từ giảng viên.</div>
              ) : (
                milestones
                  .filter((milestone) => milestone.teacherComment)
                  .map((milestone) => (
                    <div key={milestone.name} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                      <MessageSquareQuote className="mt-0.5 h-4 w-4 text-[#1976D2]" />
                      <div>
                        <div className="font-medium text-slate-900">{milestone.name}</div>
                        <div>{milestone.teacherComment}</div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>
        </div>
      </div>

      <StudentModal
        open={submitOpen}
        title="Nộp bản thảo ĐATN"
        description="Nhập giai đoạn, file và nội dung bản thảo"
        onClose={() => setSubmitOpen(false)}
        footer={
          <>
            <StudentButton variant="secondary" onClick={() => setSubmitOpen(false)}>{COMMON_LABELS.CANCEL}</StudentButton>
            <StudentButton variant="primary" onClick={handleSubmitDraft}>
              <Upload className="h-4 w-4" />
              Gửi bản thảo
            </StudentButton>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <StudentField label="Tên bản thảo">
              <input
                value={submitForm.name}
                onChange={(event) => setSubmitForm((current) => ({ ...current, name: event.target.value }))}
                className={StudentInputClass()}
                placeholder="Ví dụ: Bản thảo Chương 3"
              />
            </StudentField>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm font-medium text-slate-700 mb-1">Tải file bản thảo lên</div>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                  <Upload className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500 font-medium">
                    {uploadingFile
                      ? 'Đang tải file lên...'
                      : submitForm.fileName
                      ? `Đã chọn: ${submitForm.fileName}`
                      : 'Kéo thả hoặc nhấp để chọn file'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Hỗ trợ PDF, Word, ZIP (tối đa 20MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  disabled={uploadingFile}
                  onChange={handleUploadFile}
                />
              </label>
            </div>
          </div>
          <div className="md:col-span-2">
            <StudentField label="Nội dung bản thảo">
              <textarea
                rows={5}
                value={submitForm.note}
                onChange={(event) => setSubmitForm((current) => ({ ...current, note: event.target.value }))}
                className={StudentInputClass()}
                placeholder="Mô tả nội dung, tiến độ, phần đã hoàn thành..."
              />
            </StudentField>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Bản thảo sau khi gửi sẽ chuyển sang trạng thái <span className="font-semibold">Đang chấm điểm</span> và được chọn ngay trên danh sách.
        </div>
      </StudentModal>
    </>
  )
}
