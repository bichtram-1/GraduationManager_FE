"use client"

import { useState, useEffect } from 'react'
import { CalendarDays, CheckCircle2, Clock3, Trophy, TrendingUp, Users } from 'lucide-react'
import { TeacherPill, TeacherSectionHeader, TeacherStatCard } from './_components/TeacherShell'
import { getTopicStatusTone } from './_components/TeacherUI'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { teacherApi } from '@/lib/api/teacherApi'

interface ITopicItem {
  id?: string | number;
  code?: string;
  name: string;
  status: string;
  note?: string;
  slot?: string;
  students?: string;
}

interface ITttnItem {
  id?: string | number;
  name?: string;
  studentCode?: string;
  report?: string;
  status?: string;
  comment?: string;
}

interface IDatnGroupItem {
  group?: string;
  topic?: string;
  members_list?: { name?: string; code?: string }[];
  members?: number;
  status?: string;
  comment?: string;
}

interface ICouncilItem {
  id?: string | number;
  name?: string;
  date?: string;
  room?: string;
}

export default function TeacherIndexPage() {
  const { selectedPeriod } = usePeriod()
  const [stats, setStats] = useState({ topics: 0, tttn: 0, datn: 0, councils: 0 })
  const [topics, setTopics] = useState<ITopicItem[]>([])
  const [tttnList, setTttnList] = useState<ITttnItem[]>([])
  const [datnList, setDatnList] = useState<IDatnGroupItem[]>([])
  const [councilsList, setCouncilsList] = useState<ICouncilItem[]>([])
  const [loading, setLoading] = useState(false)

  const load = () => {
    let mounted = true
    setLoading(true)
    
    Promise.all([
      teacherApi.getDashboardData({ periodId: selectedPeriod?.id }),
      teacherApi.getStudents({ periodId: selectedPeriod?.id }),
      teacherApi.getGradingData({ periodId: selectedPeriod?.id })
    ])
      .then(([dashRes, studentsRes, gradingRes]) => {
        if (!mounted) return
        
        if (dashRes?.success) {
          setStats(dashRes.stats)
          setTopics(dashRes.topics || [])
        } else {
          setStats({ topics: 0, tttn: 0, datn: 0, councils: 0 })
          setTopics([])
        }
        
        if (studentsRes?.success) {
          setTttnList(studentsRes.tttn || [])
          setDatnList(studentsRes.datn || [])
        } else {
          setTttnList([])
          setDatnList([])
        }
        
        if (gradingRes?.councilGroups) {
          setCouncilsList(gradingRes.councilGroups || [])
        } else {
          setCouncilsList([])
        }
      })
      .catch((err) => {
        console.error('Error loading dashboard data:', err)
        if (mounted) {
          setStats({ topics: 0, tttn: 0, datn: 0, councils: 0 })
          setTopics([])
          setTttnList([])
          setDatnList([])
          setCouncilsList([])
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }

  useEffect(() => {
    const cleanup = load()

    const handleSync = () => {
      load()
    }
    window.addEventListener('realtime-group-updated', handleSync)
    window.addEventListener('realtime-topic-updated', handleSync)
    window.addEventListener('realtime-assignment-published', handleSync)

    return () => {
      cleanup()
      window.removeEventListener('realtime-group-updated', handleSync)
      window.removeEventListener('realtime-topic-updated', handleSync)
      window.removeEventListener('realtime-assignment-published', handleSync)
    }
  }, [selectedPeriod?.id])

  // Tự động sinh danh sách việc cần xử lý dựa trên dữ liệu thực tế
  const getDynamicReminders = () => {
    const list: string[] = []

    // 1. Duyệt báo cáo thực tập (nếu có báo cáo 'Đã nộp' mà giảng viên chưa có nhận xét)
    const pendingTttn = tttnList.filter(s => s.status === 'Đã nộp' && (!s.comment || s.comment.trim() === ''))
    if (pendingTttn.length > 0) {
      list.push(`Đánh giá báo cáo thực tập của sinh viên ${pendingTttn[0].name} (${pendingTttn[0].studentCode}) - báo cáo ${pendingTttn[0].report || 'tuần mới nhất'}.`)
    }

    // 2. Nhận xét tiến độ đồ án (nếu có nhóm 'Đã nộp' mà giảng viên chưa nhận xét)
    const pendingDatn = datnList.filter(g => g.status === 'Đã nộp' && (!g.comment || g.comment.trim() === ''))
    if (pendingDatn.length > 0) {
      list.push(`Nhận xét báo cáo tiến độ ĐATN của nhóm ${pendingDatn[0].group} (Đề tài: ${pendingDatn[0].topic}).`)
    }

    // 3. Đề tài đang ở trạng thái chờ duyệt của Khoa
    const pendingTopics = topics.filter(t => t.status === 'Chờ duyệt')
    if (pendingTopics.length > 0) {
      list.push(`Đề xuất "${pendingTopics[0].name.substring(0, 30)}..." của bạn hiện đang chờ phê duyệt.`)
    }

    return list
  }

  // Tự động sinh lịch làm việc dựa trên dữ liệu hội đồng chấm và lịch hướng dẫn
  const getDynamicTimeline = () => {
    const list: [string, string, string][] = []

    // 1. Lấy lịch từ hội đồng chấm điểm
    councilsList.forEach((council: ICouncilItem) => {
      const [datePart, timePart] = (council.date || '').split('•')
      const dayStr = datePart ? datePart.trim() : 'Lịch chấm'
      const timeStr = timePart ? timePart.trim() : '08:00'
      list.push([
        dayStr,
        `Chấm Hội đồng: ${council.name}`,
        `${timeStr} tại phòng ${council.room || 'Phòng hội đồng'}`
      ])
    })

    // 2. Lịch hướng dẫn nhóm đồ án tốt nghiệp
    datnList.forEach((g: IDatnGroupItem) => {
      list.push([
        'Đợt này',
        `Hướng dẫn ĐATN nhóm ${g.group}`,
        `Đề tài: ${g.topic} (${g.members_list?.length || g.members || 0} SV)`
      ])
    })

    if (list.length === 0) {
      list.push(['Hôm nay', 'Không có lịch chấm hội đồng hoặc hướng dẫn nào được thiết lập.', '—'])
    }

    return list.slice(0, 4) // Giới hạn hiển thị tối đa 4 mục gần nhất
  }

  const dynamicReminders = getDynamicReminders()
  const dynamicTimeline = getDynamicTimeline()

  // Tính toán các chỉ số tức thì dựa trên dữ liệu thực tế
  const totalTttnStudents = tttnList.length
  const submittedTttn = tttnList.filter(s => s.status === 'Đã nộp').length
  const tttnSubmissionRate = totalTttnStudents > 0 ? Math.round((submittedTttn / totalTttnStudents) * 100) : 0

  const totalDatnStudents = datnList.reduce((acc, g) => acc + (g.members_list?.length || g.members || 0), 0)

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
                  <th className="px-5 py-3 text-left w-16">STT</th>
                  <th className="px-5 py-3 text-left">Tên đề tài</th>
                  <th className="px-5 py-3 text-left">SLTV</th>
                  <th className="px-5 py-3 text-left">SV đăng ký</th>
                  <th className="px-5 py-3 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500">Đang tải danh sách đề tài...</td>
                  </tr>
                ) : topics.length > 0 ? (
                  topics.map((topic, index) => (
                    <tr key={topic.code} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                      <td className="px-5 py-4 font-medium text-slate-500">{index + 1}</td>
                      <td className="px-5 py-4 text-slate-900">
                        <div className="font-medium">{topic.name}</div>
                        {topic.note && <div className="mt-1 text-xs text-slate-500">{topic.note}</div>}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{topic.slot}</td>
                      <td className="px-5 py-4 text-slate-600">{topic.students}</td>
                      <td className="px-5 py-4">
                        <TeacherPill tone={getTopicStatusTone(topic.status)}>{topic.status}</TeacherPill>
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
                <div className="text-xs text-slate-500">Các công việc cần lưu ý dựa trên dữ liệu thực tế</div>
              </div>
              <TeacherPill tone="orange">Tự động tổng hợp</TeacherPill>
            </div>
            <div className="space-y-3 p-5">
              {loading ? (
                <div className="py-4 text-center text-slate-500 text-sm">Đang tải danh sách công việc cần xử lý...</div>
              ) : dynamicReminders.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#eff6ff] text-[#1976D2] font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{item}</div>
                    <div className="mt-1 text-xs text-slate-500">Được tổng hợp tự động từ trạng thái báo cáo của sinh viên.</div>
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
                <div className="text-xs text-slate-500">Mốc lịch chấm hội đồng & hướng dẫn</div>
              </div>
              <CalendarDays className="text-[#1976D2]" />
            </div>
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="py-4 text-center text-slate-500 text-sm">Đang tải lịch tuần...</div>
              ) : dynamicTimeline.map(([day, title, time]) => (
                <div key={title} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-[#1976D2]">{day}</span>
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
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" />
                <span>{stats.topics} đề tài giảng viên đã đăng ký</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="text-blue-500" />
                <span>{totalTttnStudents} sinh viên thực tập đang quản lý</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="text-orange-500" />
                <span>{datnList.length} nhóm đồ án tốt nghiệp hướng dẫn</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}