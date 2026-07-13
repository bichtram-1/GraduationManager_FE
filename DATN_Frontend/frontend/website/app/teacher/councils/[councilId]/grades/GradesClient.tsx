"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TeacherSectionHeader } from '../../../_components/TeacherShell'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { teacherApi } from '@/lib/api/teacherApi'

interface ICouncilMember {
  id: string
  name: string
  role: string
}

interface ICouncilGroup {
  id: string
  groupCode?: string
  topic?: string
  advisorId?: string | number
  reviewerId?: string | number
  students?: ICouncilStudentInfo[]
}

interface ICouncilStudentInfo {
  id: string
  name: string
  class?: string
}

interface IRawCouncil {
  code: string
  name: string
  groups?: ICouncilGroup[]
  members?: ICouncilMember[]
}

type Student = {
  id: string
  studentId: string
  name: string
  clazz: string
  topic: string
  group: string
  scores: {
    presentation: number | null // 0-3 (null nếu chưa chấm)
    demo: number | null // 0-5 (null nếu chưa chấm)
    defense: number | null // 0-2 (null nếu chưa chấm)
    report: number | null // report score (null nếu chưa chấm)
  }
  status: string
  isChair?: boolean
  councilMembers?: ICouncilMember[]
  gvhdName?: string
  gvpbName?: string
  diemGvhd?: number | null
  diemGvpb?: number | null
  diemTbBaoVe?: number | null
  diemTongKet?: number | null
  diemBaoVe?: number | null
  lecturerScores?: Record<string, number>
  advisorId?: string
  reviewerId?: string
}

function groupBy<T, K extends string | number>(items: T[], keyFn: (t: T) => K) {
  const map = new Map<K, T[]>()
  items.forEach((it) => {
    const k = keyFn(it)
    const arr = map.get(k) || []
    arr.push(it)
    map.set(k, arr)
  })
  return map
}

function shortenName(name: string): string {
  if (!name) return '—'
  // Loại bỏ các học hàm học vị như ThS., TS., PGS. TS., v.v.
  const cleanName = name.replace(/^(ThS\.|TS\.|PGS\.\s*TS\.|PGS\.|ThS|TS|PGS)\s+/i, '').trim()
  const parts = cleanName.split(/\s+/)
  if (parts.length <= 1) return cleanName
  const lastWord = parts[parts.length - 1]
  const initials = parts.slice(0, -1).map(p => p[0].toUpperCase()).join('')
  return initials + lastWord
}

