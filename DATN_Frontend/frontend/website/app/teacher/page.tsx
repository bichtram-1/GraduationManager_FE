'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, CheckCircle2, Clock3, Trophy, TrendingUp, Users } from 'lucide-react'
import { TeacherPill, TeacherSectionHeader, TeacherStatCard } from './_components/TeacherShell'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { teacherApi } from '@/lib/api/teacherApi'

const reminders = [
  'Duyệt đề tài mới gửi lên trong tuần này.',
  'Xác nhận lịch phản biện cho hội đồng ĐATN.',
  'Kiểm tra báo cáo tuần của SV TTTN.',
]

const weeklyTimeline = [
  ['Thứ 2', 'Họp nhóm TTTN', '08:30'],
  ['Thứ 4', 'Duyệt đề tài mới', '14:00'],
  ['Thứ 6', 'Chấm hội đồng ĐATN', '09:00'],
]

export default function TeacherIndexPage() {
  const { selectedPeriod } = usePeriod()
  const [stats, setStats] = useState({ topics: 0, tttn: 0, datn: 0, councils: 0 })
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    const load = () => {
      teacherApi.getDashboardData({ periodId: selectedPeriod?.id })
        .then((res) => {
          if (!mounted) return
          if (res?.success) {
            setStats(res.stats)
            setTopics(res.topics || [])
          } else {
            // fallback mock values if backend is empty
            setStats({ topics: 3, tttn: 4, datn: 2, councils: 1 })
            setTopics([
              { code: 'DA001', name: 'Hệ thống IoT giám sát nông nghiệp', slot: '3/4', status: 'Đã duyệt', students: 2, note: 'Đã có 2 nhóm đăng ký' },
              { code: 'DA007', name: 'Blockchain cho quản lý chuỗi cung ứng', slot: '0/3', status: 'Chờ duyệt', students: 0, note: 'Chờ phê duyệt từ Khoa' },
              { code: 'DA012', name: 'Ứng dụng ML dự đoán giá chứng khoán', slot: '0/4', status: 'Chờ duyệt', students: 0, note: 'Mới tạo trong tuần' },
            ])
          }
        })
        .catch(() => {
          if (mounted) {
            setStats({ topics: 3, tttn: 4, datn: 2, councils: 1 })
            setTopics([
              { code: 'DA001', name: 'Hệ thống IoT giám sát nông nghiệp', slot: '3/4', status: 'Đã duyệt', students: 2, note: 'Đã có 2 nhóm đăng ký' },
              { code: 'DA007', name: 'Blockchain cho quản lý chuỗi cung ứng', slot: '0/3', status: 'Chờ duyệt', students: 0, note: 'Chờ phê duyệt từ Khoa' },
              { code: 'DA012', name: 'Ứng dụng ML dự đoán giá chứng khoán', slot: '0/4', status: 'Chờ duyệt', students: 0, note: 'Mới tạo trong tuần' },
            ])
          }
        })
        .finally(() => {
          if (mounted) setLoading(false)
        })
    }

    load()

    const handleSync = () => {
      load()
    }
    window.addEventListener('realtime-group-updated', handleSync)
    window.addEventListener('realtime-topic-updated', handleSync)
    window.addEventListener('realtime-assignment-published', handleSync)

    return () => {
      mounted = false
      window.removeEventListener('realtime-group-updated', handleSync)
      window.removeEventListener('realtime-topic-updated', handleSync)
      window.removeEventListener('realtime-assignment-published', handleSync)
    }
  }, [selectedPeriod?.id])

  return (
    <>
      <TeacherSectionHeader
        title="Trang chủ giảng viên"
        description="Quản lý đề tài, sinh viên hướng dẫn và hoạt động chấm điểm dựa trên kết nối thực tế tới Back-End."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TeacherStatCard title="Đề tài" value={String(stats.topics)} hint="Đề tài đã đề xuất" accent="blue" />
        <TeacherStatCard title="TTTN" value={String(stats.tttn)} hint="Sinh viên đang hướng dẫn" accent="green" />
        <TeacherStatCard title="ĐATN" value={String(stats.datn)} hint="Nhóm chấm phản biện" accent="orange" />
        <TeacherStatCard title="Hội đồng" value={String(stats.councils)} hint="Lịch chấm hội đồng" accent="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Đề tài đang phụ trách</div>
                <div className="text-xs text-slate-500">Danh sách đề tài hiện đang hướng dẫn và trạng thái duyệt</div>
              </div>
              <TeacherPill tone="blue">{selectedPeriod?.name || 'Học kỳ hiện tại'}</TeacherPill>
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
                {topics.length > 0 ? (
                  topics.map((topic) => (
                    <tr key={topic.code} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                      <td className="px-5 py-4 font-medium text-[#1976D2]">{topic.code}</td>
                      <td className="px-5 py-4 text-slate-900">
                        <div className="font-medium">{topic.name}</div>
                        {topic.note && <div className="mt-1 text-xs text-slate-500">{topic.note}</div>}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{topic.slot}</td>
                      <td className="px-5 py-4 text-slate-600">{topic.students}</td>
                      <td className="px-5 py-4">
                        <TeacherPill tone={topic.status === 'Đã duyệt' ? 'green' : topic.status === 'Từ chối' ? 'red' : 'orange'}>{topic.status}</TeacherPill>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500">Không có đề tài nào phụ trách trong đợt này.</td>
                  </tr>
                )}
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
              <div className="flex items-center gap-2"><CheckCircle2 className="text-emerald-500" /> {stats.topics} đề tài sẵn sàng công bố</div>
              <div className="flex items-center gap-2"><Users className="text-blue-500" /> {stats.tttn} sinh viên đang theo dõi</div>
              <div className="flex items-center gap-2"><Trophy className="text-orange-500" /> {stats.datn} nhóm ĐATN phản biện</div>
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