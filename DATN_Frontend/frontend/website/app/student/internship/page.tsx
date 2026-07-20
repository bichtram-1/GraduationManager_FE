"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart3, Building2, ChevronLeft, ChevronRight, MapPin, Search, CalendarDays, Plus } from 'lucide-react'
import { StudentPill, StudentSectionHeader } from '../_components/StudentShell'
import { StudentButton, StudentField, StudentInputClass, StudentModal } from '../_components/StudentUI'
import { studentApi, ICompany } from '@/lib/api/studentApi'
import { App, Spin } from 'antd'
import { usePeriod } from '@/lib/providers/PeriodProvider'
import { COMMON_LABELS } from '@/constants/commonLabels'

interface IInternshipRequest {
  status: string
  confirmPaper: boolean
  companyName: string
  position?: string
  internshipAddress?: string
  mentor?: string
  phone?: string
  duration?: string
}

const DEFAULT_FIELDS = [
  'Phần mềm',
  'Mạng máy tính',
  'An toàn thông tin',
  'Hệ thống thông tin',
  'Trí tuệ nhân tạo',
  'Thiết kế đồ họa / UI-UX',
  'Thương mại điện tử',
  'Phần cứng & Nhúng',
  'Fintech',
  'Internet',
  'Viễn thông',
  'Khác'
]

const DISTRICT_WARDS: Record<string, string[]> = {
  'quận 1': [
    'Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 
    'Phường Cô Giang', 'Phường Đa Kao', 'Phường Nguyễn Thái Bình', 'Phường Nguyễn Cư Trinh', 
    'Phường Phạm Ngũ Lão', 'Phường Tân Định'
  ],
  'quận 2': [
    'Phường An Phú', 'Phường Thảo Điền', 'Phường An Khánh', 'Phường Bình An', 
    'Phường Bình Khánh', 'Phường Bình Trưng Đông', 'Phường Bình Trưng Tây', 'Phường Cát Lái', 
    'Phường Thạnh Mỹ Lợi', 'Phường Thủ Thiêm'
  ],
  'quận 3': [
    'Phường Võ Thị Sáu', 'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 
    'Phường 5', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'
  ],
  'quận 4': [
    'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 6', 'Phường 8', 
    'Phường 9', 'Phường 10', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'
  ],
  'quận 5': [
    'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 
    'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 
    'Phường 13', 'Phường 14'
  ],
  'quận 6': [
    'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 
    'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 
    'Phường 13', 'Phường 14'
  ],
  'quận 7': [
    'Phường Bình Thuận', 'Phường Phú Mỹ', 'Phường Phú Thuận', 'Phường Tân Hưng', 
    'Phường Tân Kiểng', 'Phường Tân Phong', 'Phường Tân Phú', 'Phường Tân Quy', 
    'Phường Tân Thuận Đông', 'Phường Tân Thuận Tây'
  ],
  'quận 8': [
    'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 
    'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 
    'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'
  ],
  'quận 9': [
    'Phường Hiệp Phú', 'Phường Long Bình', 'Phường Long Phước', 'Phường Long Thạnh Mỹ', 
    'Phường Long Trường', 'Phường Phú Hữu', 'Phường Phước Bình', 'Phường Phước Long A', 
    'Phường Phước Long B', 'Phường Tân Phú', 'Phường Tăng Nhơn Phú A', 'Phường Tăng Nhơn Phú B', 
    'Phường Trường Thạnh'
  ],
  'quận 10': [
    'Phường 1', 'Phường 2', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 
    'Phường 8', 'Phường 9', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'
  ],
  'quận 11': [
    'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 
    'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 
    'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'
  ],
  'quận 12': [
    'Phường An Phú Đông', 'Phường Đông Hưng Thuận', 'Phường Hiệp Thành', 'Phường Tân Chánh Hiệp', 
    'Phường Tân Hưng Thuận', 'Phường Tân Thới Hiệp', 'Phường Tân Thới Nhất', 'Phường Thạnh Lộc', 
    'Phường Thạnh Xuân', 'Phường Thới An', 'Phường Trung Mỹ Tây'
  ],
  'quận bình thạnh': [
    'Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 6', 'Phường 7', 
    'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 17', 
    'Phường 19', 'Phường 21', 'Phường 22', 'Phường 24', 'Phường 25', 'Phường 26', 
    'Phường 27', 'Phường 28'
  ],
  'quận thủ đức': [
    'Phường Bình Chiểu', 'Phường Bình Thọ', 'Phường Hiệp Bình Chánh', 'Phường Hiệp Bình Phước', 
    'Phường Linh Chiểu', 'Phường Linh Đông', 'Phường Linh Tây', 'Phường Linh Trung', 
    'Phường Linh Xuân', 'Phường Tam Bình', 'Phường Tam Phú', 'Phường Trường Thọ'
  ],
  'quận gò vấp': [
    'Phường 1', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 
    'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 
    'Phường 14', 'Phường 15', 'Phường 16', 'Phường 17'
  ],
  'quận phú nhuận': [
    'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7', 
    'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 13', 'Phường 15', 'Phường 17'
  ],
  'quận tân bình': [
    'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 
    'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 
    'Phường 13', 'Phường 14', 'Phường 15'
  ],
  'quận tân phú': [
    'Phường Hiệp Tân', 'Phường Hòa Thạnh', 'Phường Phú Thạnh', 'Phường Phú Thọ Hòa', 
    'Phường Phú Trung', 'Phường Sơn Kỳ', 'Phường Tân Quý', 'Phường Tân Sơn Nhì', 
    'Phường Tân Thành', 'Phường Tân Thới Hòa', 'Phường Tây Thạnh'
  ],
  'quận bình tân': [
    'Phường An Lạc', 'Phường An Lạc A', 'Phường Bình Hưng Hòa', 'Phường Bình Hưng Hòa A', 
    'Phường Bình Hưng Hòa B', 'Phường Bình Trị Đông', 'Phường Bình Trị Đông A', 
    'Phường Bình Trị Đông B', 'Phường Tân Tạo', 'Phường Tân Tạo A'
  ],
  'thành phố thủ đức': [
    'Phường An Khánh', 'Phường An Lợi Đông', 'Phường An Phú', 'Phường Bình Chiểu', 
    'Phường Bình Thọ', 'Phường Cát Lái', 'Phường Hiệp Bình Chánh', 'Phường Hiệp Bình Phước', 
    'Phường Hiệp Phú', 'Phường Linh Chiểu', 'Phường Linh Đông', 'Phường Linh Tây', 
    'Phường Linh Trung', 'Phường Linh Xuân', 'Phường Long Bình', 'Phường Long Phước', 
    'Phường Long Thạnh Mỹ', 'Phường Long Trường', 'Phường Phú Hữu', 'Phường Phước Bình', 
    'Phường Phước Long A', 'Phường Phước Long B', 'Phường Tam Bình', 'Phường Tam Phú', 
    'Phường Tân Phú', 'Phường Tăng Nhơn Phú A', 'Phường Tăng Nhơn Phú B', 'Phường Thạnh Mỹ Lợi', 
    'Phường Thảo Điền', 'Phường Thủ Thiêm', 'Phường Trường Thạnh', 'Phường Trường Thọ'
  ]
};