export default function GradesClient({ councilId }: { councilId: string }) {
  const router = useRouter()
  const { selectedPeriod } = usePeriod()
  const [query, setQuery] = useState('')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [councilName, setCouncilName] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [currentTeacherId, setCurrentTeacherId] = useState<string>('')

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    let mounted = true
    async function loadData() {
      setLoading(true)
      try {
        const data = await teacherApi.getGradingData({ periodId: selectedPeriod?.id })
        if (!mounted) return
        
        if (data?.teacherId) {
          setCurrentTeacherId(String(data.teacherId))
        }
        
        if (data?.councilGroups) {
          const matchedCouncil = data.councilGroups.find((c: IRawCouncil) => c.code === councilId)
          if (matchedCouncil) {
            setCouncilName(matchedCouncil.name)
            const groups = matchedCouncil.groups || []
            
            const scoresPromises = groups.map(async (g: ICouncilGroup) => {
              try {
                const res = await teacherApi.getScores(g.id)
                if (res?.success && res?.data?.rows) {
                  return res.data.rows.map((row: {
                    id: string
                    name: string
                    class?: string
                    gvhdName?: string
                    gvpbName?: string
                    diemGvhd?: number | null
                    diemGvpb?: number | null
                    diemTbBaoVe?: number | null
                    diemTongKet?: number | null
                    diemBaoVe?: number | null
                    lecturerScores?: Record<string, number>
                    presentation?: number | string | null
                    demo?: number | string | null
                    qna?: number | string | null
                    report?: number | string | null
                  }) => ({
                    id: row.id,
                    studentId: row.id,
                    name: row.name,
                    clazz: row.class || '—',
                    topic: g.topic,
                    group: g.groupCode || `Nhóm #${g.id}`,
                    scores: {
                      presentation: row.presentation !== null && row.presentation !== undefined ? parseFloat(String(row.presentation)) : null,
                      demo: row.demo !== null && row.demo !== undefined ? parseFloat(String(row.demo)) : null,
                      defense: row.qna !== null && row.qna !== undefined ? parseFloat(String(row.qna)) : null,
                      report: row.report !== null && row.report !== undefined ? parseFloat(String(row.report)) : null,
                    },
                    status: (row.presentation !== null || row.demo !== null || row.qna !== null) ? 'Published' : 'Draft',
                    isChair: res.data.isChair || false,
                    councilMembers: res.data.councilMembers || [],
                    gvhdName: row.gvhdName || '—',
                    gvpbName: row.gvpbName || '—',
                    diemGvhd: row.diemGvhd,
                    diemGvpb: row.diemGvpb,
                    diemTbBaoVe: row.diemTbBaoVe,
                    diemTongKet: row.diemTongKet,
                    diemBaoVe: row.diemBaoVe,
                    lecturerScores: row.lecturerScores || {},
                    advisorId: g.advisorId ? String(g.advisorId) : undefined,
                    reviewerId: g.reviewerId ? String(g.reviewerId) : undefined,
                  }))
                }
              } catch (err) {
                console.error('Error fetching scores for group:', g.id, err)
              }
              
              // Fallback map
              return (g.students || []).map((s: ICouncilStudentInfo) => ({
                id: s.id,
                studentId: s.id,
                name: s.name,
                clazz: s.class || '—',
                topic: g.topic,
                group: g.groupCode || `Nhóm #${g.id}`,
                scores: { presentation: null, demo: null, defense: null, report: null },
                status: 'Draft',
                isChair: false,
                councilMembers: [],
                gvhdName: '—',
                gvpbName: '—',
                diemGvhd: null,
                diemGvpb: null,
                diemTbBaoVe: null,
                diemTongKet: null,
                diemBaoVe: null,
                lecturerScores: {},
                advisorId: g.advisorId ? String(g.advisorId) : undefined,
                reviewerId: g.reviewerId ? String(g.reviewerId) : undefined,
              }))
            })
            
            const groupsStudents = await Promise.all(scoresPromises)
            if (mounted) {
              const allStudents = groupsStudents.flat()
              setStudents(allStudents)
              setSelectedGroups({}) // Mặc định ban đầu không chọn bất kỳ nhóm đề tài nào
            }
          } else {
            setStudents([])
          }
        } else {
          setStudents([])
        }
      } catch (err) {
        console.error('Error loading grades:', err)
        if (mounted) setStudents([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [selectedPeriod?.id, councilId])

  const filtered = students.filter((s) => (query ? `${s.studentId} ${s.name} ${s.topic}`.toLowerCase().includes(query.toLowerCase()) : true))
  const grouped = groupBy(filtered, (s) => s.topic)

  const groupKeys = Array.from(grouped.keys())
  const isAllSelected = groupKeys.length > 0 && groupKeys.every(g => selectedGroups[String(g)])
  const selectedCount = groupKeys.filter(g => selectedGroups[String(g)]).length

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedGroups({})
    } else {
      const next: Record<string, boolean> = {}
      groupKeys.forEach(g => {
        next[String(g)] = true
      })
      setSelectedGroups(next)
    }
  }

  const toggleSelectGroup = (g: string) => {
    setSelectedGroups(prev => ({
      ...prev,
      [g]: !prev[g]
    }))
  }

  const toggleGroupCollapse = (g: string) => setOpenGroups((p) => ({ ...p, [g]: !p[g] }))

  const computeComponentTotal = (s: Student) => {
    if (s.scores.presentation === null && s.scores.demo === null && s.scores.defense === null) {
      return null
    }
    const a = s.scores.presentation ?? 0
    const b = s.scores.demo ?? 0
    const c = s.scores.defense ?? 0
    return +(a + b + c).toFixed(2)
  }

  const exportCSV = () => {
    const selectedKeys = Object.keys(selectedGroups).filter(k => selectedGroups[k])
    if (selectedKeys.length === 0) {
      showToast('Vui lòng chọn ít nhất một đề tài để xuất bảng điểm')
      return
    }

    selectedKeys.forEach((topicName) => {
      const topicStudents = students.filter(s => s.topic === topicName)
      if (topicStudents.length === 0) return

      const isChair = topicStudents[0]?.isChair || false
      const councilMembers = topicStudents[0]?.councilMembers || []
      const chairMember = councilMembers.find((m: ICouncilMember) => m.role.includes('Chủ tịch'))
      const chairStr = chairMember ? `${chairMember.role}: ${chairMember.name}` : 'Chưa phân công'
      
      let headerCols: string[] = []
      if (isChair) {
        headerCols = [
          'Mã SV', 'Họ tên', 'Lớp', 'GVHD', 'GVPB',
          ...councilMembers.map((m: ICouncilMember) => shortenName(m.name)),
          'TB bảo vệ', 'BC-GVHD', 'BC-GVPB', 'TK'
        ]
      } else {
        const isAdvisor = topicStudents[0]?.advisorId === currentTeacherId
        const isReviewer = topicStudents[0]?.reviewerId === currentTeacherId
        
        headerCols = ['Mã SV', 'Họ tên', 'Lớp', 'GVHD', 'GVPB', 'Thuyết trình', 'Demo', 'Vấn đáp']
        if (isAdvisor) headerCols.push('BC-GVHD')
        if (isReviewer) headerCols.push('BC-GVPB')
      }
      
      const colCount = headerCols.length
      const headersHtml = headerCols.map((col) => `<th style="border: 0.5pt solid #a0aec0; padding: 6px; font-weight: bold; background-color: #f1f5f9; text-align: center;">${col}</th>`).join('')
      
      const rowsHtml = topicStudents.map((s) => {
        let cells: string[] = []
        if (isChair) {
          cells = [
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: center; mso-number-format:'\\@';">${s.studentId}</td>`,
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: left;">${s.name}</td>`,
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: center;">${s.clazz}</td>`,
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: left;">${s.gvhdName}</td>`,
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: left;">${s.gvpbName}</td>`,
            ...councilMembers.map((m: ICouncilMember) => {
              const score = s.lecturerScores?.[m.id];
              const scoreStr = score !== undefined && score !== null ? score.toFixed(2) : '—';
              return `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${scoreStr}</td>`;
            }),
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right; font-weight: bold; background-color: #f8fafc;">${s.diemTbBaoVe !== null && s.diemTbBaoVe !== undefined ? s.diemTbBaoVe.toFixed(2) : '—'}</td>`,
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${s.diemGvhd !== null && s.diemGvhd !== undefined ? s.diemGvhd.toFixed(2) : '—'}</td>`,
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${s.diemGvpb !== null && s.diemGvpb !== undefined ? s.diemGvpb.toFixed(2) : '—'}</td>`,
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right; font-weight: bold; color: #1e3a8a; background-color: #dbeafe;">${s.diemTongKet !== null && s.diemTongKet !== undefined ? s.diemTongKet.toFixed(2) : '—'}</td>`
          ]
        } else {
          const isAdvisor = s.advisorId === currentTeacherId
          const isReviewer = s.reviewerId === currentTeacherId
          cells = [
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: center; mso-number-format:'\\@';">${s.studentId}</td>`,
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: left;">${s.name}</td>`,
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: center;">${s.clazz}</td>`,
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: left;">${s.gvhdName}</td>`,
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: left;">${s.gvpbName}</td>`,
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${s.scores.presentation !== null ? s.scores.presentation.toFixed(2) : '—'}</td>`,
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${s.scores.demo !== null ? s.scores.demo.toFixed(2) : '—'}</td>`,
            `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${s.scores.defense !== null ? s.scores.defense.toFixed(2) : '—'}</td>`,
          ]
          if (isAdvisor) {
            cells.push(`<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${s.diemGvhd !== null && s.diemGvhd !== undefined ? s.diemGvhd.toFixed(2) : '—'}</td>`)
          }
          if (isReviewer) {
            cells.push(`<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${s.diemGvpb !== null && s.diemGvpb !== undefined ? s.diemGvpb.toFixed(2) : '—'}</td>`)
          }
        }
        return `<tr>${cells.join('')}</tr>`
      }).join('')

      const htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Bang Diem</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            body { font-family: 'Times New Roman', Times, serif; }
            table { border-collapse: collapse; }
            th { font-weight: bold; background-color: #f1f5f9; text-align: center; }
            td, th { padding: 6px; font-size: 11pt; vertical-align: middle; }
          </style>
        </head>
        <body>
          <table>
            <tr>
              <td colspan="${colCount}" style="text-align: center; font-size: 16pt; font-weight: bold; height: 35px;">BẢNG ĐIỂM THÀNH PHẦN ĐỒ ÁN TỐT NGHIỆP</td>
            </tr>
            <tr>
              <td colspan="${colCount}" style="text-align: left; font-size: 11pt; font-weight: bold; height: 20px;">Hội đồng: ${councilName || '—'}</td>
            </tr>
            <tr>
              <td colspan="${colCount}" style="text-align: left; font-size: 11pt; font-weight: bold; height: 20px;">Đề tài: ${topicName}</td>
            </tr>
            <tr>
              <td colspan="${colCount}" style="text-align: left; font-size: 11pt; height: 20px;">Chủ tịch hội đồng: ${chairStr}</td>
            </tr>
            <tr>
              <td colspan="${colCount}" style="height: 10px;"></td>
            </tr>
            <tr>
              ${headersHtml}
            </tr>
            ${rowsHtml}
          </table>
        </body>
        </html>
      `

      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      
      const cleanCouncilName = (councilName || 'Hoi_dong').replace(/[\\/:*?"<>|]/g, '').trim()
      const shortTopic = topicName.length > 25 ? topicName.substring(0, 22) + '...' : topicName
      const cleanTopic = shortTopic.replace(/[\\/:*?"<>|]/g, '').trim()
      const filename = `${cleanCouncilName} - ${cleanTopic}.xls`

      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div>
      <TeacherSectionHeader
        title={councilName || 'Bảng điểm Hội đồng'}
        description="Sắp xếp theo đề tài; tích chọn các đề tài mong muốn để xuất Excel hàng loạt."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="px-4 py-2 border rounded-2xl bg-white hover:bg-slate-50 transition text-sm font-medium">Quay lại</button>
            <button onClick={exportCSV} className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-2xl shadow-md shadow-emerald-100 transition text-sm font-medium">Xuất Excel ({selectedCount})</button>
          </div>
        }
      />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm mã SV hoặc tên hoặc đề tài..."
          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 pl-3 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white w-80 shadow-sm"
        />

        {groupKeys.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className={`inline-flex items-center gap-2.5 text-sm font-semibold px-4.5 py-2.5 rounded-2xl border transition select-none ${
              isAllSelected
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div 
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                isAllSelected 
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-100' 
                  : 'border-slate-300 bg-white'
              }`}
            >
              {isAllSelected && (
                <svg className="w-3 h-3 stroke-[3px] stroke-current" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span>Chọn tất cả ({groupKeys.length} đề tài)</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-500">Đang tải bảng điểm hội đồng...</div>
      ) : students.length > 0 ? (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([group, items]) => {
            const isChair = items[0]?.isChair || false
            const councilMembers = items[0]?.councilMembers || []
            const isSelected = !!selectedGroups[String(group)]

            return (
              <div 
                key={String(group)} 
                className={`rounded-[24px] border transition-all duration-300 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.02)] border-l-4 ${
                  isSelected 
                    ? 'border-slate-200 border-l-blue-600 bg-blue-50/10' 
                    : 'border-slate-200 border-l-transparent'
                }`}
              >
                <div className="w-full flex justify-between items-center py-1">
                  <div className="flex items-center">
                    <div 
                      onClick={() => toggleSelectGroup(String(group))}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 mr-3.5 ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-100' 
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 stroke-[3px] stroke-current" fill="none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-base">{group}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        <span className="font-medium text-slate-500">Thành viên:</span>{' '}
                        {items.map((s) => `${s.name} (${s.studentId})`).join(', ')}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => toggleGroupCollapse(String(group))} className="text-sm font-semibold text-blue-600 hover:text-blue-700 outline-none">
                    {openGroups[String(group)] ? 'Thu gọn ▲' : 'Chi tiết ▼'}
                  </button>
                </div>
                {openGroups[String(group)] && (
                  <div className="p-0 mt-4 border-t border-slate-100 pt-4">
                    <div className="overflow-x-auto">
                      {isChair ? (
                        <table className="min-w-full w-full text-sm">
                          <thead className="bg-slate-50 text-slate-600 font-medium">
                            <tr className="border-b border-slate-100">
                              <th className="px-4 py-3 text-left">Mã SV</th>
                              <th className="px-4 py-3 text-left">Họ tên</th>
                              <th className="px-4 py-3 text-left">Lớp</th>
                              <th className="px-4 py-3 text-left">GVHD</th>
                              <th className="px-4 py-3 text-left">GVPB</th>
                              {councilMembers.map((m: ICouncilMember) => (
                                <th key={m.id} className="px-4 py-3 text-right" title={`${m.name} (${m.role})`}>
                                  {shortenName(m.name)}
                                </th>
                              ))}
                              <th className="px-4 py-3 text-right">TB bảo vệ</th>
                              <th className="px-4 py-3 text-right">BC-GVHD</th>
                              <th className="px-4 py-3 text-right">BC-GVPB</th>
                              <th className="px-4 py-3 text-right">TK</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((s) => {
                              const compTotal = computeComponentTotal(s)
                              return (
                                <tr key={s.id} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                                  <td className="px-4 py-4 font-semibold text-slate-800">{s.studentId}</td>
                                  <td className="px-4 py-4 text-slate-900 font-medium">{s.name}</td>
                                  <td className="px-4 py-4 text-slate-700">{s.clazz}</td>
                                  <td className="px-4 py-4 text-slate-600 text-xs">{s.gvhdName}</td>
                                  <td className="px-4 py-4 text-slate-600 text-xs">{s.gvpbName}</td>
                                  {councilMembers.map((m: ICouncilMember) => {
                                    const score = s.lecturerScores?.[m.id];
                                    return (
                                      <td key={m.id} className="px-4 py-4 text-right font-semibold text-slate-700">
                                        {score !== undefined && score !== null ? score.toFixed(2) : '—'}
                                      </td>
                                    );
                                  })}
                                  <td className="px-4 py-4 text-right font-bold text-slate-800">
                                    {s.diemTbBaoVe !== null && s.diemTbBaoVe !== undefined ? s.diemTbBaoVe.toFixed(2) : '—'}
                                  </td>
                                  <td className="px-4 py-4 text-right">
                                    <div className="inline-flex w-16 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50 text-slate-700 font-medium">
                                      {s.diemGvhd !== null && s.diemGvhd !== undefined ? s.diemGvhd.toFixed(2) : '—'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-right">
                                    <div className="inline-flex w-16 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50 text-slate-700 font-medium">
                                      {s.diemGvpb !== null && s.diemGvpb !== undefined ? s.diemGvpb.toFixed(2) : '—'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-right font-extrabold text-[#1976D2] text-base">
                                    {s.diemTongKet !== null && s.diemTongKet !== undefined ? s.diemTongKet.toFixed(2) : '—'}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      ) : (
                        (() => {
                          const isAdvisor = items[0]?.advisorId === currentTeacherId;
                          const isReviewer = items[0]?.reviewerId === currentTeacherId;
                          return (
                            <table className="min-w-full w-full text-sm">
                              <thead className="bg-slate-50 text-slate-600 font-medium">
                                <tr className="border-b border-slate-100">
                                  <th className="px-4 py-3 text-left">Mã SV</th>
                                  <th className="px-4 py-3 text-left">Họ tên</th>
                                  <th className="px-4 py-3 text-left">Lớp</th>
                                  <th className="px-4 py-3 text-left">GVHD</th>
                                  <th className="px-4 py-3 text-left">GVPB</th>
                                  <th className="px-4 py-3 text-right">Thuyết trình</th>
                                  <th className="px-4 py-3 text-right">Demo</th>
                                  <th className="px-4 py-3 text-right">Vấn đáp</th>
                                  {isAdvisor && <th className="px-4 py-3 text-right">BC-GVHD</th>}
                                  {isReviewer && <th className="px-4 py-3 text-right">BC-GVPB</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {items.map((s) => (
                                  <tr key={s.id} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                                    <td className="px-4 py-4 font-semibold text-slate-800">{s.studentId}</td>
                                    <td className="px-4 py-4 text-slate-900 font-medium">{s.name}</td>
                                    <td className="px-4 py-4 text-slate-700">{s.clazz}</td>
                                    <td className="px-4 py-4 text-slate-600 text-xs">{s.gvhdName}</td>
                                    <td className="px-4 py-4 text-slate-600 text-xs">{s.gvpbName}</td>
                                    <td className="px-4 py-4 text-right">
                                      <div className="inline-flex w-16 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50 text-slate-700 font-medium">
                                        {s.scores.presentation !== null && s.scores.presentation !== undefined ? s.scores.presentation.toFixed(2) : '—'}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <div className="inline-flex w-16 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50 text-slate-700 font-medium">
                                        {s.scores.demo !== null && s.scores.demo !== undefined ? s.scores.demo.toFixed(2) : '—'}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <div className="inline-flex w-16 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50 text-slate-700 font-medium">
                                        {s.scores.defense !== null && s.scores.defense !== undefined ? s.scores.defense.toFixed(2) : '—'}
                                      </div>
                                    </td>
                                    {isAdvisor && (
                                      <td className="px-4 py-4 text-right">
                                        <div className="inline-flex w-16 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50 text-slate-700 font-medium">
                                          {s.diemGvhd !== null && s.diemGvhd !== undefined ? s.diemGvhd.toFixed(2) : '—'}
                                        </div>
                                      </td>
                                    )}
                                    {isReviewer && (
                                      <td className="px-4 py-4 text-right">
                                        <div className="inline-flex w-16 items-center justify-center rounded-md border px-2 py-1 text-sm bg-slate-50 text-slate-700 font-medium">
                                          {s.diemGvpb !== null && s.diemGvpb !== undefined ? s.diemGvpb.toFixed(2) : '—'}
                                        </div>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          );
                        })()
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-slate-500">
          Không tìm thấy sinh viên nào trong hội đồng này.
        </div>
      )}

      {/* Thông báo dạng Toast đồng bộ với hệ thống giảng viên */}
      {toast && (
        <div className="fixed right-6 top-20 z-[9999] rounded-2xl bg-emerald-500 px-4 py-3 text-sm text-white shadow-lg transition-all duration-300">
          ✓ {toast}
        </div>
      )}
    </div>
  )
}
