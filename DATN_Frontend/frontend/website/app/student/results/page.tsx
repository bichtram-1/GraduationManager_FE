'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Trophy, Sparkles, ChartColumnBig, CalendarDays, Medal, BadgeCheck, Clock3, TrendingUp, FileText, GraduationCap, Star } from 'lucide-react'
import { StudentPill, StudentSectionHeader, StudentStatCard } from '../_components/StudentShell'

type ResultType = 'tttn' | 'datn'

type ResultRecord = {
  id: string
  label: string
  score: string
  note: string
  updatedAt: string
}

const tttnRecords: ResultRecord[] = [
  { id: 'tttn-1', label: 'Báo cáo tuần', score: '8.5', note: 'Ổn định, đầy đủ số tuần', updatedAt: 'Hôm nay' },
  { id: 'tttn-2', label: 'Nhận xét GVHD', score: '8.3', note: 'Tiến độ tốt, phản hồi nhanh', updatedAt: 'Hôm nay' },
]

const datnRecords: ResultRecord[] = [
  { id: 'datn-1', label: 'Điểm báo cáo', score: '7.8', note: 'Tài liệu rõ ràng, đúng form', updatedAt: 'Hôm nay' },
  { id: 'datn-2', label: 'Điểm bảo vệ', score: '8.2', note: 'Thuyết trình tốt, trả lời ổn', updatedAt: 'Hôm nay' },
]

export default function StudentResultsPage() {
  const [resultType, setResultType] = useState<ResultType>('tttn')
  const [selectedRecordId, setSelectedRecordId] = useState(tttnRecords[0].id)

  const activeRecords = useMemo(() => (resultType === 'tttn' ? tttnRecords : datnRecords), [resultType])
  const selectedRecord = activeRecords.find((record) => record.id === selectedRecordId) ?? activeRecords[0]

  const switchType = (type: ResultType) => {
    setResultType(type)
    setSelectedRecordId(type === 'tttn' ? tttnRecords[0].id : datnRecords[0].id)
  }

  return (
    <>
      <StudentSectionHeader
        title="Kết quả"
        description="Tra cứu điểm sau khi giảng viên và hội đồng công bố."
        actions={<StudentPill tone="green">Đã cập nhật gần nhất</StudentPill>}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StudentStatCard title="TTTN" value="8.5" hint="Điểm giảng viên hướng dẫn" accent="blue" />
        <StudentStatCard title="ĐATN" value="8.12" hint="Điểm tổng kết hội đồng" accent="green" />
        <StudentStatCard title="Xếp loại" value="Giỏi" hint="Theo thang điểm hiện tại" accent="orange" />
        <StudentStatCard title="Cập nhật" value="Mới nhất" hint="Sau khi hội đồng công bố" accent="violet" />
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
              <div className="mt-2 text-lg font-semibold text-slate-900">Hôm nay</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500"><ChartColumnBig className="h-4 w-4 text-[#1976D2]" /> Biểu đồ</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">Đang tổng hợp</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500"><Medal className="h-4 w-4 text-emerald-500" /> Xếp loại</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">Giỏi</div>
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
              <StudentPill tone="green">Hoàn thành</StudentPill>
            </div>
            <div className="grid gap-4 p-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="flex items-end justify-between rounded-[24px] border border-green-200 bg-gradient-to-br from-green-50 to-white p-6">
                <div>
                  <div className="text-sm text-slate-600">Điểm tổng kết TTTN</div>
                  <div className="mt-1 text-xs text-slate-500">Giảng viên chấm</div>
                </div>
                <div className="text-4xl font-semibold text-emerald-600">8.5</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-medium text-slate-900">Ghi chú</div>
                <div className="mt-2 text-sm text-slate-600">Sinh viên đã nộp đủ báo cáo tuần và hoàn thành mục tiêu thực tập.</div>
                <div className="mt-4 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Đủ số tuần báo cáo</div>
                  <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#1976D2]" /> Cập nhật lần cuối: hôm nay</div>
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 xl:col-span-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><FileText className="h-4 w-4 text-[#1976D2]" /> Bảng ghi nhận nhanh</div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {tttnRecords.map((record) => (
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
              <StudentPill tone="green">ĐẠT</StudentPill>
            </div>

            <div className="grid gap-4 p-6 xl:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-medium text-slate-900">Điểm chấm báo cáo</div>
                <div className="mt-3 text-3xl font-semibold text-[#1976D2]">7.8</div>
                <div className="mt-2 text-xs text-slate-500">Trung bình GVHD và GVPB</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-medium text-slate-900">Điểm bảo vệ</div>
                <div className="mt-3 text-3xl font-semibold text-emerald-600">8.2</div>
                <div className="mt-2 text-xs text-slate-500">Trung bình 5 thành viên hội đồng</div>
              </div>
              <div className="rounded-[24px] border border-blue-200 bg-blue-50 p-5 xl:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Điểm tổng kết</div>
                    <div className="text-xs text-slate-500">= (Điểm báo cáo × 0.2) + (Điểm bảo vệ × 0.8)</div>
                  </div>
                  <div className="text-4xl font-semibold text-[#1976D2]">8.12</div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Chúc mừng bạn đã hoàn thành Đồ án tốt nghiệp.
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 xl:col-span-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><GraduationCap className="h-4 w-4 text-[#1976D2]" /> Mốc đánh giá</div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {datnRecords.map((record) => (
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
            <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#1976D2]" /> Lần cập nhật gần nhất: hôm nay</div>
            <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#1976D2]" /> Điểm trung bình đang ở mức tốt</div>
          </div>

          <div className="mt-5 rounded-[24px] bg-white/85 p-4 ring-1 ring-slate-200">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><Star className="h-4 w-4 text-[#1976D2]" /> Quy đổi nhanh</div>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>TTTN</span>
                <span className="font-medium text-[#1976D2]">8.5 / 10</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>ĐATN</span>
                <span className="font-medium text-emerald-600">8.12 / 10</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>GPA xếp loại</span>
                <span className="font-medium text-slate-900">Giỏi</span>
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
              <div className="mt-1 h-3 w-3 rounded-full bg-emerald-500" />
              <div>
                <div className="text-sm font-medium text-slate-900">TTTN được chấm xong</div>
                <div className="text-xs text-slate-500">Cập nhật điểm bởi giảng viên hướng dẫn</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-[#2196F3]" />
              <div>
                <div className="text-sm font-medium text-slate-900">ĐATN được hội đồng công bố</div>
                <div className="text-xs text-slate-500">Điểm tổng hợp từ báo cáo và bảo vệ</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-semibold text-slate-900">Nhận xét nhanh</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">Điểm TTTN ổn định, không có cảnh báo nộp muộn.</div>
            <div className="rounded-2xl bg-slate-50 p-4">Điểm ĐATN đã vượt ngưỡng đạt, xếp loại tốt.</div>
            <div className="rounded-2xl bg-slate-50 p-4">{selectedRecord?.label}: {selectedRecord?.note}</div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-semibold text-slate-900">Tình trạng hiện tại</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Dữ liệu đã được công bố</div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3"><Sparkles className="h-4 w-4 text-[#1976D2]" /> Có thể tra cứu lại bất kỳ lúc nào</div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3"><CalendarDays className="h-4 w-4 text-[#1976D2]" /> Chuẩn bị cho đợt tốt nghiệp tiếp theo</div>
          </div>
        </div>
      </section>
    </>
  )
}
