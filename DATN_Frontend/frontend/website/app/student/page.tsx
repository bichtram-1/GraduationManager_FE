import Link from 'next/link'
import { ArrowRight, CalendarDays, CheckCircle2, FileText, GraduationCap, MapPin, Trophy, Upload, Building2, Clock3, TrendingUp } from 'lucide-react'
import { StudentPill, StudentSectionHeader, StudentStatCard } from './_components/StudentShell'

const internshipPartners = [
  { name: 'FPT Software', field: 'Phần mềm', address: 'Quận 9, TP.HCM', slots: '15' },
  { name: 'VNG Corp', field: 'Internet', address: 'Quận 7, TP.HCM', slots: '8' },
  { name: 'MoMo', field: 'Fintech', address: 'Quận 3, TP.HCM', slots: '5' },
]

const pendingTasks = [
  'Khai báo nơi thực tập trước 30/04.',
  'Nộp nhật ký tuần 3 cho GVHD.',
  'Cập nhật bản thảo chương 2 của ĐATN.',
]

const milestones = [
  ['30/04', 'Hết hạn đăng ký TTTN'],
  ['05/05', 'Nộp nhật ký tuần 3'],
  ['20/06', 'Công bố kết quả ĐATN'],
]

export default function StudentIndexPage() {
  return (
    <>
      <StudentSectionHeader
        title="Trang chủ sinh viên"
        description="Theo dõi thực tập, đồ án và kết quả học tập với bố cục dashboard nhiều thẻ, đồng bộ phong cách bộ design tham chiếu."
        actions={
          <>
            <Link href="/student/internship" className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50">
              <Upload className="h-4 w-4" />
              Đăng ký TTTN
            </Link>
            <Link href="/student/thesis-register" className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50">
              <FileText className="h-4 w-4" />
              Đăng ký ĐATN
            </Link>
            <Link href="/student/results" className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]">
              <Trophy className="h-4 w-4" />
              Xem kết quả
            </Link>
          </>
        }
      />

      <section className="mb-6 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <StudentPill tone="blue">Tuần này đang mở</StudentPill>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">Một nơi để theo dõi TTTN, ĐATN và kết quả ngay trên cùng màn hình.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Các khối bên dưới được sắp lại theo kiểu dashboard: thông tin chính ở trước, hành động nhanh bên cạnh, và trạng thái tiến độ ở cuối.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">TTTN</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">Sẵn sàng</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">ĐATN</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">1 đề tài</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Kết quả</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">8.12</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StudentStatCard title="TTTN" value="Đang mở" hint="Đợt đăng ký hiện tại" accent="blue" />
        <StudentStatCard title="ĐATN" value="1 đề tài" hint="Đề tài đã đăng ký" accent="green" />
        <StudentStatCard title="Báo cáo" value="03" hint="Bản thảo chờ nộp" accent="orange" />
        <StudentStatCard title="Kết quả" value="8.12" hint="Điểm tổng kết ĐATN" accent="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Công ty đối tác nổi bật</div>
                <div className="text-xs text-slate-500">Các đơn vị đang mở slot thực tập cho sinh viên</div>
              </div>
              <StudentPill tone="blue">{internshipPartners.length} công ty</StudentPill>
            </div>
            <div className="divide-y divide-slate-100">
              {internshipPartners.map((company) => (
                <div key={company.name} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#1976D2]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium text-slate-900">{company.name}</div>
                      <StudentPill tone="green">{company.field}</StudentPill>
                      <StudentPill tone="blue">Open {company.slots}</StudentPill>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {company.address}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Slot</div>
                    <div className="text-sm font-medium text-emerald-600">{company.slots}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Lộ trình cá nhân</div>
                <div className="text-xs text-slate-500">Những việc cần hoàn thành trong tuần</div>
              </div>
              <StudentPill tone="orange">Ưu tiên</StudentPill>
            </div>
            <div className="space-y-3 p-5">
              {pendingTasks.map((task, index) => (
                <div key={task} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#eff6ff] text-[#1976D2]">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{task}</div>
                    <div className="mt-1 text-xs text-slate-500">Cập nhật từ TTTN, ĐATN và mục kết quả.</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Mốc quan trọng</div>
                <div className="text-xs text-slate-500">Theo dõi hạn nộp gần nhất</div>
              </div>
              <CalendarDays className="text-[#1976D2]" />
            </div>
            <div className="mt-4 space-y-3">
              {milestones.map(([date, title]) => (
                <div key={title} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{date}</span>
                    <span><CheckCircle2 className="h-4 w-4 text-emerald-500" /></span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-900">{title}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="text-sm font-semibold text-slate-900">Điều hướng nhanh</div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <Link href="/student/internship" className="flex items-center gap-2 transition hover:text-[#1976D2]"><FileText className="h-4 w-4" /> Đăng ký nơi thực tập</Link>
              <Link href="/student/thesis-register" className="flex items-center gap-2 transition hover:text-[#1976D2]"><ArrowRight className="h-4 w-4" /> Đăng ký đề tài ĐATN</Link>
              <Link href="/student/thesis-invite" className="flex items-center gap-2 transition hover:text-[#1976D2]"><ArrowRight className="h-4 w-4" /> Tạo nhóm ĐATN</Link>
              <Link href="/student/reports/tttn" className="flex items-center gap-2 transition hover:text-[#1976D2]"><Upload className="h-4 w-4" /> Nộp báo cáo TTTN</Link>
              <Link href="/student/results" className="flex items-center gap-2 transition hover:text-[#1976D2]"><Trophy className="h-4 w-4" /> Xem điểm tổng kết</Link>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="text-sm font-semibold text-slate-900">Tình trạng tuần này</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Báo cáo</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">03</div>
                <div className="text-xs text-slate-500">bản nháp cần hoàn thành</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500"><TrendingUp className="h-4 w-4 text-[#1976D2]" /> Điểm dự kiến</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">8.2</div>
                <div className="text-xs text-slate-500">TTTN + ĐATN</div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}