const findDistrictByWard = (wardName: string) => {
  if (!wardName) return '';
  const search = wardName.toLowerCase().trim();
  
  for (const [district, wards] of Object.entries(DISTRICT_WARDS)) {
    for (const w of wards) {
      if (w.toLowerCase().includes(search) || search.includes(w.toLowerCase())) {
        return district;
      }
    }
  }
  return '';
};

const parseAddressInfo = (address: string) => {
  if (!address) return { ward: '', district: '' };
  const cleaned = address.trim();
  
  let ward = '';
  const wardMatch = cleaned.match(/(?:Phường|P\.)\s+([^,]+)/i);
  if (wardMatch) {
    ward = wardMatch[0].trim();
  }
  
  let district = '';
  const districtMatch = cleaned.match(/(?:Quận|Q\.|Huyện|H\.)\s+([^,]+)/i);
  if (districtMatch) {
    district = districtMatch[0].trim();
  } else {
    if (/Thủ Đức/i.test(cleaned) && /Thành phố|TP/i.test(cleaned)) {
      district = 'Thành phố Thủ Đức';
    }
  }

  // Fallback: If district is not found, search by ward name
  if (!district && ward) {
    const foundDistrict = findDistrictByWard(ward);
    if (foundDistrict) {
      district = foundDistrict;
    }
  }
  
  return { ward, district };
};

