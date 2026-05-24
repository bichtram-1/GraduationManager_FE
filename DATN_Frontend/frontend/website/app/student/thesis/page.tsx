'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Mail, Plus, Users, XCircle, Sparkles, Layers3, CircleCheckBig, CalendarDays, FileText, Clock3, ArrowRight } from 'lucide-react'
import { StudentPill, StudentSectionHeader, StudentStatCard } from '../_components/StudentShell'

const topics = [
  { code: 'DT001', name: 'Xây dựng hệ thống quản lý thư viện điện tử', teacher: 'TS. Nguyễn Văn X', maxSlots: 3, used: 2, desc: 'Quản lý sách, mượn trả, dashboard và phân quyền.', tags: ['Web app', 'Node.js', 'React'] },
  { code: 'DT004', name: 'Nền tảng học tập thông minh', teacher: 'TS. Trần Thị Y', maxSlots: 4, used: 1, desc: 'Tối ưu lộ trình học, nhắc việc và gợi ý nội dung.', tags: ['AI', 'Learning', 'Analytics'] },
  { code: 'DT009', name: 'Dashboard phân tích dữ liệu tuyển sinh', teacher: 'ThS. Lê Văn Z', maxSlots: 2, used: 2, desc: 'Theo dõi KPI tuyển sinh, biểu đồ và bộ lọc đa chiều.', tags: ['BI', 'Dashboard', 'Data'] },
]

export default function StudentThesisPage() {
  const [expanded, setExpanded] = useState<string | null>('DT001')

  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.code === expanded) ?? topics[0],
    [expanded]
  )

  const availableTopics = topics.filter((topic) => topic.used < topic.maxSlots).length
  const fullTopics = topics.length - availableTopics

  return (
    <>
      <StudentSectionHeader
        title="Đề tài ĐATN"
        description="Chọn đề tài phù hợp, xem slot còn trống và tạo nhóm thực hiện đồ án với bố cục chi tiết hơn."
        actions={<StudentPill tone="blue">Đủ điều kiện đăng ký</StudentPill>}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <StudentStatCard title="Đề tài mở" value={`${availableTopics}`} hint="Có thể đăng ký ngay" accent="blue" />
        <StudentStatCard title="Đề tài kín" value={`${fullTopics}`} hint="Đã đủ số lượng thành viên" accent="orange" />
        <StudentStatCard title="Đang xem" value={selectedTopic.code} hint="Đề tài đang mở chi tiết" accent="green" />
      </div>

      <section className="mb-5 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#1976D2] shadow-sm ring-1 ring-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Chọn đề tài theo slot
            </div>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              Mỗi đề tài có thể mở rộng xem thông tin, đăng ký nhóm và mời thành viên ngay trong cùng một màn hình.
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[460px]">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500"><Layers3 className="h-4 w-4 text-[#1976D2]" /> Đề tài mở</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{availableTopics}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500"><CircleCheckBig className="h-4 w-4 text-emerald-500" /> Đã đăng ký</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">1 nhóm</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500"><CalendarDays className="h-4 w-4 text-[#1976D2]" /> Hạn cuối</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">30/04</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {topics.map((topic) => {
          const full = topic.used >= topic.maxSlots
          const active = expanded === topic.code

          return (
            <section key={topic.code} className={`overflow-hidden rounded-[28px] border bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] ${active ? 'border-[#2196F3]' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{topic.code}</div>
                  <div className="mt-1 text-xs text-slate-500">GVHD: {topic.teacher}</div>
                </div>
                <StudentPill tone={full ? 'red' : 'green'}>{full ? 'Hết slot' : 'Còn slot'}</StudentPill>
              </div>
              <div className="space-y-4 p-5">
                <div className="text-sm font-medium text-slate-900">{topic.name}</div>
                <div className="text-xs text-slate-500">{topic.desc}</div>
                <div className="flex flex-wrap gap-2">
                  {topic.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                  <span>Số thành viên tối đa: {topic.maxSlots}</span>
                  <span>Đã có: {topic.used}</span>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setExpanded(topic.code)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    <Users className="h-4 w-4" />
                    Chi tiết
                  </button>
                  <button
                    type="button"
                    disabled={full}
                    onClick={() => setExpanded(expanded === topic.code ? null : topic.code)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  >
                    <Plus className="h-4 w-4" />
                    Đăng ký
                  </button>
                </div>

                {active && !full && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-medium text-slate-900">Mời thành viên nhóm</div>
                    <div className="mt-3 space-y-2">
                      {['20520002', '20520003'].map((studentId) => (
                        <div key={studentId} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-2"><Mail className="text-slate-400" /> MSSV {studentId}</span>
                          <StudentPill tone="orange">Chờ xác nhận</StudentPill>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {full && (
                  <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    <XCircle className="h-4 w-4" />
                    Đề tài đã đủ số lượng thành viên.
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Luồng đăng ký</div>
              <div className="text-xs text-slate-500">Theo dõi các bước từ chọn đề tài đến chốt nhóm</div>
            </div>
            <StudentPill tone="blue">4 bước</StudentPill>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-2">
            {[
              'Chọn đề tài còn slot phù hợp chuyên môn',
              'Mở chi tiết để xem giảng viên hướng dẫn',
              'Đăng ký nhóm và mời các MSSV còn lại',
              'Xác nhận trạng thái trước khi nộp chính thức',
            ].map((step, index) => (
              <div key={step} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-[#1976D2]">
                  <Clock3 className="h-4 w-4" />
                  Bước {index + 1}
                </div>
                <div className="mt-2 text-sm text-slate-700">{step}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-semibold text-slate-900">Xem nhanh đề tài</div>
          <div className="mt-4 rounded-[22px] bg-white/90 p-4">
            <div className="text-xs text-slate-500">Đang chọn</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{selectedTopic.code}</div>
            <div className="mt-1 text-sm text-slate-600">{selectedTopic.name}</div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#1976D2]" /> {selectedTopic.desc}</div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#1976D2]" /> GVHD: {selectedTopic.teacher}</div>
              <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#1976D2]" /> {selectedTopic.used}/{selectedTopic.maxSlots} slot</div>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-white/80 p-4">Mời thành viên sớm để giảng viên duyệt nhóm nhanh hơn.</div>
            <div className="rounded-2xl bg-white/80 p-4">Đề tài kín sẽ hiển thị trạng thái hết slot ngay trên thẻ.</div>
          </div>
          <button type="button" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]">
            <ArrowRight className="h-4 w-4" />
            Tiếp tục đăng ký
          </button>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Lời mời nhóm</div>
              <div className="text-xs text-slate-500">Sinh viên có thể chấp nhận hoặc từ chối lời mời</div>
            </div>
            <StudentPill tone="blue">1 lời mời mới</StudentPill>
          </div>
          <div className="p-5">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">Nguyễn Văn B mời bạn vào nhóm DT001</div>
                  <div className="mt-1 text-xs text-slate-500">Đề tài: Xây dựng hệ thống quản lý thư viện điện tử</div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50">
                    <XCircle className="h-4 w-4" />
                    Từ chối
                  </button>
                  <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Đồng ý
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-semibold text-slate-900">Checklist đăng ký</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Xác nhận đủ thành viên nhóm</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#1976D2]" /> Gửi lời mời cho MSSV còn lại</div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#1976D2]" /> Kiểm tra slot trước khi nộp</div>
          </div>
        </section>
      </div>
    </>
  )
}
