import { BankOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DownloadOutlined, FileTextOutlined, SearchOutlined, SolutionOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Select, Space, Tag, Tabs, Typography, Table, message } from 'antd';
import * as XLSX from 'xlsx';
import RemindModal from './components/RemindModal';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn, STATUS_CODE, isPeriodClosedForAdmin } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import { internshipHooks } from '../../hooks/useInternships';
import { companyHooks } from '../../hooks/useCompanies';
import type { ConfirmationStatus, IConfirmationRequest, INoCompanyStudent, NoCompanyStatus, ICreateConfirmationRequest, IUpdateConfirmationRequest, ICreateNoCompanyStudent, IUpdateNoCompanyStudent } from '../../type/InternshipType';
import FilterTable from '../../components/shared/table/FilterTable';
import ConfirmationForm from './components/ConfirmationForm';
import StudentForm from './components/StudentForm';
import type { BaseListParams, ListResponseTypeObject } from '@shared/types/GeneralType';
import type { IListCompany } from '../../type/CompanyType';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { TFunction } from 'i18next';
import { formatNumber } from '@shared/utils/numberUtils';

import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';

type ModeKey = 'no-company' | 'declarations';
type ConfirmationTab = 'all' | ConfirmationStatus | 'grouped';

const INITIAL_CONFIRMATIONS: IConfirmationRequest[] = [];
const INITIAL_NO_COMPANY_STUDENTS: INoCompanyStudent[] = [];

const getConfirmationStatusMeta = (t: TFunction) => ({
  [STATUS_CODE.PENDING]: { label: t(getKey('pending_list')), className: 'bg-[var(--color-gold-light)] text-[var(--color-gold-medium)]' },
  [STATUS_CODE.APPROVED]: { label: t(getKey('approved_list')), className: 'bg-[var(--color-green-light)] text-[var(--color-green-medium)]' },
  [STATUS_CODE.REJECTED]: { label: t(getKey('rejected_list')), className: 'bg-[var(--color-red-light)] text-[var(--color-red-medium)]' },
  [STATUS_CODE.CHO_CAP_GIAY]: { label: t(getKey('cho_cap_giay_list')), className: 'bg-[var(--color-gold-light)] text-[var(--color-gold-medium)]' },
} as const);

const getNoCompanyStatusMeta = (t: TFunction) => ({
  [STATUS_CODE.NOT_REGISTERED]: { label: t(getKey('not_registered_list')), className: 'bg-[var(--color-red-light)] text-[var(--color-red-medium)]' },
  [STATUS_CODE.HAS_COMPANY]: { label: t(getKey('has_company_list')), className: 'bg-[var(--color-green-light)] text-[var(--color-green-medium)]' },
} as const);

const useFilteredDeclarationListQuery = (params: BaseListParams) => {
  const typedParams = params as BaseListParams & { keyword?: string; companyName?: string; className?: string; periodId?: string; declarationTab?: string };
  const periodId = typedParams.periodId;
  const declarationTab = typedParams.declarationTab || 'all';

  const query = internshipHooks.useFetchListDeclarations({ periodId });
  const keyword = (typedParams.keyword ?? '').trim().toLowerCase();
  const companyName = typedParams.companyName || 'all';
  const className = typedParams.className || 'all';

  const sourceRows = (query.data?.rows ?? INITIAL_CONFIRMATIONS) as IConfirmationRequest[];
  const filteredRows = sourceRows
    .filter((r: IConfirmationRequest) => (declarationTab === 'all' ? true : r.status === declarationTab))
    .filter((r: IConfirmationRequest) => (className === 'all' ? true : r.className === className))
    .filter((r: IConfirmationRequest) => (companyName === 'all' || !companyName ? true : r.companyName.toLowerCase() === companyName.toLowerCase()))
    .filter((r: IConfirmationRequest) => !keyword || [r.studentId, r.studentName, r.className, r.companyName, r.taxId].join(' ').toLowerCase().includes(keyword));

  return {
    ...query,
    data: query.data
      ? ({ ...query.data, rows: filteredRows, total: filteredRows.length } as ListResponseTypeObject<IConfirmationRequest>)
      : query.data,
  } as UseQueryResult<ListResponseTypeObject<IConfirmationRequest>, Error>;
};

const useFilteredNoCompanyListQuery = (params: BaseListParams) => {
  const typedParams = params as BaseListParams & { keyword?: string; className?: string; assignmentStatus?: string; periodId?: string; noCompanyTab?: string };
  const periodId = typedParams.periodId;
  const noCompanyTab = typedParams.noCompanyTab || 'all';

  const query = internshipHooks.useFetchListNoCompanyStudents({ periodId });
  const keyword = (typedParams.keyword ?? '').trim().toLowerCase();
  const className = typedParams.className || 'all';
  const assignmentStatus = typedParams.assignmentStatus || 'all';

  const sourceRows2 = (query.data?.rows ?? INITIAL_NO_COMPANY_STUDENTS) as INoCompanyStudent[];
  const filteredRows = sourceRows2
    .filter((r: INoCompanyStudent) => (noCompanyTab === 'all' || noCompanyTab === undefined ? true : r.status === noCompanyTab))
    .filter((r: INoCompanyStudent) => (className === 'all' ? true : r.className === className))
    .filter((r: INoCompanyStudent) => {
      if (assignmentStatus === 'all') return true;
      return r.assignmentStatus === assignmentStatus;
    })
    .filter((r: INoCompanyStudent) => !keyword || [r.studentId, r.studentName, r.phone, r.supervisor || ''].join(' ').toLowerCase().includes(keyword));

  return {
    ...query,
    data: query.data
      ? ({ ...query.data, rows: filteredRows, total: filteredRows.length } as ListResponseTypeObject<INoCompanyStudent>)
      : query.data,
  } as UseQueryResult<ListResponseTypeObject<INoCompanyStudent>, Error>;
};

const InternshipStudentsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { selectedPeriod } = useGlobalVariable();
  const mode: ModeKey = location.pathname.includes('/no-company') ? 'no-company' : 'declarations';
  const [declarationTab, setDeclarationTab] = useState<ConfirmationTab>('pending');
  const [remindOpen, setRemindOpen] = useState(false);
  const [groupedKeyword, setGroupedKeyword] = useState('');
  const [groupedStatusFilter, setGroupedStatusFilter] = useState<'all' | 'cho_cap_giay' | 'approved' | 'pending'>('all');

  const { data: confirmationList } = internshipHooks.useFetchListConfirmationRequests({ periodId: selectedPeriod?.id });
  const { data: declarationsList } = internshipHooks.useFetchListDeclarations({ periodId: selectedPeriod?.id });
  const { data: noCompanyList } = internshipHooks.useFetchListNoCompanyStudents({ periodId: selectedPeriod?.id });
  const { data: companiesData } = companyHooks.useFetchListCompanies();

  const companiesList = useMemo(() => (companiesData?.rows ?? []) as IListCompany[], [companiesData]);

  const updateDeclarationMutation = internshipHooks.useUpdateDeclaration();
  const deleteDeclarationMutation = internshipHooks.useDeleteDeclaration();
  const updateNoCompanyMutation = internshipHooks.useUpdateNoCompanyStudent();
  const deleteNoCompanyMutation = internshipHooks.useDeleteNoCompanyStudent();

  const confirmationRows = confirmationList?.rows ?? INITIAL_CONFIRMATIONS;
  const declarationsRows = declarationsList?.rows ?? INITIAL_CONFIRMATIONS;
  const noCompanyRows = noCompanyList?.rows ?? INITIAL_NO_COMPANY_STUDENTS;
  const isPeriodClosed = isPeriodClosedForAdmin(selectedPeriod);

  const summary = useMemo(() => {
    if (mode === 'declarations') {
      return {
        total: declarationsRows.length,
        pending: declarationsRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.PENDING).length,
        approved: declarationsRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.APPROVED || item.status === STATUS_CODE.CHO_CAP_GIAY).length,
        noCompany: noCompanyRows.length,
      };
    }
    return {
      total: confirmationRows.length,
      pending: confirmationRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.PENDING).length,
      approved: confirmationRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.APPROVED).length,
      noCompany: noCompanyRows.length,
    };
  }, [mode, confirmationRows, declarationsRows, noCompanyRows]);

  const classOptions = useMemo(() => {
    const classes = [
      ...noCompanyRows.map((item: INoCompanyStudent) => item.className),
      ...confirmationRows.map((item: IConfirmationRequest) => item.className),
      ...declarationsRows.map((item: IConfirmationRequest) => item.className)
    ];
    return Array.from(new Set(classes)).filter(Boolean);
  }, [noCompanyRows, confirmationRows, declarationsRows]);

  const declarationTabCounts = useMemo(() => {
    const validRowsForGroups = declarationsRows.filter((r: IConfirmationRequest) => {
      const isApproved = r.status === STATUS_CODE.APPROVED || r.status === STATUS_CODE.CHO_CAP_GIAY;
      const hasLocation = !!(r.internshipLocation || '').trim();
      return isApproved && hasLocation;
    });
    
    const groupsMap = new Map<string, boolean>();
    validRowsForGroups.forEach((row: IConfirmationRequest) => {
      const company = (row.companyName || '').trim();
      const locClean = (row.internshipLocation || '').trim();
      
      const getNormalizedWard = (w: string) => {
        let name = w.toLowerCase().trim();
        name = name.replace(/^p\./, 'phường');
        name = name.replace(/\s+/g, ' ');
        return name;
      };

      const key = `${company.toLowerCase()}_${getNormalizedWard(locClean)}`;
      groupsMap.set(key, true);
    });

    return {
      total: declarationsRows.length,
      pending: declarationsRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.PENDING).length,
      cho_cap_giay: declarationsRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.CHO_CAP_GIAY).length,
      approved: declarationsRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.APPROVED).length,
      rejected: declarationsRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.REJECTED).length,
      grouped: groupsMap.size,
    };
  }, [declarationsRows]);

  // Hook luôn phải gọi vô điều kiện ở mọi lần render (Rules of Hooks) — không được đặt
  // useMemo bên trong nhánh ternary của JSX, vì số lượng hook gọi sẽ khác nhau giữa các
  // lần render (VD: đổi tab "Gộp theo nơi thực tập") và React sẽ báo lỗi "Rendered fewer
  // hooks than expected".
  const declarationParamVariables = useMemo(() => ({
    page: 1,
    limit: 10,
    periodId: selectedPeriod?.id || '',
    declarationTab
  }), [selectedPeriod?.id, declarationTab]);

  const declarationActions = useMemo(() => ({
    isDetail: true,
    isEdit: false,
    isDelete: !isPeriodClosed,
    isDeleteDisabled: (record: IConfirmationRequest) => {
      return record.status === STATUS_CODE.APPROVED || (record.status as any) === 'APPROVED';
    }
  }), [isPeriodClosed]);

  const noCompanyParamVariables = useMemo(() => ({
    page: 1,
    limit: 10,
    periodId: selectedPeriod?.id || '',
  }), [selectedPeriod?.id]);

  interface IGroupedDeclaration {
    key: string;
    companyName: string;
    companyAddress: string;
    internshipLocation: string;
    taxId: string;
    mentor: string;
    students: IConfirmationRequest[];
  }

  const groupedDeclarations = useMemo(() => {
    let rows = declarationsRows.filter((r: IConfirmationRequest) => {
      const isApproved = r.status === STATUS_CODE.APPROVED || r.status === STATUS_CODE.CHO_CAP_GIAY;
      const hasLocation = !!(r.internshipLocation || '').trim();
      return isApproved && hasLocation;
    });
    if (groupedStatusFilter !== 'all') {
      rows = rows.filter((r: IConfirmationRequest) => r.status === groupedStatusFilter);
    }

    const groupsMap = new Map<string, IGroupedDeclaration>();
    rows.forEach((row: IConfirmationRequest) => {
      const company = (row.companyName || '').trim();
      const address = (row.companyAddress || '').trim();
      const locClean = (row.internshipLocation || '').trim();
      
      const getNormalizedWard = (w: string) => {
        let name = w.toLowerCase().trim();
        name = name.replace(/^p\./, 'phường');
        name = name.replace(/\s+/g, ' ');
        return name;
      };

      const key = `${company.toLowerCase()}_${getNormalizedWard(locClean)}`;

      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          key,
          companyName: company,
          companyAddress: address,
          internshipLocation: locClean,
          taxId: row.taxId || '—',
          mentor: row.mentor || '—',
          students: [],
        });
      }
      groupsMap.get(key)!.students.push(row);
    });

    const kw = groupedKeyword.trim().toLowerCase();
    return Array.from(groupsMap.values()).filter((g) => {
      if (!kw) return true;
      const matchCompany = g.companyName.toLowerCase().includes(kw) || g.companyAddress.toLowerCase().includes(kw);
      const matchStudents = g.students.some((s) => s.studentName.toLowerCase().includes(kw) || s.studentId.toLowerCase().includes(kw));
      return matchCompany || matchStudents;
    });
  }, [declarationsRows, groupedStatusFilter, groupedKeyword]);

  const handlePrintGroupedPDF = (group: IGroupedDeclaration) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('Không thể mở cửa sổ in. Vui lòng tắt trình chặn popup của trình duyệt!');
      return;
    }

    const studentsHtml = group.students
      .map(
        (s, idx) => `
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid black; padding: 6px; text-align: center;">${idx + 1}</td>
        <td style="border: 1px solid black; padding: 6px; font-weight: bold;">${s.studentId}</td>
        <td style="border: 1px solid black; padding: 6px;">${s.studentName}</td>
        <td style="border: 1px solid black; padding: 6px; text-align: center;">${s.className}</td>
        <td style="border: 1px solid black; padding: 6px; text-align: center;">${s.studentPhone || '—'}</td>
      </tr>
    `
      )
      .join('');

    const today = new Date();
    const dayStr = today.getDate().toString().padStart(2, '0');
    const monthStr = (today.getMonth() + 1).toString().padStart(2, '0');
    const yearStr = today.getFullYear();

    const gvhdNames = Array.from(new Set(group.students.map((s) => s.gvhdName).filter(Boolean)));
    const gvhdText = gvhdNames.length > 0 ? gvhdNames.join(', ') : '(Nhà trường sẽ phân công sau)';
    const startDate = selectedPeriod?.startDate || '.../.../....';
    const endDate = selectedPeriod?.endDate || '.../.../....';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Công văn liên hệ thực tập tốt nghiệp</title>
        <meta charset="utf-8">
        <style>
          @media print {
            @page {
              size: A4;
              margin: 15mm 15mm 15mm 20mm;
            }
            body {
              font-family: "Times New Roman", Times, serif;
              font-size: 13pt;
              line-height: 1.4;
              color: #000;
              background: #fff;
            }
          }
          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 13pt;
            line-height: 1.4;
            margin: 20px;
            color: #000;
          }
          .page-break {
            page-break-before: always;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .header-table td {
            vertical-align: top;
          }
          .header-left {
            text-align: center;
          }
          .header-right {
            text-align: center;
          }
          .content-text {
            text-align: justify;
            margin-bottom: 14px;
          }
          .content-text.indent {
            text-indent: 1cm;
          }
          .title {
            text-align: center;
            margin-top: 20px;
            margin-bottom: 20px;
          }
          .title h1 {
            font-size: 14pt;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
          }
          .student-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 20px;
          }
          .student-table th, .student-table td {
            border: 1px solid black;
          }
          .student-table th {
            padding: 8px 6px;
            font-weight: bold;
            background-color: #f2f2f2;
            font-size: 12pt;
          }
          .footer-section {
            width: 100%;
            margin-top: 20px;
            border-collapse: collapse;
          }
          .footer-section td {
            width: 50%;
            text-align: center;
            vertical-align: top;
          }
          .footer-title {
            font-weight: bold;
            margin-bottom: 60px;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 50%;" class="header-left">
              <strong>BỘ CÔNG THƯƠNG</strong><br>
              <strong>TRƯỜNG CĐ KỸ THUẬT CAO THẮNG</strong>
            </td>
            <td style="width: 50%;" class="header-right">
              <strong>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
              <strong style="text-decoration: underline;">Độc lập – Tự do – Hạnh phúc</strong>
            </td>
          </tr>
          <tr>
            <td style="width: 50%;" class="header-left">
              <span style="font-style: italic;">Số:     &nbsp;/CĐKTCT-CTCT HSSV</span><br>
              <span style="font-style: italic;">V/v: Liên hệ thực tập tốt nghiệp</span>
            </td>
            <td style="width: 50%;" class="header-right">
              <span style="font-style: italic;">TP.Hồ Chí Minh, ngày ${dayStr} tháng ${monthStr} năm ${yearStr}</span>
            </td>
          </tr>
        </table>

        <p style="text-align: center; font-weight: bold; margin-top: 20px;">Kính gửi:</p>
        <p style="text-align: center; font-weight: bold;">CÔNG TY ${group.companyName}</p>

        <p class="content-text indent">
          Để thực hiện tốt nhiệm vụ đào tạo của trường, giúp cho sinh viên học tập trong nhà trường phối hợp thực hành, sản xuất nâng cao tay nghề từ thực tiễn tại nhà máy, công ty, cơ sở sản xuất.
        </p>
        <p class="content-text indent">
          Trường Cao đẳng Kỹ thuật Cao Thắng kính đề nghị Quý đơn vị:
        </p>
        <p class="content-text">* Tạo điều kiện cho: ${group.students.length} sinh viên (danh sách đính kèm)</p>
        <p class="content-text">* Đến thực tập sản xuất tại đơn vị theo ngành, nghề đào tạo: Quản trị mạng máy tính; Sửa chữa lắp ráp và cài đặt máy tính; Công nghệ thông tin.</p>
        <p class="content-text">* Với giảng viên hướng dẫn là Thầy/Cô: ${gvhdText}</p>
        <p class="content-text">* Thời gian thực tập từ ngày: ${startDate} đến ngày: ${endDate}</p>
        <p class="content-text">* Nội dung thực tập: theo đề cương thực tập (gửi kèm).</p>

        <p class="content-text indent">
          Nhà trường cùng với giảng viên hướng dẫn có trách nhiệm giáo dục, nhắc nhở sinh viên thuộc trường chấp hành nghiêm túc nội quy, quy định thực tập, sản xuất tại Quý đơn vị.
        </p>
        <p class="content-text indent">Rất mong được xem xét giải quyết.</p>
        <p class="content-text indent">Trân trọng kính chào./.</p>

        <table class="footer-section">
          <tr>
            <td></td>
            <td>
              <div class="footer-title">TL. HIỆU TRƯỞNG<br>TRƯỞNG PHÒNG CTCT-HSSV</div>
            </td>
          </tr>
        </table>

        <div class="page-break">
          <div class="title">
            <h1>Danh sách sinh viên thực tập tốt nghiệp</h1>
          </div>

          <table class="student-table">
            <thead>
              <tr>
                <th style="width: 8%;">STT</th>
                <th style="width: 18%;">MSSV</th>
                <th style="width: 34%;">Họ và tên</th>
                <th style="width: 20%;">Lớp</th>
                <th style="width: 20%;">SĐT</th>
              </tr>
            </thead>
            <tbody>
              ${studentsHtml}
            </tbody>
          </table>

          <table class="footer-section">
            <tr>
              <td></td>
              <td>
                <div class="footer-title">TL. HIỆU TRƯỞNG<br>TRƯỞNG PHÒNG CTCT-HS</div>
              </td>
            </tr>
          </table>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const groupedColumns = [
    { title: 'STT', key: 'index', width: 60, align: 'center' as const, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: 'Nơi thực tập', key: 'company', render: (_: unknown, record: IGroupedDeclaration) => (
      <div>
        <div className="font-bold text-navyDark">{record.companyName}</div>
        <div className="text-xs text-slate-500 mt-0.5">Địa chỉ: {record.companyAddress}</div>
        {record.internshipLocation && record.internshipLocation !== record.companyAddress && (
          <div className="text-xs text-slate-400 mt-0.5">Địa điểm làm việc: {record.internshipLocation}</div>
        )}
      </div>
    )},
    { title: 'Số lượng SV', dataIndex: 'students', key: 'count', width: 110, align: 'center' as const, render: (students: IConfirmationRequest[]) => (
      <Tag color="blue" className="m-0 font-medium px-2 py-0.5 rounded-full">{students.length} sinh viên</Tag>
    )},
    { title: 'Danh sách sinh viên', key: 'students_list', render: (_: unknown, record: IGroupedDeclaration) => (
      <div className="flex flex-col gap-1 max-w-md">
        {record.students.map((s) => (
          <div key={s.id} className="text-xs flex items-center gap-1.5">
            <span className="text-slate-400 font-mono">{s.studentId}</span>
            <span>-</span>
            <span className="font-medium text-slate-700">{s.studentName}</span>
            <span className="text-slate-400">({s.className})</span>
            {s.position && <span className="text-slate-500 font-normal">[{s.position}]</span>}
          </div>
        ))}
      </div>
    )},
    { title: t(getKey('action')), key: 'actions', width: 140, render: (_: unknown, record: IGroupedDeclaration) => (
      <Button type="primary" icon={<DownloadOutlined />} onClick={() => handlePrintGroupedPDF(record)}>
        In Giấy Gộp
      </Button>
    )}
  ];

  const handleDeclarationAction = (row: IConfirmationRequest, status: ConfirmationStatus) => {
    const meta = getConfirmationStatusMeta(t)[status];
    const targetLabel = meta.label.toLowerCase();
    updateDeclarationMutation.mutate(
      { id: row.id, body: { status }, index: 0, params: { page: 1, limit: 10 } },
      {
        onSuccess: () => {
          message.success(t(getKey('update_confirmation_success'), { name: row.studentName, status: targetLabel }));
        },
      }
    );
  };

  const handleExportIssuedList = () => {
    const approvedRows = declarationsRows.filter((r: IConfirmationRequest) => r.status === STATUS_CODE.APPROVED);
    if (approvedRows.length === 0) {
      message.warning('Không có sinh viên nào đã được cấp giấy xác nhận thực tập trong đợt này!');
      return;
    }
    const data = approvedRows.map((r: IConfirmationRequest, index: number) => ({
      'STT': index + 1,
      'MSSV': r.studentId,
      'Họ và tên': r.studentName,
      'Lớp': r.className,
      'Tên công ty': r.companyName,
      'Địa điểm thực tập': r.internshipLocation || r.companyAddress,
      'Vị trí thực tập': r.position || '',
      'Mã số thuế công ty': r.taxId,
      'Người hướng dẫn': r.mentor,
      'Ngày đăng ký': r.regDate,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DS cap giay xac nhan');
    XLSX.writeFile(workbook, `danh-sach-sv-cap-giay-xac-nhan-${selectedPeriod?.name || 'export'}.xlsx`);
  };

  const declarationColumns = [
    { title: t(getKey('stt')), key: 'index', width: 70, render: (_: unknown, __: IConfirmationRequest, index: number) => formatNumber(index + 1) },
    { title: t(getKey('student_info')), key: 'student', width: 240, ellipsis: true, render: (_: unknown, record: IConfirmationRequest) => (
      <div className="truncate">
        <div className="text-[var(--color-primary)] font-medium">{record.studentId}</div>
        <div className="truncate" title={record.studentName}>{record.studentName}</div>
        <div className="text-xs text-slate-500 truncate">{t(getKey('class_name'))}: {record.className}</div>
      </div>
    ) },
    { title: t(getKey('company_info')), key: 'company', ellipsis: true, render: (_: unknown, record: IConfirmationRequest) => (
      <div className="text-sm truncate">
        <div className="font-medium text-slate-900 truncate" title={record.companyName}>{record.companyName}</div>
        <div className="text-xs text-slate-500 truncate" title={record.companyAddress}>{t(getKey('company_address'))}: {record.companyAddress}</div>
        <div className="text-xs text-slate-500 truncate" title={record.internshipLocation}>{t(getKey('internship_location'))}: {record.internshipLocation}</div>
        <div className="text-xs text-slate-500 truncate" title={record.position}>{t(getKey('internship_position'))}: {record.position || '—'}</div>
        <div className="text-xs text-slate-500 truncate">{t(getKey('company_tax_id'))}: {record.taxId}</div>
        <div className="text-xs text-slate-500 truncate">{t(getKey('mentor'))}: {record.mentor}</div>
      </div>
    ) },
    { title: t(getKey('registration_date')), dataIndex: 'regDate', key: 'regDate', width: 130, render: (v: string) => <span className="text-slate-600">{v}</span> },
    { title: 'Trạng thái', key: 'status', width: 140, render: (_: unknown, record: IConfirmationRequest) => {
      if (record.status === STATUS_CODE.APPROVED) {
        const hasPaper = !!(record.internshipLocation || '').trim();
        if (hasPaper) {
          return <Tag className="m-0 rounded-full px-[10px] py-0 border-none bg-blue-50 text-[#1976D2]">Đã cấp</Tag>;
        } else {
          return <Tag className="m-0 rounded-full px-[10px] py-0 border-none bg-green-50 text-[var(--color-green-medium)]">Đã duyệt</Tag>;
        }
      }
      const meta = getConfirmationStatusMeta(t)[record.status] || { label: record.status || 'Chờ duyệt', className: 'bg-[var(--color-gold-light)] text-[var(--color-gold-medium)]' };
      return <Tag className={cn("m-0 rounded-full px-[10px] py-0 border-none", meta.className)}>{meta.label}</Tag>;
    } },
    { title: 'Duyệt & Cấp giấy', key: 'cert', width: 135, render: (_: unknown, record: IConfirmationRequest) => (
      <Space size={8}>
        {record.status === STATUS_CODE.CHO_CAP_GIAY ? (
          <>
            <Button
              type="text"
              size="small"
              className="!px-2"
              title="Xác nhận đã cấp giấy"
              onClick={() => handleDeclarationAction(record, STATUS_CODE.APPROVED)}
              disabled={isPeriodClosed}
            >
              <CheckCircleOutlined className="text-[var(--color-green-medium)]" />
            </Button>
            <Button
              type="text"
              size="small"
              danger
              className="!px-2"
              title="Từ chối/Hủy"
              onClick={() => handleDeclarationAction(record, STATUS_CODE.REJECTED)}
              disabled={isPeriodClosed}
            >
              <CloseCircleOutlined />
            </Button>
          </>
        ) : (
          <>
            <Button
              type="text"
              size="small"
              className="!px-2"
              title={t(getKey('accept')) || 'Duyệt'}
              onClick={() => handleDeclarationAction(record, STATUS_CODE.APPROVED)}
              disabled={record.status === STATUS_CODE.APPROVED || isPeriodClosed}
            >
              <CheckCircleOutlined className="text-[var(--color-green-medium)]" />
            </Button>
            <Button
              type="text"
              size="small"
              danger
              className="!px-2"
              title={t(getKey('reject')) || 'Từ chối'}
              onClick={() => handleDeclarationAction(record, STATUS_CODE.REJECTED)}
              disabled={record.status === STATUS_CODE.APPROVED || record.status === STATUS_CODE.REJECTED || isPeriodClosed}
            >
              <CloseCircleOutlined />
            </Button>
          </>
        )}
      </Space>
    ) },
  ];

  const noCompanyColumns = [
    { title: t(getKey('stt')), key: 'index', width: 70, render: (_: unknown, __: INoCompanyStudent, index: number) => formatNumber(index + 1) },
    { title: t(getKey('student_id')), dataIndex: 'studentId', key: 'studentId', width: 140, render: (v: string) => <span className="text-[var(--color-primary)] font-medium">{v}</span> },
    { title: t(getKey('student_name')), dataIndex: 'studentName', key: 'studentName', ellipsis: true },
    { title: t(getKey('class_name')), dataIndex: 'className', key: 'className', width: 130 },
    { title: t(getKey('phone_number')), dataIndex: 'phone', key: 'phone', width: 140 },
    { title: t(getKey('mentor')) || 'Giáo viên hướng dẫn', dataIndex: 'supervisor', key: 'supervisor', render: (value: string) => value ? <Tag color="blue">{value}</Tag> : <span className="text-slate-400">Chưa phân công</span> },
    { title: t(getKey('status')), dataIndex: 'status', key: 'status', width: 160, render: (status: NoCompanyStatus) => {
      const meta = getNoCompanyStatusMeta(t)[status] || { label: status || 'Chưa có công ty', className: 'bg-[var(--color-red-light)] text-[var(--color-red-medium)]' };
      return <Tag className={cn("m-0 rounded-full px-[10px] py-0 border-none", meta.className)}>{meta.label}</Tag>;
    } },
  ];

  return (
    <div className={cn('pb-4')}>
      <div className={cn('mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]')}>
        <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-md)]/10 px-3 py-1 text-xs font-medium text-[var(--color-blue-login-mid)]')}>
          <SolutionOutlined /> {t(getKey('internship_students'))}
        </div>
        <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between')}>
          <div>
            <Typography.Title level={1} className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">
              {mode === 'declarations'
                ? t(getKey('internship_students_declarations'))
                : t(getKey('internship_students_nocompany'))}
            </Typography.Title>
            <p className={cn('mt-2 mb-0 text-[18px] leading-[26px] text-grayDark')}>{t(getKey('internship_students_desc'))}</p>
          </div>
        </div>
      </div>

      {selectedPeriod && (
        <div className={cn(
          "mb-5 p-4 rounded-[18px] border flex items-center justify-between shadow-[0_12px_28px_rgba(15,23,42,0.02)]",
          isPeriodClosed ? "bg-[var(--color-red-light)] border-[var(--color-red-medium)] text-[var(--color-red-medium)]" : "bg-[var(--color-blue-light)] border-[var(--color-blue-medium)] text-[var(--color-primary)]"
        )}>
          <div>
            {t(getKey('viewing_internship_of'))}: <strong className="underline">{selectedPeriod.name}</strong>
            {isPeriodClosed && ` (${t(getKey('read_only_data_locked'))})`}
          </div>
          {isPeriodClosed && <Tag className="bg-[var(--color-red-light)] text-[var(--color-red-medium)] border-[var(--color-red-medium)] m-0">{t(getKey('read_only_tag'))}</Tag>}
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: mode === 'declarations' ? 'Tổng khai báo' : t(getKey('total_registered')), value: summary.total, color: 'bg-[var(--color-primary)]', icon: <FileTextOutlined /> },
          { label: mode === 'declarations' ? 'Khai báo chờ duyệt' : t(getKey('pending_issue')), value: summary.pending, color: 'bg-[var(--color-gold-medium)]', icon: <ClockCircleOutlined /> },
          { label: mode === 'declarations' ? 'Khai báo đã duyệt' : t(getKey('approved_issue')), value: summary.approved, color: 'bg-[var(--color-green-medium)]', icon: <CheckCircleOutlined /> },
          { label: t(getKey('no_company')), value: summary.noCompany, color: 'bg-[var(--color-red-medium)]', icon: <CloseCircleOutlined /> },
        ].map((item) => (
          <Card key={item.label} className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="mt-2 text-3xl font-bold text-navyDark">{formatNumber(item.value)}</div>
              </div>
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl text-white', item.color)}>{item.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {mode === 'declarations' && (
        <div className="mb-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <Tabs
            activeKey={declarationTab}
            onChange={(key) => setDeclarationTab(key as ConfirmationTab)}
            items={[
              { key: 'pending', label: `Chờ duyệt (${formatNumber(declarationTabCounts.pending)})`, icon: <ClockCircleOutlined /> },
              { key: 'cho_cap_giay', label: `Chờ cấp giấy (${formatNumber(declarationTabCounts.cho_cap_giay)})`, icon: <FileTextOutlined /> },
              { key: 'approved', label: `Đã xong (${formatNumber(declarationTabCounts.approved)})`, icon: <CheckCircleOutlined /> },
              { key: 'rejected', label: `Bị từ chối (${formatNumber(declarationTabCounts.rejected)})`, icon: <CloseCircleOutlined /> },
              { key: 'grouped', label: `Gộp theo nơi thực tập (${formatNumber(declarationTabCounts.grouped)})`, icon: <BankOutlined /> },
            ]}
            className="batch-tabs"
          />
        </div>
      )}

      {mode === 'declarations' && declarationTab === 'grouped' ? (
        <Card key="grouped-view" className="overflow-hidden rounded-[18px] border border-slate-100 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <Input
                allowClear
                placeholder="Tìm theo tên công ty, địa chỉ, MSSV, tên sinh viên..."
                prefix={<SearchOutlined className="text-slate-400" />}
                value={groupedKeyword}
                onChange={(e) => setGroupedKeyword(e.target.value)}
                className="!h-11 max-w-md !rounded-[12px] !border-slate-300"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">Trạng thái SV:</span>
              <Select
                value={groupedStatusFilter}
                onChange={(v) => setGroupedStatusFilter(v)}
                className="!h-11 w-[200px]"
                options={[
                  { value: 'all', label: 'Tất cả (Chờ duyệt/Đã xong)' },
                  { value: STATUS_CODE.CHO_CAP_GIAY, label: 'Chờ cấp giấy' },
                  { value: STATUS_CODE.APPROVED, label: 'Đã cấp giấy/Đã xong' },
                  { value: STATUS_CODE.PENDING, label: 'Chờ duyệt' }
                ]}
              />
            </div>
          </div>
          <Table
            rowKey="key"
            dataSource={groupedDeclarations}
            columns={groupedColumns}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </Card>
      ) : mode === 'declarations' ? (
        <Card key="normal-view-declarations" className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <FilterTable<IConfirmationRequest, IConfirmationRequest | undefined, ICreateConfirmationRequest, IUpdateConfirmationRequest>
            key="table-declarations"
            title={t(getKey('internship_students_declarations'))}
            columns={declarationColumns}
            useQueryHook={useFilteredDeclarationListQuery}
            paramVariables={declarationParamVariables}
            actions={declarationActions}
            updateInfo={isPeriodClosed ? undefined : { type: 'modal', modalInfo: { modalContent: <ConfirmationForm />, modalProps: { centered: true, width: 720, title: t(getKey('edit_profile')) }, modalFunc: updateDeclarationMutation } }}
            deleteInfo={isPeriodClosed ? undefined : { type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: deleteDeclarationMutation as unknown as UseMutationResult<IConfirmationRequest, AxiosError, { id: string; params: BaseListParams }> } }}
            detailInfo={{ type: 'modal', modalInfo: { modalContent: <ConfirmationForm disabled />, modalProps: { centered: true, width: 720, title: t(getKey('detail_profile')), footer: null }, modalFunc: internshipHooks.useFetchDetailDeclaration } }}
            formatInitialValues={(d) => ({ studentId: d?.studentId ?? '', studentName: d?.studentName ?? '', className: d?.className ?? '', regDate: d?.regDate ?? '', companyName: d?.companyName ?? '', companyAddress: d?.companyAddress ?? '', internshipLocation: d?.internshipLocation ?? '', position: d?.position ?? '', taxId: d?.taxId ?? '', mentor: d?.mentor ?? '', status: d?.status ?? STATUS_CODE.PENDING })}
            formatFormValues={(v) => v as unknown as ICreateConfirmationRequest}
            filterRender={() => (
              <div className="mb-4">
                <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-start">
                  <div className="grid flex-1 grid-cols-1 gap-3 xl:grid-cols-12">
                    <Form.Item name="keyword" className="xl:col-span-5 !mb-0">
                      <Input allowClear prefix={<SearchOutlined className="text-slate-400" />} placeholder={t(getKey('search_student_company_placeholder'))} className="!h-11 !rounded-[12px] !border-slate-300" />
                    </Form.Item>
                    <Form.Item name="companyName" className="xl:col-span-4 !mb-0" initialValue="all">
                      <Select
                        allowClear
                        showSearch
                        placeholder={t(getKey('filter_company_name_placeholder'))}
                        className="!h-11 w-full"
                        options={[
                          { value: 'all', label: 'Tất cả công ty' },
                          ...companiesList.map((c) => ({ value: c.name, label: c.name }))
                        ]}
                        optionFilterProp="label"
                      />
                    </Form.Item>
                    <Form.Item name="className" className="xl:col-span-3 !mb-0">
                      <Select allowClear placeholder={t(getKey('all_classes'))} className="!h-11 !w-full" options={[{ value: 'all', label: t(getKey('all_classes')) }, ...classOptions.map((c) => ({ value: c, label: c }))]} />
                    </Form.Item>
                  </div>
                  <Button icon={<DownloadOutlined />} className="!h-11" onClick={handleExportIssuedList}>
                    Xuất DS cấp giấy
                  </Button>
                </div>
              </div>
            )}
          />
        </Card>
      ) : (
        <Card key="no-company-view" className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <FilterTable<INoCompanyStudent, INoCompanyStudent | undefined, ICreateNoCompanyStudent, IUpdateNoCompanyStudent>
            key="no-company-table"
            title={t(getKey('internship_students_nocompany'))}
            columns={noCompanyColumns}
            useQueryHook={useFilteredNoCompanyListQuery}
            paramVariables={noCompanyParamVariables}
            updateInfo={isPeriodClosed ? undefined : { type: 'modal', modalInfo: { modalContent: <StudentForm />, modalProps: { centered: true, width: 720, title: t(getKey('edit_student')) }, modalFunc: updateNoCompanyMutation } }}
            deleteInfo={isPeriodClosed ? undefined : { type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: deleteNoCompanyMutation as unknown as import('@tanstack/react-query').UseMutationResult<INoCompanyStudent, import('axios').AxiosError, { id: string; params: BaseListParams }> } }}
            detailInfo={{ type: 'modal', modalInfo: { modalContent: <StudentForm disabled />, modalProps: { centered: true, width: 720, title: t(getKey('detail_student')), footer: null }, modalFunc: internshipHooks.useFetchDetailNoCompanyStudent } }}
            formatInitialValues={(d) => ({ studentId: d?.studentId ?? '', studentName: d?.studentName ?? '', className: d?.className ?? '', phone: d?.phone ?? '', status: d?.status ?? STATUS_CODE.NOT_REGISTERED, companyName: d?.companyName ?? '—', internshipLocation: d?.internshipLocation ?? '—' })}
            formatFormValues={(v) => v as unknown as ICreateNoCompanyStudent}
            filterRender={() => (
              <div className="mb-4">
                <div className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
                  <Form.Item name="keyword" className="xl:col-span-4 !mb-0">
                    <Input allowClear prefix={<SearchOutlined className="text-slate-400" />} placeholder={t(getKey('search_student_no_company_placeholder'))} className="!h-11 !rounded-[12px] !border-slate-300" />
                  </Form.Item>
                  <Form.Item name="className" className="xl:col-span-2 !mb-0">
                    <Select allowClear placeholder={t(getKey('all_classes'))} className="!h-11 !w-full" options={[{ value: 'all', label: t(getKey('all_classes')) }, ...classOptions.map((c) => ({ value: c, label: c }))]} />
                  </Form.Item>
                  <Form.Item name="noCompanyTab" className="xl:col-span-3 !mb-0" initialValue="all">
                    <Select className="!h-11 !w-full" options={[
                      { value: 'all', label: t(getKey('all_list')) },
                      { value: STATUS_CODE.NOT_REGISTERED, label: t(getKey('not_registered_list')) },
                      { value: STATUS_CODE.HAS_COMPANY, label: t(getKey('has_company_list')) },
                    ]} />
                  </Form.Item>
                  <Form.Item name="assignmentStatus" className="xl:col-span-3 !mb-0" initialValue="all">
                    <Select className="!h-11 !w-full" options={[
                      { value: 'all', label: 'Tất cả trạng thái phân công' },
                      { value: 'assigned', label: 'Đã phân công GVHD' },
                      { value: 'unassigned', label: 'Chưa phân công GVHD' }
                    ]} />
                  </Form.Item>
                </div>
              </div>
            )}
            actions={{ isDetail: true, isEdit: false, isDelete: !isPeriodClosed }}
          />
        </Card>
      )}

      <RemindModal open={remindOpen} onCancel={() => setRemindOpen(false)} onOk={() => { setRemindOpen(false); message.success(t(getKey('remind_all_success_msg'))); }} count={summary.noCompany} showing={noCompanyRows.length} approved={summary.approved} />
    </div>
  );
};

export default InternshipStudentsPage;
