'use client'

import { useMemo, useState } from 'react'
import { BarChart3, BookOpen, CheckCircle, Clock3, Download, Eye, FileText, Layers3, Plus, Search, ShieldCheck, Upload, Users } from 'lucide-react'
import { TeacherPill, TeacherSectionHeader } from '../_components/TeacherShell'
import { TeacherButton, TeacherCard, TeacherField, TeacherInputClass, TeacherModal, TeacherToolbar } from '../_components/TeacherUI'

const TOPICS = [
  {
    code: 'DA001',
    name: 'Hệ thống IoT giám sát nông nghiệp',
    slots: '3/4',
    status: 'Đã duyệt',
    note: 'Có 2 nhóm đã đăng ký',
    semester: 'HK2/2025-2026',
    summary: 'Theo dõi độ ẩm, nhiệt độ và cảnh báo từ cảm biến.',
    progress: 75,
  },
  {
    code: 'DA007',
    name: 'Blockchain cho quản lý chuỗi cung ứng',
    slots: '0/3',
    status: 'Chờ duyệt',
    note: 'Chờ Admin phản hồi',
    semester: 'HK2/2025-2026',
    summary: 'Minh bạch hóa trạng thái vận chuyển và xác thực lô hàng.',
    progress: 0,
  },
  {
    code: 'DA012',
    name: 'Ứng dụng ML dự đoán giá chứng khoán',
    slots: '0/4',
    status: 'Chờ duyệt',
    note: 'Mới gửi tuần này',
    semester: 'HK2/2025-2026',
    summary: 'Dự đoán xu hướng giá từ dữ liệu lịch sử và tin tức.',
    progress: 20,
  },
  {
    code: 'DA015',
    name: 'Hệ thống chấm điểm tự động',
    slots: '0/3',
    status: 'Từ chối',
    note: 'Cần chỉnh lại mô tả',
    semester: 'HK2/2025-2026',
    summary: 'Tự động hóa quy trình chấm và phản hồi cho sinh viên.',
    progress: 10,
  },
]

