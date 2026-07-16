'use client'

import { useEffect, useState, useMemo } from 'react'
import { studentApi } from '@/lib/api/studentApi'
import { Spin, message, Empty } from 'antd'
import { Clock, Search, User, Users, ClipboardCheck, AlertTriangle, BookOpen } from 'lucide-react'

interface IHistoryLog {
  log_id: number
  sinh_vien_id?: number
  ma_so_sinh_vien?: string
  nhom_id?: number
  role: string
  user_name: string
  action_type: string
  description: string
  details?: string
  created_at: string
}

const ACTION_META: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  KHAI_BAO_TTTN: { label: 'Khai báo TTTN', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ClipboardCheck },
  DANG_KY_DE_TAI: { label: 'Đăng ký đề tài', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: BookOpen },
  HUY_DANG_KY_DE_TAI: { label: 'Hủy đăng ký đề tài', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: BookOpen },
  GUI_LOI_MOI: { label: 'Gửi lời mời', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Users },
  HUY_LOI_MOI: { label: 'Hủy lời mời', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertTriangle },
  CHAP_NHAN_LOI_MOI: { label: 'Gia nhập nhóm', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: User },
  TU_CHOI_LOI_MOI: { label: 'Từ chối lời mời', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertTriangle },
  TAO_NHOM: { label: 'Tạo nhóm', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Users },
  GIAI_TAN_NHOM: { label: 'Giải tán nhóm', color: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle },
  ROI_NHOM: { label: 'Rời nhóm', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertTriangle },
}

export default function StudentHistoryPage() {
  const [logs, setLogs] = useState<IHistoryLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let mounted = true
    async function loadHistory() {
      try {
        const data = await studentApi.getHistory()
        if (mounted) {
          setLogs(data)
        }
      } catch (err) {
        console.error('Failed to load student history:', err)
        message.error('Không thể tải lịch sử hoạt động.')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    loadHistory()
    return () => {
      mounted = false
    }
  }, [])

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs
    const q = search.toLowerCase()
    return logs.filter(
      (log) =>
        log.description.toLowerCase().includes(q) ||
        log.action_type.toLowerCase().includes(q) ||
        (log.user_name && log.user_name.toLowerCase().includes(q))
    )
  }, [logs, search])

  const formatTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr)
      const pad = (n: number) => n.toString().padStart(2, '0')
      return `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
    } catch {
      return timeStr
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <div className="text-sm text-slate-500">Đang tải lịch sử hoạt động...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      {/* Header section */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Lịch sử hoạt động</h1>
          <p className="mt-1 text-sm text-slate-500">
            Xem lại toàn bộ quá trình khai báo thực tập, tương tác nhóm và lời mời ĐATN của bạn.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Tìm kiếm hoạt động..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Timeline Section */}
      {filteredLogs.length > 0 ? (
        <div className="relative border-l-2 border-slate-100 pl-6 ml-4 space-y-8">
          {filteredLogs.map((log) => {
            const meta = ACTION_META[log.action_type] || {
              label: log.action_type,
              color: 'bg-slate-50 text-slate-700 border-slate-200',
              icon: Clock,
            }
            const Icon = meta.icon

            return (
              <div key={log.log_id} className="relative group">
                {/* Timeline Dot Indicator */}
                <div className={`absolute -left-[35px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-white shadow-sm transition group-hover:scale-110 ${meta.color.split(' ')[0]} ${meta.color.split(' ')[1]}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                {/* Card Container */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition hover:border-slate-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    {/* Log action tag and name */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold ${meta.color}`}>
                        {meta.label}
                      </span>
                      {log.nhom_id && (
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          Nhóm #{log.nhom_id}
                        </span>
                      )}
                    </div>
                    {/* Timestamp */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(log.created_at)}
                    </div>
                  </div>

                  {/* Main Description */}
                  <p className="mt-3 text-sm leading-relaxed text-slate-700 font-medium">
                    {log.description}
                  </p>

                  {/* Details block if any */}
                  {log.details && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 border border-slate-100/50">
                      {log.details}
                    </div>
                  )}

                  {/* Operator */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 border-t border-slate-50 pt-3">
                    <User className="h-3.5 w-3.5 text-slate-300" />
                    <span>Thực hiện bởi:</span>
                    <span className="font-semibold text-slate-600">{log.user_name}</span>
                    <span className="text-slate-300">|</span>
                    <span className="capitalize">{log.role === 'sinh_vien' ? 'Sinh viên' : log.role}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center">
          <Empty description={search ? 'Không tìm thấy hoạt động nào phù hợp.' : 'Bạn chưa có lịch sử hoạt động nào.'} />
        </div>
      )}
    </div>
  )
}
