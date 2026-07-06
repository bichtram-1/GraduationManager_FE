'use client'

import { useMemo, useState, useEffect, ChangeEvent } from 'react'
import Link from 'next/link'
import { CheckCircle2, FileText, Plus, Upload, Clock3, MessageSquareQuote, Rocket, Users, GraduationCap } from 'lucide-react'
import { StudentPill, StudentSectionHeader } from '../../_components/StudentShell'
import { StudentButton, StudentField, StudentFilterTabs, StudentInputClass, StudentModal, getReportStatusTone } from '../../_components/StudentUI'
import { studentApi, IDatnProgressReport, IThesisRegistration } from '@/lib/api/studentApi'
import { uploadApi } from '@/lib/api/uploadApi'
import { COMMON_LABELS } from '@/constants/commonLabels'
import { message } from 'antd'

type StatusFilter = 'all' | 'Đã nộp' | 'Thiếu' | 'Chưa nộp'

export default function StudentReportsDATNPage() {
  const [milestones, setMilestones] = useState<IDatnProgressReport[]>([])
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [submitOpen, setSubmitOpen] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [submitForm, setSubmitForm] = useState({
    week: '1',
    name: '',
    fileName: '',
    fileUrl: '',
    note: '',
  })
  const [loading, setLoading] = useState(true)
  const [registration, setRegistration] = useState<IThesisRegistration | null>(null)

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
          setSelectedWeek(reportsData[0].week)
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
    return milestones.find((milestone) => milestone.week === selectedWeek)
      ?? milestones[0]
      ?? { week: 1, name: 'Chưa có bản thảo', status: 'Chưa nộp', file: 'Chưa có', note: 'Chưa có bản thảo nào được nộp.', updated: 'Chưa cập nhật' }
  }, [selectedWeek, milestones])

  const submittedCount = milestones.filter((milestone) => milestone.status === 'Đã nộp').length
  const missingCount = milestones.filter((milestone) => milestone.status === 'Thiếu').length
  const notSubmittedCount = milestones.filter((milestone) => milestone.status === 'Chưa nộp').length

  const filteredMilestones = useMemo(() => {
    if (statusFilter === 'all') return milestones
    return milestones.filter((milestone) => milestone.status === statusFilter)
  }, [milestones, statusFilter])

  const latestTeacherComment = useMemo(() => {
    const withComment = milestones.filter((milestone) => milestone.teacherComment)
    if (withComment.length === 0) return 'Chưa có nhận xét từ giảng viên.'
    const latest = withComment.reduce((acc, milestone) => (milestone.week > acc.week ? milestone : acc))
    return latest.teacherComment || 'Chưa có nhận xét từ giảng viên.'
  }, [milestones])

  const openSubmitModal = () => {
    const unsubmitted = milestones.filter((m) => m.status === 'Chưa nộp')
    const nextWeek = unsubmitted.length > 0 
      ? Math.min(...unsubmitted.map((m) => m.week)) 
      : (milestones.length > 0 ? Math.max(...milestones.map((milestone) => milestone.week)) + 1 : 1)
    setSubmitForm({
      week: String(nextWeek),
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
        message.success('Tải file lên thành công!')
      } else {
        message.error('Tải file lên thất bại!')
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Tải file lên thất bại!'
      message.error(errorMsg)
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmitDraft = async () => {
    const week = Number(submitForm.week)
    const name = submitForm.name.trim()
    const note = submitForm.note.trim()

    if (!Number.isInteger(week) || week <= 0) {
      message.error('Vui lòng nhập số tuần hợp lệ (số nguyên dương).')
      return
    }

    if (!name) {
      message.error('Vui lòng nhập tên bản thảo.')
      return
    }

    if (!note) {
      message.error('Vui lòng nhập nội dung bản thảo.')
      return
    }

    if (!submitForm.fileUrl) {
      message.error('Vui lòng tải lên file đính kèm bản thảo!')
      return
    }

    try {
      setLoading(true)
      const nextMilestone = await studentApi.submitDatnReport({
        week,
        name,
        note,
        file: submitForm.fileUrl,
        fileName: submitForm.fileName
      })

      setMilestones((current) => {
        const withoutMilestone = current.filter((item) => item.week !== nextMilestone.week)
        return [nextMilestone, ...withoutMilestone]
      })
      setSelectedWeek(nextMilestone.week)
      setSubmitOpen(false)
      message.success('Gửi bản thảo thành công!')
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra khi gửi bản thảo.'
      message.error(errorMsg)
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
          { key: 'Đã nộp', label: 'Đã nộp', count: submittedCount },
          { key: 'Thiếu', label: 'Thiếu', count: missingCount },
          { key: 'Chưa nộp', label: 'Chưa nộp', count: notSubmittedCount },
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
          {registration && (
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-[#1976D2] shrink-0" />
                <span>{registration.groupName} · {registration.topicTitle}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#1976D2] shrink-0" />
                <span>GVHD: {registration.instructor || 'Chưa phân công'}</span>
              </div>
              {registration.members && registration.members.length > 0 && (
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-[#1976D2] shrink-0 mt-0.5" />
                  <span>Thành viên: {registration.members.map((m) => m.name).join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Nhận xét gần nhất</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{latestTeacherComment}</div>
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
          <div className="text-xs text-slate-500">Tuần đang xem</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">W{selected.week}</div>
          <div className="mt-2 text-sm text-slate-500">{selected.name}</div>
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
                <th className="px-5 py-3 text-left">Tuần</th>
                <th className="px-5 py-3 text-left">Giai đoạn</th>
                <th className="px-5 py-3 text-left">File</th>
                <th className="px-5 py-3 text-left">Trạng thái</th>
                <th className="px-5 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredMilestones.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">Không có bản thảo nào phù hợp bộ lọc.</td>
                </tr>
              )}
              {filteredMilestones.map((milestone) => {
                const active = selectedWeek === milestone.week
                return (
                  <tr key={milestone.week} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${active ? 'bg-blue-50/60' : ''}`}>
                    <td className="px-5 py-4 font-medium text-slate-900">W{milestone.week}</td>
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
                        onClick={() => setSelectedWeek(milestone.week)}
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
              <div className="mt-1 text-lg font-semibold text-slate-900">Tuần {selected.week} · {selected.name}</div>
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
            <div className="mt-4 text-sm text-slate-600">
              {selected.teacherComment ? (
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <MessageSquareQuote className="mt-0.5 h-4 w-4 text-[#1976D2]" />
                  <div>
                    <div className="font-medium text-slate-900">Tuần {selected.week}</div>
                    <div>{selected.teacherComment}</div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 text-slate-500">Chưa có nhận xét từ giảng viên cho mốc này.</div>
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
          <StudentField label="Tên bản thảo">
            <input
              value={submitForm.name}
              onChange={(event) => setSubmitForm((current) => ({ ...current, name: event.target.value }))}
              className={StudentInputClass()}
              placeholder="Ví dụ: Bản thảo Chương 3"
            />
          </StudentField>
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
          Bản thảo sau khi gửi sẽ chuyển sang trạng thái <span className="font-semibold">Đã nộp</span> và được chọn ngay trên danh sách.
        </div>
      </StudentModal>
    </>
  )
}
