'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, FileText, Plus, Upload, Clock3, MessageSquareQuote } from 'lucide-react'
import { StudentPill, StudentSectionHeader, StudentStatCard } from '../../_components/StudentShell'

const reports = [
  { week: 1, title: 'Làm quen môi trường công ty', status: 'Đã duyệt', file: 'week1.pdf', note: 'Giới thiệu cấu trúc phòng ban', updated: '12/05/2026' },
  { week: 2, title: 'Nghiên cứu công nghệ', status: 'Đã duyệt', file: 'week2.pdf', note: 'Khảo sát stack nội bộ', updated: '19/05/2026' },
  { week: 3, title: 'Phát triển tính năng A', status: 'Nháp', file: '—', note: 'Đang viết dàn ý báo cáo', updated: '23/05/2026' },
]

export default function StudentReportsTTTNPage() {
  const [selectedWeek, setSelectedWeek] = useState(reports[0].week)

  const selectedReport = useMemo(
    () => reports.find((report) => report.week === selectedWeek) ?? reports[0],
    [selectedWeek]
  )

  const approvedCount = reports.filter((report) => report.status === 'Đã duyệt').length
  const draftCount = reports.filter((report) => report.status === 'Nháp').length

  return (
    <>
      <StudentSectionHeader
        title="Báo cáo TTTN"
        description="Nộp nhật ký thực tập hàng tuần, xem tiến độ duyệt và mở nhanh từng bản nộp như trong bộ design mẫu."
        actions={(
          <button className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]">
            <Plus className="h-4 w-4" />
            Nộp nhật ký
          </button>
        )}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <StudentStatCard title="Đã duyệt" value={`${approvedCount}`} hint="Bài đã được giảng viên xác nhận" accent="green" />
        <StudentStatCard title="Nháp" value={`${draftCount}`} hint="Bản đang soạn hoặc chờ nộp" accent="orange" />
        <StudentStatCard title="Tuần hiện tại" value={`W${selectedReport.week}`} hint="Đang xem chi tiết báo cáo" accent="violet" />
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
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="text-xs text-slate-500">Tuần đang xem</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">W{selectedReport.week}</div>
          <div className="mt-2 text-sm text-slate-500">{selectedReport.title}</div>
        </section>
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="text-xs text-slate-500">Tệp đính kèm</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{selectedReport.file}</div>
          <div className="mt-2 text-sm text-slate-500">File báo cáo hiện tại</div>
        </section>
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
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
                      <StudentPill tone={report.status === 'Đã duyệt' ? 'green' : 'slate'}>{report.status}</StudentPill>
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
    </>
  )
}
