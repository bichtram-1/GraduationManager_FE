'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, FileText, Plus, Upload, Clock3, MessageSquareQuote } from 'lucide-react'
import { StudentPill, StudentSectionHeader, StudentStatCard } from '../../_components/StudentShell'

const initialReports = [
  { week: 1, title: 'Làm quen môi trường công ty', status: 'Đã duyệt', file: 'week1.pdf', note: 'Giới thiệu cấu trúc phòng ban', updated: '12/05/2026' },
  { week: 2, title: 'Nghiên cứu công nghệ', status: 'Đã duyệt', file: 'week2.pdf', note: 'Khảo sát stack nội bộ', updated: '19/05/2026' },
  { week: 3, title: 'Phát triển tính năng A', status: 'Nháp', file: '—', note: 'Đang viết dàn ý báo cáo', updated: '23/05/2026' },
]

export default function StudentReportsTTTNPage() {
  const [reports, setReports] = useState(initialReports)
  const [selectedWeek, setSelectedWeek] = useState(initialReports[0].week)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitForm, setSubmitForm] = useState({
    week: String(initialReports.length + 1),
    title: '',
    note: '',
    file: '',
  })

  const selectedReport = useMemo(
    () => reports.find((report) => report.week === selectedWeek) ?? reports[0],
    [selectedWeek, reports]
  )

  const approvedCount = reports.filter((report) => report.status === 'Đã duyệt').length
  const draftCount = reports.filter((report) => report.status === 'Nháp').length
  const pendingCount = reports.filter((report) => report.status === 'Chờ duyệt').length

  const openSubmitModal = () => {
    const nextWeek = Math.max(...reports.map((report) => report.week)) + 1
    setSubmitForm({
      week: String(nextWeek),
      title: '',
      note: '',
      file: '',
    })
    setSubmitOpen(true)
  }

  const handleSubmitReport = () => {
    const nextWeek = Number(submitForm.week)

    if (!Number.isFinite(nextWeek) || nextWeek <= 0) {
      alert('Vui lòng nhập số tuần hợp lệ.')
      return
    }

    if (!submitForm.title.trim() || !submitForm.note.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung nhật ký.')
      return
    }

    const nextReport = {
      week: nextWeek,
      title: submitForm.title.trim(),
      status: 'Chờ duyệt',
      file: submitForm.file.trim() || `week${nextWeek}.pdf`,
      note: submitForm.note.trim(),
      updated: new Date().toLocaleDateString('vi-VN'),
    }

    setReports((current) => {
      const withoutWeek = current.filter((report) => report.week !== nextReport.week)
      return [...withoutWeek, nextReport].sort((left, right) => left.week - right.week)
    })
    setSelectedWeek(nextReport.week)
    setSubmitOpen(false)
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

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <StudentStatCard title="Đã duyệt" value={`${approvedCount}`} hint="Bài đã được giảng viên xác nhận" accent="green" />
        <StudentStatCard title="Nháp" value={`${draftCount}`} hint="Bản đang soạn hoặc chờ nộp" accent="orange" />
        <StudentStatCard title="Chờ duyệt" value={`${pendingCount}`} hint="Bản đã nộp và đang chờ phản hồi" accent="violet" />
      </div>

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
            <div className="mt-2 text-sm font-semibold text-slate-900">Ổn, chỉ cần bổ sung số liệu.</div>
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
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="text-xs text-slate-500">Tệp đính kèm</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{selectedReport.file}</div>
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
            <StudentPill tone="green">{reports.length} tuần</StudentPill>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 text-left">Tuần</th>
                <th className="px-5 py-3 text-left">Nội dung</th>
                <th className="px-5 py-3 text-left">File</th>
                <th className="px-5 py-3 text-left">Trạng thái</th>
                <th className="px-5 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
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
                    <td className="px-5 py-4 text-[#1976D2]">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {report.file}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StudentPill tone={report.status === 'Đã duyệt' ? 'green' : report.status === 'Chờ duyệt' ? 'orange' : 'slate'}>{report.status}</StudentPill>
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
        </section>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="text-sm font-semibold text-slate-900">Xem nhanh báo cáo</div>
            <div className="mt-4 rounded-[22px] bg-white/90 p-4">
              <div className="text-xs text-slate-500">Đang chọn</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">Tuần {selectedReport.week}</div>
              <div className="mt-1 text-sm text-slate-600">{selectedReport.title}</div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#1976D2]" /> File: {selectedReport.file}</div>
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
            <div className="text-sm font-semibold text-slate-900">Ghi chú phản hồi</div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <MessageSquareQuote className="mt-0.5 h-4 w-4 text-[#1976D2]" />
                <div>
                  <div className="font-medium text-slate-900">Tuần 1</div>
                  <div>Hoàn thành tốt phần giới thiệu, giữ đúng format.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <MessageSquareQuote className="mt-0.5 h-4 w-4 text-[#1976D2]" />
                <div>
                  <div className="font-medium text-slate-900">Tuần 2</div>
                  <div>Thêm rõ công nghệ sử dụng và kết quả thử nghiệm.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <MessageSquareQuote className="mt-0.5 h-4 w-4 text-[#1976D2]" />
                <div>
                  <div className="font-medium text-slate-900">Tuần {selectedReport.week}</div>
                  <div>{selectedReport.note}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {submitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.3)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Nộp nhật ký TTTN</div>
                <div className="text-xs text-slate-500">Nhập tuần, tiêu đề, nội dung và tên file báo cáo</div>
              </div>
              <button
                type="button"
                onClick={() => setSubmitOpen(false)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Đóng popup"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="text-sm font-medium text-slate-700">Tuần báo cáo</div>
                  <input
                    type="number"
                    min={1}
                    value={submitForm.week}
                    onChange={(event) => setSubmitForm((current) => ({ ...current, week: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    placeholder="4"
                  />
                </label>
                <label className="block">
                  <div className="text-sm font-medium text-slate-700">Tên nhật ký</div>
                  <input
                    value={submitForm.title}
                    onChange={(event) => setSubmitForm((current) => ({ ...current, title: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    placeholder="Ví dụ: Tích hợp API đăng ký"
                  />
                </label>
                <label className="block md:col-span-2">
                  <div className="text-sm font-medium text-slate-700">Nội dung báo cáo</div>
                  <textarea
                    rows={5}
                    value={submitForm.note}
                    onChange={(event) => setSubmitForm((current) => ({ ...current, note: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    placeholder="Mô tả công việc, kết quả, khó khăn và hướng xử lý..."
                  />
                </label>
                <div className="block md:col-span-2">
                  <div className="text-sm font-medium text-slate-700 mb-1">Tải file đính kèm lên</div>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500 font-medium">
                          {submitForm.file ? `Đã chọn: ${submitForm.file}` : 'Kéo thả hoặc nhấp để chọn file nhật ký'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Hỗ trợ PDF, Word, ZIP (tối đa 20MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setSubmitForm((current) => ({ ...current, file: file.name }))
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Sau khi nộp, bản ghi sẽ được thêm vào danh sách với trạng thái <span className="font-semibold">Chờ duyệt</span>.
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setSubmitOpen(false)} className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]"
                >
                  <Upload className="h-4 w-4" />
                  Gửi nhật ký
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
