'use client'

import { useMemo, useState, useEffect, ChangeEvent } from 'react'
import { CalendarDays, CheckCircle2, FileText, Plus, Upload, Clock3, MessageSquareQuote } from 'lucide-react'
import { StudentPill, StudentSectionHeader } from '../../_components/StudentShell'
import { StudentButton, StudentField, StudentFilterTabs, StudentInputClass, StudentModal, getReportStatusTone } from '../../_components/StudentUI'
import { studentApi, IProgressReport } from '@/lib/api/studentApi'
import { uploadApi } from '@/lib/api/uploadApi'
import { COMMON_LABELS } from '@/constants/commonLabels'

type StatusFilter = 'all' | 'Đã duyệt' | 'Bị từ chối' | 'Chờ duyệt'

export default function StudentReportsTTTNPage() {
  const [reports, setReports] = useState<IProgressReport[]>([])
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [submitOpen, setSubmitOpen] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [submitForm, setSubmitForm] = useState<{
    week: string
    title: string
    note: string
    fileName: string
    fileUrl: string
  }>({
    week: '1',
    title: '',
    note: '',
    fileName: '',
    fileUrl: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    async function load() {
      try {
        const data = await studentApi.getTttnReports()
        if (!mounted) return
        setReports(data)
        if (data.length > 0) {
          setSelectedWeek(data[0].week)
        }
      } catch (_err) {
        if (!mounted) return
        setReports([])
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

  const selectedReport = useMemo(() => {
    return reports.find((report) => report.week === selectedWeek) 
      ?? reports[0] 
      ?? { week: 1, title: 'Không có dữ liệu', status: 'Chưa nộp', file: 'Chưa có', note: 'Chưa nộp nhật ký nào.', updated: 'Chưa cập nhật' }
  }, [selectedWeek, reports])

  const approvedCount = reports.filter((report) => report.status === 'Đã duyệt').length
  const rejectedCount = reports.filter((report) => report.status === 'Bị từ chối').length
  const pendingCount = reports.filter((report) => report.status === 'Chờ duyệt').length

  const filteredReports = useMemo(() => {
    if (statusFilter === 'all') return reports
    return reports.filter((report) => report.status === statusFilter)
  }, [reports, statusFilter])

  const latestTeacherComment = useMemo(() => {
    const withComment = reports.filter((report) => report.teacherComment)
    if (withComment.length === 0) return 'Chưa có nhận xét từ giảng viên.'
    const latest = withComment.reduce((acc, report) => (report.week > acc.week ? report : acc))
    return latest.teacherComment || 'Chưa có nhận xét từ giảng viên.'
  }, [reports])

  const openSubmitModal = () => {
    const nextWeek = reports.length > 0 ? Math.max(...reports.map((report) => report.week)) + 1 : 1
    setSubmitForm({
      week: String(nextWeek),
      title: '',
      note: '',
      fileName: '',
      fileUrl: '',
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

  const handleSubmitReport = async () => {
    const nextWeek = Number(submitForm.week)

    if (!Number.isFinite(nextWeek) || nextWeek <= 0) {
      alert('Vui lòng nhập số tuần hợp lệ.')
      return
    }

    if (!submitForm.title.trim() || !submitForm.note.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung nhật ký.')
      return
    }

    try {
      setLoading(true)
      const nextReport = await studentApi.submitTttnReport({
        week: nextWeek,
        title: submitForm.title.trim(),
        note: submitForm.note.trim(),
        file: submitForm.fileUrl || undefined,
        fileName: submitForm.fileName || undefined
      })

      setReports((current) => {
        const withoutWeek = current.filter((report) => report.week !== nextReport.week)
        return [nextReport, ...withoutWeek]
      })
      setSelectedWeek(nextReport.week)
      setSubmitOpen(false)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra khi nộp báo cáo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <StudentSectionHeader
        title="Báo cáo TTTN"
        description="Nộp nhật ký thực tập hàng tuần, xem tiến độ duyệt và mở nhanh từng bản nộp như trong bộ design mẫu."
        actions={(
          <button
            type="button"
            onClick={openSubmitModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]"
          >
            <Plus className="h-4 w-4" />
            Nộp nhật ký
          </button>
        )}
      />

      <StudentFilterTabs
        tabs={[
          { key: 'all', label: 'Tất cả', count: reports.length },
          { key: 'Đã duyệt', label: 'Đã duyệt', count: approvedCount },
          { key: 'Bị từ chối', label: 'Bị từ chối', count: rejectedCount },
          { key: 'Chờ duyệt', label: 'Chờ duyệt', count: pendingCount },
        ]}
        activeKey={statusFilter}
        onChange={(key) => setStatusFilter(key as StatusFilter)}
      />

      <section className="mb-5 grid gap-4 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#1976D2] ring-1 ring-blue-100">
            <CalendarDays className="h-3.5 w-3.5" />
            Theo dõi theo tuần
          </div>
          <div className="mt-3 text-lg font-semibold text-slate-900">Luồng nộp báo cáo TTTN</div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Mỗi tuần có một bản nộp, trạng thái duyệt và ghi chú phản hồi được hiển thị rõ ràng để bạn biết còn thiếu gì.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Nhận xét gần nhất</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{latestTeacherComment}</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Cập nhật cuối</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{selectedReport.updated}</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Trạng thái</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{selectedReport.status}</div>
          </div>
        </div>
      </section>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="text-xs text-slate-500">Tuần đang xem</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">W{selectedReport.week}</div>
          <div className="mt-2 text-sm text-slate-500">{selectedReport.title}</div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] min-w-0">
          <div className="text-xs text-slate-500">Tệp đính kèm</div>
          <div className="mt-2 truncate text-3xl font-semibold tracking-tight text-slate-900" title={selectedReport.file}>{selectedReport.file}</div>
          <div className="mt-2 text-sm text-slate-500">File báo cáo hiện tại</div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="text-xs text-slate-500">Phản hồi</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{selectedReport.status}</div>
          <div className="mt-2 text-sm text-slate-500">Trạng thái mới nhất</div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Nhật ký theo tuần</div>
              <div className="text-xs text-slate-500">Trạng thái từng lần nộp báo cáo</div>
            </div>
            <StudentPill tone="green">{filteredReports.length} tuần</StudentPill>
          </div>
          <div className="max-h-120 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 text-left">Tuần</th>
                <th className="px-5 py-3 text-left">Nội dung</th>
                <th className="px-5 py-3 text-left">File</th>
                <th className="px-5 py-3 text-left">Trạng thái</th>
                <th className="px-5 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">Không có báo cáo nào phù hợp bộ lọc.</td>
                </tr>
              )}
              {filteredReports.map((report) => {
                const active = selectedWeek === report.week
                return (
                  <tr key={report.week} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${active ? 'bg-blue-50/60' : ''}`}>
                    <td className="px-5 py-4 font-medium text-slate-900">W{report.week}</td>
                    <td className="px-5 py-4 text-slate-700">
                      <div className="space-y-1">
                        <div>{report.title}</div>
                        <div className="text-xs text-slate-500">{report.note}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#1976D2] max-w-40">
                      {report.fileUrl ? (
                        <a href={report.fileUrl} target="_blank" rel="noopener noreferrer" title={report.file} className="flex min-w-0 items-center gap-1 hover:underline">
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 truncate">{report.file}</span>
                        </a>
                      ) : (
                        <span className="flex min-w-0 items-center gap-1" title={report.file}>
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 truncate">{report.file}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StudentPill tone={getReportStatusTone(report.status)}>{report.status}</StudentPill>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedWeek(report.week)}
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
            <div className="text-sm font-semibold text-slate-900">Xem nhanh báo cáo</div>
            <div className="mt-4 rounded-[22px] bg-white/90 p-4">
              <div className="text-xs text-slate-500">Đang chọn</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">Tuần {selectedReport.week}</div>
              <div className="mt-1 text-sm text-slate-600">{selectedReport.title}</div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-[#1976D2] shrink-0" />
                  <span className="shrink-0">File: </span>
                  {selectedReport.fileUrl ? (
                    <a href={selectedReport.fileUrl} target="_blank" rel="noopener noreferrer" title={selectedReport.file} className="min-w-0 truncate text-[#1976D2] hover:underline font-semibold">
                      {selectedReport.file}
                    </a>
                  ) : (
                    <span className="min-w-0 truncate" title={selectedReport.file}>{selectedReport.file}</span>
                  )}
                </div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#1976D2]" /> {selectedReport.status}</div>
                <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Cập nhật: {selectedReport.updated}</div>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-white/80 p-4">Nội dung đã nộp được lưu theo từng tuần để giảng viên duyệt nhanh.</div>
              <div className="rounded-2xl bg-white/80 p-4">Nếu trạng thái là nháp, bạn có thể chỉnh sửa trước khi nộp lại.</div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="text-sm font-semibold text-slate-900">Ghi chú phản hồi của giảng viên</div>
            <div className="mt-4 text-sm text-slate-600">
              {selectedReport.teacherComment ? (
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <MessageSquareQuote className="mt-0.5 h-4 w-4 text-[#1976D2]" />
                  <div>
                    <div className="font-medium text-slate-900">Tuần {selectedReport.week}</div>
                    <div>{selectedReport.teacherComment}</div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 text-slate-500">Chưa có nhận xét từ giảng viên cho tuần này.</div>
              )}
            </div>
          </section>
        </div>
      </div>

      <StudentModal
        open={submitOpen}
        title="Nộp nhật ký TTTN"
        description="Nhập tuần, tiêu đề, nội dung và tệp đính kèm báo cáo"
        onClose={() => setSubmitOpen(false)}
        footer={
          <>
            <StudentButton variant="secondary" onClick={() => setSubmitOpen(false)}>{COMMON_LABELS.CANCEL}</StudentButton>
            <StudentButton variant="primary" onClick={handleSubmitReport}>
              <Upload className="h-4 w-4" />
              Gửi nhật ký
            </StudentButton>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <StudentField label="Tuần báo cáo">
            <input
              type="number"
              min={1}
              value={submitForm.week}
              onChange={(event) => setSubmitForm((current) => ({ ...current, week: event.target.value }))}
              className={StudentInputClass()}
              placeholder="4"
            />
          </StudentField>
          <StudentField label="Tên nhật ký">
            <input
              value={submitForm.title}
              onChange={(event) => setSubmitForm((current) => ({ ...current, title: event.target.value }))}
              className={StudentInputClass()}
              placeholder="Ví dụ: Tích hợp API đăng ký"
            />
          </StudentField>
          <div className="md:col-span-2">
            <StudentField label="Nội dung báo cáo">
              <textarea
                rows={5}
                value={submitForm.note}
                onChange={(event) => setSubmitForm((current) => ({ ...current, note: event.target.value }))}
                className={StudentInputClass()}
                placeholder="Mô tả công việc, kết quả, khó khăn và hướng xử lý..."
              />
            </StudentField>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm font-medium text-slate-700 mb-1">Tải file đính kèm lên</div>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                  <Upload className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500 font-medium">
                    {uploadingFile
                      ? 'Đang tải file lên...'
                      : submitForm.fileName
                      ? `Đã chọn: ${submitForm.fileName}`
                      : 'Kéo thả hoặc nhấp để chọn file nhật ký'}
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
            {submitForm.fileUrl && (
              <div className="mt-2 text-right">
                <a
                  href={submitForm.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#1976D2] hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Xem file vừa tải lên
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Sau khi nộp, bản ghi sẽ được thêm vào danh sách với trạng thái <span className="font-semibold">Chờ duyệt</span>.
        </div>
      </StudentModal>
    </>
  )
}
