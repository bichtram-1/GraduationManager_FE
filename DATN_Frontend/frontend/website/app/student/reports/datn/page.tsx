'use client'

import { useMemo, useState, useEffect } from 'react'
import { CheckCircle2, FileText, GitBranch, Plus, Upload, Clock3, MessageSquareQuote, Rocket } from 'lucide-react'
import { StudentPill, StudentSectionHeader, StudentStatCard } from '../../_components/StudentShell'
import { studentApi, IDatnProgressReport } from '@/lib/api/studentApi'

export default function StudentReportsDATNPage() {
  const [milestones, setMilestones] = useState<IDatnProgressReport[]>([])
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitForm, setSubmitForm] = useState({
    name: '',
    file: '',
    repo: '',
    note: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    async function load() {
      try {
        const data = await studentApi.getDatnReports()
        if (!mounted) return
        setMilestones(data)
        if (data.length > 0) {
          setSelectedMilestone(data[0].name)
        }
      } catch (_err) {
        if (!mounted) return
        setMilestones([])
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const selected = useMemo(() => {
    return milestones.find((milestone) => milestone.name === selectedMilestone) 
      ?? milestones[0] 
      ?? { name: 'Chưa có bản thảo', status: '—', file: '—', repo: '—', note: 'Chưa có bản thảo nào được nộp.', updated: '—' }
  }, [selectedMilestone, milestones])

  const approvedCount = milestones.filter((milestone) => milestone.status === 'Đã duyệt').length
  const draftCount = milestones.filter((milestone) => milestone.status === 'Nháp').length
  const reviewCount = milestones.filter((milestone) => milestone.status === 'Đang chấm điểm').length

  const openSubmitModal = () => {
    setSubmitForm({
      name: '',
      file: '',
      repo: '',
      note: '',
    })
    setSubmitOpen(true)
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
        file: submitForm.file.trim() || undefined,
        repo: submitForm.repo.trim() || undefined
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
        actions={(
          <button
            type="button"
            onClick={openSubmitModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]"
          >
            <Plus className="h-4 w-4" />
            Nộp bản thảo
          </button>
        )}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <StudentStatCard title="Đã duyệt" value={`${approvedCount}`} hint="Bản thảo đã được xác nhận" accent="green" />
        <StudentStatCard title="Nháp" value={`${draftCount}`} hint="Giai đoạn chưa nộp chính thức" accent="orange" />
        <StudentStatCard title="Đang chấm" value={`${reviewCount}`} hint="Bản đã nộp và đang chờ phản hồi" accent="blue" />
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
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="text-xs text-slate-500">Mốc đang xem</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{selected.name}</div>
          <div className="mt-2 text-sm text-slate-500">{selected.note}</div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="text-xs text-slate-500">File nộp</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{selected.file}</div>
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

      {submitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.3)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Nộp bản thảo ĐATN</div>
                <div className="text-xs text-slate-500">Nhập giai đoạn, file, repo và nội dung bản thảo</div>
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
                <label className="block md:col-span-2">
                  <div className="text-sm font-medium text-slate-700">Tên bản thảo</div>
                  <input
                    value={submitForm.name}
                    onChange={(event) => setSubmitForm((current) => ({ ...current, name: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    placeholder="Ví dụ: Bản thảo Chương 3"
                  />
                </label>
                <div className="block md:col-span-2">
                  <div className="text-sm font-medium text-slate-700 mb-1">Tải file bản thảo lên</div>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500 font-medium">
                          {submitForm.file ? `Đã chọn: ${submitForm.file}` : 'Kéo thả hoặc nhấp để chọn file'}
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
                <label className="block md:col-span-2">
                  <div className="text-sm font-medium text-slate-700">Kho mã nguồn / link repo</div>
                  <input
                    value={submitForm.repo}
                    onChange={(event) => setSubmitForm((current) => ({ ...current, repo: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    placeholder="github.com/user/project"
                  />
                </label>
                <label className="block md:col-span-2">
                  <div className="text-sm font-medium text-slate-700">Nội dung bản thảo</div>
                  <textarea
                    rows={5}
                    value={submitForm.note}
                    onChange={(event) => setSubmitForm((current) => ({ ...current, note: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    placeholder="Mô tả nội dung, tiến độ, phần đã hoàn thành..."
                  />
                </label>
              </div>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Bản thảo sau khi gửi sẽ chuyển sang trạng thái <span className="font-semibold">Đang chấm điểm</span> và được chọn ngay trên danh sách.
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setSubmitOpen(false)} className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmitDraft}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]"
                >
                  <Upload className="h-4 w-4" />
                  Gửi bản thảo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
