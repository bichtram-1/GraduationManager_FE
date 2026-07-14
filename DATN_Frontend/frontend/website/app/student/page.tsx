'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarDays, CheckCircle2, FileText, Trophy, Upload, Building2, Clock3, TrendingUp } from 'lucide-react'
import { StudentPill, StudentSectionHeader, StudentStatCard } from './_components/StudentShell'
import { studentApi, IStudentDashboardData } from '@/lib/api/studentApi'
import { App, Spin } from 'antd'

export default function StudentIndexPage() {
  const { message } = App.useApp()
  const [data, setData] = useState<IStudentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    const load = () => {
      studentApi.getDashboard()
        .then((res) => {
          if (mounted) {
            setData(res)
            setLoading(false)
          }
        })
        .catch((err) => {
          console.error('Failed to fetch student dashboard:', err)
          if (mounted) {
            setLoading(false)
          }
        })
    }

    load()

    const handleSync = () => {
      load()
    }
    const handleAssignmentPublished = () => {
      message.success('Bạn vừa được công bố giảng viên hướng dẫn TTTN!')
      load()
    }
    window.addEventListener('realtime-group-updated', handleSync)
    window.addEventListener('realtime-topic-updated', handleSync)
    window.addEventListener('realtime-assignment-published', handleAssignmentPublished)

    return () => {
      mounted = false
      window.removeEventListener('realtime-group-updated', handleSync)
      window.removeEventListener('realtime-topic-updated', handleSync)
      window.removeEventListener('realtime-assignment-published', handleAssignmentPublished)
    }
  }, [message])

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <div className="text-sm text-slate-500">Đang tải thông tin trang chủ sinh viên...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
        Đã xảy ra lỗi khi tải dữ liệu từ máy chủ. Vui lòng tải lại trang.
      </div>
    )
  }

  const { student, tttn, datn, reportsCount, expectedScore, pendingTasks, milestones, companiesCount } = data

  return (
    <>
      <StudentSectionHeader
        title={`Chào mừng, ${student.name}`}
        description={`MSSV: ${student.studentCode} | Lớp: ${student.className} | Quản lý đợt thực tập tốt nghiệp và đồ án tốt nghiệp.`}
      />

      <section className="mb-6 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <StudentPill tone="blue">Thông tin học tập</StudentPill>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
              {tttn.hasPeriod ? `Đợt TTTN: ${tttn.periodName}` : 'Không có đợt TTTN nào'}
              {datn.hasPeriod && ` | Đợt ĐATN: ${datn.periodName}`}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {tttn.status === 'Đang thực tập'
                ? `Bạn đang thực tập tại ${tttn.companyName} với vị trí "${tttn.position || 'Chưa cập nhật'}" (Người hướng dẫn tại công ty: ${tttn.mentor || 'Chưa cập nhật'}).`
                : tttn.status === 'Chờ phê duyệt'
                ? `Yêu cầu tự khai báo thực tập tại ${tttn.companyName} đang chờ duyệt.`
                : 'Bạn chưa đăng ký nơi thực tập.'}
              {' '}
              {tttn.hasPeriod && (
                tttn.supervisorTeacher
                  ? `Giảng viên hướng dẫn TTTN (nhà trường phân công): ${tttn.supervisorTeacher}.`
                  : 'Nhà trường chưa công bố giảng viên hướng dẫn TTTN cho bạn.'
              )}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {datn.status === 'Đã đăng ký'
                ? `Đề tài đồ án: "${datn.topicTitle}" (Giảng viên hướng dẫn: ${datn.instructor}).`
                : datn.hasPeriod
                ? 'Bạn chưa đăng ký đề tài đồ án tốt nghiệp.'
                : ''}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">TTTN</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{tttn.status}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">ĐATN</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">
                {datn.status === 'Đã đăng ký' ? '1 đề tài' : datn.status}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Điểm dự kiến</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">
                {expectedScore > 0 ? expectedScore : 'Chưa có'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StudentStatCard 
          title="TTTN" 
          value={tttn.status} 
          hint={tttn.companyName || (tttn.hasPeriod ? "Đã mở đăng ký" : "Chưa mở")} 
          accent="blue" 
        />
        <StudentStatCard 
          title="ĐATN" 
          value={datn.status === 'Đã đăng ký' ? '1 đề tài' : datn.status} 
          hint={datn.topicTitle || "Đề tài tốt nghiệp"} 
          accent="green" 
        />
        <StudentStatCard 
          title="Báo cáo" 
          value={String(reportsCount).padStart(2, '0')} 
          hint="Báo cáo tiến độ đã nộp" 
          accent="orange" 
        />
        <StudentStatCard 
          title="Kết quả" 
          value={expectedScore > 0 ? String(expectedScore) : 'Chưa có'} 
          hint="Điểm tổng kết dự kiến" 
          accent="violet" 
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#1976D2]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-semibold tracking-tight text-slate-900">{companiesCount}</div>
                  <div className="text-sm text-slate-600">công ty đối tác đang hoạt động, sẵn sàng nhận sinh viên thực tập</div>
                </div>
              </div>
              <Link
                href="/student/internship"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]"
              >
                Xem danh sách công ty
                <ArrowRight className="h-4 w-4" />
              </Link>
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
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#eff6ff] text-[#1976D2] font-semibold text-xs shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{task}</div>
                    <div className="mt-1 text-xs text-slate-500">Cập nhật tự động từ đợt thực tập và đồ án của bạn.</div>
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
              {milestones.map((milestone) => (
                <div key={milestone.title} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{milestone.date}</span>
                    <span><CheckCircle2 className="h-4 w-4 text-emerald-500" /></span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-900">{milestone.title}</div>
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
            <div className="text-sm font-semibold text-slate-900">Tình trạng học tập</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Báo cáo đã nộp</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">{reportsCount}</div>
                <div className="text-xs text-slate-500">báo cáo tiến độ</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500"><TrendingUp className="h-4 w-4 text-[#1976D2]" /> Điểm trung bình</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">
                  {expectedScore > 0 ? expectedScore : 'Chưa có'}
                </div>
                <div className="text-xs text-slate-500">dựa trên kết quả hiện tại</div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}