export default function StudentInternshipPage() {
  const { message } = App.useApp()
  const { selectedPeriod } = usePeriod()
  const isPeriodLocked = selectedPeriod?.status === 'grading' || selectedPeriod?.status === 'closed'
  const [companies, setCompanies] = useState<ICompany[]>([])
  const [myRequest, setMyRequest] = useState<IInternshipRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedField, setSelectedField] = useState('all')
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
    duration: '',
    confirmPaper: false,
  })
  const [errors, setErrors] = useState({
    phone: '',
    email: '',
    duration: '',
  })

  const validateField = (name: string, value: string) => {
    let errorMsg = ''
    if (name === 'phone') {
      const trimmed = value.trim()
      if (!trimmed) {
        errorMsg = 'Vui lòng nhập số điện thoại liên hệ'
      } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(trimmed)) {
        errorMsg = 'Số điện thoại phải gồm 10 chữ số bắt đầu bằng 0 hoặc +84'
      }
    } else if (name === 'email') {
      const trimmed = value.trim()
      if (!trimmed) {
        errorMsg = 'Vui lòng nhập email người liên hệ'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        errorMsg = 'Email người liên hệ không đúng định dạng!'
      }
    } else if (name === 'duration') {
      const trimmed = value.trim()
      if (!trimmed) {
        errorMsg = 'Vui lòng nhập thời gian thực tập'
      } else if (Number(trimmed) < 8) {
        errorMsg = 'Thời gian thực tập phải từ 8 tuần trở lên!'
      }
    }
    setErrors((current) => ({ ...current, [name]: errorMsg }))
    return errorMsg === ''
  }

  const handleCloseModal = () => {
    setDeclareOpen(false)
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
      duration: '',
      confirmPaper: false,
    })
    setErrors({
      phone: '',
      email: '',
      duration: '',
    })
    setSelectedWardOption('')
    setCustomWardText('')
  }
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<ICompany[]>([])
  const [lookingUpTax, setLookingUpTax] = useState(false)
  const [selectedWardOption, setSelectedWardOption] = useState('')
  const [customWardText, setCustomWardText] = useState('')

  const { ward: mainWard, district: mainDistrict } = useMemo(() => {
    return parseAddressInfo(declareForm.address);
  }, [declareForm.address]);

  const wardsOptions = useMemo(() => {
    if (!mainDistrict) return [];
    let key = mainDistrict.toLowerCase().trim();
    key = key.replace(/^q\./, 'quận');
    key = key.replace(/^h\./, 'huyện');
    key = key.replace(/\s+/g, ' ');
    return DISTRICT_WARDS[key] || [];
  }, [mainDistrict]);

  const finalWardsList = useMemo(() => {
    const list = [...wardsOptions];
    if (mainWard && !list.includes(mainWard)) {
      list.unshift(mainWard);
    }
    return list;
  }, [mainWard, wardsOptions]);

  // Sync selectedWardOption and internshipAddress when mainWard changes
  useEffect(() => {
    if (mainWard) {
      setSelectedWardOption(mainWard);
      setDeclareForm(current => ({ ...current, internshipAddress: mainWard }));
    }
  }, [mainWard]);

  const fieldOptions = useMemo(() => {
    const fromCompanies = companies
      .map((c) => c.field)
      .filter(Boolean)
      .flatMap((f) => f.split(',').map((s) => s.trim()))
    const all = Array.from(new Set([...DEFAULT_FIELDS, ...fromCompanies]))
    return all.sort((a, b) => a.localeCompare(b, 'vi'))
  }, [companies])

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

  const handleLookupTax = async () => {
    const taxId = declareForm.taxId.trim().replace(/-/g, '')
    if (!/^[0-9]{10}([0-9]{3})?$/.test(taxId)) {
      message.error('Mã số thuế phải gồm 10 hoặc 13 chữ số để tra cứu!')
      return
    }
    setLookingUpTax(true)
    try {
      const result = await studentApi.lookupCompanyByTaxId(taxId)
      if (result) {
        setDeclareForm((current) => ({
          ...current,
          companyName: result.name || current.companyName,
          address: result.address || current.address,
        }))
        message.success('Đã tự động điền thông tin công ty từ mã số thuế!')
      }
    } catch (err) {
      message.error((err as Error).message || 'Tra cứu mã số thuế thất bại, vui lòng nhập thủ công.')
    } finally {
      setLookingUpTax(false)
    }
  }

  // "Thời gian thực tập" chỉ nhập số tuần, đơn vị "tuần" cố định - dữ liệu công ty cũ có thể
  // đã lưu dạng "8 tuần" nên cần bóc lại phần số khi điền vào ô nhập chỉ nhận số này.
  const extractWeeksDigits = (str?: string): string => {
    if (!str) return '';
    const match = str.match(/\d+/);
    return match ? match[0] : '';
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
      duration: extractWeeksDigits(c.duration) || '8',
      confirmPaper: declareForm.confirmPaper,
    });
    setShowSuggestions(false);
  };

  const loadData = useCallback(async () => {
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
      setMyRequest(request as IInternshipRequest)
    } catch {
      message.error('Không thể tải thông tin thực tập từ máy chủ!')
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod?.id, message])

  useEffect(() => {
    setLoading(true)
    loadData()
  }, [loadData])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#companies') {
      const el = document.getElementById('companies')
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 150)
      }
    }
  }, [companies])

  const filtered = useMemo(() => {
    return companies.filter((company) => {
      const text = `${company.code} ${company.name} ${company.field} ${company.address}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const matchesField = selectedField === 'all' || 
        (company.field && company.field.toLowerCase().includes(selectedField.toLowerCase()))
      return matchesQuery && matchesField
    })
  }, [query, selectedField, companies])

  useEffect(() => {
    setPage(1)
  }, [query, selectedField, companies])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage])

  const handleDeclareSubmit = async () => {
    const companyName = declareForm.companyName.trim()
    const taxId = declareForm.taxId.trim()
    const field = declareForm.field.trim()
    const position = declareForm.position.trim()
    const address = declareForm.address.trim()
    const mentor = declareForm.mentor.trim()
    const phone = declareForm.phone.trim()
    const email = declareForm.email.trim()
    const duration = declareForm.duration.trim()
    const internshipAddress = declareForm.internshipAddress.trim()

    if (!companyName) {
      message.error('Vui lòng nhập tên công ty!')
      return
    }
    if (!taxId) {
      message.error('Vui lòng nhập mã số thuế công ty!')
      return
    }
    if (!field) {
      message.error('Vui lòng chọn lĩnh vực hoạt động!')
      return
    }
    if (!position) {
      message.error('Vui lòng nhập vị trí thực tập!')
      return
    }

    // Vietnam tax ID regex validation: 10 digits, or 13 digits, or 10 digits followed by - and 3 digits
    const taxIdRegex = /^[0-9]{10}$|^[0-9]{13}$|^[0-9]{10}-[0-9]{3}$/
    if (!taxIdRegex.test(taxId)) {
      message.error('Mã số thuế không hợp lệ (phải gồm 10 hoặc 13 chữ số, ví dụ: 0101243150)!')
      return
    }

    const isPhoneValid = validateField('phone', phone)
    const isEmailValid = validateField('email', email)
    const isDurationValid = validateField('duration', duration)

    if (!isPhoneValid || !isEmailValid || !isDurationValid) {
      message.error('Vui lòng sửa các lỗi trong form trước khi gửi!')
      return
    }

    if (declareForm.confirmPaper && !internshipAddress) {
      message.error('Vui lòng chọn hoặc nhập phường/xã nơi thực tập!')
      return
    }

    setSubmitting(true)
    try {
      await studentApi.declareInternship({
        companyName,
        taxId,
        field,
        position,
        address,
        mentor,
        phone,
        email,
        duration: `${duration} tuần`,
        confirmPaper: declareForm.confirmPaper,
        internshipAddress: declareForm.confirmPaper ? (internshipAddress || address) : undefined
      }, selectedPeriod?.id)

      message.success('Gửi hồ sơ khai báo nơi thực tập thành công!')
      handleCloseModal()
      // Reload updated status
      loadData()
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Gửi khai báo thất bại. Vui lòng thử lại!'
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

  const REQUEST_STATUS_META: Record<string, { label: string; tone: 'green' | 'red' | 'blue' | 'orange' }> = {
    approved: { label: 'Đã duyệt', tone: 'green' },
    rejected: { label: 'Bị từ chối', tone: 'red' },
    cho_cap_giay: { label: 'Chờ cấp giấy', tone: 'blue' },
  }
  const requestStatusMeta = myRequest
    ? REQUEST_STATUS_META[myRequest.status] ?? { label: 'Chờ phê duyệt', tone: 'orange' as const }
    : { label: 'Chưa khai báo', tone: 'orange' as const }
  const myRequestStatusText = requestStatusMeta.label

  const summary = [
    { title: 'Công ty đối tác', value: companies.length.toString(), hint: 'Đã phê duyệt đối tác' },
    { title: 'Trạng thái của bạn', value: myRequestStatusText, hint: myRequest ? `Tại ${myRequest.companyName}` : 'Khai báo để đăng ký' },
  ]

  return (
    <>
      <StudentSectionHeader
        title="Đăng ký thực tập tốt nghiệp"
        description="Tìm kiếm công ty đối tác đã được duyệt hoặc tự khai báo thông tin nơi thực tập của bạn."
        actions={
          <>
            {isPeriodLocked ? (
              <StudentPill tone="red">
                {selectedPeriod?.status === 'closed' ? 'Đợt đã đóng' : 'Đã bắt đầu chấm điểm'}
              </StudentPill>
            ) : (
              <StudentPill tone="green">Đang mở đăng ký</StudentPill>
            )}
            {myRequest?.status !== 'approved' && !isPeriodLocked && (
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
      {isPeriodLocked && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {selectedPeriod?.status === 'closed'
            ? 'Đợt thực tập này đã đóng, bạn không thể khai báo hoặc chỉnh sửa thông tin thực tập nữa.'
            : 'Đợt thực tập đã bắt đầu chấm điểm, bạn không thể khai báo hoặc chỉnh sửa thông tin thực tập nữa.'}
        </div>
      )}

      <div className="mb-5 grid gap-4 md:grid-cols-2">
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
                <StudentPill tone={requestStatusMeta.tone}>
                  {myRequestStatusText}
                </StudentPill>
                {myRequest.confirmPaper && <StudentPill tone="blue">Yêu cầu giấy giới thiệu</StudentPill>}
              </div>
              <h3 className="mt-2.5 text-lg font-semibold text-slate-950">
                {myRequest.companyName}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Vị trí thực tập: {myRequest.position || 'Chưa cập nhật'} | Địa chỉ: {myRequest.internshipAddress || 'Tại công ty'} | Mentor: {myRequest.mentor || 'Chưa cập nhật'} ({myRequest.phone || 'Chưa cập nhật'})
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs text-slate-500">Thời gian thực tập</div>
              <div className="text-base font-semibold text-slate-900">{myRequest.duration || '8 tuần'}</div>
            </div>
          </div>
        </section>
      )}

      <section id="companies" className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">Danh sách doanh nghiệp</div>
            <div className="text-xs text-slate-500">Các đơn vị liên kết đã được duyệt nhận sinh viên thực tập</div>
          </div>
          <StudentPill tone="blue">{filtered.length} đơn vị</StudentPill>
        </div>

        <div className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo tên công ty, địa chỉ hoặc lĩnh vực..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 shrink-0">Lĩnh vực:</span>
              <select
                value={selectedField}
                onChange={(event) => setSelectedField(event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white min-w-[180px] shadow-sm cursor-pointer"
              >
                <option value="all">Tất cả lĩnh vực</option>
                {fieldOptions.map((field) => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
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

      <StudentModal
        open={declareOpen}
        title="Khai báo nơi thực tập"
        description="Khai báo đơn vị tự liên hệ thực tập ngoài danh sách"
        onClose={handleCloseModal}
        closeDisabled={submitting}
        footer={
          <>
            <StudentButton variant="secondary" disabled={submitting} onClick={handleCloseModal}>{COMMON_LABELS.CANCEL}</StudentButton>
            <StudentButton variant="primary" disabled={submitting} onClick={handleDeclareSubmit}>
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
            </StudentButton>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <StudentField label="Tên công ty" required>
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
                className={StudentInputClass()}
                placeholder="Nhập tên đầy đủ của công ty"
                disabled={submitting}
              />
            </StudentField>
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full z-50 -mt-3 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
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
          <StudentField label="Mã số thuế công ty" required>
            <div className="flex gap-2">
              <input
                value={declareForm.taxId}
                onChange={(event) => setDeclareForm((current) => ({ ...current, taxId: event.target.value }))}
                className={StudentInputClass()}
                placeholder="VD: 0101243150"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={handleLookupTax}
                disabled={submitting || lookingUpTax || !declareForm.taxId.trim()}
                className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-blue-200 bg-blue-50 px-3 text-xs font-medium text-[#1976D2] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                title="Tự động điền tên công ty và địa chỉ từ mã số thuế"
              >
                {lookingUpTax ? <Spin size="small" /> : <Search className="h-3.5 w-3.5" />}
                Tra cứu
              </button>
            </div>
          </StudentField>
          <StudentField label="Lĩnh vực" required>
            <select
              value={declareForm.field}
              onChange={(event) => setDeclareForm((current) => ({ ...current, field: event.target.value }))}
              className={StudentInputClass('appearance-none bg-[url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10')}
              disabled={submitting}
            >
              <option value="">-- Chọn lĩnh vực hoạt động --</option>
              {fieldOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </StudentField>
          <StudentField label="Vị trí thực tập" required>
            <input
              value={declareForm.position}
              onChange={(event) => setDeclareForm((current) => ({ ...current, position: event.target.value }))}
              className={StudentInputClass()}
              placeholder="VD: Thực tập sinh Backend Developer"
              disabled={submitting}
            />
          </StudentField>
          <div className="md:col-span-2">
            <StudentField label="Địa chỉ công ty">
              <input
                value={declareForm.address}
                onChange={(event) => setDeclareForm((current) => ({ ...current, address: event.target.value }))}
                className={StudentInputClass()}
                placeholder="Nhập địa chỉ trụ sở chính"
                disabled={submitting}
              />
            </StudentField>
          </div>
          <StudentField label="Người hướng dẫn (Mentor)">
            <input
              value={declareForm.mentor}
              onChange={(event) => setDeclareForm((current) => ({ ...current, mentor: event.target.value }))}
              className={StudentInputClass()}
              placeholder="Họ tên người hướng dẫn tại công ty"
              disabled={submitting}
            />
          </StudentField>
          <StudentField label="Số điện thoại liên hệ" required error={errors.phone}>
            <input
              value={declareForm.phone}
              onChange={(event) => {
                const val = event.target.value;
                setDeclareForm((current) => ({ ...current, phone: val }));
                validateField('phone', val);
              }}
              className={StudentInputClass()}
              placeholder="Nhập số điện thoại liên lạc"
              disabled={submitting}
            />
          </StudentField>
          <StudentField label="Email người liên hệ" required error={errors.email}>
            <input
              value={declareForm.email}
              onChange={(event) => {
                const val = event.target.value;
                setDeclareForm((current) => ({ ...current, email: val }));
                validateField('email', val);
              }}
              className={StudentInputClass()}
              placeholder="mentor@company.com"
              disabled={submitting}
            />
          </StudentField>
          <StudentField label="Thời gian thực tập (tuần)" required error={errors.duration}>
            <input
              value={declareForm.duration}
              inputMode="numeric"
              onChange={(event) => {
                const val = event.target.value.replace(/[^0-9]/g, '');
                setDeclareForm((current) => ({ ...current, duration: val }));
                validateField('duration', val);
              }}
              className={StudentInputClass()}
              placeholder="VD: 8"
              disabled={submitting}
            />
          </StudentField>
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
          <div className="mt-4 space-y-3">
            <StudentField label="Phường/Xã nơi thực tập (Chọn phường của trụ sở hoặc chi nhánh)" required>
              <select
                value={selectedWardOption}
                onChange={(event) => {
                  const val = event.target.value;
                  setSelectedWardOption(val);
                  if (val === 'custom') {
                    setDeclareForm((current) => ({ ...current, internshipAddress: customWardText }));
                  } else {
                    setDeclareForm((current) => ({ ...current, internshipAddress: val }));
                  }
                }}
                className={StudentInputClass('appearance-none bg-[url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10')}
                disabled={submitting}
              >
                {finalWardsList.length > 0 ? (
                  finalWardsList.map((w) => (
                    <option key={w} value={w}>
                      {w} {w === mainWard ? '(Trụ sở chính)' : ''}
                    </option>
                  ))
                ) : (
                  <option value="">-- Chọn phường/xã --</option>
                )}
                <option value="custom">Khác (Nhập thủ công)...</option>
              </select>
            </StudentField>

            {selectedWardOption === 'custom' && (
              <StudentField label="Nhập Phường/Xã cụ thể">
                <input
                  value={customWardText}
                  onChange={(event) => {
                    const val = event.target.value;
                    setCustomWardText(val);
                    setDeclareForm((current) => ({ ...current, internshipAddress: val }));
                  }}
                  className={StudentInputClass()}
                  placeholder="Nhập tên phường/xã chi nhánh thực tập"
                  disabled={submitting}
                />
              </StudentField>
            )}
          </div>
        )}
      </StudentModal>
    </>
  )
}
