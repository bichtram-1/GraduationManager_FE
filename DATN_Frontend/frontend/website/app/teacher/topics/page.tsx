"use client"

import { useMemo, useState, useEffect } from 'react'
import { BarChart3, CheckCircle, Edit2, Eye, Plus, ShieldCheck, Trash2, Users } from 'lucide-react'
import { TeacherPill, TeacherSectionHeader } from '../_components/TeacherShell'
import { TeacherButton, TeacherCard, TeacherToolbar } from '../_components/TeacherUI'
import ModalCreateEditTopic from './components/ModalCreateEditTopic'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { topicApi } from '@/lib/api/topicApi'

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
] as const

type Topic = {
  id?: string
  code: string
  name: string
  slots: string
  status: 'Đã duyệt' | 'Chờ duyệt' | 'Từ chối'
  note: string
  semester: string
  summary: string
  progress: number
}

type SaveTopicPayload = {
  code: string
  name: string
  summary: string
  maxSlots: number
}

async function mockUpdateTopic(current: Topic[], payload: SaveTopicPayload): Promise<Topic[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        current.map((topic) => {
          if (topic.code !== payload.code) return topic
          const registered = Number.parseInt(topic.slots.split('/')[0] ?? '0', 10)
          const boundedRegistered = Number.isNaN(registered) ? 0 : Math.min(registered, payload.maxSlots)
          const progress = Math.max(0, Math.min(100, Math.round((boundedRegistered / payload.maxSlots) * 100)))
          return {
            ...topic,
            name: payload.name,
            summary: payload.summary,
            slots: `${boundedRegistered}/${payload.maxSlots}`,
            progress,
          }
        })
      )
    }, 180)
  })
}

async function mockDeleteTopic(current: Topic[], code: string): Promise<Topic[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(current.filter((topic) => topic.code !== code))
    }, 180)
  })
}

