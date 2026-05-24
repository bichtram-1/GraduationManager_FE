'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, FileText, GitBranch, Plus, Upload, Clock3, MessageSquareQuote, Rocket } from 'lucide-react'
import { StudentPill, StudentSectionHeader, StudentStatCard } from '../../_components/StudentShell'

const milestones = [
  { name: 'Bản thảo Chương 1', status: 'Đã duyệt', file: 'chuong1.pdf', repo: 'github.com/user/project', note: 'Phạm vi đề tài và tổng quan', updated: '05/05/2026' },
  { name: 'Bản thảo Chương 2', status: 'Đang chấm điểm', file: 'chuong2.pdf', repo: 'github.com/user/project', note: 'Thiết kế và cơ sở lý thuyết', updated: '14/05/2026' },
  { name: 'Báo cáo chính thức', status: 'Nháp', file: '—', repo: '—', note: 'Hoàn thiện kết luận và phụ lục', updated: '23/05/2026' },
]

export default function StudentReportsDATNPage() {
  const [selectedMilestone, setSelectedMilestone] = useState(milestones[0].name)

  const selected = useMemo(
    () => milestones.find((milestone) => milestone.name === selectedMilestone) ?? milestones[0],
    [selectedMilestone]
  )

  const approvedCount = milestones.filter((milestone) => milestone.status === 'Đã duyệt').length
  const draftCount = milestones.filter((milestone) => milestone.status === 'Nháp').length

  return (
    <>
      <StudentSectionHeader
        title="Báo cáo ĐATN"
        description="Nộp bản thảo từng giai đoạn, theo dõi phản hồi và trạng thái chấm của giảng viên theo bố cục chi tiết hơn."
        actions={(
          <button className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]">
            <Plus className="h-4 w-4" />
            Nộp bản thảo
          </button>
        )}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <StudentStatCard title="Đã duyệt" value={`${approvedCount}`} hint="Bản thảo đã được xác nhận" accent="green" />
        <StudentStatCard title="Nháp" value={`${draftCount}`} hint="Giai đoạn chưa nộp chính thức" accent="orange" />
        <StudentStatCard title="Mốc đang xem" value={selected.name.replace('Bản thảo ', '')} hint="Chi tiết bản thảo được chọn" accent="blue" />
      </div>

      <section className="mb-5 grid gap-4 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#1976D2] ring-1 ring-blue-100">
            <Rocket className="h-3.5 w-3.5" />
            Luồng nộp đồ án
          </div>
          <div className="mt-3 text-lg font-semibold text-slate-900">Theo dõi tiến độ từng mốc</div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Mỗi bản thảo có file, kho mã nguồn, nhận xét và thời điểm cập nhật để bạn nắm nhanh trạng thái đồ án.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Kho nguồn</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">GitHub / private repo</div>
          </div>
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
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="text-xs text-slate-500">Mốc đang xem</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{selected.name}</div>
          <div className="mt-2 text-sm text-slate-500">{selected.note}</div>
        </section>
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="text-xs text-slate-500">File nộp</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{selected.file}</div>
          <div className="mt-2 text-sm text-slate-500">Tài liệu đính kèm</div>
        </section>
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
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
            <StudentPill tone="blue">3 mốc nộp</StudentPill>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 text-left">Giai đoạn</th>
                <th className="px-5 py-3 text-left">File</th>
                <th className="px-5 py-3 text-left">Kho mã nguồn</th>
                <th className="px-5 py-3 text-left">Trạng thái</th>
                <th className="px-5 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((milestone) => {
                const active = selectedMilestone === milestone.name
                return (
                  <tr key={milestone.name} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${active ? 'bg-blue-50/60' : ''}`}>
                    <td className="px-5 py-4 text-slate-700">
                      <div className="space-y-1">
                        <div className="font-medium text-slate-900">{milestone.name}</div>
                        <div className="text-xs text-slate-500">{milestone.note}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#1976D2]">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {milestone.file}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <GitBranch className="h-4 w-4" />
                        {milestone.repo}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StudentPill tone={milestone.status === 'Đã duyệt' ? 'green' : milestone.status === 'Đang chấm điểm' ? 'orange' : 'slate'}>
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
        </section>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="text-sm font-semibold text-slate-900">Xem nhanh mốc nộp</div>
            <div className="mt-4 rounded-[22px] bg-white/90 p-4">
              <div className="text-xs text-slate-500">Đang chọn</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{selected.name}</div>
              <div className="mt-1 text-sm text-slate-600">{selected.note}</div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#1976D2]" /> File: {selected.file}</div>
                <div className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-[#1976D2]" /> Repo: {selected.repo}</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#1976D2]" /> {selected.status}</div>
                <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Cập nhật: {selected.updated}</div>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-white/80 p-4">Giữ repo cập nhật sớm để giảng viên có thể xem lịch sử thay đổi.</div>
              <div className="rounded-2xl bg-white/80 p-4">Bản chính thức nên đính kèm cả file thuyết minh và link nguồn.</div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="text-sm font-semibold text-slate-900">Ghi chú phản hồi</div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <MessageSquareQuote className="mt-0.5 h-4 w-4 text-[#1976D2]" />
                <div>
                  <div className="font-medium text-slate-900">Chương 1</div>
                  <div>Phần tổng quan tốt, thêm trích dẫn tài liệu tham khảo.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <MessageSquareQuote className="mt-0.5 h-4 w-4 text-[#1976D2]" />
                <div>
                  <div className="font-medium text-slate-900">Chương 2</div>
                  <div>Cần mô tả rõ hơn kiến trúc và phân chia module.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <MessageSquareQuote className="mt-0.5 h-4 w-4 text-[#1976D2]" />
                <div>
                  <div className="font-medium text-slate-900">Mốc hiện tại</div>
                  <div>{selected.note}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
