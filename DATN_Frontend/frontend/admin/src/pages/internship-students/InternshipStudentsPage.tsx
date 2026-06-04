import { BankOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, FileTextOutlined, SearchOutlined, SolutionOutlined, TeamOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Select, Space, Tag, Tabs, Typography, message } from 'antd';
import RemindModal from './components/RemindModal';
import { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import { internshipHooks } from '../../hooks/useInternships';
import type { ConfirmationStatus, IConfirmationRequest, INoCompanyStudent, NoCompanyStatus, ICreateConfirmationRequest, IUpdateConfirmationRequest, ICreateNoCompanyStudent, IUpdateNoCompanyStudent } from '../../type/InternshipType';
import FilterTable from '../../components/shared/table/FilterTable';
import ConfirmationForm from './components/ConfirmationForm';
import StudentForm from './components/StudentForm';
import type { BaseListParams, ListResponseTypeObject } from '@shared/types/GeneralType';
import type { UseQueryResult } from '@tanstack/react-query';

type ModeKey = 'confirmations' | 'no-company';
type ConfirmationTab = 'all' | ConfirmationStatus;
type NoCompanyTab = 'all' | NoCompanyStatus;

const INITIAL_CONFIRMATIONS: IConfirmationRequest[] = [];
const INITIAL_NO_COMPANY_STUDENTS: INoCompanyStudent[] = [];

const confirmationStatusMeta: Record<ConfirmationStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Chờ cấp', color: '#D08A00', bg: '#FFF7E6' },
  approved: { label: 'Đã cấp', color: '#00A65A', bg: '#E8F9EE' },
  rejected: { label: 'Bị từ chối', color: '#C53030', bg: '#FFEDED' },
};

const noCompanyStatusMeta: Record<NoCompanyStatus, { label: string; color: string; bg: string }> = {
  not_registered: { label: 'Chưa đăng ký', color: '#C53030', bg: '#FFEDED' },
  searching: { label: 'Đang tìm', color: '#D08A00', bg: '#FFF7E6' },
};

const InternshipStudentsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const initialMode = location.pathname.includes('/no-company') ? 'no-company' : location.pathname.includes('/confirmations') ? 'confirmations' : 'confirmations';
  const [mode, setMode] = useState<ModeKey>(initialMode);
  const [confirmationTab, setConfirmationTab] = useState<ConfirmationTab>('all');
  const [noCompanyTab, setNoCompanyTab] = useState<NoCompanyTab>('all');
  const [remindOpen, setRemindOpen] = useState(false);

  const { data: confirmationList } = internshipHooks.useFetchListConfirmationRequests();
  const { data: noCompanyList } = internshipHooks.useFetchListNoCompanyStudents();

  const createConfirmationMutation = internshipHooks.useCreateConfirmationRequest();
  const updateConfirmationMutation = internshipHooks.useUpdateConfirmationRequest();
  const deleteConfirmationMutation = internshipHooks.useDeleteConfirmationRequest();

  const createNoCompanyMutation = internshipHooks.useCreateNoCompanyStudent();
  const updateNoCompanyMutation = internshipHooks.useUpdateNoCompanyStudent();
  const deleteNoCompanyMutation = internshipHooks.useDeleteNoCompanyStudent();

  const confirmationRows = confirmationList?.rows ?? INITIAL_CONFIRMATIONS;
  const noCompanyRows = noCompanyList?.rows ?? INITIAL_NO_COMPANY_STUDENTS;

  useEffect(() => {
    if (location.pathname.includes('/no-company')) setMode('no-company');
    else if (location.pathname.includes('/confirmations')) setMode('confirmations');
  }, [location.pathname]);

  const summary = useMemo(() => ({
    confirmations: confirmationRows.length,
    pending: confirmationRows.filter((item) => item.status === 'pending').length,
    approved: confirmationRows.filter((item) => item.status === 'approved').length,
    noCompany: noCompanyRows.length,
  }), [confirmationRows, noCompanyRows]);

  const classOptions = useMemo(() => Array.from(new Set(noCompanyRows.map((item) => item.className))), [noCompanyRows]);

  const confirmationTabCounts = useMemo(() => ({
    total: confirmationRows.length,
    pending: confirmationRows.filter((item) => item.status === 'pending').length,
    approved: confirmationRows.filter((item) => item.status === 'approved').length,
    rejected: confirmationRows.filter((item) => item.status === 'rejected').length,
  }), [confirmationRows]);

  const noCompanyTabCounts = useMemo(() => ({
    total: noCompanyRows.length,
    not_registered: noCompanyRows.filter((item) => item.status === 'not_registered').length,
    searching: noCompanyRows.filter((item) => item.status === 'searching').length,
  }), [noCompanyRows]);

  const useFilteredConfirmationListQuery = (params: BaseListParams) => {
    const query = internshipHooks.useFetchListConfirmationRequests();
    const typedParams = params as BaseListParams & { keyword?: string; companyName?: string };
    const keyword = (typedParams.keyword ?? '').trim().toLowerCase();
    const companyName = (typedParams.companyName ?? '').trim().toLowerCase();
    // use outer tab state (confirmationTab) like CompaniesPage uses `tab`
    const status = confirmationTab || 'all';

    const sourceRows = (query.data?.rows ?? confirmationList ?? INITIAL_CONFIRMATIONS) as IConfirmationRequest[];
    // debug removed
    const filteredRows = sourceRows
      .filter((r) => (status === 'all' ? true : r.status === status))
      .filter((r) => !companyName || r.companyName.toLowerCase().includes(companyName))
      .filter((r) => !keyword || [r.studentId, r.studentName, r.className, r.companyName, r.taxId].join(' ').toLowerCase().includes(keyword));
    // debug removed

    return {
      ...query,
      data: query.data
        ? ({ ...query.data, rows: filteredRows, total: filteredRows.length } as ListResponseTypeObject<IConfirmationRequest>)
        : query.data,
    } as UseQueryResult<ListResponseTypeObject<IConfirmationRequest>, Error>;
  };

  const useFilteredNoCompanyListQuery = (params: BaseListParams) => {
    const query = internshipHooks.useFetchListNoCompanyStudents();
    const typedParams = params as BaseListParams & { keyword?: string; className?: string };
    const keyword = (typedParams.keyword ?? '').trim().toLowerCase();
    // use outer tab state for no-company as well
    const status = noCompanyTab || 'all';
    const className = typedParams.className || 'all';

    const sourceRows2 = (query.data?.rows ?? noCompanyList ?? INITIAL_NO_COMPANY_STUDENTS) as INoCompanyStudent[];
    const filteredRows = sourceRows2
      .filter((r) => (status === 'all' || status === undefined ? true : r.status === status))
      .filter((r) => (className === 'all' ? true : r.className === className))
      .filter((r) => !keyword || [r.studentId, r.studentName, r.className, r.phone].join(' ').toLowerCase().includes(keyword));
    // debug removed

    return {
      ...query,
      data: query.data
        ? ({ ...query.data, rows: filteredRows, total: filteredRows.length } as ListResponseTypeObject<INoCompanyStudent>)
        : query.data,
    } as UseQueryResult<ListResponseTypeObject<INoCompanyStudent>, Error>;
  };

  const handleConfirmationAction = (row: IConfirmationRequest, status: ConfirmationStatus) => {
    const targetLabel = confirmationStatusMeta[status].label.toLowerCase();
    updateConfirmationMutation.mutate({ id: row.id, body: { status }, index: 0, params: { page: 1, limit: 10 } }, { onSuccess: () => message.success(`Đã cập nhật ${row.studentName} sang ${targetLabel}`) });
  };

  const confirmationColumns = [
    { title: 'STT', key: 'index', width: 70, render: (_: unknown, __: IConfirmationRequest, index: number) => index + 1 },
    { title: 'Thông tin sinh viên', key: 'student', width: 240, render: (_: unknown, record: IConfirmationRequest) => (
      <div>
        <div className="text-[#2563eb] font-medium">{record.studentId}</div>
        <div>{record.studentName}</div>
        <div className="text-xs text-slate-500">Lớp: {record.className}</div>
      </div>
    ) },
    { title: 'Thông tin công ty', key: 'company', render: (_: unknown, record: IConfirmationRequest) => (
      <div className="text-sm">
        <div className="font-medium text-slate-900">{record.companyName}</div>
        <div className="text-xs text-slate-500">Địa chỉ công ty: {record.companyAddress}</div>
        <div className="text-xs text-slate-500">Địa điểm thực tập: {record.internshipLocation}</div>
        <div className="text-xs text-slate-500">MST: {record.taxId}</div>
        <div className="text-xs text-slate-500">Mentor: {record.mentor}</div>
      </div>
    ) },
    { title: 'Ngày đăng ký', dataIndex: 'regDate', key: 'regDate', width: 130, render: (v: string) => <span className="text-slate-600">{v}</span> },
    { title: 'Trạng thái cấp', key: 'status', width: 140, render: (_: unknown, record: IConfirmationRequest) => {
      const meta = confirmationStatusMeta[record.status];
      return <Tag style={{ margin: 0, borderRadius: 999, padding: '0 10px', border: 'none', backgroundColor: meta.bg, color: meta.color }}>{meta.label}</Tag>;
    } },
    { title: 'Giấy xác nhận', key: 'cert', width: 120, render: (_: unknown, record: IConfirmationRequest) => (
      <Space size={8}>
        <Button type="text" size="small" className="!px-2" title="Cấp giấy" onClick={() => handleConfirmationAction(record, 'approved')} disabled={record.status === 'approved'}>
          <CheckCircleOutlined className="text-[#00A65A]" />
        </Button>
        <Button type="text" size="small" danger className="!px-2" title="Từ chối" onClick={() => handleConfirmationAction(record, 'rejected')} disabled={record.status === 'rejected'}>
          <CloseCircleOutlined />
        </Button>
      </Space>
    ) },
  ];

  const noCompanyColumns = [
    { title: 'STT', key: 'index', width: 70, render: (_: unknown, __: INoCompanyStudent, index: number) => index + 1 },
    { title: 'MSSV', dataIndex: 'studentId', key: 'studentId', width: 140, render: (v: string) => <span className="text-[#2563eb]">{v}</span> },
    { title: 'Họ tên', dataIndex: 'studentName', key: 'studentName' },
    { title: 'Lớp', dataIndex: 'className', key: 'className', width: 130 },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone', width: 140 },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 160, render: (status: NoCompanyStatus) => {
      const meta = noCompanyStatusMeta[status];
      return <Tag style={{ margin: 0, borderRadius: 999, padding: '0 10px', border: 'none', backgroundColor: meta.bg, color: meta.color }}>{meta.label}</Tag>;
    } },
  ];

  return (
    <div className={cn('pb-4')}>
      <div className={cn('mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]')}>
        <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[#2196F3]/10 px-3 py-1 text-xs font-medium text-[#1976d2]')}>
          <SolutionOutlined /> Quản lý thực tập tốt nghiệp
        </div>
        <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between')}>
          <div>
            <Typography.Title level={1} className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">{t(getKey('internship_students'))}</Typography.Title>
            <p className={cn('mt-2 mb-0 text-[18px] leading-[26px] text-grayDark')}>{t(getKey('internship_students_desc'))}</p>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Tổng đăng ký', value: summary.confirmations, color: 'bg-[#2196F3]', icon: <FileTextOutlined /> },
          { label: 'Chờ cấp giấy', value: summary.pending, color: 'bg-[#D08A00]', icon: <ClockCircleOutlined /> },
          { label: 'Đã cấp', value: summary.approved, color: 'bg-[#00A65A]', icon: <CheckCircleOutlined /> },
          { label: 'Chưa có công ty', value: summary.noCompany, color: 'bg-[#C53030]', icon: <CloseCircleOutlined /> },
        ].map((item) => (
          <Card key={item.label} className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="mt-2 text-3xl font-bold text-navyDark">{item.value}</div>
              </div>
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl text-white', item.color)}>{item.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Selector removed — submenu links now control the active internship management view */}

      <div className="mb-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <Tabs
          activeKey={mode === 'confirmations' ? confirmationTab : noCompanyTab}
          onChange={(key) => { if (mode === 'confirmations') setConfirmationTab(key as ConfirmationTab); else setNoCompanyTab(key as NoCompanyTab); }}
          items={mode === 'confirmations' ? [
            { key: 'all', label: `Tất cả (${confirmationTabCounts.total})`, icon: <BankOutlined /> },
            { key: 'pending', label: `Chờ cấp (${confirmationTabCounts.pending})`, icon: <ClockCircleOutlined /> },
            { key: 'approved', label: `Đã cấp (${confirmationTabCounts.approved})`, icon: <CheckCircleOutlined /> },
            { key: 'rejected', label: `Bị từ chối (${confirmationTabCounts.rejected})`, icon: <CloseCircleOutlined /> },
          ] : [
            { key: 'all', label: `Tất cả (${noCompanyTabCounts.total})`, icon: <BankOutlined /> },
            { key: 'not_registered', label: `Chưa đăng ký (${noCompanyTabCounts.not_registered})`, icon: <CloseCircleOutlined /> },
            { key: 'searching', label: `Đang tìm (${noCompanyTabCounts.searching})`, icon: <ClockCircleOutlined /> },
          ]}
          className="batch-tabs"
        />
      </div>

      {mode === 'confirmations' ? (
        <Card className="overflow-hidden rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <FilterTable<IConfirmationRequest, IConfirmationRequest | undefined, ICreateConfirmationRequest, IUpdateConfirmationRequest>
            title="Danh sách đăng ký giấy xác nhận thực tập"
            columns={confirmationColumns}
            useQueryHook={useFilteredConfirmationListQuery}
            createInfo={{ type: 'modal', modalInfo: { modalContent: <ConfirmationForm />, modalProps: { centered: true, width: 720, title: 'Thêm hồ sơ' }, modalFunc: createConfirmationMutation } }}
            updateInfo={{ type: 'modal', modalInfo: { modalContent: <ConfirmationForm />, modalProps: { centered: true, width: 720, title: 'Chỉnh sửa hồ sơ' }, modalFunc: updateConfirmationMutation } }}
            deleteInfo={{ type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: deleteConfirmationMutation as unknown as import('@tanstack/react-query').UseMutationResult<IConfirmationRequest, import('axios').AxiosError, { id: string; params: BaseListParams }> } }}
            detailInfo={{ type: 'modal', modalInfo: { modalContent: <ConfirmationForm disabled />, modalProps: { centered: true, width: 720, title: 'Chi tiết hồ sơ', footer: null }, modalFunc: internshipHooks.useFetchDetailConfirmationRequest } }}
            formatInitialValues={(d) => ({ studentId: d?.studentId ?? '', studentName: d?.studentName ?? '', className: d?.className ?? '', regDate: d?.regDate ?? '', companyName: d?.companyName ?? '', companyAddress: d?.companyAddress ?? '', internshipLocation: d?.internshipLocation ?? '', taxId: d?.taxId ?? '', mentor: d?.mentor ?? '', status: d?.status ?? 'pending' })}
            formatFormValues={(v) => v as unknown as ICreateConfirmationRequest}
            filterRender={() => (
              <div className="mb-4">
                <div className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
                  <Form.Item name="keyword" className="xl:col-span-6 !mb-0">
                    <Input allowClear prefix={<SearchOutlined className="text-slate-400" />} placeholder="Tìm MSSV, tên, lớp, công ty..." className="!h-11 !rounded-[12px] !border-slate-300" />
                  </Form.Item>
                  <Form.Item name="companyName" className="xl:col-span-6 !mb-0">
                    <Input allowClear prefix={<SearchOutlined className="text-slate-400" />} placeholder="Lọc theo tên công ty..." className="!h-11 !rounded-[12px] !border-slate-300" />
                  </Form.Item>
                </div>

                {/* tabs removed from filter area to avoid duplication; using outer tabs */}
              </div>
            )}
            actions={{ isDetail: true, isEdit: true, isDelete: true }}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <FilterTable<INoCompanyStudent, INoCompanyStudent | undefined, ICreateNoCompanyStudent, IUpdateNoCompanyStudent>
            title="Sinh viên chưa có công ty"
            columns={noCompanyColumns}
            useQueryHook={useFilteredNoCompanyListQuery}
            createInfo={{ type: 'modal', modalInfo: { modalContent: <StudentForm />, modalProps: { centered: true, width: 720, title: 'Thêm sinh viên' }, modalFunc: createNoCompanyMutation } }}
            updateInfo={{ type: 'modal', modalInfo: { modalContent: <StudentForm />, modalProps: { centered: true, width: 720, title: 'Chỉnh sửa sinh viên' }, modalFunc: updateNoCompanyMutation } }}
            deleteInfo={{ type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: deleteNoCompanyMutation as unknown as import('@tanstack/react-query').UseMutationResult<INoCompanyStudent, import('axios').AxiosError, { id: string; params: BaseListParams }> } }}
            detailInfo={{ type: 'modal', modalInfo: { modalContent: <StudentForm disabled />, modalProps: { centered: true, width: 720, title: 'Chi tiết sinh viên', footer: null }, modalFunc: internshipHooks.useFetchDetailNoCompanyStudent } }}
            formatInitialValues={(d) => ({ studentId: d?.studentId ?? '', studentName: d?.studentName ?? '', className: d?.className ?? '', phone: d?.phone ?? '', status: d?.status ?? 'not_registered' })}
            formatFormValues={(v) => v as unknown as ICreateNoCompanyStudent}
            filterRender={() => (
              <div className="mb-4">
                <div className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
                  <Form.Item name="keyword" className="xl:col-span-5 !mb-0">
                    <Input allowClear prefix={<SearchOutlined className="text-slate-400" />} placeholder="Tìm theo MSSV, tên, lớp..." className="!h-11 !rounded-[12px] !border-slate-300" />
                  </Form.Item>
                  <Form.Item name="className" className="xl:col-span-4 !mb-0">
                    <Select allowClear className="!h-11 !w-full" options={[{ value: 'all', label: 'Tất cả lớp' }, ...classOptions.map((c) => ({ value: c, label: c }))]} />
                  </Form.Item>
                </div>

                {/* tabs removed from filter area to avoid duplication; using outer tabs */}
              </div>
            )}
            actions={{ isDetail: true, isEdit: true, isDelete: true, customAction: (record: unknown) => {
              const r = record as INoCompanyStudent;
              return (
                <div className="pointer-events-auto">
                  <Space size={8}>
                    <Button type="text" size="small" onClick={() => message.success(`Đã gửi nhắc nhở cho ${r.studentName}`)} title="Nhắc nhở"><SendOutlined /></Button>
                  </Space>
                </div>
              );
            } }}
          />
        </Card>
      )}

      <RemindModal open={remindOpen} onCancel={() => setRemindOpen(false)} onOk={() => { setRemindOpen(false); message.success('Đã gửi nhắc nhở cho toàn bộ sinh viên chưa có công ty'); }} count={summary.noCompany} showing={noCompanyRows.length} approved={summary.approved} />
    </div>
  );
};

export default InternshipStudentsPage;
