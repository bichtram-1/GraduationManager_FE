'use client'

import { useMemo, useState } from 'react'
import { BarChart3, BookOpen, Eye, GitBranch, Mail, MapPin, Phone, Search, ShieldCheck, Star, Users, Clock3 } from 'lucide-react'
import { TeacherPill, TeacherSectionHeader } from '../_components/TeacherShell'
import { TeacherButton, TeacherCard } from '../_components/TeacherUI'

const TTTN = [
  { id: '20520001', name: 'Nguyễn Văn A', company: 'FPT Software', mentor: 'TS. Nguyễn Văn X', phone: '0901 234 567', email: 'xnv@fpt.com', report: 'Tuần 3', status: 'Đã nộp', date: '15/05/2026' },
  { id: '20520002', name: 'Trần Thị B', company: 'VNG Corp', mentor: 'ThS. Lê Thị Y', phone: '0909 111 222', email: 'ylt@vng.com', report: 'Tuần 2', status: 'Trễ hạn', date: '08/05/2026' },
  { id: '20520003', name: 'Phạm Văn C', company: 'TMA Solutions', mentor: 'TS. Trần Văn Z', phone: '0933 444 555', email: 'ztv@tma.com', report: 'Tuần 3', status: 'Đã nộp', date: '16/05/2026' },
]

const DATN = [
  { group: 'G01', topic: 'Hệ thống quản lý thư viện điện tử', members: 2, latest: 'Bản thảo Chương 2', status: 'Đã nộp', date: '12/05/2026', github: 'github.com/user/library-system' },
  { group: 'G02', topic: 'Ứng dụng AI nhận diện hình ảnh', members: 3, latest: 'Bản thảo Chương 1', status: 'Đang chấm điểm', date: '10/05/2026', github: 'github.com/user/ai-image-recognition' },
  { group: 'G05', topic: 'Hệ thống bán hàng trực tuyến', members: 2, latest: 'Bản thảo Chương 3', status: 'Đã nộp', date: '15/05/2026', github: 'github.com/user/ecommerce-system' },
]