export default function Page() {
  const { selectedPeriod } = usePeriod()
  const [topicList, setTopicList] = useState<Topic[]>([])
  const [openCreate, setOpenCreate] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingCode, setDeletingCode] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Đã duyệt' | 'Chờ duyệt' | 'Từ chối'>('all')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [slots, setSlots] = useState('4')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    topicApi.getTeacherTopics({ periodId: selectedPeriod?.id })
      .then((data) => {
        if (!mounted) return
        setTopicList(data)
        if (data.length > 0) {
          setSelectedTopic((curr) => {
            if (curr && data.some((t: any) => t.id === curr.id)) {
              return data.find((t: any) => t.id === curr.id) || data[0];
            }
            return data[0];
          })
        } else {
          setSelectedTopic(null)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [selectedPeriod?.id])

  const filtered = useMemo(
    () =>
      topicList.filter((topic) => {
        const q = query.toLowerCase()
        const statusMatch = statusFilter === 'all' || topic.status === statusFilter
        return statusMatch && (!q || [topic.code, topic.name, topic.status].some((value) => value.toLowerCase().includes(q)))
      }),
    [query, statusFilter, topicList]
  )

  const statusCount = useMemo(
    () => ({
      all: topicList.length,
      approved: topicList.filter((topic) => topic.status === 'Đã duyệt').length,
      pending: topicList.filter((topic) => topic.status === 'Chờ duyệt').length,
      rejected: topicList.filter((topic) => topic.status === 'Từ chối').length,
    }),
    [topicList]
  )

  const resetForm = () => {
    setName('')
    setDescription('')
    setSlots('4')
    setEditingCode(null)
  }

  const openCreateModal = () => {
    resetForm()
    setOpenCreate(true)
  }

  const handleEdit = (topic: Topic) => {
    setSelectedTopic(topic)
    setEditingCode(topic.code)
    setName(topic.name)
    setDescription(topic.summary)
    setSlots(topic.slots.split('/')[1] ?? '4')
    setOpenCreate(true)
  }

  const handleDelete = async (topic: Topic) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa đề tài ${topic.code} - ${topic.name}?`)
    if (!ok) return

    setDeletingCode(topic.code)
    try {
      if (topic.id) {
        await topicApi.deleteTopic(topic.id);
      }
      const data = await topicApi.getTeacherTopics({ periodId: selectedPeriod?.id });
      setTopicList(data);
      if (data.length > 0) {
        setSelectedTopic(data[0]);
      } else {
        setSelectedTopic(null);
      }
    } catch (e) {
      console.error(e);
      alert('Không thể xóa đề tài!');
    } finally {
      setDeletingCode(null)
    }
  }

  const handleImportFile = async (file: File) => {
    const ok = window.confirm(`Bạn có chắc muốn import đề tài từ file ${file.name}?`)
    if (!ok) return
    setSubmitting(true)
    try {
      const res = await topicApi.importTopics(file, selectedPeriod?.id)
      if (res?.success) {
        alert(res.message || 'Import đề tài thành công!')
        const data = await topicApi.getTeacherTopics({ periodId: selectedPeriod?.id })
        setTopicList(data)
        if (data.length > 0) {
          setSelectedTopic(data[0])
        }
        setOpenCreate(false)
      } else {
        alert(res?.message || 'Import đề tài thất bại!')
      }
    } catch (e: any) {
      console.error(e)
      alert(e?.response?.data?.message || 'Có lỗi xảy ra khi import file!')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSave = async () => {
    const trimmedName = name.trim()
    const trimmedSummary = description.trim()
    const maxSlots = Number.parseInt(slots, 10)

    if (!trimmedName || !trimmedSummary || Number.isNaN(maxSlots) || maxSlots <= 0) {
      return
    }

    setSubmitting(true)

    try {
      if (editingCode) {
        const targetTopic = topicList.find(t => t.code === editingCode);
        if (targetTopic?.id) {
          await topicApi.updateTopic(targetTopic.id, {
            name: trimmedName,
            description: trimmedSummary,
            slots: String(maxSlots),
            teacher: 'TS. Nguyễn Văn X',
          });
        }
      } else {
        await topicApi.createTopic({
          name: trimmedName,
          description: trimmedSummary,
          slots: String(maxSlots),
          teacher: 'TS. Nguyễn Văn X',
          periodId: selectedPeriod?.id
        });
      }

      const data = await topicApi.getTeacherTopics({ periodId: selectedPeriod?.id });
      setTopicList(data);
      if (data.length > 0) {
        setSelectedTopic((curr) => {
          if (editingCode && data.some((t: any) => t.code === editingCode)) {
            return data.find((t: any) => t.code === editingCode) || data[0];
          }
          return data[0];
        })
      } else {
        setSelectedTopic(null);
      }
    } catch (e) {
      console.error(e);
      alert('Không thể lưu đề tài!');
    } finally {
      setSubmitting(false)
      setOpenCreate(false)
      resetForm()
    }
  }

  return (
    <>
      <TeacherSectionHeader
        title="Đề tài của tôi"
        description="Theo dõi đề tài, cập nhật nội dung và quản lý trạng thái ngay trên một màn hình."
        actions={
          <TeacherButton variant="primary" className="!h-11" onClick={openCreateModal}>
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tạo đề tài mới
            </span>
          </TeacherButton>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2 rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        {[
          { key: 'all', label: 'Tất cả', count: statusCount.all },
          { key: 'Đã duyệt', label: 'Đã duyệt', count: statusCount.approved },
          { key: 'Chờ duyệt', label: 'Chờ duyệt', count: statusCount.pending },
          { key: 'Từ chối', label: 'Từ chối', count: statusCount.rejected },
        ].map((tab) => {
          const active = statusFilter === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key as typeof statusFilter)}
              className={`inline-flex items-center gap-2 rounded-[20px] px-4 py-2.5 text-sm font-medium transition ${active ? 'bg-[#2196F3] text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{tab.count}</span>
            </button>
          )
        })}
      </div>

      <TeacherCard>
        <TeacherToolbar
          placeholder="Tìm mã đề tài, tên đề tài, trạng thái..."
          value={query}
          onChange={setQuery}
        >
          <TeacherPill tone="blue">Tất cả học kỳ</TeacherPill>
          <TeacherPill tone="green">{statusCount.approved} đề tài đã duyệt</TeacherPill>
          <TeacherPill tone="orange">{statusCount.pending} đề tài chờ duyệt</TeacherPill>
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
                    <button className="rounded-2xl p-2 text-amber-600 transition hover:bg-amber-50" title="Sửa" onClick={() => handleEdit(topic)}>
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-2xl p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Xóa"
                      onClick={() => handleDelete(topic)}
                      disabled={deletingCode === topic.code}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TeacherCard>

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

      <ModalCreateEditTopic
        open={openCreate}
        submitting={submitting}
        editingCode={editingCode}
        name={name}
        description={description}
        slots={slots}
        onChangeName={setName}
        onChangeDescription={setDescription}
        onChangeSlots={setSlots}
        onClose={() => {
          setOpenCreate(false)
          resetForm()
        }}
        onSave={handleSave}
        onImportFile={handleImportFile}
      />
    </>
  )
}
