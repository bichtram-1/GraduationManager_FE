"use client"

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Building2, ChevronLeft, ChevronRight, MapPin, Search, Users, CalendarDays, Phone, Mail, X, Plus } from 'lucide-react'
import { StudentPill, StudentSectionHeader } from '../_components/StudentShell'
import { studentApi, ICompany } from '@/lib/api/studentApi'
import { Spin, message } from 'antd'
import { usePeriod } from '@/lib/providers/PeriodProvider'

export default function StudentInternshipPage() {
  const { selectedPeriod } = usePeriod()
  const [companies, setCompanies] = useState<ICompany[]>([])
  const [myRequest, setMyRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [declareOpen, setDeclareOpen] = useState(false)
  const [declareForm, setDeclareForm] = useState({
    companyName: '',
    taxId: '',
    field: '',
    position: '',
    address: '',
    internshipAddress: '',
    mentor: '',
    phone: '',
    email: '',
    slots: '',
    duration: '',
    confirmPaper: false,
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<ICompany[]>([])

  const handleCompanyNameChange = (value: string) => {
    setDeclareForm((current) => ({ ...current, companyName: value }));
    if (value.trim()) {
      const filtered = companies.filter((c) =>
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (c: ICompany) => {
    setDeclareForm({
      companyName: c.name,
      taxId: c.taxId || '',
      field: c.field || '',
      position: declareForm.position,
      address: c.address || '',
      internshipAddress: c.address || '',
      mentor: c.mentor || '',
      phone: c.phone || '',
      email: c.email || '',
      slots: String(c.slots || ''),
      duration: c.duration || '8 tuần',
      confirmPaper: declareForm.confirmPaper,
    });
    setShowSuggestions(false);
  };

  const loadData = async () => {
    if (!selectedPeriod?.id) {
      setLoading(false);
      return;
    }
    try {
      const [compList, request] = await Promise.all([
        studentApi.getCompanies(selectedPeriod.id),
        studentApi.getMyInternshipRequest(selectedPeriod.id)
      ])
      setCompanies(compList)
      setMyRequest(request)
    } catch (err) {
      console.error('Failed to load internship data:', err)
      message.error('Không thể tải thông tin thực tập từ máy chủ!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadData()
  }, [selectedPeriod?.id])

  const filtered = useMemo(() => {
    return companies.filter((company) => {
      const text = `${company.code} ${company.name} ${company.field} ${company.address}`.toLowerCase()
      return text.includes(query.toLowerCase())
    })
  }, [query, companies])

  useEffect(() => {
    setPage(1)
  }, [query, companies])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage])

  const totalSlots = useMemo(() => {
    return companies.reduce((total, company) => total + (company.slots || 0), 0)
  }, [companies])

  const handleDeclareSubmit = async () => {
    if (!declareForm.companyName) {
      message.error('Vui lòng nhập tên công ty!')
      return
    }
    if (!declareForm.taxId.trim()) {
      message.error('Vui lòng nhập mã số thuế công ty!')
      return
    }

    setSubmitting(true)
    try {
      await studentApi.declareInternship({
        companyName: declareForm.companyName,
        taxId: declareForm.taxId,
        field: declareForm.field,
        position: declareForm.position,
        address: declareForm.address,
        mentor: declareForm.mentor,
        phone: declareForm.phone,
        email: declareForm.email,
        duration: declareForm.duration,
        confirmPaper: declareForm.confirmPaper,
        internshipAddress: declareForm.internshipAddress
      }, selectedPeriod?.id)

      message.success('Gửi hồ sơ khai báo nơi thực tập thành công!')
      setDeclareOpen(false)
      // Reset form fields
      setDeclareForm({
        companyName: '',
        taxId: '',
        field: '',
        position: '',
        address: '',
        internshipAddress: '',
        mentor: '',
        phone: '',
        email: '',
        slots: '',
        duration: '',
        confirmPaper: false,
      })
      // Reload updated status
      loadData()
    } catch (err: any) {
      console.error('Declaration failed:', err)
      const errorMsg = err.response?.data?.message || 'Gửi khai báo thất bại. Vui lòng thử lại!'
      message.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <div className="text-sm text-slate-500">Đang tải thông tin thực tập...</div>
      </div>
    )
  }

  const myRequestStatusText = (() => {
    if (!myRequest) return 'Chưa khai báo'
    if (myRequest.status === 'approved') return 'Đã duyệt'
    if (myRequest.status === 'rejected') return 'Bị từ chối'
    if (myRequest.status === 'cho_cap_giay') return 'Chờ cấp giấy'
    return 'Chờ phê duyệt'
  })()

  const summary = [
    { title: 'Công ty mở slot', value: companies.length.toString(), hint: 'Đã phê duyệt đối tác' },
    { title: 'Slot đang mở', value: totalSlots.toString(), hint: 'Có thể nộp đăng ký ngay' },
    { title: 'Trạng thái của bạn', value: myRequestStatusText, hint: myRequest ? `Tại ${myRequest.companyName}` : 'Khai báo để đăng ký' },
  ]

  return (
    <>
      <StudentSectionHeader
        title="Đăng ký thực tập tốt nghiệp"
        description="Tìm kiếm công ty, xem số lượng slot còn trống hoặc tự khai báo thông tin nơi thực tập của bạn."
        actions={
          <>
            <StudentPill tone="green">Đang mở đăng ký</StudentPill>
            {myRequest?.status !== 'approved' && (
              <button
                type="button"
                onClick={() => setDeclareOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2]"
              >
                <Plus className="h-4 w-4" />
                Khai báo
              </button>
            )}
          </>
        }
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <section key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="inline-flex rounded-2xl bg-gradient-to-br from-[#2196F3] to-[#2563eb] px-3 py-2 text-white shadow-lg shadow-blue-100">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{item.value}</div>
            <div className="mt-1 text-sm font-medium text-slate-700">{item.title}</div>
            <div className="mt-2 text-xs text-slate-500">{item.hint}</div>
          </section>
        ))}
      </div>

      {myRequest && (
        <section className="mb-6 rounded-[28px] border border-blue-100 bg-[#eff6ff]/40 p-5 shadow-[0_12px_40px_rgba(37,99,235,0.03)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">HỒ SƠ KHAI BÁO CỦA BẠN:</span>
                <StudentPill tone={myRequest.status === 'approved' ? 'green' : (myRequest.status === 'rejected' ? 'red' : (myRequest.status === 'cho_cap_giay' ? 'blue' : 'orange'))}>
                  {myRequestStatusText}
                </StudentPill>
                {myRequest.confirmPaper && <StudentPill tone="blue">Yêu cầu giấy giới thiệu</StudentPill>}
              </div>
              <h3 className="mt-2.5 text-lg font-semibold text-slate-950">
                {myRequest.companyName}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Địa chỉ: {myRequest.internshipAddress || 'Tại công ty'} | Mentor: {myRequest.mentor || 'Chưa cập nhật'} ({myRequest.phone || 'Chưa cập nhật'})
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs text-slate-500">Thời gian thực tập</div>
              <div className="text-base font-semibold text-slate-900">{myRequest.duration || '8 tuần'}</div>
            </div>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">Danh sách doanh nghiệp</div>
            <div className="text-xs text-slate-500">Các đơn vị liên kết đã được duyệt nhận sinh viên thực tập</div>
          </div>
          <StudentPill tone="blue">{filtered.length} đơn vị</StudentPill>
        </div>

        <div className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên công ty, địa chỉ hoặc lĩnh vực..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">Không tìm thấy công ty nào phù hợp từ khóa tìm kiếm.</div>
          ) : (
            paginated.map((company) => (
              <div
                key={company.code}
                className="flex flex-col gap-4 px-5 py-4 hover:bg-slate-50/80 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#1976D2]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium text-slate-900">{company.name}</div>
                      <StudentPill tone="green">{company.field}</StudentPill>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" /> {company.address}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Mentor: {company.mentor}</span>
                      <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {company.phone}</span>
                      <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {company.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filtered.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} trong {filtered.length} doanh nghiệp
            </div>
            {pageCount > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`flex h-8 min-w-8 items-center justify-center rounded-xl px-2 text-xs font-medium transition ${
                      p === currentPage
                        ? 'bg-[#2196F3] text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={currentPage === pageCount}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {declareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.3)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Khai báo nơi thực tập</div>
                <div className="text-xs text-slate-500">Khai báo đơn vị tự liên hệ thực tập ngoài danh sách</div>
              </div>
              <button 
                onClick={() => setDeclareOpen(false)} 
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700" 
                aria-label="Đóng popup"
                disabled={submitting}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative block">
                  <div className="text-sm font-medium text-slate-700">Tên công ty <span className="text-red-500">*</span></div>
                  <input
                    type="text"
                    value={declareForm.companyName}
                    onChange={(event) => handleCompanyNameChange(event.target.value)}
                    onFocus={() => {
                      if (declareForm.companyName.trim()) {
                        const filtered = companies.filter((c) =>
                          c.name.toLowerCase().includes(declareForm.companyName.toLowerCase())
                        );
                        setSuggestions(filtered);
                        setShowSuggestions(filtered.length > 0);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    placeholder="Nhập tên đầy đủ của công ty"
                    disabled={submitting}
                  />
                  {showSuggestions && (
                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                      {suggestions.map((c) => (
                        <div
                          key={c.code}
                          onClick={() => handleSelectSuggestion(c)}
                          className="cursor-pointer rounded-xl px-4 py-2.5 text-left hover:bg-slate-50 transition"
                        >
                          <div className="text-xs font-semibold text-slate-900">{c.name}</div>
                          <div className="text-[10px] text-slate-500">{c.field} • {c.address}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <label className="block">
                  <div className="text-sm font-medium text-slate-700">Mã số thuế công ty <span className="text-red-500">*</span></div>
                  <input
                    value={declareForm.taxId}
                    onChange={(event) => setDeclareForm((current) => ({ ...current, taxId: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    placeholder="VD: 0101243150"
                    disabled={submitting}
                  />
                </label>
                <label className="block">
                  <div className="text-sm font-medium text-slate-700">Lĩnh vực</div>
                  <input
                    value={declareForm.field}
                    onChange={(event) => setDeclareForm((current) => ({ ...current, field: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    placeholder="Phần mềm, fintech, phần cứng..."
                    disabled={submitting}
                  />
                </label>
                <label className="block">
                  <div className="text-sm font-medium text-slate-700">Vị trí thực tập</div>
                  <input
                    value={declareForm.position}
                    onChange={(event) => setDeclareForm((current) => ({ ...current, position: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    placeholder="VD: Thực tập sinh Backend Developer"
                    disabled={submitting}
                  />
                </label>
                <label className="block md:col-span-2">
                  <div className="text-sm font-medium text-slate-700">Địa chỉ công ty</div>
                  <input 
                    value={declareForm.address} 
                    onChange={(event) => setDeclareForm((current) => ({ ...current, address: event.target.value }))} 
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white" 
                    placeholder="Nhập địa chỉ trụ sở chính" 
                    disabled={submitting}
                  />
                </label>
                <label className="block">
                  <div className="text-sm font-medium text-slate-700">Người hướng dẫn (Mentor)</div>
                  <input 
                    value={declareForm.mentor} 
                    onChange={(event) => setDeclareForm((current) => ({ ...current, mentor: event.target.value }))} 
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white" 
                    placeholder="Họ tên người hướng dẫn tại công ty" 
                    disabled={submitting}
                  />
                </label>
                <label className="block">
                  <div className="text-sm font-medium text-slate-700">Số điện thoại liên hệ</div>
                  <input 
                    value={declareForm.phone} 
                    onChange={(event) => setDeclareForm((current) => ({ ...current, phone: event.target.value }))} 
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white" 
                    placeholder="Nhập số điện thoại liên lạc" 
                    disabled={submitting}
                  />
                </label>
                <label className="block">
                  <div className="text-sm font-medium text-slate-700">Email người liên hệ</div>
                  <input 
                    value={declareForm.email} 
                    onChange={(event) => setDeclareForm((current) => ({ ...current, email: event.target.value }))} 
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white" 
                    placeholder="mentor@company.com" 
                    disabled={submitting}
                  />
                </label>
                <label className="block">
                  <div className="text-sm font-medium text-slate-700">Thời gian thực tập</div>
                  <input 
                    value={declareForm.duration} 
                    onChange={(event) => setDeclareForm((current) => ({ ...current, duration: event.target.value }))} 
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white" 
                    placeholder="8 tuần, 12 tuần..." 
                    disabled={submitting}
                  />
                </label>
              </div>

              <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declareForm.confirmPaper}
                  onChange={(event) => setDeclareForm((current) => ({ ...current, confirmPaper: event.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2196F3] focus:ring-[#2196F3]"
                  disabled={submitting}
                />
                <div>
                  <div className="text-sm font-medium text-slate-900">Yêu cầu giấy giới thiệu thực tập</div>
                  <div className="mt-1 text-xs text-slate-500">Tích chọn nếu bạn cần Khoa cấp giấy giới thiệu gửi đến doanh nghiệp này.</div>
                </div>
              </label>

              {declareForm.confirmPaper && (
                <label className="mt-4 block">
                  <div className="text-sm font-medium text-slate-700">Địa chỉ cụ thể nơi thực tập (nếu khác trụ sở chính)</div>
                  <input
                    value={declareForm.internshipAddress}
                    onChange={(event) => setDeclareForm((current) => ({ ...current, internshipAddress: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    placeholder="Nhập địa chỉ chi nhánh, văn phòng làm việc"
                    disabled={submitting}
                  />
                </label>
              )}

              <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button 
                  type="button" 
                  onClick={() => setDeclareOpen(false)} 
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleDeclareSubmit}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#2196F3] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-[#1976D2] disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spin size="small" className="text-white" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <CalendarDays className="h-4 w-4" />
                      Gửi khai báo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
