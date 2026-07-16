'use client'

import { useMemo, useState, useEffect, ChangeEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, CheckCircle2, FileText, Plus, Upload, Clock3, MessageSquareQuote, Building2, GraduationCap, ShieldCheck } from 'lucide-react'
import { StudentPill, StudentSectionHeader } from '../../_components/StudentShell'
import { StudentButton, StudentField, StudentFilterTabs, StudentInputClass, StudentModal, getReportStatusTone } from '../../_components/StudentUI'
import { studentApi } from '@/lib/api/studentApi'
import { uploadApi } from '@/lib/api/uploadApi'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { COMMON_LABELS } from '@/constants/commonLabels'
import { getFileUrl } from '@/lib/utils/fileUrl'
import { App, Spin } from 'antd'

type StatusFilter = 'all' | 'Đã nộp' | 'Thiếu' | 'Chưa nộp'

const REPORTS_KEY = ['tttn-reports']
// Cùng key với app/student/page.tsx — chuyển qua lại giữa 2 trang trong lúc còn "tươi"
// (staleTime) sẽ dùng chung cache, khỏi gọi lại API.
const DASHBOARD_KEY = ['student-dashboard']

export default function StudentReportsTTTNPage() {
  const { message } = App.useApp()
  const { selectedPeriod } = usePeriod()
  const queryClient = useQueryClient()
  const isPeriodLocked = selectedPeriod?.status === 'grading' || selectedPeriod?.status === 'closed'

  const reportsQuery = useQuery({ queryKey: REPORTS_KEY, queryFn: studentApi.getTttnReports })
  const dashboardQuery = useQuery({ queryKey: DASHBOARD_KEY, queryFn: studentApi.getDashboard })

  const reports = useMemo(() => reportsQuery.data?.reports ?? [], [reportsQuery.data])
  const hasGvhd = reportsQuery.data?.hasGvhd !== false
  const isInternshipApproved = reportsQuery.data?.isInternshipApproved !== false
  const internshipInfo = dashboardQuery.data?.tttn ?? null
  const loading = reportsQuery.isLoading || dashboardQuery.isLoading

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [submitOpen, setSubmitOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
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

  // Mặc định chọn tuần đầu tiên khi báo cáo tải xong lần đầu — không ghi đè lựa chọn
  // hiện tại của người dùng khi dữ liệu chỉ đơn thuần được refetch (realtime/mutation).
  useEffect(() => {
    if (selectedWeek === null && reports.length > 0) {
      setSelectedWeek(reports[0].week)
    }
  }, [reports, selectedWeek])

  // Sự kiện realtime chỉ cần đánh dấu cache cũ (invalidate) — react-query tự refetch lại,
  // không cần tự viết lại hàm load() thủ công như trước.
  useEffect(() => {
    const handleSync = () => {
      queryClient.invalidateQueries({ queryKey: REPORTS_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY })
    }
    window.addEventListener('realtime-group-updated', handleSync)
    window.addEventListener('realtime-topic-updated', handleSync)

    return () => {
      window.removeEventListener('realtime-group-updated', handleSync)
      window.removeEventListener('realtime-topic-updated', handleSync)
    }
  }, [queryClient])

  // Prefill form when week changes (for editing/updating existing reports)
  useEffect(() => {
    if (!submitOpen) return
    const wNum = Number(submitForm.week)
    if (!wNum) return
    setSelectedFile(null)
    const existing = reports.find((r) => r.week === wNum)
    if (existing && existing.status === 'Đã nộp') {
      setSubmitForm((current) => ({
        ...current,
        title: existing.title || '',
        note: existing.note || '',
        fileName: existing.file && existing.file !== '—' ? existing.file : '',
        fileUrl: existing.fileUrl || '',
      }))
    } else {
      setSubmitForm((current) => ({
        ...current,
        title: '',
        note: '',
        fileName: '',
        fileUrl: '',
      }))
    }
  }, [submitForm.week, submitOpen, reports])

  const selectedReport = useMemo(() => {
    return reports.find((report) => report.week === selectedWeek) 
      ?? reports[0] 
      ?? { week: 1, title: 'Không có dữ liệu', status: 'Chưa nộp', file: 'Chưa có', note: 'Chưa nộp nhật ký nào.', updated: 'Chưa cập nhật' }
  }, [selectedWeek, reports])

  const submittedCount = reports.filter((report) => report.status === 'Đã nộp').length
  const missingCount = reports.filter((report) => report.status === 'Thiếu').length
  const notSubmittedCount = reports.filter((report) => report.status === 'Chưa nộp').length

  const filteredReports = useMemo(() => {
    if (statusFilter === 'all') return reports
    return reports.filter((report) => report.status === statusFilter)
  }, [reports, statusFilter])

  const sortedWeeks = useMemo(() => {
    return [...reports].sort((a, b) => a.week - b.week)
  }, [reports])

  const latestTeacherComment = useMemo(() => {
    const withComment = reports.filter((report) => report.teacherComment)
    if (withComment.length === 0) return 'Chưa có nhận xét từ giảng viên.'
    const latest = withComment.reduce((acc, report) => (report.week > acc.week ? report : acc))
    return latest.teacherComment || 'Chưa có nhận xét từ giảng viên.'
  }, [reports])

  const openSubmitModal = () => {
    const unsubmitted = reports.filter((r) => r.status === 'Chưa nộp')
    const missing = reports.filter((r) => r.status === 'Thiếu')
    let nextWeek = 1
    if (unsubmitted.length > 0) {
      nextWeek = Math.min(...unsubmitted.map((r) => r.week))
    } else if (missing.length > 0) {
      nextWeek = Math.min(...missing.map((r) => r.week))
    } else if (reports.length > 0) {
      nextWeek = Math.min(...reports.map((r) => r.week))
    }
    setSubmitForm({
      week: String(nextWeek),
      title: '',
      note: '',
      fileName: '',
      fileUrl: '',
    })
    setSelectedFile(null)
    setSubmitOpen(true)
  }

  // Chỉ giữ file cục bộ ở đây, chưa gửi lên server — file thật sự chỉ được tải lên
  // khi sinh viên bấm "Gửi nhật ký" (handleSubmitReport), tránh trường hợp file mồ côi
  // trên storage nếu sinh viên chọn file rồi đóng modal mà không nộp.
  const handleUploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setSubmitForm((current) => ({ ...current, fileName: file.name }))
  }

  const handleSubmitReport = async () => {
    const nextWeek = Number(submitForm.week)
    const title = submitForm.title.trim()
    const note = submitForm.note.trim()

    if (!Number.isInteger(nextWeek) || nextWeek <= 0) {
      message.error('Vui lòng nhập số tuần hợp lệ (số nguyên dương).')
      return
    }

    if (!title) {
      message.error('Vui lòng nhập tên nhật ký.')
      return
    }

    if (!note) {
      message.error('Vui lòng nhập nội dung báo cáo.')
      return
    }

    setSubmitting(true)
    try {
      let fileUrl = submitForm.fileUrl
      let fileName = submitForm.fileName

      // Chỉ tải file lên storage ngay lúc gửi, gộp cùng một lần với dữ liệu báo cáo
      if (selectedFile) {
        const res = await uploadApi.uploadFile(selectedFile)
        if (!res?.cloudFrontUrl) {
          message.error('Tải file đính kèm lên thất bại!')
          return
        }
        fileUrl = res.cloudFrontUrl
        fileName = selectedFile.name
      }

      const nextReport = await studentApi.submitTttnReport({
        week: nextWeek,
        title,
        note,
        file: fileUrl || undefined,
        fileName: fileName || undefined
      })

      // Thao tác do chính mình vừa làm — invalidate ngay, không chờ realtime hay hết staleTime.
      queryClient.invalidateQueries({ queryKey: REPORTS_KEY })
      setSelectedWeek(nextReport.week)
      setSubmitOpen(false)
      setSelectedFile(null)
      message.success('Nộp nhật ký thành công!')
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra khi nộp báo cáo.'
      message.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <div className="text-sm text-slate-500">Đang tải thông tin báo cáo TTTN...</div>
      </div>
    )
  }

  return (
    <>
      <StudentSectionHeader
        title="Báo cáo TTTN"
        description="Nộp nhật ký thực tập hàng tuần, xem tiến độ duyệt và mở nhanh từng bản."
        actions={(
          <button
            type="button"
            onClick={() => {
              if (isPeriodLocked) {
                message.error(
                  selectedPeriod?.status === 'closed'
                    ? 'Đợt thực tập này đã đóng, bạn không thể nộp báo cáo nữa.'
                    : 'Đợt thực tập đã bắt đầu chấm điểm, bạn không thể nộp báo cáo nữa.'
                )
                return
              }
              if (!hasGvhd) {
                message.error('Bạn chưa được phân công Giảng viên hướng dẫn cho đợt này. Bạn không thể thực hiện nộp báo cáo!')
                return
              }
              if (!isInternshipApproved) {
                message.error('Thông tin đăng ký thực tập tốt nghiệp của bạn chưa được duyệt hoặc chưa khai báo. Bạn không thể thực hiện nộp báo cáo!')
                return
              }
              openSubmitModal()
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]"
          >
            <Plus className="h-4 w-4" />
            Nộp nhật ký
          </button>
        )}
      />

      {isPeriodLocked && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {selectedPeriod?.status === 'closed'
            ? 'Đợt thực tập này đã đóng, bạn không thể nộp báo cáo nữa.'
            : 'Đợt thực tập đã bắt đầu chấm điểm, bạn không thể nộp báo cáo nữa.'}
        </div>
      )}

      {!hasGvhd && (
        <div className="mb-6 flex gap-3 rounded-[28px] border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-900">Chưa được phân công giảng viên hướng dẫn</h4>
            <p className="mt-1 text-xs leading-relaxed text-amber-700">
              Bạn chưa được phân công Giảng viên hướng dẫn cho đợt này nên không thể thực hiện nộp báo cáo. Vui lòng liên hệ khoa hoặc quản trị viên để được hỗ trợ!
            </p>
          </div>
        </div>
      )}

      {!isInternshipApproved && (
        <div className="mb-6 flex gap-3 rounded-[28px] border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-900">Đăng ký thực tập tốt nghiệp chưa được duyệt</h4>
            <p className="mt-1 text-xs leading-relaxed text-amber-700">
              Thông tin đăng ký thực tập tốt nghiệp của bạn chưa được duyệt hoặc chưa khai báo. Bạn không thể thực hiện nộp báo cáo tiến độ. Vui lòng khai báo thông tin thực tập hoặc đợi giảng viên phê duyệt!
            </p>
          </div>
        </div>
      )}

      <StudentFilterTabs
        tabs={[
          { key: 'all', label: 'Tất cả', count: reports.length },
          { key: 'Đã nộp', label: 'Đã nộp', count: submittedCount },
          { key: 'Thiếu', label: 'Thiếu', count: missingCount },
          { key: 'Chưa nộp', label: 'Chưa nộp', count: notSubmittedCount },
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
          {internshipInfo?.companyName && (
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#1976D2] shrink-0" />
                <span>{internshipInfo.companyName} · {internshipInfo.position || 'Chưa cập nhật vị trí thực tập'}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#1976D2] shrink-0" />
                <span>GVHD: {internshipInfo.supervisorTeacher || 'Chưa phân công'}</span>
              </div>
            </div>
          )}
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
                      {getFileUrl(report.fileUrl || report.file) ? (
                        <a href={getFileUrl(report.fileUrl || report.file) || undefined} target="_blank" rel="noopener noreferrer" title={report.file} className="flex min-w-0 items-center gap-1 hover:underline">
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
                        onClick={() => {
                          setSelectedWeek(report.week)
                          document.getElementById('quick-view-tttn')?.scrollIntoView({ behavior: 'smooth' })
                        }}
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
          <section id="quick-view-tttn" className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="text-sm font-semibold text-slate-900">Xem nhanh báo cáo</div>
            <div className="mt-4 rounded-[22px] bg-white/90 p-4">
              <div className="text-xs text-slate-500">Đang chọn</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">Tuần {selectedReport.week}</div>
              <div className="mt-1 text-sm text-slate-600">{selectedReport.title}</div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-[#1976D2] shrink-0" />
                  <span className="shrink-0">File: </span>
                  {getFileUrl(selectedReport.fileUrl || selectedReport.file) ? (
                    <a href={getFileUrl(selectedReport.fileUrl || selectedReport.file) || undefined} target="_blank" rel="noopener noreferrer" title={selectedReport.file} className="min-w-0 truncate text-[#1976D2] hover:underline font-semibold">
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
            <StudentButton variant="secondary" disabled={submitting} onClick={() => setSubmitOpen(false)}>{COMMON_LABELS.CANCEL}</StudentButton>
            <StudentButton variant="primary" disabled={submitting} onClick={handleSubmitReport}>
              <Upload className="h-4 w-4" />
              {submitting ? 'Đang gửi...' : 'Gửi nhật ký'}
            </StudentButton>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <StudentField label="Tuần báo cáo">
            <select
              value={submitForm.week}
              onChange={(event) => setSubmitForm((current) => ({ ...current, week: event.target.value }))}
              className={StudentInputClass()}
            >
              {sortedWeeks.map((w) => (
                <option key={w.week} value={String(w.week)}>
                  Tuần {w.week} ({w.status})
                </option>
              ))}
            </select>
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
                    {submitForm.fileName
                      ? `Đã chọn: ${submitForm.fileName}`
                      : 'Kéo thả hoặc nhấp để chọn file nhật ký'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Hỗ trợ PDF, Word (tối đa 20MB) — file chỉ được gửi lên khi bạn bấm &quot;Gửi nhật ký&quot;</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  disabled={submitting}
                  onChange={handleUploadFile}
                />
              </label>
            </div>
            {submitForm.fileUrl && !selectedFile && (
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
          Bạn có thể nộp lại nhiều lần để cập nhật báo cáo cho đến khi hết hạn nộp của tuần đó.
        </div>
      </StudentModal>
    </>
  )
}
