import { BankOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DownloadOutlined, FileTextOutlined, SearchOutlined, SolutionOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Select, Space, Tag, Tabs, Typography, message } from 'antd';
import * as XLSX from 'xlsx';
import RemindModal from './components/RemindModal';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn, STATUS_CODE } from '../../constants/commonConst';
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

type ModeKey = 'confirmations' | 'no-company' | 'declarations';
type ConfirmationTab = 'all' | ConfirmationStatus;
type NoCompanyTab = 'all' | NoCompanyStatus;

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

const InternshipStudentsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { selectedPeriod } = useGlobalVariable();
  const mode: ModeKey = location.pathname.includes('/no-company')
    ? 'no-company'
    : location.pathname.includes('/declarations')
    ? 'declarations'
    : 'confirmations';
  const [confirmationTab, setConfirmationTab] = useState<ConfirmationTab>('all');
  const [declarationTab, setDeclarationTab] = useState<ConfirmationTab>('pending');
  const [noCompanyTab, setNoCompanyTab] = useState<NoCompanyTab>('all');
  const [remindOpen, setRemindOpen] = useState(false);

  const { data: confirmationList } = internshipHooks.useFetchListConfirmationRequests({ periodId: selectedPeriod?.id });
  const { data: declarationsList } = internshipHooks.useFetchListDeclarations({ periodId: selectedPeriod?.id });
  const { data: noCompanyList } = internshipHooks.useFetchListNoCompanyStudents({ periodId: selectedPeriod?.id });
  const { data: companiesData } = companyHooks.useFetchListCompanies();

  const companiesList = useMemo(() => (companiesData?.rows ?? []) as IListCompany[], [companiesData]);

  const updateConfirmationMutation = internshipHooks.useUpdateConfirmationRequest();
  const deleteConfirmationMutation = internshipHooks.useDeleteConfirmationRequest();
  const updateDeclarationMutation = internshipHooks.useUpdateDeclaration();
  const deleteDeclarationMutation = internshipHooks.useDeleteDeclaration();
  const updateNoCompanyMutation = internshipHooks.useUpdateNoCompanyStudent();
  const deleteNoCompanyMutation = internshipHooks.useDeleteNoCompanyStudent();

  const confirmationRows = confirmationList?.rows ?? INITIAL_CONFIRMATIONS;
  const declarationsRows = declarationsList?.rows ?? INITIAL_CONFIRMATIONS;
  const noCompanyRows = noCompanyList?.rows ?? INITIAL_NO_COMPANY_STUDENTS;
  const isPeriodClosed = selectedPeriod?.status === STATUS_CODE.CLOSED;

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

  const confirmationTabCounts = useMemo(() => ({
    total: confirmationRows.length,
    pending: confirmationRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.PENDING).length,
    approved: confirmationRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.APPROVED).length,
    rejected: confirmationRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.REJECTED).length,
  }), [confirmationRows]);

  const declarationTabCounts = useMemo(() => ({
    total: declarationsRows.length,
    pending: declarationsRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.PENDING).length,
    cho_cap_giay: declarationsRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.CHO_CAP_GIAY).length,
    approved: declarationsRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.APPROVED).length,
    rejected: declarationsRows.filter((item: IConfirmationRequest) => item.status === STATUS_CODE.REJECTED).length,
  }), [declarationsRows]);

  const noCompanyTabCounts = useMemo(() => ({
    total: noCompanyRows.length,
    not_registered: noCompanyRows.filter((item: INoCompanyStudent) => item.status === STATUS_CODE.NOT_REGISTERED).length,
    has_company: noCompanyRows.filter((item: INoCompanyStudent) => item.status === STATUS_CODE.HAS_COMPANY).length,
  }), [noCompanyRows]);

  const useFilteredConfirmationListQuery = (params: BaseListParams) => {
    const query = internshipHooks.useFetchListConfirmationRequests({ periodId: selectedPeriod?.id });
    const typedParams = params as BaseListParams & { keyword?: string; companyName?: string; className?: string };
    const keyword = (typedParams.keyword ?? '').trim().toLowerCase();
    const companyName = typedParams.companyName || 'all';
    const className = typedParams.className || 'all';
    const status = confirmationTab || 'all';

    const sourceRows = (query.data?.rows ?? confirmationList ?? INITIAL_CONFIRMATIONS) as IConfirmationRequest[];
    const filteredRows = sourceRows
      .filter((r) => (status === 'all' ? true : r.status === status))
      .filter((r) => (className === 'all' ? true : r.className === className))
      .filter((r) => (companyName === 'all' || !companyName ? true : r.companyName.toLowerCase() === companyName.toLowerCase()))
      .filter((r) => !keyword || [r.studentId, r.studentName, r.className, r.companyName, r.taxId].join(' ').toLowerCase().includes(keyword));

    return {
      ...query,
      data: query.data
        ? ({ ...query.data, rows: filteredRows, total: filteredRows.length } as ListResponseTypeObject<IConfirmationRequest>)
        : query.data,
    } as UseQueryResult<ListResponseTypeObject<IConfirmationRequest>, Error>;
  };

  const useFilteredDeclarationListQuery = (params: BaseListParams) => {
    const query = internshipHooks.useFetchListDeclarations({ periodId: selectedPeriod?.id });
    const typedParams = params as BaseListParams & { keyword?: string; companyName?: string; className?: string };
    const keyword = (typedParams.keyword ?? '').trim().toLowerCase();
    const companyName = typedParams.companyName || 'all';
    const className = typedParams.className || 'all';
    const status = declarationTab || 'all';

    const sourceRows = (query.data?.rows ?? declarationsList ?? INITIAL_CONFIRMATIONS) as IConfirmationRequest[];
    const filteredRows = sourceRows
      .filter((r) => (status === 'all' ? true : r.status === status))
      .filter((r) => (className === 'all' ? true : r.className === className))
      .filter((r) => (companyName === 'all' || !companyName ? true : r.companyName.toLowerCase() === companyName.toLowerCase()))
      .filter((r) => !keyword || [r.studentId, r.studentName, r.className, r.companyName, r.taxId].join(' ').toLowerCase().includes(keyword));

    return {
      ...query,
      data: query.data
        ? ({ ...query.data, rows: filteredRows, total: filteredRows.length } as ListResponseTypeObject<IConfirmationRequest>)
        : query.data,
    } as UseQueryResult<ListResponseTypeObject<IConfirmationRequest>, Error>;
  };

  const useFilteredNoCompanyListQuery = (params: BaseListParams) => {
    const query = internshipHooks.useFetchListNoCompanyStudents({ periodId: selectedPeriod?.id });
    const typedParams = params as BaseListParams & { keyword?: string; className?: string; assignmentStatus?: string };
    const keyword = (typedParams.keyword ?? '').trim().toLowerCase();
    const status = noCompanyTab || 'all';
    const className = typedParams.className || 'all';
    const assignmentStatus = typedParams.assignmentStatus || 'all';

    const sourceRows2 = (query.data?.rows ?? noCompanyList ?? INITIAL_NO_COMPANY_STUDENTS) as INoCompanyStudent[];
    const filteredRows = sourceRows2
      .filter((r) => (status === 'all' || status === undefined ? true : r.status === status))
      .filter((r) => (className === 'all' ? true : r.className === className))
      .filter((r) => {
        if (assignmentStatus === 'all') return true;
        return r.assignmentStatus === assignmentStatus;
      })
      .filter((r) => !keyword || [r.studentId, r.studentName, r.phone, r.supervisor || ''].join(' ').toLowerCase().includes(keyword));

    return {
      ...query,
      data: query.data
        ? ({ ...query.data, rows: filteredRows, total: filteredRows.length } as ListResponseTypeObject<INoCompanyStudent>)
        : query.data,
    } as UseQueryResult<ListResponseTypeObject<INoCompanyStudent>, Error>;
  };

  const createCompanyMutation = companyHooks.useCreateCompany();

  const handleConfirmationAction = (row: IConfirmationRequest, status: ConfirmationStatus) => {
    const meta = getConfirmationStatusMeta(t)[status];
    const targetLabel = meta.label.toLowerCase();
    updateConfirmationMutation.mutate(
      { id: row.id, body: { status }, index: 0, params: { page: 1, limit: 10 } },
      {
        onSuccess: () => {
          message.success(t(getKey('update_confirmation_success'), { name: row.studentName, status: targetLabel }));
          
          if (status === STATUS_CODE.APPROVED) {
            if (!row.taxId?.trim()) {
              message.warning(`Sinh viên "${row.studentName}" thiếu mã số thuế công ty, vui lòng bổ sung để công ty "${row.companyName}" được tự động thêm vào danh sách đối tác.`);
              return;
            }
            createCompanyMutation.mutate(
              {
                body: {
                  name: row.companyName,
                  taxId: row.taxId,
                  field: 'Tự liên hệ',
                  contact: row.mentor || 'Chưa cập nhật',
                  phone: '',
                  email: '',
                  status: 'active',
                  reviewStatus: 'approved',
                },
                params: { page: 1, limit: 10 },
              },
              {
                onSuccess: () => {
                  message.success(`Đã tự động thêm công ty "${row.companyName}" vào danh sách đối tác!`);
                },
                onError: (err: AxiosError) => {
                  console.error('Failed to auto-create company:', err);
                  const msg = (err?.response?.data as { message?: string } | undefined)?.message || '';
                  if (msg.includes('tồn tại') || msg.includes('exist')) {
                    message.info(`Công ty "${row.companyName}" đã có sẵn trong danh sách.`);
                  } else {
                    message.warning(`Không thể tự động thêm công ty vào danh sách (Lỗi: ${msg || err.message}).`);
                  }
                },
              }
            );
          }
        },
      }
    );
  };

  const handleDeclarationAction = (row: IConfirmationRequest, status: ConfirmationStatus) => {
    const meta = getConfirmationStatusMeta(t)[status];
    const targetLabel = meta.label.toLowerCase();
    updateDeclarationMutation.mutate(
      { id: row.id, body: { status }, index: 0, params: { page: 1, limit: 10 } },
      {
        onSuccess: () => {
          message.success(t(getKey('update_confirmation_success'), { name: row.studentName, status: targetLabel }));
          
          if (status === STATUS_CODE.APPROVED) {
            if (!row.taxId?.trim()) {
              message.warning(`Sinh viên "${row.studentName}" thiếu mã số thuế công ty, vui lòng bổ sung để công ty "${row.companyName}" được tự động thêm vào danh sách đối tác.`);
              return;
            }
            createCompanyMutation.mutate(
              {
                body: {
                  name: row.companyName,
                  taxId: row.taxId,
                  field: 'Tự liên hệ',
                  contact: row.mentor || 'Chưa cập nhật',
                  phone: '',
                  email: '',
                  status: 'active',
                  reviewStatus: 'approved',
                },
                params: { page: 1, limit: 10 },
              },
              {
                onSuccess: () => {
                  message.success(`Đã tự động thêm công ty "${row.companyName}" vào danh sách đối tác!`);
                },
                onError: (err: AxiosError) => {
                  console.error('Failed to auto-create company:', err);
                  const msg = (err?.response?.data as { message?: string } | undefined)?.message || '';
                  if (msg.includes('tồn tại') || msg.includes('exist')) {
                    message.info(`Công ty "${row.companyName}" đã có sẵn trong danh sách.`);
                  } else {
                    message.warning(`Không thể tự động thêm công ty vào danh sách (Lỗi: ${msg || err.message}).`);
                  }
                },
              }
            );
          }
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

  const confirmationColumns = [
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
    { title: t(getKey('issued_status')), key: 'status', width: 140, render: (_: unknown, record: IConfirmationRequest) => {
      const meta = getConfirmationStatusMeta(t)[record.status] || { label: record.status || 'Chờ duyệt', className: 'bg-[var(--color-gold-light)] text-[var(--color-gold-medium)]' };
      return <Tag className={cn("m-0 rounded-full px-[10px] py-0 border-none", meta.className)}>{meta.label}</Tag>;
    } },
    { title: 'Cấp giấy giới thiệu', key: 'cert', width: 130, render: (_: unknown, record: IConfirmationRequest) => (
      <Space size={8}>
        <Button
          type="text"
          size="small"
          className="!px-2"
          title={t(getKey('approve_cert'))}
          onClick={() => handleConfirmationAction(record, STATUS_CODE.APPROVED)}
          disabled={record.status === STATUS_CODE.APPROVED || isPeriodClosed}
        >
          <CheckCircleOutlined className="text-[var(--color-green-medium)]" />
        </Button>
        <Button
          type="text"
          size="small"
          danger
          className="!px-2"
          title={t(getKey('reject_cert'))}
          onClick={() => handleConfirmationAction(record, STATUS_CODE.REJECTED)}
          disabled={record.status === STATUS_CODE.APPROVED || record.status === STATUS_CODE.REJECTED || isPeriodClosed}
        >
          <CloseCircleOutlined />
        </Button>
      </Space>
    ) },
  ];

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
    { title: t(getKey('issued_status')), key: 'status', width: 140, render: (_: unknown, record: IConfirmationRequest) => {
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
                : mode === 'confirmations'
                ? t(getKey('internship_students_confirm'))
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

      <div className="mb-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <Tabs
          activeKey={mode === 'confirmations' ? confirmationTab : mode === 'declarations' ? declarationTab : noCompanyTab}
          onChange={(key) => {
            if (mode === 'confirmations') setConfirmationTab(key as ConfirmationTab);
            else if (mode === 'declarations') setDeclarationTab(key as ConfirmationTab);
            else setNoCompanyTab(key as NoCompanyTab);
          }}
          items={mode === 'confirmations' ? [
            { key: 'all', label: `${t(getKey('all_list'))} (${formatNumber(confirmationTabCounts.total)})`, icon: <BankOutlined /> },
            { key: 'pending', label: `${t(getKey('pending_list'))} (${formatNumber(confirmationTabCounts.pending)})`, icon: <ClockCircleOutlined /> },
            { key: 'approved', label: `${t(getKey('approved_list'))} (${formatNumber(confirmationTabCounts.approved)})`, icon: <CheckCircleOutlined /> },
            { key: 'rejected', label: `${t(getKey('rejected_list'))} (${formatNumber(confirmationTabCounts.rejected)})`, icon: <CloseCircleOutlined /> },
          ] : mode === 'declarations' ? [
            { key: 'pending', label: `Chờ duyệt (${formatNumber(declarationTabCounts.pending)})`, icon: <ClockCircleOutlined /> },
            { key: 'cho_cap_giay', label: `Chờ cấp giấy (${formatNumber(declarationTabCounts.cho_cap_giay)})`, icon: <FileTextOutlined /> },
            { key: 'approved', label: `Đã xong (${formatNumber(declarationTabCounts.approved)})`, icon: <CheckCircleOutlined /> },
            { key: 'rejected', label: `Bị từ chối (${formatNumber(declarationTabCounts.rejected)})`, icon: <CloseCircleOutlined /> },
          ] : [
            { key: 'all', label: `${t(getKey('all_list'))} (${formatNumber(noCompanyTabCounts.total)})`, icon: <BankOutlined /> },
            { key: 'not_registered', label: `${t(getKey('not_registered_list'))} (${formatNumber(noCompanyTabCounts.not_registered)})`, icon: <CloseCircleOutlined /> },
            { key: 'has_company', label: `${t(getKey('has_company_list'))} (${formatNumber(noCompanyTabCounts.has_company)})`, icon: <CheckCircleOutlined /> },
          ]}
          className="batch-tabs"
        />
      </div>

      {mode === 'confirmations' || mode === 'declarations' ? (
        <Card className="overflow-hidden rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <FilterTable<IConfirmationRequest, IConfirmationRequest | undefined, ICreateConfirmationRequest, IUpdateConfirmationRequest>
            key={mode}
            title={mode === 'declarations' ? t(getKey('internship_students_declarations')) : t(getKey('internship_students_confirm'))}
            columns={mode === 'declarations' ? declarationColumns : confirmationColumns}
            useQueryHook={mode === 'declarations' ? useFilteredDeclarationListQuery : useFilteredConfirmationListQuery}
            paramVariables={useMemo(() => ({ page: 1, limit: 10, periodId: selectedPeriod?.id || '' }), [selectedPeriod?.id])}
            actions={useMemo(() => ({ isDetail: true, isEdit: !isPeriodClosed, isDelete: !isPeriodClosed }), [isPeriodClosed])}
            updateInfo={isPeriodClosed ? undefined : { type: 'modal', modalInfo: { modalContent: <ConfirmationForm />, modalProps: { centered: true, width: 720, title: t(getKey('edit_profile')) }, modalFunc: mode === 'declarations' ? updateDeclarationMutation : updateConfirmationMutation } }}
            deleteInfo={isPeriodClosed ? undefined : { type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: (mode === 'declarations' ? deleteDeclarationMutation : deleteConfirmationMutation) as unknown as UseMutationResult<IConfirmationRequest, AxiosError, { id: string; params: BaseListParams }> } }}
            detailInfo={{ type: 'modal', modalInfo: { modalContent: <ConfirmationForm disabled />, modalProps: { centered: true, width: 720, title: t(getKey('detail_profile')), footer: null }, modalFunc: mode === 'declarations' ? internshipHooks.useFetchDetailDeclaration : internshipHooks.useFetchDetailConfirmationRequest } }}
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
                  {mode === 'declarations' && (
                    <Button icon={<DownloadOutlined />} className="!h-11" onClick={handleExportIssuedList}>
                      Xuất DS cấp giấy
                    </Button>
                  )}
                </div>
              </div>
            )}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <FilterTable<INoCompanyStudent, INoCompanyStudent | undefined, ICreateNoCompanyStudent, IUpdateNoCompanyStudent>
            key={mode}
            title={t(getKey('internship_students_nocompany'))}
            columns={noCompanyColumns}
            useQueryHook={useFilteredNoCompanyListQuery}
            paramVariables={useMemo(() => ({ page: 1, limit: 10, periodId: selectedPeriod?.id || '' }), [selectedPeriod?.id])}
            updateInfo={isPeriodClosed ? undefined : { type: 'modal', modalInfo: { modalContent: <StudentForm />, modalProps: { centered: true, width: 720, title: t(getKey('edit_student')) }, modalFunc: updateNoCompanyMutation } }}
            deleteInfo={isPeriodClosed ? undefined : { type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: deleteNoCompanyMutation as unknown as import('@tanstack/react-query').UseMutationResult<INoCompanyStudent, import('axios').AxiosError, { id: string; params: BaseListParams }> } }}
            detailInfo={{ type: 'modal', modalInfo: { modalContent: <StudentForm disabled />, modalProps: { centered: true, width: 720, title: t(getKey('detail_student')), footer: null }, modalFunc: internshipHooks.useFetchDetailNoCompanyStudent } }}
            formatInitialValues={(d) => ({ studentId: d?.studentId ?? '', studentName: d?.studentName ?? '', className: d?.className ?? '', phone: d?.phone ?? '', status: d?.status ?? STATUS_CODE.NOT_REGISTERED, companyName: d?.companyName ?? '—', internshipLocation: d?.internshipLocation ?? '—' })}
            formatFormValues={(v) => v as unknown as ICreateNoCompanyStudent}
            filterRender={() => (
              <div className="mb-4">
                <div className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
                  <Form.Item name="keyword" className="xl:col-span-5 !mb-0">
                    <Input allowClear prefix={<SearchOutlined className="text-slate-400" />} placeholder={t(getKey('search_student_no_company_placeholder'))} className="!h-11 !rounded-[12px] !border-slate-300" />
                  </Form.Item>
                  <Form.Item name="className" className="xl:col-span-3 !mb-0">
                    <Select allowClear placeholder={t(getKey('all_classes'))} className="!h-11 !w-full" options={[{ value: 'all', label: t(getKey('all_classes')) }, ...classOptions.map((c) => ({ value: c, label: c }))]} />
                  </Form.Item>
                  <Form.Item name="assignmentStatus" className="xl:col-span-4 !mb-0" initialValue="all">
                    <Select className="!h-11 !w-full" options={[
                      { value: 'all', label: 'Tất cả trạng thái phân công' },
                      { value: 'assigned', label: 'Đã phân công GVHD' },
                      { value: 'unassigned', label: 'Chưa phân công GVHD' }
                    ]} />
                  </Form.Item>
                </div>
              </div>
            )}
            actions={{ isDetail: true, isEdit: !isPeriodClosed, isDelete: !isPeriodClosed }}
          />
        </Card>
      )}

      <RemindModal open={remindOpen} onCancel={() => setRemindOpen(false)} onOk={() => { setRemindOpen(false); message.success(t(getKey('remind_all_success_msg'))); }} count={summary.noCompany} showing={noCompanyRows.length} approved={summary.approved} />
    </div>
  );
};

export default InternshipStudentsPage;
