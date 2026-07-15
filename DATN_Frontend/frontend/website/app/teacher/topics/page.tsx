"use client"

import { useMemo, useState, useEffect } from 'react'
import { Edit2, Eye, Plus, Trash2 } from 'lucide-react'
import { TeacherPill, TeacherSectionHeader } from '../_components/TeacherShell'
import { TeacherButton, TeacherCard, TeacherToolbar, TeacherModal, getTopicStatusTone } from '../_components/TeacherUI'
import ModalCreateEditTopic from './components/ModalCreateEditTopic'
import ModalDetailTopic from './components/ModalDetailTopic'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { topicApi } from '@/lib/api/topicApi'
import { COMMON_LABELS } from '@/constants/commonLabels'

type Topic = {
  id?: string
  code: string
  name: string
  slots: string
  approvedStudents?: string
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    let mounted = true
    
    const fetchTopics = async (showLoading = false) => {
      if (showLoading) setLoading(true)
      try {
        const data = await topicApi.getTeacherTopics({ periodId: selectedPeriod?.id });
        if (mounted) {
          setTopicList(data);
          
          setSelectedTopic((curr) => {
            if (curr && data.some((t: Topic) => t.id === curr.id)) {
              return data.find((t: Topic) => t.id === curr.id) || data[0];
            }
            return data.length > 0 ? data[0] : null;
          });

          setViewingTopic((curr) => {
            if (curr) {
              const updated = data.find((t: Topic) => t.id === curr.id);
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
      showNotification('Xóa đề tài thành công!', 'success');
    } catch (e) {
      console.error(e);
      showNotification('Không thể xóa đề tài!', 'error');
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
        showNotification(res.message || 'Import đề tài thành công!', 'success')
        const data = await topicApi.getTeacherTopics({ periodId: selectedPeriod?.id })
        setTopicList(data)
        if (data.length > 0) {
          setSelectedTopic(data[0])
        }
        setOpenCreate(false)
      } else {
        showNotification(res?.message || 'Import đề tài thất bại!', 'error')
      }
    } catch (e: unknown) {
      console.error(e)
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showNotification(msg || 'Có lỗi xảy ra khi import file!', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSave = async () => {
    const trimmedName = name.trim()
    const trimmedSummary = description.trim()
    const maxSlots = Number.parseInt(slots, 10)

    if (!trimmedName || trimmedName.length > 255 || !trimmedSummary || trimmedSummary.length > 5000 || Number.isNaN(maxSlots) || maxSlots < 2 || maxSlots % 2 !== 0) {
      return
    }

    if (!editingCode && !fileUrl) {
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
          if (editingCode && data.some((t: Topic) => t.code === editingCode)) {
            const updated = data.find((t: Topic) => t.code === editingCode);
            if (updated) setViewingTopic(updated);
            return updated || data[0];
          }
          return data[0];
        })
      } else {
        setSelectedTopic(null);
        setViewingTopic(null);
      }
      showNotification(editingCode ? 'Cập nhật đề tài thành công!' : 'Đề xuất đề tài thành công!', 'success');
    } catch {
      showNotification('Không thể lưu đề tài!', 'error');
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
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Đã duyệt' | 'Chờ duyệt' | 'Từ chối')}
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
              <th className="px-5 py-3 text-center w-16">STT</th>
              <th className="px-5 py-3 text-center">Tên đề tài</th>
              <th className="px-5 py-3 text-center w-28">Số lượng</th>
              <th className="px-5 py-3 text-center w-32">Đã đăng kí</th>
              <th className="px-5 py-3 text-center w-1/3">Mô tả</th>
              <th className="px-5 py-3 text-center w-36">Trạng thái</th>
              <th className="px-5 py-3 text-center w-36">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((topic, index) => (
              <tr key={topic.code} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                <td className="px-5 py-4 text-center font-medium text-slate-500">{index + 1}</td>
                <td className="px-5 py-4 text-slate-900 font-medium text-left">{topic.name}</td>
                <td className="px-5 py-4 text-center text-slate-600">{topic.slots.split('/')[1] || topic.slots}</td>
                <td className="px-5 py-4 text-center text-slate-600">{topic.approvedStudents || 'chưa có'}</td>
                <td className="px-5 py-4 text-slate-600 max-w-xs truncate text-left" title={topic.summary}>{topic.summary}</td>
                <td className="px-5 py-4 text-center">
                  <TeacherPill tone={getTopicStatusTone(topic.status)}>
                    {topic.status}
                  </TeacherPill>
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex justify-center gap-1">
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
                <td colSpan={7} className="px-5 py-8 text-center text-slate-500">Không có đề tài nào phù hợp bộ lọc.</td>
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
            <TeacherButton variant="secondary" onClick={() => setDeletingTopic(null)}>{COMMON_LABELS.CANCEL}</TeacherButton>
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

      {toast && (
        <div
          className={`fixed right-6 top-20 z-[9999] rounded-2xl px-4 py-3 text-sm text-white shadow-lg transition-all duration-300 flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        >
          <span>{toast.type === 'success' ? '✓' : '✗'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </>
  )
}