export default function TeacherStudentsPage() {
  const [segment, setSegment] = useState<'TTTN' | 'ĐATN'>('TTTN')
  const [query, setQuery] = useState('')
  const [selectedTTTN, setSelectedTTTN] = useState(TTTN[0])
  const [selectedDATN, setSelectedDATN] = useState(DATN[0])
  const [comments, setComments] = useState<Record<string, string>>({})
  const [commentModal, setCommentModal] = useState<{ open: boolean; id?: string; text: string }>({ open: false, id: undefined, text: '' })
  const [reportModal, setReportModal] = useState<{ open: boolean; id?: string; type?: 'TTTN' | 'DATN' }>({ open: false, id: undefined, type: undefined })

  const commentTargetLabel = useMemo(() => {
    if (!commentModal.id) return ''
    const student = TTTN.find((s) => s.id === commentModal.id)
    if (student) return `${student.name} · ${student.id}`
    const group = DATN.find((g) => g.group === commentModal.id)
    if (group) return `${group.topic} · ${group.group}`
    return commentModal.id
  }, [commentModal.id])

  const filteredTTTN = useMemo(
    () => TTTN.filter((row) => [row.id, row.name, row.company, row.mentor].some((value) => value.toLowerCase().includes(query.toLowerCase()))),
    [query]
  )

  const filteredDATN = useMemo(
    () => DATN.filter((row) => [row.group, row.topic, row.latest, row.status].some((value) => value.toLowerCase().includes(query.toLowerCase()))),
    [query]
  )

  const summary = [
    { title: 'Sinh viên thực tập', value: TTTN.length.toString(), hint: 'Đang theo dõi báo cáo tuần' },
    { title: 'Nhóm đồ án', value: DATN.length.toString(), hint: 'Đã gắn với đề tài và repo' },
    { title: 'Trễ hạn', value: TTTN.filter((i) => i.status === 'Trễ hạn').length.toString(), hint: 'Cần gửi nhắc nộp bài' },
  ]

  return (
    <>
      <TeacherSectionHeader
        title="Hướng dẫn sinh viên"
        description="Theo dõi sinh viên thực tập và nhóm đồ án với giao diện phân cấp rõ ràng."
        actions={(
          <>
            <TeacherPill tone="blue">TTTN: {TTTN.length}</TeacherPill>
            <TeacherPill tone="green">ĐATN: {DATN.length}</TeacherPill>
          </>
        )}
      />

      <section className="mb-5 rounded-3xl border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <TeacherPill tone="blue">Theo dõi tập trung</TeacherPill>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">Mọi sinh viên TTTN và nhóm ĐATN được gom chung vào một dashboard để giảng viên xem nhanh hơn.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Khối này nhấn mạnh số lượng, trạng thái và hành động ngắn: mở chi tiết, Nhận xét, hoặc nhắc nộp đúng nhịp.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[440px]">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Đang xem</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{segment}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Kết quả lọc</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{segment === 'TTTN' ? filteredTTTN.length : filteredDATN.length}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Tương tác</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">Xem nhanh</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <TeacherCard key={item.title} className="p-5">
            <div className="inline-flex rounded-2xl bg-linear-to-br from-[#2196F3] to-[#2563eb] px-3 py-2 text-white shadow-lg shadow-blue-100">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{item.value}</div>
            <div className="mt-1 text-sm font-medium text-slate-700">{item.title}</div>
            <div className="mt-2 text-xs text-slate-500">{item.hint}</div>
          </TeacherCard>
        ))}
      </div>

      <section className="mb-5 flex flex-wrap items-center gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        {(['TTTN', 'ĐATN'] as const).map((item) => (
          <button key={item} type="button" onClick={() => setSegment(item)} className={`inline-flex items-center gap-2 rounded-[20px] px-4 py-2.5 text-sm font-medium transition ${segment === item ? 'bg-[#2196F3] text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}>
            {item === 'TTTN' ? <ShieldCheck /> : <Users />}
            {item === 'TTTN' ? 'Sinh viên thực tập' : 'Sinh viên đồ án'}
          </button>
        ))}

        <div className="ml-auto w-full max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm MSSV, tên, công ty, đề tài..." className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white" />
          </div>
        </div>
      </section>

      {segment === 'TTTN' ? (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <TeacherCard>
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Sinh viên thực tập</div>
                <div className="text-xs text-slate-500">Theo dõi báo cáo hàng tuần và tình trạng nộp bài</div>
              </div>
              <TeacherPill tone="orange">{filteredTTTN.length} sinh viên</TeacherPill>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 text-left">MSSV</th>
                  <th className="px-5 py-3 text-left">Họ tên</th>
                  <th className="px-5 py-3 text-left">Công ty</th>
                  <th className="px-5 py-3 text-left">Mentor</th>
                  <th className="px-5 py-3 text-left">Báo cáo</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredTTTN.map((student) => (
                  <tr key={student.id} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${selectedTTTN.id === student.id ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-5 py-4 font-medium text-[#1976D2]">{student.id}</td>
                    <td className="px-5 py-4 text-slate-900">{student.name}</td>
                    <td className="px-5 py-4 text-slate-600">{student.company}</td>
                    <td className="px-5 py-4 text-slate-600">
                      <div className="space-y-1">
                        <div className="font-medium text-slate-900">{student.mentor}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500"><Phone className="h-3 w-3" /> {student.phone}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500"><Mail className="h-3 w-3" /> {student.email}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-600">{student.report}</div>
                        <TeacherPill tone={student.status === 'Đã nộp' ? 'green' : 'orange'}>{student.status}</TeacherPill>
                        <div className="text-xs text-slate-500">{student.date}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <TeacherButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => { setSelectedTTTN(student); setReportModal({ open: true, id: student.id, type: 'TTTN' }) }}>
                          <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> Xem</span>
                        </TeacherButton>
                        <TeacherButton variant="primary" className="px-3 py-1.5 text-xs" onClick={() => setCommentModal({ open: true, id: student.id, text: comments[student.id] ?? '' })}>
                          <span className="inline-flex items-center gap-1"><Star className="h-4 w-4" /> Nhận xét</span>
                        </TeacherButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TeacherCard>

          <TeacherCard className="space-y-4 p-5">
            <div className="text-sm font-semibold text-slate-900">Xem nhanh sinh viên</div>
            <div className="rounded-3xl bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-4">
              <div className="text-xs text-slate-500">Đang chọn</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{selectedTTTN.name}</div>
              <div className="mt-1 text-sm text-slate-600">{selectedTTTN.company}</div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#1976D2]" /> {selectedTTTN.report} · {selectedTTTN.status}</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#1976D2]" /> {selectedTTTN.phone}</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#1976D2]" /> {selectedTTTN.email}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#1976D2]" /> Mentor: {selectedTTTN.mentor}</div>
                <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Cập nhật: {selectedTTTN.date}</div>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">Kiểm tra 1 sinh viên trễ hạn và gửi nhắc nộp báo cáo.</div>
              <div className="rounded-2xl bg-slate-50 p-4">Nhận xét 2 báo cáo đã nộp vào cuối tuần.</div>
              <div className="rounded-2xl bg-slate-50 p-4">Xem nhanh file báo cáo mới nhất để nhận xét.</div>
            </div>
            {comments[selectedTTTN.id] && (
              <div className="mt-3 rounded-2xl bg-white/85 p-4 text-sm text-slate-700">
                <div className="text-sm font-medium text-slate-900">Nhận xét đã lưu</div>
                <div className="mt-2 text-sm text-slate-600">{comments[selectedTTTN.id]}</div>
              </div>
            )}
            {/* Hành động gợi ý removed */}
          </TeacherCard>
        </div>
      ) : (

        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <TeacherCard>
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Sinh viên đồ án</div>
                <div className="text-xs text-slate-500">Theo dõi nhóm, tiến độ báo cáo và kho mã nguồn</div>
              </div>
              <TeacherPill tone="blue">{filteredDATN.length} nhóm</TeacherPill>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 text-left">Mã nhóm</th>
                  <th className="px-5 py-3 text-left">Tên đề tài</th>
                  <th className="px-5 py-3 text-left">SV</th>
                  <th className="px-5 py-3 text-left">Báo cáo</th>
                  <th className="px-5 py-3 text-left">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredDATN.map((group) => (
                  <tr key={group.group} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${selectedDATN.group === group.group ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-5 py-4 font-medium text-[#1976D2]">{group.group}</td>
                    <td className="px-5 py-4 text-slate-900">{group.topic}</td>
                    <td className="px-5 py-4 text-slate-600">{group.members}</td>
                    <td className="px-5 py-4 text-slate-600">{group.latest}</td>
                    <td className="px-5 py-4"><TeacherPill tone={group.status === 'Đang chấm điểm' ? 'orange' : 'green'}>{group.status}</TeacherPill></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <TeacherButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => { setSelectedDATN(group); setReportModal({ open: true, id: group.group, type: 'DATN' }) }}>
                          <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> Xem</span>
                        </TeacherButton>
                        <TeacherButton variant="primary" className="px-3 py-1.5 text-xs" onClick={() => setCommentModal({ open: true, id: group.group, text: comments[group.group] ?? '' })}>
                          <span className="inline-flex items-center gap-1"><Star className="h-4 w-4" /> Nhận xét</span>
                        </TeacherButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TeacherCard>

          <TeacherCard className="space-y-4 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5">
            <div className="text-sm font-semibold text-slate-900">Xem nhanh nhóm</div>
            <div className="rounded-3xl bg-white/80 p-4">
              <div className="text-xs text-slate-500">Đang chọn</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{selectedDATN.group}</div>
              <div className="mt-1 text-sm text-slate-600">{selectedDATN.topic}</div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#1976D2]" /> {selectedDATN.members} thành viên</div>
                <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#1976D2]" /> {selectedDATN.latest}</div>
                <div className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-[#1976D2]" /> {selectedDATN.github}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#1976D2]" /> Cập nhật: {selectedDATN.date}</div>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-white/80 p-4">Kiểm tra trạng thái GitHub và bản thảo mới nhất của nhóm.</div>
              <div className="rounded-2xl bg-white/80 p-4">Lọc nhóm theo hội đồng hoặc buổi chấm sắp tới.</div>
              <div className="rounded-2xl bg-white/80 p-4">Mở chi tiết nhóm để xem sinh viên và ghi chú.</div>
            </div>
            {comments[selectedDATN.group] && (
              <div className="mt-3 rounded-2xl bg-white/85 p-4 text-sm text-slate-700">
                <div className="text-sm font-medium text-slate-900">Nhận xét đã lưu</div>
                <div className="mt-2 text-sm text-slate-600">{comments[selectedDATN.group]}</div>
              </div>
            )}
            {/* Hành động gợi ý removed */}
          </TeacherCard>
        </div>
      )}

      {/* Report modal (Xem báo cáo) */}
      {reportModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setReportModal({ open: false, id: undefined, type: undefined })} />
          <div className="relative z-50 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{reportModal.type === 'TTTN' ? 'Xem báo cáo' : 'Xem báo cáo'}{reportModal.id ? ` - ${reportModal.type === 'TTTN' ? (TTTN.find(s => s.id === reportModal.id)?.name ?? reportModal.id) : reportModal.id}` : ''}</h3>
              <button className="text-slate-500" onClick={() => setReportModal({ open: false, id: undefined, type: undefined })}>✕</button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{reportModal.type === 'TTTN' ? (TTTN.find(s => s.id === reportModal.id)?.report ?? 'Báo cáo') : (DATN.find(g => g.group === reportModal.id)?.latest ?? 'Báo cáo nhóm')}</div>
                    <div className="mt-1 text-xs text-slate-500">{reportModal.type === 'TTTN' ? `Ngày nộp: ${TTTN.find(s => s.id === reportModal.id)?.date ?? ''}` : `Đề tài: ${DATN.find(g => g.group === reportModal.id)?.topic ?? ''} · Ngày nộp: ${DATN.find(g => g.group === reportModal.id)?.date ?? ''}`}</div>
                  </div>
                  <div className="text-sm text-slate-500">{reportModal.type === 'TTTN' ? (TTTN.find(s => s.id === reportModal.id)?.status ?? '') : (DATN.find(g => g.group === reportModal.id)?.status ?? '')}</div>
                </div>
              </div>

              {reportModal.type === 'DATN' && (
                <div>
                  <div className="text-sm font-medium text-slate-900">GitHub Repository</div>
                  <div className="mt-2 rounded-md border border-slate-100 bg-white p-3 text-sm text-slate-700">
                    {(() => {
                      const repo = DATN.find(g => g.group === reportModal.id)?.github
                      const href = repo ? (repo.startsWith('http') ? repo : `https://${repo}`) : '#'
                      return (<a href={href} target="_blank" rel="noreferrer" className="text-blue-600 underline">{repo}</a>)
                    })()}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-slate-900">File báo cáo</div>
                <div className="mt-2 rounded-md border border-slate-100 bg-white p-3 text-sm text-slate-700">
                  {(() => {
                    const seed = reportModal.type === 'TTTN' ? (TTTN.find(s => s.id === reportModal.id)?.report ?? 'report') : (DATN.find(g => g.group === reportModal.id)?.latest ?? 'report')
                    const fileName = `${seed.replace(/\s+/g, '_').toLowerCase()}.pdf`
                    return (<a href="#" className="text-blue-600 underline">{fileName}</a>)
                  })()}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-900">Nội dung báo cáo</div>
                <div className="mt-2 rounded-md border border-slate-100 bg-white p-4 text-sm text-slate-700">
                  <p className="font-medium">{reportModal.type === 'TTTN' ? (TTTN.find(s => s.id === reportModal.id)?.report ?? '') : (DATN.find(g => g.group === reportModal.id)?.latest ?? '')}</p>
                  <div className="mt-2 text-sm text-slate-600">Bản tóm tắt công việc đã thực hiện, các mục tiêu hoàn thành và kết quả đạt được. Đây là nội dung ví dụ — bạn có thể thay bằng nội dung thực tế lấy từ backend.</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-900">Nhận xét báo cáo (không bắt buộc)</div>
                <textarea value={reportModal.id ? (comments[reportModal.id] ?? '') : ''} onChange={(e) => { if (reportModal.id) setComments(c => ({ ...c, [reportModal.id!]: e.target.value })) }} className="mt-2 h-28 w-full rounded-md border border-slate-200 p-3 text-sm outline-none" placeholder="Nhập nhận xét về báo cáo..." />
              </div>

              <div className="flex justify-end gap-3">
                <button className="rounded-md px-4 py-2 text-sm" onClick={() => setReportModal({ open: false, id: undefined, type: undefined })}>Đóng</button>
                <button className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white" onClick={() => setReportModal({ open: false, id: undefined, type: undefined })}>Lưu nhận xét</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment modal */}
      {commentModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCommentModal({ open: false, id: undefined, text: '' })} />
          <div className="relative z-50 w-full max-w-xl rounded-3xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Nhận xét {commentTargetLabel ? `— ${commentTargetLabel}` : ''}</h3>
            <p className="mt-2 text-sm text-slate-600">Ghi nhận nhận xét cho mục được chọn.</p>
            <textarea autoFocus value={commentModal.text} onChange={(e) => setCommentModal((s) => ({ ...s, text: e.target.value }))} className="mt-4 h-32 w-full rounded-md border border-slate-200 p-3 text-sm outline-none" />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-md px-4 py-2 text-sm" onClick={() => setCommentModal({ open: false, id: undefined, text: '' })}>Hủy</button>
              <button type="button" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white" onClick={() => { if (commentModal.id) setComments((c) => ({ ...c, [commentModal.id!]: commentModal.text })); setCommentModal({ open: false, id: undefined, text: '' }) }}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
