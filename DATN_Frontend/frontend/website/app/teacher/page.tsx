import { CalendarDays, CheckCircle2, Clock3, Trophy, TrendingUp, Users } from 'lucide-react'
import { TeacherPill, TeacherSectionHeader, TeacherStatCard } from './_components/TeacherShell'

const topics = [
  { code: 'DA001', name: 'Hệ thống IoT giám sát nông nghiệp', slot: '3/4', status: 'Đã duyệt', students: 2, note: 'Đã có 2 nhóm đăng ký' },
  { code: 'DA007', name: 'Blockchain cho quản lý chuỗi cung ứng', slot: '0/3', status: 'Chờ duyệt', students: 0, note: 'Chờ phê duyệt từ Khoa' },
  { code: 'DA012', name: 'Ứng dụng ML dự đoán giá chứng khoán', slot: '0/4', status: 'Chờ duyệt', students: 0, note: 'Mới tạo trong tuần' },
]

const reminders = [
  'Duyệt 2 đề tài mới gửi lên trong tuần này.',
  'Xác nhận lịch phản biện cho hội đồng ĐATN ngày 20/06.',
  'Kiểm tra 3 báo cáo tuần của SV TTTN trước 17:00.',
]

const weeklyTimeline = [
  ['Thứ 2', 'Họp nhóm TTTN', '08:30'],
  ['Thứ 4', 'Duyệt đề tài mới', '14:00'],
  ['Thứ 6', 'Chấm hội đồng ĐATN', '09:00'],
]

export default function TeacherIndexPage() {
  return (
    <>
      <TeacherSectionHeader
        title="Trang chủ giảng viên"
        description="Quản lý đề tài, sinh viên hướng dẫn và hoạt động chấm điểm theo bố cục dashboard nhiều lớp, đậm chất bộ UI tham chiếu."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TeacherStatCard title="Đề tài" value="12" hint="4 đề tài chờ duyệt" accent="blue" />
        <TeacherStatCard title="TTTN" value="18" hint="6 sinh viên đang hướng dẫn" accent="green" />
        <TeacherStatCard title="ĐATN" value="9" hint="3 nhóm chờ phản biện" accent="orange" />
        <TeacherStatCard title="Hội đồng" value="2" hint="Lịch chấm sắp diễn ra" accent="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Đề tài đang phụ trách</div>
                <div className="text-xs text-slate-500">Danh sách đề tài hiện đang hướng dẫn và trạng thái duyệt</div>
              </div>
              <TeacherPill tone="blue">Bộ lọc theo học kỳ</TeacherPill>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 text-left">Mã</th>
                  <th className="px-5 py-3 text-left">Tên đề tài</th>
                  <th className="px-5 py-3 text-left">Slot</th>
                  <th className="px-5 py-3 text-left">SV đăng ký</th>
                  <th className="px-5 py-3 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => (
                  <tr key={topic.code} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-medium text-[#1976D2]">{topic.code}</td>
                    <td className="px-5 py-4 text-slate-900">
                      <div className="font-medium">{topic.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{topic.note}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{topic.slot}</td>
                    <td className="px-5 py-4 text-slate-600">{topic.students}</td>
                    <td className="px-5 py-4">
                      <TeacherPill tone={topic.status === 'Đã duyệt' ? 'green' : 'orange'}>{topic.status}</TeacherPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Việc cần xử lý</div>
                <div className="text-xs text-slate-500">Các đầu việc quan trọng trong tuần</div>
              </div>
              <TeacherPill tone="orange">Ưu tiên cao</TeacherPill>
            </div>
            <div className="space-y-3 p-5">
              {reminders.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#eff6ff] text-[#1976D2]">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{item}</div>
                    <div className="mt-1 text-xs text-slate-500">Tự động tổng hợp từ đề tài, sinh viên và lịch hội đồng.</div>
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
                <div className="text-sm font-semibold text-slate-900">Lịch tuần này</div>
                <div className="text-xs text-slate-500">Các mốc làm việc gần nhất</div>
              </div>
              <CalendarDays className="text-[#1976D2]" />
            </div>
            <div className="mt-4 space-y-3">
              {weeklyTimeline.map(([day, title, time]) => (
                <div key={title} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{day}</span>
                    <span>{time}</span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-900">{title}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="text-sm font-semibold text-slate-900">Tổng quan nhanh</div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2"><CheckCircle2 className="text-emerald-500" /> 4 đề tài sẵn sàng công bố</div>
              <div className="flex items-center gap-2"><Users className="text-blue-500" /> 18 sinh viên đang theo dõi</div>
              <div className="flex items-center gap-2"><Trophy className="text-orange-500" /> 9 nhóm ĐATN chờ chấm</div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="text-sm font-semibold text-slate-900">Chỉ số tức thì</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Tuần này</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">12</div>
                <div className="text-xs text-slate-500">cuộc hẹn hướng dẫn</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500"><TrendingUp className="h-4 w-4 text-[#1976D2]" /> Hiệu suất</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">92%</div>
                <div className="text-xs text-slate-500">báo cáo đúng hạn</div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}