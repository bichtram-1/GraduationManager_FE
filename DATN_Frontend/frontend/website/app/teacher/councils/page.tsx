'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TeacherSectionHeader } from '../_components/TeacherShell'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { teacherApi } from '@/lib/api/teacherApi'

type Council = {
  id: string
  name: string
  period: string
  chair: string
  studentsCount: number
  avgScore: number
  groups?: any[]
  members?: any[]
}

export default function CouncilsPage() {
  const { selectedPeriod } = usePeriod()
  const [councils, setCouncils] = useState<Council[]>([])
  const [loading, setLoading] = useState(false)
  const [currentTeacherId, setCurrentTeacherId] = useState<string>('')
  const [exportingCouncilId, setExportingCouncilId] = useState<string | null>(null)
  const [selectedCouncils, setSelectedCouncils] = useState<Record<string, boolean>>({})
  const [query, setQuery] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    teacherApi.getGradingData({ periodId: selectedPeriod?.id })
      .then((data) => {
        if (!mounted) return
        if (data?.teacherId) {
          setCurrentTeacherId(String(data.teacherId))
        }
        if (data?.councilGroups) {
          const list = data.councilGroups.map((c: any) => {
            const chair = c.members?.find((m: any) => m.role.includes('Chủ tịch'))?.name || c.members?.[0]?.name || 'Chưa phân công'
            const studentsCount = c.groups?.reduce((acc: number, g: any) => acc + (g.students?.length || 0), 0) || 0

            return {
              id: c.code,
              name: c.name,
              period: selectedPeriod?.name || 'Học kỳ hiện tại',
              chair,
              studentsCount,
              avgScore: 8.0,
              groups: c.groups || [],
              members: c.members || []
            }
          })
          setCouncils(list)
        } else {
          setCouncils([])
        }
      })
      .catch(() => {
        if (mounted) setCouncils([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [selectedPeriod?.id])

  function shortenName(name: string): string {
    if (!name) return '—'
    const cleanName = name.replace(/^(ThS\.|TS\.|PGS\.\s*TS\.|PGS\.|ThS|TS|PGS)\s+/i, '').trim()
    const parts = cleanName.split(/\s+/)
    if (parts.length <= 1) return cleanName
    const lastWord = parts[parts.length - 1]
    const initials = parts.slice(0, -1).map(p => p[0].toUpperCase()).join('')
    return initials + lastWord
  }

  const exportCouncilExcel = async (councilCode: string, councilName: string, groups: any[], members: any[]) => {
    setExportingCouncilId(councilCode)
    try {
      const scorePromises = groups.map(async (g) => {
        try {
          const res = await teacherApi.getScores(g.id)
          if (res?.success && res?.data?.rows) {
            return {
              groupId: g.id,
              groupCode: g.groupCode || `Nhóm #${g.id}`,
              topic: g.topic,
              advisorId: g.advisorId ? String(g.advisorId) : undefined,
              reviewerId: g.reviewerId ? String(g.reviewerId) : undefined,
              rows: res.data.rows,
              isChair: res.data.isChair || false,
              councilMembers: res.data.councilMembers || []
            }
          }
        } catch (e) {
          console.error("Error fetching scores for group " + g.id, e)
        }
        return null
      })

      const loadedGroups = (await Promise.all(scorePromises)).filter(g => g !== null)
      if (loadedGroups.length === 0) {
        alert('Không có dữ liệu điểm nào để xuất!')
        return
      }

      const isChair = loadedGroups[0]?.isChair || false
      const councilMembers = loadedGroups[0]?.councilMembers || members || []
      const chairMember = councilMembers.find((m: any) => m.role.includes('Chủ tịch'))
      const chairStr = chairMember ? `${chairMember.role}: ${chairMember.name}` : 'Chưa phân công'

      let headerCols: string[] = ['STT', 'Đề tài', 'Mã SV', 'Họ tên', 'Lớp', 'GVHD', 'GVPB']
      if (isChair) {
        headerCols.push(...councilMembers.map((m: any) => shortenName(m.name)))
        headerCols.push('TB bảo vệ', 'BC-GVHD', 'BC-GVPB', 'TK')
      } else {
        const hasAdvisingGroup = loadedGroups.some(g => g?.advisorId === currentTeacherId)
        const hasReviewingGroup = loadedGroups.some(g => g?.reviewerId === currentTeacherId)
        
        headerCols.push('Thuyết trình', 'Demo', 'Vấn đáp')
        if (hasAdvisingGroup) headerCols.push('BC-GVHD')
        if (hasReviewingGroup) headerCols.push('BC-GVPB')
      }

      const colCount = headerCols.length
      const headersHtml = headerCols.map((col) => `<th style="border: 0.5pt solid #a0aec0; padding: 6px; font-weight: bold; background-color: #f1f5f9; text-align: center;">${col}</th>`).join('')

      let rowsHtml = ''
      let sttIndex = 1

      loadedGroups.forEach((g) => {
        if (!g) return
        const studentsCount = g.rows.length
        if (studentsCount === 0) return

        g.rows.forEach((row: any, studentIndex: number) => {
          let sttCellHtml = ''
          let topicCellHtml = ''

          if (studentIndex === 0) {
            sttCellHtml = `<td rowspan="${studentsCount}" style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: center; vertical-align: middle;">${sttIndex}</td>`
            topicCellHtml = `<td rowspan="${studentsCount}" style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: left; vertical-align: middle;">${g.topic}</td>`
            sttIndex++
          }

          let scoreCells: string[] = []
          if (isChair) {
            scoreCells = [
              ...councilMembers.map((m: any) => {
                const score = row.lecturerScores?.[m.id];
                const scoreStr = score !== undefined && score !== null ? score.toFixed(2) : '—';
                return `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${scoreStr}</td>`;
              }),
              `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right; font-weight: bold; background-color: #f8fafc;">${row.diemTbBaoVe !== null && row.diemTbBaoVe !== undefined ? Number(row.diemTbBaoVe).toFixed(2) : '—'}</td>`,
              `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${row.diemGvhd !== null && row.diemGvhd !== undefined ? Number(row.diemGvhd).toFixed(2) : '—'}</td>`,
              `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${row.diemGvpb !== null && row.diemGvpb !== undefined ? Number(row.diemGvpb).toFixed(2) : '—'}</td>`,
              `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right; font-weight: bold; color: #1e3a8a; background-color: #dbeafe;">${row.diemTongKet !== null && row.diemTongKet !== undefined ? Number(row.diemTongKet).toFixed(2) : '—'}</td>`
            ]
          } else {
            scoreCells = [
              `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${row.presentation !== null && row.presentation !== undefined ? Number(row.presentation).toFixed(2) : '—'}</td>`,
              `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${row.demo !== null && row.demo !== undefined ? Number(row.demo).toFixed(2) : '—'}</td>`,
              `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${row.qna !== null && row.qna !== undefined ? Number(row.qna).toFixed(2) : '—'}</td>`,
            ]
            const hasAdvisingGroup = loadedGroups.some(grp => grp?.advisorId === currentTeacherId)
            const hasReviewingGroup = loadedGroups.some(grp => grp?.reviewerId === currentTeacherId)
            
            if (hasAdvisingGroup) {
              scoreCells.push(`<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${row.diemGvhd !== null && row.diemGvhd !== undefined ? Number(row.diemGvhd).toFixed(2) : '—'}</td>`)
            }
            if (hasReviewingGroup) {
              scoreCells.push(`<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: right;">${row.diemGvpb !== null && row.diemGvpb !== undefined ? Number(row.diemGvpb).toFixed(2) : '—'}</td>`)
            }
          }

          const studentIdCell = `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: center; mso-number-format:'\\@';">${row.id}</td>`
          const nameCell = `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: left;">${row.name}</td>`
          const clazzCell = `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: center;">${row.class || '—'}</td>`
          const gvhdNameCell = `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: left;">${row.gvhdName || '—'}</td>`
          const gvpbNameCell = `<td style="border: 0.5pt solid #a0aec0; padding: 6px; text-align: left;">${row.gvpbName || '—'}</td>`

          rowsHtml += `
            <tr>
              ${sttCellHtml}
              ${topicCellHtml}
              ${studentIdCell}
              ${nameCell}
              ${clazzCell}
              ${gvhdNameCell}
              ${gvpbNameCell}
              ${scoreCells.join('')}
            </tr>
          `
        })
      })

      const htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Bang Diem Hoi Dong</x:Name>
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
              <td colspan="${colCount}" style="text-align: center; font-size: 16pt; font-weight: bold; height: 35px;">BẢNG ĐIỂM TỔNG HỢP HỘI ĐỒNG ĐỒ ÁN TỐT NGHIỆP</td>
            </tr>
            <tr>
              <td colspan="${colCount}" style="text-align: left; font-size: 11pt; font-weight: bold; height: 20px;">Hội đồng: ${councilName}</td>
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
      
      const cleanCouncilName = councilName.replace(/[\\/:*?"<>|]/g, '').trim()
      const filename = `Bang_diem_${cleanCouncilName}.xls`

      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Error generating council Excel:', e)
      alert('Đã xảy ra lỗi khi xuất file Excel!')
    } finally {
      setExportingCouncilId(null)
    }
  }

  const filteredCouncils = councils.filter((c) => 
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.chair.toLowerCase().includes(query.toLowerCase()) ||
    c.id.toLowerCase().includes(query.toLowerCase())
  )

  const selectedCount = Object.keys(selectedCouncils).filter((k) => selectedCouncils[k]).length
  const isAllSelected = filteredCouncils.length > 0 && filteredCouncils.every((c) => selectedCouncils[c.id])

  const toggleSelectCouncil = (id: string) => {
    setSelectedCouncils((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCouncils({})
    } else {
      const next: Record<string, boolean> = {}
      filteredCouncils.forEach((c) => {
        next[c.id] = true
      })
      setSelectedCouncils(next)
    }
  }

  const exportBulkExcel = async () => {
    const selectedKeys = Object.keys(selectedCouncils).filter((k) => selectedCouncils[k])
    if (selectedKeys.length === 0) return
    
    for (const key of selectedKeys) {
      const c = councils.find((item) => item.id === key)
      if (c) {
        await exportCouncilExcel(c.id, c.name, c.groups || [], c.members || [])
      }
    }
  }

  return (
    <div className="p-0">
      <TeacherSectionHeader
        title="Danh sách Hội đồng"
        description="Sắp xếp theo hội đồng; tích chọn các hội đồng mong muốn để xuất Excel hàng loạt."
        actions={
          <div className="flex items-center gap-2">
            <button 
              disabled={selectedCount === 0 || exportingCouncilId !== null}
              onClick={exportBulkExcel} 
              className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-2xl shadow-md shadow-emerald-100 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportingCouncilId ? 'Đang xuất...' : `Xuất Excel (${selectedCount})`}
            </button>
          </div>
        }
      />
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm tên hội đồng hoặc chủ tịch..."
          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 pl-3 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white w-80 shadow-sm"
        />

        {filteredCouncils.length > 0 && (
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
            <span>Chọn tất cả ({filteredCouncils.length} hội đồng)</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-500">Đang tải danh sách hội đồng...</div>
      ) : filteredCouncils.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredCouncils.map((c) => {
            const isSelected = !!selectedCouncils[c.id]
            return (
              <div 
                key={c.id} 
                className={`rounded-[24px] border transition-all duration-300 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.02)] border-l-4 ${
                  isSelected 
                    ? 'border-slate-200 border-l-blue-600 bg-blue-50/10' 
                    : 'border-slate-200 border-l-transparent'
                }`}
              >
                <div className="flex items-start">
                  <div 
                    onClick={() => toggleSelectCouncil(c.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 mr-3.5 mt-1 flex-shrink-0 ${
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

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">{c.name}</h2>
                        <p className="text-sm text-slate-500 mt-1">{c.period}</p>
                        <div className="mt-3 space-y-1 text-sm text-slate-600">
                          <p>Chủ tịch hội đồng: <strong className="text-slate-800">{c.chair}</strong></p>
                        </div>
                      </div>
                      <div className="text-right rounded-2xl bg-blue-50 px-3 py-2 flex-shrink-0">
                        <div className="text-xs font-medium text-blue-600">Số sinh viên</div>
                        <div className="text-xl font-bold text-blue-700">{c.studentsCount}</div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end border-t border-slate-100 pt-4">
                      <Link href={`/teacher/councils/${c.id}/grades`} className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 hover:shadow-lg">
                        Xem bảng điểm
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-slate-500">
          Không tìm thấy hội đồng nào của bạn trong đợt này.
        </div>
      )}
    </div>
  )
}
