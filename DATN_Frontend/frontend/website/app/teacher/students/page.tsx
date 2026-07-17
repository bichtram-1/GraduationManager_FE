'use client'

import { useMemo, useState, useEffect } from 'react'
import { BookOpen, Eye, Mail, MapPin, Phone, Search, Users, Building2 } from 'lucide-react'
import { TeacherPill, TeacherSectionHeader } from '../_components/TeacherShell'
import { TeacherButton, TeacherCard, TeacherPagination } from '../_components/TeacherUI'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { teacherApi } from '@/lib/api/teacherApi'
import { App } from 'antd'
import { COMMON_LABELS } from '@/constants/commonLabels'
import { getFileUrl } from '@/lib/utils/fileUrl'

export default function TeacherStudentsPage() {
  const { message } = App.useApp()
  const { selectedPeriod, studentsTab, setStudentsTab } = usePeriod()
  const segment = studentsTab === 'DATN' ? 'ĐATN' : 'TTTN'
  const setSegment = (seg: 'TTTN' | 'ĐATN') => {
    setStudentsTab(seg === 'ĐATN' ? 'DATN' : 'TTTN')
  }
  const [searchName, setSearchName] = useState('')
  const [searchCompany, setSearchCompany] = useState('')
  const [searchTopic, setSearchTopic] = useState('')
  interface IStudentReport {
    bao_cao_id: string | number
    comment?: string
    title?: string
    date?: string
    fileUrl?: string
    week?: number
    status?: string
    tuan_so?: number
    trang_thai?: string
    thoi_gian_nop?: string
    deadline?: string
    duong_dan_file?: string
    noi_dung?: string
  }

  interface ITttnStudent {
    id: string
    name: string
    comment?: string
    reports?: IStudentReport[]
    studentCode?: string
    companyName?: string
    company?: string
    phone?: string
    email?: string
    mentor?: string
    class?: string
    className?: string
    major?: string
    majorName?: string
    companyAddress?: string
    address?: string
    internshipPosition?: string
    field?: string
    internshipLocation?: string
    internshipAddress?: string
    taxId?: string
    taxCode?: string
    mentorName?: string
    mentorPhone?: string
    mentorPhoneNo?: string
  }

  interface IGroupMemberInfo {
    id: string
    name: string
    is_leader?: boolean
    class_name?: string
    studentCode?: string
    class?: string
  }

  interface IDatnGroup {
    group: string
    topic?: string
    topic_details?: { name?: string; huong_de_tai?: string }
    members?: number
    members_list?: IGroupMemberInfo[]
    reports?: IStudentReport[]
    comment?: string
  }

  const [tttnList, setTttnList] = useState<ITttnStudent[]>([])
  const [datnList, setDatnList] = useState<IDatnGroup[]>([])
  const [selectedTTTN, setSelectedTTTN] = useState<ITttnStudent | null>(null)
  const [selectedDATN, setSelectedDATN] = useState<IDatnGroup | null>(null)
  const [comments, setComments] = useState<Record<string, string>>({})
  const [commentModal, setCommentModal] = useState<{ open: boolean; id?: string; text: string }>({ open: false, id: undefined, text: '' })
  const [reportModal, setReportModal] = useState<{ open: boolean; id?: string; type?: 'TTTN' | 'DATN' }>({ open: false, id: undefined, type: undefined })
  const [companyModal, setCompanyModal] = useState<{ open: boolean; student: ITttnStudent | null }>({ open: false, student: null })
  const [groupDetailModal, setGroupDetailModal] = useState<{ open: boolean; group: IDatnGroup | null }>({ open: false, group: null })
  const [loading, setLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<IStudentReport | null>(null)
  const [reportCommentText, setReportCommentText] = useState('')
  const [currentPageTTTN, setCurrentPageTTTN] = useState(1)
  const [currentPageDATN, setCurrentPageDATN] = useState(1)

  useEffect(() => {
    setCurrentPageTTTN(1)
  }, [searchName, searchCompany, selectedPeriod?.id])

  useEffect(() => {
    setCurrentPageDATN(1)
  }, [searchName, searchTopic, selectedPeriod?.id])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('studentsTab')
      if (tabParam === 'DATN') {
        setStudentsTab('DATN')
      } else if (tabParam === 'TTTN') {
        setStudentsTab('TTTN')
      }
    }
  }, [])

  useEffect(() => {
    const handleStudentSegmentEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail === 'DATN') {
        setStudentsTab('DATN')
      } else if (customEvent.detail === 'TTTN') {
        setStudentsTab('TTTN')
      }
    }
    window.addEventListener('student-segment-changed', handleStudentSegmentEvent)
    return () => {
      window.removeEventListener('student-segment-changed', handleStudentSegmentEvent)
    }
  }, [])

  const formatCompanyInfo = (val?: string | null) => {
    if (!val || val === '—' || val === 'Chưa có' || val === 'chưa có' || val === 'Chưa cập nhật') {
      return 'Chưa có thông tin'
    }
    return val
  }

  useEffect(() => {
    let mounted = true
    setLoading(true)
    const load = () => {
      teacherApi.getStudents({ periodId: selectedPeriod?.id })
        .then((res) => {
          if (!mounted) return
          if (res?.success) {
            const tttn = res.tttn || []
            const datn = res.datn || []
            setTttnList(tttn)
            setDatnList(datn)

            // Load comments from backend
            const initialComments: Record<string, string> = {}
            tttn.forEach((item: ITttnStudent) => {
              if (item.comment) initialComments[item.id] = item.comment
            })
            datn.forEach((item: IDatnGroup) => {
              if (item.comment) initialComments[item.group] = item.comment
            })
            setComments(initialComments)

            setSelectedTTTN((curr) => {
              if (curr && tttn.some((s: ITttnStudent) => s.id === curr.id)) {
                return tttn.find((s: ITttnStudent) => s.id === curr.id) || null
              }
              return tttn.length > 0 ? tttn[0] : null
            })
            setSelectedDATN((curr) => {
              if (curr && datn.some((g: IDatnGroup) => g.group === curr.group)) {
                return datn.find((g: IDatnGroup) => g.group === curr.group) || null
              }
              return datn.length > 0 ? datn[0] : null
            })
          } else {
            setTttnList([])
            setDatnList([])
            setSelectedTTTN(null)
            setSelectedDATN(null)
            message.error('Không tải được danh sách sinh viên hướng dẫn. Vui lòng thử lại!')
          }
        })
        .catch(() => {
          if (mounted) {
            setTttnList([])
            setDatnList([])
            setSelectedTTTN(null)
            setSelectedDATN(null)
            message.error('Có lỗi xảy ra khi tải danh sách sinh viên hướng dẫn!')
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

    return () => {
      mounted = false
      window.removeEventListener('realtime-group-updated', handleSync)
      window.removeEventListener('realtime-topic-updated', handleSync)
    }
  }, [selectedPeriod?.id, message])

  useEffect(() => {
    if (reportModal.open && reportModal.type === 'TTTN') {
      setReportCommentText(selectedReport?.comment ?? '')
    } else if (reportModal.open && reportModal.type === 'DATN' && reportModal.id) {
      setReportCommentText(comments[reportModal.id] ?? '')
    } else {
      setReportCommentText('')
    }
  }, [reportModal.open, reportModal.type, reportModal.id, selectedReport, comments])

  const handleSaveReportComment = async () => {
    if (!reportModal.id || !reportModal.type) return
    try {
      const payload: { studentId: string; periodId?: string; comment: string; type: "TTTN" | "DATN"; baoCaoId?: number } = {
        studentId: reportModal.id,
        periodId: selectedPeriod?.id,
        comment: reportCommentText,
        type: reportModal.type as "TTTN" | "DATN"
      }
      if (selectedReport) {
        payload.baoCaoId = Number(selectedReport.bao_cao_id)
      }
      const res = await teacherApi.saveReportComment(payload)
      if (res?.success) {
        message.success('Lưu nhận xét thành công!')
        
        if (selectedReport) {
          // Update selectedReport comment
          setSelectedReport((prev) => prev ? { ...prev, comment: reportCommentText } : null)
          // Update reports array
          const updateReports = (reps: IStudentReport[]) => reps.map(r => r.bao_cao_id === selectedReport.bao_cao_id ? { ...r, comment: reportCommentText } : r)
          
          if (reportModal.type === 'TTTN') {
            setTttnList(prev => prev.map(s => s.id === reportModal.id ? { ...s, reports: updateReports(s.reports || []) } : s))
            setSelectedTTTN((prev) => prev ? { ...prev, reports: updateReports(prev.reports || []) } : null)
          } else {
            setDatnList(prev => prev.map(g => g.group === reportModal.id ? { ...g, reports: updateReports(g.reports || []) } : g))
            setSelectedDATN((prev) => prev ? { ...prev, reports: updateReports(prev.reports || []) } : null)
          }
        } else {
          setComments((c) => ({ ...c, [reportModal.id!]: reportCommentText }))
        }

        setReportModal({ open: false, id: undefined, type: undefined })
      } else {
        message.error('Lưu nhận xét thất bại!')
      }
    } catch {
      message.error('Lưu nhận xét thất bại!')
    }
  }

  const handleSaveCommentFromModal = async () => {
    if (!commentModal.id) return
    const type = commentModal.id.startsWith('G') ? 'DATN' : 'TTTN'
    try {
      const res = await teacherApi.saveReportComment({
        studentId: commentModal.id,
        periodId: selectedPeriod?.id,
        comment: commentModal.text,
        type
      })
      if (res?.success) {
        setComments((c) => ({ ...c, [commentModal.id!]: commentModal.text }))
        setCommentModal({ open: false, id: undefined, text: '' })
        message.success('Lưu nhận xét thành công!')
      } else {
        message.error('Lưu nhận xét thất bại!')
      }
    } catch {
      message.error('Lưu nhận xét thất bại!')
    }
  }

  const commentTargetLabel = useMemo(() => {
    if (!commentModal.id) return ''
    const student = tttnList.find((s) => s.id === commentModal.id)
    if (student) return `${student.name} · ${student.id}`
    const group = datnList.find((g) => g.group === commentModal.id)
    if (group) return group.topic || 'Đồ án tốt nghiệp'
    return commentModal.id
  }, [commentModal.id, tttnList, datnList])

  const filteredTTTN = useMemo(() => {
    return tttnList.filter((row) => {
      const nameQ = searchName.trim().toLowerCase()
      const companyQ = searchCompany.trim().toLowerCase()

      const mssv = (row.id || row.studentCode || '').toLowerCase()
      const hoten = (row.name || '').toLowerCase()
      const nameMatch = !nameQ || mssv.includes(nameQ) || hoten.includes(nameQ)

      const congty = (row.company || row.companyName || '').toLowerCase()
      const companyMatch = !companyQ || congty.includes(companyQ)

      return nameMatch && companyMatch
    })
  }, [searchName, searchCompany, tttnList, selectedPeriod?.id])

  const filteredDATN = useMemo(() => {
    const filtered = datnList.filter((row) => {
      const nameQ = searchName.trim().toLowerCase()
      const topicQ = searchTopic.trim().toLowerCase()

      const topicName = (row.topic_details?.name || row.topic || '').toLowerCase()
      const topicMatch = !topicQ || topicName.includes(topicQ)

      const memberMatch = !nameQ || (row.members_list && row.members_list.some((m: IGroupMemberInfo) => {
        const mssv = (m.id || m.studentCode || '').toLowerCase()
        const hoten = (m.name || '').toLowerCase()
        return mssv.includes(nameQ) || hoten.includes(nameQ)
      }))

      return topicMatch && memberMatch
    })
    return [...filtered].sort((a, b) => {
      const topicA = a.topic_details?.name || a.topic || ''
      const topicB = b.topic_details?.name || b.topic || ''
      return topicA.localeCompare(topicB, 'vi')
    })
  }, [searchName, searchTopic, datnList, selectedPeriod?.id])

  const itemsPerPage = 10
  const paginatedTTTN = useMemo(() => {
    const startIndex = (currentPageTTTN - 1) * itemsPerPage
    return filteredTTTN.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTTTN, currentPageTTTN])

  const paginatedDATN = useMemo(() => {
    const startIndex = (currentPageDATN - 1) * itemsPerPage
    return filteredDATN.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredDATN, currentPageDATN])

  return (
    <>
      <TeacherSectionHeader
        title="Hướng dẫn sinh viên"
        description="Theo dõi sinh viên thực tập và nhóm đồ án hướng dẫn"
        actions={(
          <>
            <TeacherPill tone="blue">TTTN: {tttnList.length}</TeacherPill>
            <TeacherPill tone="green">ĐATN: {datnList.length}</TeacherPill>
          </>
        )}
      />

      <section className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="text-sm font-semibold text-slate-800">
          {segment === 'TTTN' ? 'Danh sách sinh viên thực tập tốt nghiệp' : 'Danh sách sinh viên đồ án tốt nghiệp'}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          {segment === 'TTTN' ? (
            <>
              <div className="relative w-44 sm:w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Tìm tên, MSSV..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>
              <div className="relative w-44 sm:w-56">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  value={searchCompany}
                  onChange={(e) => setSearchCompany(e.target.value)}
                  placeholder="Tìm tên công ty..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>
            </>
          ) : (
            <>
              <div className="relative w-44 sm:w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Tìm tên, MSSV..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>
              <div className="relative w-44 sm:w-56">
                <BookOpen className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  placeholder="Tìm tên đề tài..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>
            </>
          )}
        </div>
      </section>

      {segment === 'TTTN' ? (
        <div className="grid gap-6 xl:grid-cols-[1.8fr_0.6fr]">
          <TeacherCard>
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Sinh viên thực tập</div>
                <div className="text-xs text-slate-500">Theo dõi báo cáo hàng tuần và tình trạng nộp bài</div>
              </div>
              <TeacherPill tone="orange">{filteredTTTN.length} sinh viên</TeacherPill>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10 shadow-[0_1px_0_rgba(226,232,240,1)]">
                  <tr>
                    <th className="px-5 py-3 text-left w-12">STT</th>
                    <th className="px-5 py-3 text-left">MSSV</th>
                    <th className="px-5 py-3 text-left">Họ tên</th>
                    <th className="px-5 py-3 text-left">Công ty</th>
                    <th className="px-5 py-3 text-left">Báo cáo</th>
                    <th className="px-5 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTTTN.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400 italic bg-white">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    paginatedTTTN.map((student, index) => {
                      const globalIndex = (currentPageTTTN - 1) * itemsPerPage + index + 1
                      return (
                        <tr key={student.id} className={`border-t border-slate-100 transition hover:bg-slate-50/80 ${selectedTTTN?.id === student.id ? 'bg-blue-50/50' : ''}`}>
                          <td className="px-5 py-4 text-slate-500 font-medium">{globalIndex}</td>
                          <td className="px-5 py-4 font-medium text-[#1976D2]">{student.id}</td>
                          <td className="px-5 py-4 text-slate-900">{student.name}</td>
                          <td className="px-5 py-4 text-slate-600">{student.company || student.companyName || 'Chưa có'}</td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => {
                                setSelectedTTTN(student);
                                document.getElementById('quick-view-teacher-tttn')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:scale-105 shadow-sm active:scale-95"
                            >
                              Xem chi tiết
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <TeacherButton
                                variant="secondary"
                                className="px-3 py-1.5 text-xs"
                                onClick={() => {
                                  setCompanyModal({ open: true, student });
                                }}
                              >
                                <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" /> Xem chi tiết công ty</span>
                              </TeacherButton>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            <TeacherPagination
              currentPage={currentPageTTTN}
              totalItems={filteredTTTN.length}
              itemsPerPage={itemsPerPage}
              onChangePage={setCurrentPageTTTN}
            />
          </TeacherCard>

          <TeacherCard id="quick-view-teacher-tttn" className="space-y-4 p-5">
            <div className="text-sm font-semibold text-slate-900">Xem nhanh báo cáo sinh viên</div>
            {selectedTTTN ? (
              <>
                <div className="rounded-3xl bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-4">
                  <div className="text-xs text-slate-500">Đang chọn</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{selectedTTTN.name}</div>
                  <div className="mt-1 text-sm text-slate-600">{selectedTTTN.company || '—'}</div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#1976D2]" /> {selectedTTTN.phone || '—'}</div>
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#1976D2]" /> {selectedTTTN.email || '—'}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#1976D2]" /> Mentor: {selectedTTTN.mentor || '—'}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Danh sách báo cáo tuần:</div>
                  {(!selectedTTTN.reports || selectedTTTN.reports.length === 0) ? (
                    <div className="text-sm text-slate-400 italic py-2 text-center bg-slate-50 rounded-2xl">Chưa có báo cáo nào được nộp.</div>
                  ) : (
                    <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2">
                      {selectedTTTN.reports.map((rep: IStudentReport) => (
                        <div
                          key={rep.bao_cao_id || rep.tuan_so}
                          onClick={() => {
                            if (rep.trang_thai === 'Đã nộp') {
                              setSelectedReport(rep);
                              setReportModal({ open: true, id: selectedTTTN.id, type: 'TTTN' });
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-white shadow-xs group ${rep.trang_thai === 'Đã nộp' ? 'cursor-pointer hover:bg-blue-50/40 hover:border-blue-200 transition' : 'cursor-default'}`}
                        >
                          <div>
                            <div className="text-sm font-semibold text-slate-950 group-hover:text-blue-600 transition flex items-center gap-1.5">
                              Tuần {rep.tuan_so}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {rep.trang_thai === 'Đã nộp' ? `Nộp ngày: ${rep.thoi_gian_nop}` : `Hạn nộp: ${new Date(rep.deadline || '').toLocaleDateString('vi-VN')}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {rep.trang_thai === 'Đã nộp' && (
                              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-green-50 text-green-700">
                                {rep.trang_thai}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400">
                <Users className="h-10 w-10 text-slate-300 mb-2" />
                <span className="text-sm font-medium">Chưa chọn sinh viên thực tập</span>
                <span className="text-xs text-slate-400 mt-1">Chọn sinh viên trong danh sách để xem chi tiết báo cáo</span>
              </div>
            )}
          </TeacherCard>
        </div>
      ) : (

        <div className="grid gap-6 xl:grid-cols-[1.8fr_0.6fr]">
          <TeacherCard>
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Sinh viên đồ án</div>
                <div className="text-xs text-slate-500">Theo dõi nhóm, tiến độ báo cáo và kho mã nguồn</div>
              </div>
              <TeacherPill tone="blue">{filteredDATN.length} nhóm</TeacherPill>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10 shadow-[0_1px_0_rgba(226,232,240,1)]">
                  <tr>
                    <th className="px-5 py-3 text-left w-12">STT</th>
                    <th className="px-5 py-3 text-left">Tên đề tài</th>
                    <th className="px-5 py-3 text-left">Thành viên</th>
                    <th className="px-5 py-3 text-left">Báo cáo</th>
                    <th className="px-5 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDATN.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400 italic bg-white">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    paginatedDATN.map((group, index) => {
                      const nextGroup = filteredDATN[index + 1];
                      const isLastOfTopic = nextGroup && (group.topic_details?.name || group.topic) !== (nextGroup.topic_details?.name || nextGroup.topic);
                      const active = selectedDATN?.group === group.group;
                      const globalIndex = (currentPageDATN - 1) * itemsPerPage + index + 1
                      return (
                        <tr 
                          key={group.group} 
                          className={`border-t border-slate-200/80 transition hover:bg-slate-50/80 ${active ? 'bg-blue-50/50' : ''} ${isLastOfTopic ? 'border-b-2 border-slate-300/80' : ''}`}
                        >
                          <td className="px-5 py-4 text-slate-500 font-medium">{globalIndex}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{group.topic_details?.name || group.topic}</td>
                          <td className="px-5 py-4 text-slate-600">
                            {group.members_list && group.members_list.length > 0 ? (
                              <div className="space-y-1">
                                {group.members_list.map((m: IGroupMemberInfo) => (
                                  <div key={m.id} className="text-xs text-slate-700">
                                    <span className="font-semibold whitespace-nowrap">{m.name}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              `${group.members || 0} thành viên`
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => {
                                setSelectedDATN(group);
                                document.getElementById('quick-view-teacher-datn')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:scale-105 shadow-sm active:scale-95"
                            >
                              Xem báo cáo
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <TeacherButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => { setGroupDetailModal({ open: true, group }); }}>
                                <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> Xem chi tiết</span>
                              </TeacherButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <TeacherPagination
              currentPage={currentPageDATN}
              totalItems={filteredDATN.length}
              itemsPerPage={itemsPerPage}
              onChangePage={setCurrentPageDATN}
            />
          </TeacherCard>

          <TeacherCard id="quick-view-teacher-datn" className="space-y-4 p-5 bg-[linear-gradient(135deg,#f0fdf4_0%,#ffffff_100%)]">
            <div className="text-sm font-semibold text-slate-900">Xem nhanh báo cáo nhóm</div>
            {selectedDATN ? (
              <>
                <div className="rounded-3xl bg-white/80 p-4 shadow-sm border border-emerald-50">
                  <div className="text-xs text-slate-500">Đang chọn</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{selectedDATN.topic_details?.name || selectedDATN.topic || '—'}</div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#2e7d32]" /> {selectedDATN.members || 0} thành viên</div>
                    {selectedDATN.members_list && selectedDATN.members_list.length > 0 && (
                      <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-2">
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Thành viên:</div>
                        {selectedDATN.members_list.map((m: IGroupMemberInfo) => (
                          <div key={m.id} className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                            <span className="truncate">{m.name}</span>
                            {m.is_leader && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full shrink-0">Trưởng nhóm</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Danh sách báo cáo tuần của nhóm:</div>
                  {(!selectedDATN.reports || selectedDATN.reports.length === 0) ? (
                    <div className="text-sm text-slate-400 italic py-2 text-center bg-white/80 rounded-2xl border border-slate-100">Chưa có báo cáo nào được nộp.</div>
                  ) : (
                    <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2">
                      {selectedDATN.reports.map((rep: IStudentReport) => (
                        <div
                          key={rep.bao_cao_id || rep.tuan_so}
                          onClick={() => {
                            if (rep.trang_thai === 'Đã nộp') {
                              setSelectedReport(rep);
                              setReportModal({ open: true, id: selectedDATN.group, type: 'DATN' });
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-white shadow-xs group ${
                            rep.trang_thai === 'Đã nộp' ? 'cursor-pointer hover:bg-emerald-50/40 hover:border-emerald-200' : 'cursor-default'
                          }`}
                        >
                          <div>
                            <div className="text-sm font-semibold text-slate-950 group-hover:text-[#2e7d32] transition flex items-center gap-1.5">
                              Tuần {rep.tuan_so}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {rep.trang_thai === 'Đã nộp' ? `Nộp ngày: ${rep.thoi_gian_nop}` : `Hạn nộp: ${new Date(rep.deadline || '').toLocaleDateString('vi-VN')}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {rep.trang_thai === 'Đã nộp' && (
                              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-green-50 text-green-700">
                                {rep.trang_thai}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl border border-dashed border-slate-200 bg-white/50 text-slate-400">
                <Users className="h-10 w-10 text-slate-300 mb-2" />
                <span className="text-sm font-medium">Chưa chọn nhóm đồ án</span>
                <span className="text-xs text-slate-400 mt-1">Chọn nhóm trong danh sách để xem chi tiết báo cáo</span>
              </div>
            )}
          </TeacherCard>
        </div>
      )}

      {/* Report modal (Xem báo cáo) */}
      {reportModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setReportModal({ open: false, id: undefined, type: undefined })} />
          <div className="relative z-50 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{reportModal.type === 'TTTN' ? 'Xem báo cáo' : 'Xem báo cáo'}{reportModal.id ? ` - ${reportModal.type === 'TTTN' ? (tttnList.find(s => s.id === reportModal.id)?.name ?? reportModal.id) : reportModal.id}` : ''}</h3>
              <button className="text-slate-500" onClick={() => setReportModal({ open: false, id: undefined, type: undefined })}>✕</button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {selectedReport ? `Tuần ${selectedReport.tuan_so}` : 'Báo cáo'}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {reportModal.type === 'TTTN'
                        ? `Ngày nộp: ${selectedReport?.thoi_gian_nop ?? ''}`
                        : `Đề tài: ${datnList.find(g => g.group === reportModal.id)?.topic_details?.name || datnList.find(g => g.group === reportModal.id)?.topic || ''} · Ngày nộp: ${selectedReport?.thoi_gian_nop ?? ''}`}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {selectedReport?.trang_thai ?? ''}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">File báo cáo</div>
                <div className="mt-2 rounded-md border border-slate-100 bg-white p-3 text-sm text-slate-700">
                  {(() => {
                    const fileName = selectedReport?.duong_dan_file || (selectedReport ? `tuan_${selectedReport.tuan_so}.pdf` : 'report.pdf');
                    const fileUrl = getFileUrl(selectedReport?.duong_dan_file);
                    return fileUrl ? (
                      <a href={fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold hover:text-blue-800">
                        {fileName}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Không có file đính kèm</span>
                    );
                  })()}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-900">Nội dung báo cáo</div>
                <div className="mt-2 rounded-md border border-slate-100 bg-white p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-850">
                    {selectedReport?.noi_dung ?? ''}
                  </p>
                  <div className="mt-2 text-xs text-slate-500 italic">
                    Bản tóm tắt công việc đã thực hiện, các mục tiêu hoàn thành và kết quả đạt được.
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-900">Nhận xét báo cáo (không bắt buộc)</div>
                <textarea 
                  value={reportCommentText} 
                  onChange={(e) => setReportCommentText(e.target.value)} 
                  className="mt-2 h-28 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-400" 
                  placeholder="Nhập nhận xét về báo cáo..." 
                />
              </div>

              <div className="flex justify-end gap-3">
                <button className="rounded-md px-4 py-2 text-sm" onClick={() => setReportModal({ open: false, id: undefined, type: undefined })}>{COMMON_LABELS.CLOSE}</button>
                <button className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white" onClick={handleSaveReportComment}>Lưu nhận xét</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment modal */}
      {commentModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCommentModal({ open: false, id: undefined, text: '' })} />
          <div className="relative z-50 w-full max-w-xl rounded-3xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold font-sans">Nhận xét {commentTargetLabel ? `— ${commentTargetLabel}` : ''}</h3>
            <p className="mt-2 text-sm text-slate-600 font-sans">Ghi nhận nhận xét cho mục được chọn.</p>
            <textarea autoFocus value={commentModal.text} onChange={(e) => setCommentModal((s) => ({ ...s, text: e.target.value }))} className="mt-4 h-32 w-full rounded-md border border-slate-200 p-3 text-sm outline-none" />
            <div className="mt-4 flex justify-end gap-2 font-sans">
              <button type="button" className="rounded-md px-4 py-2 text-sm" onClick={() => setCommentModal({ open: false, id: undefined, text: '' })}>{COMMON_LABELS.CANCEL}</button>
              <button type="button" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white" onClick={handleSaveCommentFromModal}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Company detail modal */}
      {companyModal.open && companyModal.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={() => setCompanyModal({ open: false, student: null })} />
          <div className="relative z-50 w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-2.5 text-blue-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-sans">Chi tiết Công ty Thực tập</h3>
                  <p className="text-xs text-slate-500 font-sans">Thông tin phân bổ thực tập đã duyệt của sinh viên</p>
                </div>
              </div>
              <button 
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition" 
                onClick={() => setCompanyModal({ open: false, student: null })}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="mt-6 grid gap-8 md:grid-cols-[0.8fr_1.2fr] max-h-[60vh] overflow-y-auto pr-1">
              {/* Section 1: Student Details */}
              <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 font-sans">
                <h4 className="flex items-center gap-2 text-sm font-bold tracking-wide text-slate-800 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  Thông tin sinh viên
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="text-slate-500">MSSV</span>
                    <span className="font-semibold text-slate-900">{companyModal.student.id || companyModal.student.studentCode}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Họ tên</span>
                    <span className="font-semibold text-slate-900">{companyModal.student.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Lớp</span>
                    <span className="font-semibold text-slate-900">{companyModal.student.class || companyModal.student.className || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Chuyên ngành</span>
                    <span className="font-semibold text-slate-900">{companyModal.student.major || companyModal.student.majorName || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Email</span>
                    <span className="font-semibold text-[#1976D2]">{companyModal.student.email}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-500">Số điện thoại</span>
                    <span className="font-semibold text-slate-900">{companyModal.student.phone || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Company Details */}
              <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 font-sans">
                <h4 className="flex items-center gap-2 text-sm font-bold tracking-wide text-slate-800 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Thông tin công ty thực tập
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-slate-500 font-medium">Tên công ty:</span>
                    <span className="font-semibold text-slate-900 ml-1.5">{formatCompanyInfo(companyModal.student.company || companyModal.student.companyName)}</span>
                  </div>
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-slate-500 font-medium">Địa chỉ công ty:</span>
                    <span className="font-semibold text-slate-900 ml-1.5">{formatCompanyInfo(companyModal.student.companyAddress || companyModal.student.address)}</span>
                  </div>
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-slate-500 font-medium">Vị trí thực tập:</span>
                    <span className="font-semibold text-slate-900 ml-1.5">{formatCompanyInfo(companyModal.student.internshipPosition || companyModal.student.field)}</span>
                  </div>
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-slate-500 font-medium">Địa điểm thực tập:</span>
                    <span className="font-semibold text-slate-900 ml-1.5">{formatCompanyInfo(companyModal.student.internshipLocation || companyModal.student.internshipAddress || companyModal.student.companyAddress || companyModal.student.address)}</span>
                  </div>
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-slate-500 font-medium">Mã số thuế:</span>
                    <span className="font-semibold text-slate-900 ml-1.5">{formatCompanyInfo(companyModal.student.taxId || companyModal.student.taxCode)}</span>
                  </div>
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-slate-500 font-medium">Người hướng dẫn:</span>
                    <span className="font-semibold text-slate-900 ml-1.5">{formatCompanyInfo(companyModal.student.mentor || companyModal.student.mentorName)}</span>
                  </div>
                  <div className="pb-1">
                    <span className="text-slate-500 font-medium">SĐT người HD:</span>
                    <span className="font-semibold text-slate-900 ml-1.5">{formatCompanyInfo(companyModal.student.mentorPhone || companyModal.student.mentorPhoneNo)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group detail modal */}
      {groupDetailModal.open && groupDetailModal.group && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={() => setGroupDetailModal({ open: false, group: null })} />
          <div className="relative z-50 w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-2.5 text-blue-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-sans">Chi tiết Đề tài & Nhóm Đồ án</h3>
                  <p className="text-xs text-slate-500 font-sans">Thông tin đề tài và các thành viên thực hiện</p>
                </div>
              </div>
              <button 
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition" 
                onClick={() => setGroupDetailModal({ open: false, group: null })}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="mt-6 grid gap-6 md:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
              {/* Section 1: Topic Details */}
              <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 font-sans">
                <h4 className="flex items-center gap-2 text-sm font-bold tracking-wide text-slate-800 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  Thông tin đề tài
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Tên đề tài</span>
                    <span className="font-semibold text-slate-900">{groupDetailModal.group.topic_details?.name || groupDetailModal.group.topic || '—'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Số lượng sinh viên thực hiện</span>
                    <span className="font-semibold text-slate-900">{groupDetailModal.group.members || 0} sinh viên</span>
                  </div>
                  <div className="flex flex-col gap-1 pb-1">
                    <span className="text-slate-500">Hướng đề tài</span>
                    <span className="font-semibold text-slate-900">
                      {groupDetailModal.group.topic_details?.huong_de_tai === 'MANG_MAY_TINH' || groupDetailModal.group.topic_details?.huong_de_tai === 'Mạng máy tính'
                        ? 'Mạng máy tính'
                        : (groupDetailModal.group.topic_details?.huong_de_tai === 'PHAN_MEM' || groupDetailModal.group.topic_details?.huong_de_tai === 'Phát triển phần mềm'
                          ? 'Phát triển phần mềm'
                          : (groupDetailModal.group.topic_details?.huong_de_tai || '—'))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Group Members Details */}
              <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 font-sans">
                <h4 className="flex items-center gap-2 text-sm font-bold tracking-wide text-slate-800 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Thông tin nhóm thực hiện
                </h4>
                <div className="space-y-3">
                  {groupDetailModal.group.members_list && groupDetailModal.group.members_list.length > 0 ? (
                    groupDetailModal.group.members_list.map((m: IGroupMemberInfo) => (
                      <div key={m.id} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0 font-sans">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">{m.name}</span>
                          {m.is_leader ? (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Trưởng nhóm</span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Thành viên</span>
                          )}
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-slate-500">
                          <span>MSSV: {m.studentCode || m.id}</span>
                          <span>Lớp: {m.class || '—'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500 italic">Không có danh sách thành viên.</div>
                  )}
                </div>
              </div>
            </div>
            </div>
          </div>
        )}

    </>
  )
}
