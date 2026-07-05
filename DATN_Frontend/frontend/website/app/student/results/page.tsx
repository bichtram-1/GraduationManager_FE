'use client'

import { useMemo, useState, useEffect } from 'react'
import { CheckCircle2, Trophy, Sparkles, ChartColumnBig, CalendarDays, Medal, BadgeCheck, Clock3, TrendingUp, FileText, GraduationCap, Star } from 'lucide-react'
import { StudentPill, StudentSectionHeader, StudentStatCard } from '../_components/StudentShell'
import { studentApi, IStudentResults } from '@/lib/api/studentApi'

type ResultType = 'tttn' | 'datn'

export default function StudentResultsPage() {
  const [resultType, setResultType] = useState<ResultType>('tttn')
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [data, setData] = useState<IStudentResults | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    async function load() {
      try {
        const res = await studentApi.getStudentResults()
        if (!mounted) return
        setData(res)
        if (res.tttn.records.length > 0) {
          setSelectedRecordId(res.tttn.records[0].id)
        }
      } catch (_err) {
        if (!mounted) return
        setData(null)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const activeRecords = useMemo(() => {
    if (!data) return []
    return resultType === 'tttn' ? data.tttn.records : data.datn.records
  }, [resultType, data])

  const selectedRecord = useMemo(() => {
    return activeRecords.find((record) => record.id === selectedRecordId) ?? activeRecords[0]
  }, [selectedRecordId, activeRecords])

  const switchType = (type: ResultType) => {
    setResultType(type)
    if (data) {
      setSelectedRecordId(type === 'tttn' ? data.tttn.records[0]?.id : data.datn.records[0]?.id)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-slate-500">Đang tải kết quả học tập...</div>
      </div>
    )
  }

  const tttnDone = data.tttn.status === 'Hoàn thành'
  const datnDone = data.datn.status === 'ĐẠT' || data.datn.status === 'KHÔNG ĐẠT'
  const isPublished = tttnDone && datnDone

  return (
    <>
      <StudentSectionHeader
        title="Kết quả"
        description="Tra cứu điểm sau khi giảng viên và hội đồng công bố."
        actions={<StudentPill tone="green">Đã cập nhật gần nhất</StudentPill>}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StudentStatCard title="TTTN" value={data.summary.tttnScore} hint="Điểm giảng viên hướng dẫn" accent="blue" />
        <StudentStatCard title="ĐATN" value={data.summary.datnScore} hint="Điểm tổng kết hội đồng" accent="green" />
        <StudentStatCard title="Xếp loại" value={data.summary.classification} hint="Theo thang điểm hiện tại" accent="orange" />
        <StudentStatCard title="Cập nhật" value={data.summary.updatedAt} hint="Sau khi hội đồng công bố" accent="violet" />
      </div>

      <section className="mb-5 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#1976D2] shadow-sm ring-1 ring-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Bảng kết quả tổng hợp
            </div>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              Kết quả được chia theo TTTN và ĐATN, kèm ghi chú ngắn để sinh viên hiểu nhanh trạng thái hiện tại.
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[460px]">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500"><CalendarDays className="h-4 w-4 text-[#1976D2]" /> Cập nhật</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{data.summary.updatedAt}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500"><ChartColumnBig className="h-4 w-4 text-[#1976D2]" /> Trạng thái công bố</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{isPublished ? 'Đã công bố' : 'Đang chờ'}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500"><Medal className="h-4 w-4 text-emerald-500" /> Xếp loại</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{data.summary.classification}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-5 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => switchType('tttn')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition ${resultType === 'tttn' ? 'border-[#2196F3] text-[#2196F3]' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
        >
          Điểm TTTN
        </button>
        <button
          onClick={() => switchType('datn')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition ${resultType === 'datn' ? 'border-[#2196F3] text-[#2196F3]' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
        >
          Điểm ĐATN
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {resultType === 'tttn' ? (
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Kết quả thực tập</div>
                <div className="text-xs text-slate-500">Điểm của giảng viên hướng dẫn</div>
              </div>
              <StudentPill tone={data.tttn.status === 'Hoàn thành' ? 'green' : 'orange'}>{data.tttn.status}</StudentPill>
            </div>
            <div className="grid gap-4 p-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="flex items-end justify-between rounded-[24px] border border-green-200 bg-gradient-to-br from-green-50 to-white p-6">
                <div>
                  <div className="text-sm text-slate-600">Điểm tổng kết TTTN</div>
                  <div className="mt-1 text-xs text-slate-500">Giảng viên chấm</div>
                </div>
                <div className="text-4xl font-semibold text-emerald-600">{data.tttn.finalScore}</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-medium text-slate-900">Ghi chú</div>
                <div className="mt-2 text-sm text-slate-600">{data.tttn.note}</div>
                <div className="mt-4 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Đủ số tuần báo cáo</div>
                  <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Cập nhật lần cuối: {data.summary.updatedAt}</div>
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 xl:col-span-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><FileText className="h-4 w-4 text-[#1976D2]" /> Bảng ghi nhận nhanh</div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {data.tttn.records.map((record) => (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => setSelectedRecordId(record.id)}
                      className={`rounded-[24px] border p-4 text-left transition ${selectedRecordId === record.id ? 'border-[#2196F3] bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium text-slate-900">{record.label}</div>
                        <StudentPill tone={selectedRecordId === record.id ? 'blue' : 'slate'}>{record.score}</StudentPill>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">{record.note}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Kết quả ĐATN</div>
                <div className="text-xs text-slate-500">Tổng hợp từ báo cáo và bảo vệ</div>
              </div>
              <StudentPill tone={data.datn.status === 'ĐẠT' ? 'green' : 'orange'}>{data.datn.status}</StudentPill>
            </div>

            <div className="grid gap-4 p-6 xl:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-medium text-slate-900">Điểm chấm báo cáo</div>
                <div className="mt-3 text-3xl font-semibold text-[#1976D2]">{data.datn.reportScore}</div>
                <div className="mt-2 text-xs text-slate-500">Trung bình GVHD và GVPB</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-medium text-slate-900">Điểm bảo vệ</div>
                <div className="mt-3 text-3xl font-semibold text-emerald-600">{data.datn.defenseScore}</div>
                <div className="mt-2 text-xs text-slate-500">Trung bình các thành viên hội đồng</div>
              </div>
              <div className="rounded-[24px] border border-blue-200 bg-blue-50 p-5 xl:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Điểm tổng kết</div>
                    <div className="text-xs text-slate-500">= (Điểm báo cáo × 0.2) + (Điểm bảo vệ × 0.8)</div>
                  </div>
                  <div className="text-4xl font-semibold text-[#1976D2]">{data.datn.finalScore}</div>
                </div>
                {Number(data.datn.finalScore) >= 5.0 && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Chúc mừng bạn đã hoàn thành Đồ án tốt nghiệp.
                  </div>
                )}
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 xl:col-span-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><GraduationCap className="h-4 w-4 text-[#1976D2]" /> Mốc đánh giá</div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {data.datn.records.map((record) => (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => setSelectedRecordId(record.id)}
                      className={`rounded-[24px] border p-4 text-left transition ${selectedRecordId === record.id ? 'border-[#2196F3] bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium text-slate-900">{record.label}</div>
                        <StudentPill tone={selectedRecordId === record.id ? 'green' : 'slate'}>{record.score}</StudentPill>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">{record.note}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-semibold text-slate-900">Ghi chú nhanh</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2"><Trophy className="h-4 w-4 text-[#1976D2]" /> Điểm được đồng bộ sau khi công bố</div>
            <div className="flex items-center gap-2"><Medal className="h-4 w-4 text-emerald-500" /> Xếp loại hiển thị ngay bên cạnh điểm</div>
            <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#1976D2]" /> Lần cập nhật gần nhất: {data.summary.updatedAt}</div>
            <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#1976D2]" /> Điểm số phản ánh đúng tiến trình năng lực</div>
          </div>

          <div className="mt-5 rounded-[24px] bg-white/85 p-4 ring-1 ring-slate-200">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><Star className="h-4 w-4 text-[#1976D2]" /> Quy đổi nhanh</div>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>TTTN</span>
                <span className="font-medium text-[#1976D2]">{data.tttn.finalScore} / 10</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>ĐATN</span>
                <span className="font-medium text-emerald-600">{data.datn.finalScore} / 10</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>GPA xếp loại</span>
                <span className="font-medium text-slate-900">{data.summary.classification}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-semibold text-slate-900">Dòng thời gian</div>
          <div className="mt-4 space-y-4">
            <div className="flex gap-3">
              <div className={`mt-1 h-3 w-3 rounded-full ${tttnDone ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <div>
                <div className="text-sm font-medium text-slate-900">{tttnDone ? 'TTTN được chấm xong' : 'TTTN chưa chấm xong'}</div>
                <div className="text-xs text-slate-500">{tttnDone ? 'Cập nhật điểm bởi giảng viên hướng dẫn' : 'Đang chờ giảng viên hướng dẫn chấm điểm'}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className={`mt-1 h-3 w-3 rounded-full ${datnDone ? 'bg-[#2196F3]' : 'bg-slate-300'}`} />
              <div>
                <div className="text-sm font-medium text-slate-900">{datnDone ? 'ĐATN được hội đồng công bố' : 'ĐATN chưa được hội đồng công bố'}</div>
                <div className="text-xs text-slate-500">{datnDone ? 'Điểm tổng hợp từ báo cáo và bảo vệ' : 'Đang chờ hội đồng chấm và công bố điểm'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-semibold text-slate-900">Nhận xét nhanh</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">{data.tttn.note}</div>
            {selectedRecord && (
              <div className="rounded-2xl bg-slate-50 p-4">{selectedRecord.label}: {selectedRecord.note}</div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-semibold text-slate-900">Tình trạng hiện tại</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3">
              <CheckCircle2 className={`h-4 w-4 ${isPublished ? 'text-emerald-600' : 'text-slate-400'}`} />
              {isPublished ? 'Dữ liệu đã được công bố đầy đủ' : 'Kết quả đang chờ công bố'}
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3"><Sparkles className="h-4 w-4 text-[#1976D2]" /> Có thể tra cứu lại bất kỳ lúc nào</div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3"><CalendarDays className="h-4 w-4 text-[#1976D2]" /> Cập nhật lần cuối: {data.summary.updatedAt}</div>
          </div>
        </div>
      </section>
    </>
  )
}