export default function TeacherTopicsPage() {
  const [openCreate, setOpenCreate] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<(typeof TOPICS)[number] | null>(TOPICS[0])
  const [query, setQuery] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [slots, setSlots] = useState('4')

  const filtered = useMemo(
    () =>
      TOPICS.filter((topic) => {
        const q = query.toLowerCase()
        return !q || [topic.code, topic.name, topic.status].some((value) => value.toLowerCase().includes(q))
      }),
    [query]
  )

  const summary = [
    { title: 'Đề tài đã duyệt', value: TOPICS.filter((topic) => topic.status === 'Đã duyệt').length.toString(), hint: 'Có thể cho sinh viên đăng ký' },
    { title: 'Chờ duyệt', value: TOPICS.filter((topic) => topic.status === 'Chờ duyệt').length.toString(), hint: 'Đang chờ bộ phận quản lý' },
    { title: 'Từ chối', value: TOPICS.filter((topic) => topic.status === 'Từ chối').length.toString(), hint: 'Cần chỉnh mô tả hoặc scope' },
  ]

  return (
    <>
      <TeacherSectionHeader
        title="Đề tài của tôi"
        description="Tạo đề tài ĐATN, theo dõi slot đăng ký và trạng thái duyệt trong cùng một màn hình giống bộ design tham chiếu."
        actions={
          <>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
              <Upload className="h-4 w-4" />
              Import file đề tài
              <input type="file" accept=".xlsx,.xls" className="hidden" />
            </label>
            <TeacherButton variant="primary" className="!h-11" onClick={() => setOpenCreate(true)}>
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tạo đề tài mới
              </span>
            </TeacherButton>
          </>
        }
      />

      <section className="mb-5 rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <TeacherPill tone="blue">Quản lý đề tài ĐATN</TeacherPill>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">Danh sách đề tài được trình bày như một bảng điều khiển gọn, có chi tiết và hành động nhanh.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Khối này giúp giảng viên xem trạng thái duyệt, slot đăng ký và phản hồi nhanh hơn mà không phải rời khỏi màn hình.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[440px]">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Duyệt</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{summary[0].value}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Chờ duyệt</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{summary[1].value}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs text-slate-500">Từ chối</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{summary[2].value}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <TeacherCard key={item.title} className="p-5">
            <div className="inline-flex rounded-2xl bg-gradient-to-br from-[#2196F3] to-[#2563eb] px-3 py-2 text-white shadow-lg shadow-blue-100">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{item.value}</div>
            <div className="mt-1 text-sm font-medium text-slate-700">{item.title}</div>
            <div className="mt-2 text-xs text-slate-500">{item.hint}</div>
          </TeacherCard>
        ))}
      </div>

      <section className="mb-4 rounded-[28px] border border-blue-100 bg-[#eff6ff] p-5 text-sm text-[#1976D2] shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
        <div className="flex items-start gap-3">
          <CheckCircle className="mt-0.5 h-5 w-5" />
          <div>
            <div className="font-medium">Đề tài của bạn sẽ được hiển thị ở trạng thái chờ duyệt trước khi sinh viên đăng ký.</div>
            <div className="mt-1 text-xs text-[#4f77b5]">UI này mô phỏng phong cách của bộ design gốc: thẻ bo góc lớn, header nổi bật và bảng dữ liệu sạch.</div>
          </div>
        </div>
      </section>

      <TeacherCard>
        <TeacherToolbar
          placeholder="Tìm mã đề tài, tên đề tài, trạng thái..."
          value={query}
          onChange={setQuery}
        >
          <TeacherPill tone="blue">Tất cả học kỳ</TeacherPill>
          <TeacherPill tone="green">4 đề tài đã duyệt</TeacherPill>
          <TeacherPill tone="orange">2 đề tài chờ duyệt</TeacherPill>
        </TeacherToolbar>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 text-left">Mã</th>
              <th className="px-5 py-3 text-left">Tên đề tài</th>
              <th className="px-5 py-3 text-left">Slot</th>
              <th className="px-5 py-3 text-left">Ghi chú</th>
              <th className="px-5 py-3 text-left">Trạng thái</th>
              <th className="px-5 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((topic) => (
              <tr key={topic.code} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                <td className="px-5 py-4 font-medium text-[#1976D2]">{topic.code}</td>
                <td className="px-5 py-4 text-slate-900">{topic.name}</td>
                <td className="px-5 py-4 text-slate-600">{topic.slots}</td>
                <td className="px-5 py-4 text-slate-600">{topic.note}</td>
                <td className="px-5 py-4">
                  <TeacherPill tone={topic.status === 'Đã duyệt' ? 'green' : topic.status === 'Từ chối' ? 'red' : 'orange'}>
                    {topic.status}
                  </TeacherPill>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="rounded-2xl p-2 text-[#1976D2] transition hover:bg-blue-50" title="Xem chi tiết" onClick={() => setSelectedTopic(topic)}>
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="rounded-2xl p-2 text-emerald-600 transition hover:bg-emerald-50" title="Phê duyệt">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button className="rounded-2xl p-2 text-slate-600 transition hover:bg-slate-100" title="Tải xuống">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TeacherCard>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Sinh viên chưa có đề tài</div>
              <div className="text-xs text-slate-500">Danh sách để nhắc nhở hoặc phân công thêm</div>
            </div>
            <TeacherPill tone="orange">3 sinh viên</TeacherPill>
          </div>
          <div className="mt-4 space-y-3">
            {['20520014 - Nguyễn Văn P', '20520018 - Trần Thị Q', '20520020 - Mai Thị K'].map((student) => (
              <div key={student} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div className="text-sm text-slate-700">{student}</div>
                <button className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100">
                  Gửi nhắc nhở
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-semibold text-slate-900">Thao tác nhanh</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2"><BookOpen className="text-[#1976D2]" /> Tạo mới đề tài ĐATN</div>
            <div className="flex items-center gap-2"><Upload className="text-[#1976D2]" /> Import danh sách đề tài</div>
            <div className="flex items-center gap-2"><Layers3 className="text-[#1976D2]" /> Phân nhóm theo học kỳ</div>
            <div className="flex items-center gap-2"><ShieldCheck className="text-[#1976D2]" /> Kiểm tra trạng thái duyệt</div>
            <div className="flex items-center gap-2"><Clock3 className="text-[#1976D2]" /> Cập nhật slot đăng ký</div>
          </div>

          {selectedTopic && (
            <div className="mt-5 rounded-[24px] bg-white/85 p-4 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium text-slate-900">Đang xem</div>
                  <div className="text-xs text-slate-500">Chi tiết đề tài đã chọn từ bảng</div>
                </div>
                <TeacherPill tone={selectedTopic.status === 'Đã duyệt' ? 'green' : selectedTopic.status === 'Từ chối' ? 'red' : 'orange'}>{selectedTopic.code}</TeacherPill>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">{selectedTopic.name}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">{selectedTopic.summary}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">{selectedTopic.slots} slot · {selectedTopic.progress}% đã lấp đầy</div>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <TeacherCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Chi tiết đề tài</div>
              <div className="text-xs text-slate-500">Xem nhanh thông tin đang được chọn trong bảng</div>
            </div>
            <TeacherPill tone={selectedTopic?.status === 'Đã duyệt' ? 'green' : selectedTopic?.status === 'Từ chối' ? 'red' : 'orange'}>
              {selectedTopic?.status ?? 'Chưa chọn'}
            </TeacherPill>
          </div>

          {selectedTopic ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Mã đề tài</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{selectedTopic.code}</div>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Học kỳ</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{selectedTopic.semester}</div>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4 md:col-span-2">
                <div className="text-xs text-slate-500">Mô tả ngắn</div>
                <div className="mt-1 text-sm leading-6 text-slate-700">{selectedTopic.summary}</div>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Slot đã đăng ký</span>
                  <span>{selectedTopic.slots}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-[#2196F3]" style={{ width: `${selectedTopic.progress}%` }} />
                </div>
                <div className="mt-2 text-xs text-slate-500">Tiến độ lấp đầy đề tài</div>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Ghi chú</div>
                <div className="mt-1 text-sm text-slate-700">{selectedTopic.note}</div>
              </div>
            </div>
          ) : null}
        </TeacherCard>

        <TeacherCard className="bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-5">
          <div className="text-sm font-semibold text-slate-900">Luồng duyệt</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3"><CheckCircle className="h-4 w-4 text-emerald-600" /> Soạn đề tài và nhập mô tả</div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3"><ShieldCheck className="h-4 w-4 text-[#1976D2]" /> Gửi duyệt cho bộ phận quản lý</div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3"><Users className="h-4 w-4 text-[#1976D2]" /> Sinh viên đăng ký theo slot</div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3"><BarChart3 className="h-4 w-4 text-[#1976D2]" /> Theo dõi tiến độ nhóm đăng ký</div>
          </div>
        </TeacherCard>
      </section>

      <TeacherModal
        open={openCreate}
        title="Tạo đề tài ĐATN mới"
        onClose={() => setOpenCreate(false)}
      >
        <div className="mt-2">
          <TeacherField label="Tên đề tài" required>
            <input value={name} onChange={(e) => setName(e.target.value)} className={TeacherInputClass()} placeholder="VD: Hệ thống chatbot hỗ trợ tuyển sinh" />
          </TeacherField>
          <TeacherField label="Mô tả ngắn" required>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={TeacherInputClass('resize-none')} placeholder="Mô tả mục tiêu và nội dung chính" />
          </TeacherField>
          <TeacherField label="Số slot tối đa" required>
            <input value={slots} onChange={(e) => setSlots(e.target.value)} type="number" className={TeacherInputClass()} />
          </TeacherField>
          <div className="flex justify-end gap-2 pt-2">
            <TeacherButton variant="secondary" onClick={() => setOpenCreate(false)}>Hủy</TeacherButton>
            <TeacherButton variant="primary" onClick={() => setOpenCreate(false)}>Gửi yêu cầu duyệt</TeacherButton>
          </div>
        </div>
      </TeacherModal>
    </>
  )
}
