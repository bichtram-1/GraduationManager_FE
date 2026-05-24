'use client'

import { useMemo, useState } from 'react'
import { BarChart3, Building2, CheckCircle2, FileText, MapPin, Search, ShieldCheck, Users, ClipboardList, CalendarDays, Phone, Mail } from 'lucide-react'
import { StudentPill, StudentSectionHeader } from '../_components/StudentShell'

type Company = {
  code: string
  name: string
  field: string
  address: string
  mentor: string
  phone: string
  email: string
  slots: number
  duration: string
  status: string
  highlights: string[]
}

const companies: Company[] = [
  {
    code: 'C001',
    name: 'FPT Software',
    field: 'Phần mềm',
    address: 'Quận 9, TP.HCM',
    mentor: 'Nguyễn A',
    phone: '0901234567',
    email: 'mentor.fpt@fpt.com',
    slots: 15,
    duration: '8 tuần',
    status: 'Đã duyệt',
    highlights: ['Có mentor kỹ thuật', 'Hỗ trợ onsite', 'Phù hợp backend/frontend'],
  },
  {
    code: 'C002',
    name: 'VNG Corp',
    field: 'Internet',
    address: 'Quận 7, TP.HCM',
    mentor: 'Trần B',
    phone: '0909111222',
    email: 'mentor.vng@vng.com',
    slots: 8,
    duration: '10 tuần',
    status: 'Đã duyệt',
    highlights: ['Môi trường product', 'Quy trình rõ ràng', 'Có bài test đầu vào'],
  },
  {
    code: 'C006',
    name: 'MoMo',
    field: 'Fintech',
    address: 'Quận 3, TP.HCM',
    mentor: 'Hoàng F',
    phone: '0988777666',
    email: 'mentor.momo@momo.vn',
    slots: 5,
    duration: '8 tuần',
    status: 'Còn slot',
    highlights: ['Ưu tiên ứng viên chủ động', 'Có code review', 'Thực hành với dự án thực'],
  },
]

export default function StudentInternshipPage() {
  const [query, setQuery] = useState('')
  const [selectedCompany, setSelectedCompany] = useState(companies[0])
  const [note, setNote] = useState('')
  const filtered = useMemo(() => {
    return companies.filter((company) => {
      const text = `${company.code} ${company.name} ${company.field} ${company.address}`.toLowerCase()
      return text.includes(query.toLowerCase())
    })
  }, [query])

  const summary = [
    { title: 'Công ty mở slot', value: companies.length.toString(), hint: 'Đã được Khoa phê duyệt' },
    { title: 'Slot đang mở', value: companies.reduce((total, company) => total + company.slots, 0).toString(), hint: 'Có thể khai báo ngay' },
    { title: 'Đã xem hôm nay', value: '12', hint: 'Sinh viên tương tác với danh sách' },
    { title: 'Đang nổi bật', value: selectedCompany.name, hint: 'Đơn vị đang được chọn' },
  ]

  return (
    <>
      <StudentSectionHeader
        title="Đăng ký thực tập tốt nghiệp"
        description="Tìm công ty, xem slot còn trống và khai báo nơi thực tập của bạn."
        actions={<StudentPill tone="green">Đang mở đăng ký</StudentPill>}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <section key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="inline-flex rounded-2xl bg-gradient-to-br from-[#2196F3] to-[#2563eb] px-3 py-2 text-white shadow-lg shadow-blue-100">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{item.value}</div>
            <div className="mt-1 text-sm font-medium text-slate-700">{item.title}</div>
            <div className="mt-2 text-xs text-slate-500">{item.hint}</div>
          </section>
        ))}
      </div>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">Danh sách công ty</div>
            <div className="text-xs text-slate-500">Các đơn vị đã được Khoa phê duyệt</div>
          </div>
          <StudentPill tone="blue">{filtered.length} công ty</StudentPill>
        </div>

        <div className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="relative max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên, địa chỉ hoặc lĩnh vực..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((company) => (
            <div key={company.code} className={`flex flex-col gap-4 px-5 py-4 hover:bg-slate-50/80 md:flex-row md:items-center md:justify-between ${selectedCompany.code === company.code ? 'bg-blue-50/50' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#1976D2]">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-medium text-slate-900">{company.name}</div>
                    <StudentPill tone="green">{company.field}</StudentPill>
                    <StudentPill tone={company.status === 'Đã duyệt' ? 'blue' : 'orange'}>{company.status}</StudentPill>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" /> {company.address}</div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Mentor: {company.mentor}</span>
                    <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {company.phone}</span>
                    <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {company.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 self-start md:self-auto">
                <div className="text-right">
                  <div className="text-xs text-slate-500">Slot</div>
                  <div className="text-sm font-medium text-emerald-600">{company.slots}</div>
                </div>
                <button onClick={() => setSelectedCompany(company)} className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]">
                  <FileText className="h-4 w-4" />
                  Khai báo
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Chi tiết công ty</div>
              <div className="text-xs text-slate-500">Xem nhanh đơn vị đang được chọn</div>
            </div>
            <StudentPill tone="blue">{selectedCompany.code}</StudentPill>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Tên công ty</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{selectedCompany.name}</div>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Lĩnh vực</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{selectedCompany.field}</div>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4 md:col-span-2">
              <div className="text-xs text-slate-500">Địa chỉ</div>
              <div className="mt-1 text-sm text-slate-700">{selectedCompany.address}</div>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Mentor</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{selectedCompany.mentor}</div>
              <div className="mt-1 text-xs text-slate-500">{selectedCompany.phone}</div>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Slot còn lại</div>
              <div className="mt-1 text-3xl font-semibold text-emerald-600">{selectedCompany.slots}</div>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4 md:col-span-2">
              <div className="text-xs text-slate-500">Điểm nhấn</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {selectedCompany.highlights.map((item) => (
                  <div key={item} className="rounded-2xl bg-white px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Quy trình đăng ký</div>
            <StudentPill tone="blue">{selectedCompany.duration}</StudentPill>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3"><ShieldCheck className="h-4 w-4 text-[#1976D2]" /> Chọn công ty phù hợp</div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3"><FileText className="h-4 w-4 text-[#1976D2]" /> Khai báo nơi thực tập</div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Chờ xác nhận từ Khoa</div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3"><Users className="h-4 w-4 text-[#1976D2]" /> Cập nhật thông tin mentor</div>
          </div>

          <div className="mt-5 rounded-[24px] bg-white/85 p-4 ring-1 ring-slate-200">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><ClipboardList className="h-4 w-4 text-[#1976D2]" /> Phiếu khai báo nhanh</div>
            <div className="mt-3 space-y-3 text-sm">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-600">Đơn vị: {selectedCompany.name}</div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-600">Mentor: {selectedCompany.mentor}</div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-600">Ghi chú: {note || 'Chưa có ghi chú bổ sung'}</div>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                placeholder="Nhập ghi chú ngắn cho khoa hoặc mentor..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400"
              />
              <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]">
                <CalendarDays className="h-4 w-4" />
                Gửi khai báo
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
