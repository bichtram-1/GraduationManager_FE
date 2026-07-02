"use client"

import { useMemo, useState, useEffect } from 'react'
import { Edit2, Eye, Plus, Trash2 } from 'lucide-react'
import { TeacherPill, TeacherSectionHeader } from '../_components/TeacherShell'
import { TeacherButton, TeacherCard, TeacherToolbar, TeacherModal } from '../_components/TeacherUI'
import ModalCreateEditTopic from './components/ModalCreateEditTopic'
import ModalDetailTopic from './components/ModalDetailTopic'
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
  direction?: string
  fileUrl?: string
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
  const [viewingTopic, setViewingTopic] = useState<Topic | null>(null)
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null)
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingCode, setDeletingCode] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Đã duyệt' | 'Chờ duyệt' | 'Từ chối'>('all')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [slots, setSlots] = useState('2')
  const [direction, setDirection] = useState('Phát triển phần mềm')
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    
    const fetchTopics = async (showLoading = false) => {
      if (showLoading) setLoading(true)
      try {
        const data = await topicApi.getTeacherTopics({ periodId: selectedPeriod?.id });
        if (mounted) {
          setTopicList(data);
          
          setSelectedTopic((curr) => {
            if (curr && data.some((t: any) => t.id === curr.id)) {
              return data.find((t: any) => t.id === curr.id) || data[0];
            }
            return data.length > 0 ? data[0] : null;
          });

          setViewingTopic((curr) => {
            if (curr) {
              const updated = data.find((t: any) => t.id === curr.id);
              return updated || null;
            }
            return null;
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted && showLoading) setLoading(false)
      }
    };

    fetchTopics(true);

    const handleSync = () => {
      fetchTopics(false);
    }
    window.addEventListener('realtime-topic-updated', handleSync)

    const intervalId = setInterval(() => {
      fetchTopics(false);
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      window.removeEventListener('realtime-topic-updated', handleSync)
    }
  }, [selectedPeriod?.id])

  const filtered = useMemo(
    () =>
      topicList.filter((topic) => {
        const nameQ = query.trim().toLowerCase()
        const nameMatch = !nameQ || topic.name.toLowerCase().includes(nameQ)
        const statusMatch = statusFilter === 'all' || topic.status === statusFilter
        return nameMatch && statusMatch
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
    setSlots('2')
    setDirection('Phát triển phần mềm')
    setFileUrl('')
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
    setDirection(topic.direction || 'Phát triển phần mềm')
    setFileUrl(topic.fileUrl || '')
    setOpenCreate(true)
  }

  const confirmDelete = async () => {
    if (!deletingTopic || !deletingTopic.id) return
    setDeletingCode(deletingTopic.code)
    try {
      await topicApi.deleteTopic(deletingTopic.id);
      const data = await topicApi.getTeacherTopics({ periodId: selectedPeriod?.id });
      setTopicList(data);
      if (data.length > 0) {
        setSelectedTopic(data[0]);
      } else {
        setSelectedTopic(null);
      }
      setViewingTopic(null);
      setDeletingTopic(null);
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
            direction: direction,
            fileUrl: fileUrl,
            teacher: 'TS. Nguyễn Văn X',
          });
        }
      } else {
        await topicApi.createTopic({
          name: trimmedName,
          description: trimmedSummary,
          slots: String(maxSlots),
          direction: direction,
          fileUrl: fileUrl,
          teacher: 'TS. Nguyễn Văn X',
          periodId: selectedPeriod?.id
        });
      }

      const data = await topicApi.getTeacherTopics({ periodId: selectedPeriod?.id });
      setTopicList(data);
      if (data.length > 0) {
        setSelectedTopic((curr) => {
          if (editingCode && data.some((t: any) => t.code === editingCode)) {
            const updated = data.find((t: any) => t.code === editingCode);
            if (updated) setViewingTopic(updated);
            return updated || data[0];
          }
          return data[0];
        })
      } else {
        setSelectedTopic(null);
        setViewingTopic(null);
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

      <TeacherCard>
        <TeacherToolbar
          placeholder="Tìm tên đề tài..."
          value={query}
          onChange={setQuery}
        >
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-[#2196F3] shadow-sm cursor-pointer"
            >
              <option value="all">Tất cả ({statusCount.all})</option>
              <option value="Đã duyệt">Đã duyệt ({statusCount.approved})</option>
              <option value="Chờ duyệt">Chờ duyệt ({statusCount.pending})</option>
              <option value="Từ chối">Từ chối ({statusCount.rejected})</option>
            </select>
          </div>
          <TeacherPill tone="blue">{selectedPeriod?.name || 'Đợt hiện tại'}</TeacherPill>
        </TeacherToolbar>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 text-left w-16">STT</th>
              <th className="px-5 py-3 text-left">Tên đề tài</th>
              <th className="px-5 py-3 text-left w-48">Số lượng thành viên</th>
              <th className="px-5 py-3 text-left w-1/3">Mô tả</th>
              <th className="px-5 py-3 text-left w-36">Trạng thái</th>
              <th className="px-5 py-3 text-right w-36">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((topic, index) => (
              <tr key={topic.code} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                <td className="px-5 py-4 font-medium text-slate-500">{index + 1}</td>
                <td className="px-5 py-4 text-slate-900 font-medium">{topic.name}</td>
                <td className="px-5 py-4 text-slate-600">{topic.slots.split('/')[1] || topic.slots}</td>
                <td className="px-5 py-4 text-slate-600 max-w-xs truncate" title={topic.summary}>{topic.summary}</td>
                <td className="px-5 py-4">
                  <TeacherPill tone={topic.status === 'Đã duyệt' ? 'green' : topic.status === 'Từ chối' ? 'red' : 'orange'}>
                    {topic.status}
                  </TeacherPill>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button className="rounded-2xl p-2 text-[#1976D2] transition hover:bg-blue-50" title="Xem chi tiết" onClick={() => setViewingTopic(topic)}>
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-2xl p-2 text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-30"
                      title={topic.status === 'Đã duyệt' ? 'Đề tài đã duyệt không được chỉnh sửa' : 'Sửa'}
                      onClick={() => handleEdit(topic)}
                      disabled={topic.status === 'Đã duyệt'}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-2xl p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                      title={topic.status === 'Đã duyệt' ? 'Đề tài đã duyệt không được xóa' : 'Xóa'}
                      onClick={() => setDeletingTopic(topic)}
                      disabled={deletingCode === topic.code || topic.status === 'Đã duyệt'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-500">Không có đề tài nào phù hợp bộ lọc.</td>
              </tr>
            )}
          </tbody>
        </table>
      </TeacherCard>

      <ModalCreateEditTopic
        open={openCreate}
        submitting={submitting}
        editingCode={editingCode}
        name={name}
        description={description}
        slots={slots}
        direction={direction}
        fileUrl={fileUrl}
        status={selectedTopic?.status || ''}
        rejectReason={selectedTopic?.note || ''}
        onChangeName={setName}
        onChangeDescription={setDescription}
        onChangeSlots={setSlots}
        onChangeDirection={setDirection}
        onChangeFileUrl={setFileUrl}
        onClose={() => {
          setOpenCreate(false)
          resetForm()
        }}
        onSave={handleSave}
        onImportFile={handleImportFile}
      />

      <ModalDetailTopic
        open={viewingTopic !== null}
        topic={viewingTopic}
        onClose={() => setViewingTopic(null)}
      />

      <TeacherModal
        open={deletingTopic !== null}
        title="Xác nhận xóa đề tài"
        onClose={() => setDeletingTopic(null)}
        footer={
          <div className="flex justify-end gap-2">
            <TeacherButton variant="secondary" onClick={() => setDeletingTopic(null)}>Hủy</TeacherButton>
            <TeacherButton
              variant="primary"
              className="!bg-red-600 hover:!bg-red-700 text-white"
              onClick={confirmDelete}
              disabled={submitting}
            >
              {submitting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </TeacherButton>
          </div>
        }
      >
        <div className="mt-2 text-sm text-slate-600 leading-relaxed">
          Bạn có chắc chắn muốn xóa đề tài <span className="font-semibold text-slate-900">&quot;{deletingTopic?.name}&quot;</span>? Hành động này không thể hoàn tác.
        </div>
      </TeacherModal>
    </>
  )
}
