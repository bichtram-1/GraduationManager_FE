import { BankOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, FileTextOutlined, SearchOutlined, SolutionOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Card, Input, Modal, Select, Space, Table, Tag, Tabs, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';

type ModeKey = 'confirmations' | 'no-company';
type ConfirmationStatus = 'pending' | 'approved' | 'rejected';
type NoCompanyStatus = 'not_registered' | 'searching';
type ConfirmationTab = 'all' | ConfirmationStatus;
type NoCompanyTab = 'all' | NoCompanyStatus;

type ConfirmationRequest = {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  companyName: string;
  taxId: string;
  mentor: string;
  regDate: string;
  status: ConfirmationStatus;
};

type NoCompanyStudent = {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  phone: string;
  status: NoCompanyStatus;
};

const INITIAL_CONFIRMATIONS: ConfirmationRequest[] = [
  { id: 'CR001', studentId: '20520001', studentName: 'Nguyễn Văn A', className: 'KTPM2020', companyName: 'FPT Software', taxId: '0123456789', mentor: 'Trần Văn Mentor', regDate: '15/04/2026', status: 'pending' },
  { id: 'CR002', studentId: '20520002', studentName: 'Trần Thị B', className: 'CNPM2020', companyName: 'VNG Corp', taxId: '0987654321', mentor: 'Nguyễn Thị Guide', regDate: '16/04/2026', status: 'approved' },
  { id: 'CR003', studentId: '20520003', studentName: 'Lê Văn C', className: 'KTPM2020', companyName: 'TMA Solutions', taxId: '0112233445', mentor: 'Phạm Văn Hướng', regDate: '17/04/2026', status: 'pending' },
  { id: 'CR004', studentId: '20520004', studentName: 'Phạm Thị D', className: 'HTTT2020', companyName: 'Shopee VN', taxId: '0556677889', mentor: 'Võ Thị Lead', regDate: '18/04/2026', status: 'rejected' },
];

const INITIAL_NO_COMPANY_STUDENTS: NoCompanyStudent[] = [
  { id: 'NC001', studentId: '20520010', studentName: 'Đinh Thị H', className: 'KTPM2020', phone: '0912000111', status: 'not_registered' },
  { id: 'NC002', studentId: '20520011', studentName: 'Phan Văn I', className: 'CNPM2020', phone: '0912000222', status: 'searching' },
  { id: 'NC003', studentId: '20520012', studentName: 'Trương Thị J', className: 'KTPM2020', phone: '0912000333', status: 'not_registered' },
  { id: 'NC004', studentId: '20520013', studentName: 'Ngô Văn K', className: 'HTTT2020', phone: '0912000444', status: 'searching' },
  { id: 'NC005', studentId: '20520014', studentName: 'Đặng Thị L', className: 'CNPM2020', phone: '0912000555', status: 'not_registered' },
  { id: 'NC006', studentId: '20520015', studentName: 'Võ Văn M', className: 'KTPM2020', phone: '0912000666', status: 'searching' },
  { id: 'NC007', studentId: '20520016', studentName: 'Hoàng Thị N', className: 'HTTT2020', phone: '0912000777', status: 'not_registered' },
];

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
  const [mode, setMode] = useState<ModeKey>('confirmations');
  const [confirmationRows, setConfirmationRows] = useState(INITIAL_CONFIRMATIONS);
  const [noCompanyRows, setNoCompanyRows] = useState(INITIAL_NO_COMPANY_STUDENTS);
  const [confirmationTab, setConfirmationTab] = useState<ConfirmationTab>('all');
  const [noCompanyTab, setNoCompanyTab] = useState<NoCompanyTab>('all');
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [remindOpen, setRemindOpen] = useState(false);

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

  const filteredConfirmationRows = useMemo(
    () => (confirmationTab === 'all' ? confirmationRows : confirmationRows.filter((item) => item.status === confirmationTab)),
    [confirmationRows, confirmationTab],
  );

  const filteredNoCompanyRows = useMemo(() => {
    return noCompanyRows.filter((item) => {
      const matchesQuery = !query || [item.studentId, item.studentName, item.className, item.phone]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesClass = classFilter === 'all' || item.className === classFilter;
      const matchesStatus = noCompanyTab === 'all' ? statusFilter === 'all' || item.status === statusFilter : item.status === noCompanyTab;
      return matchesQuery && matchesClass && matchesStatus;
    });
  }, [classFilter, noCompanyRows, noCompanyTab, query, statusFilter]);

  const changeConfirmationStatus = (id: string, status: ConfirmationStatus) => {
    setConfirmationRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
  };

  const handleConfirmationAction = (row: ConfirmationRequest, status: ConfirmationStatus) => {
    const targetLabel = confirmationStatusMeta[status].label.toLowerCase();
    Modal.confirm({
      centered: true,
      title: `Chuyển ${row.studentName} sang ${targetLabel}?`,
      content:
        status === 'approved'
          ? 'Sinh viên sẽ được cấp giấy xác nhận thực tập.'
          : 'Hồ sơ sẽ được chuyển sang trạng thái từ chối và cần xem xét lại.',
      okText: 'Xác nhận',
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: status === 'rejected' ? { danger: true } : undefined,
      onOk: () => {
        changeConfirmationStatus(row.id, status);
        message.success(`Đã cập nhật ${row.studentName} sang ${targetLabel}`);
      },
    });
  };

  const remindAll = () => {
    setRemindOpen(false);
    message.success('Đã gửi nhắc nhở cho toàn bộ sinh viên chưa có công ty');
  };

  const confirmationColumns: ColumnsType<ConfirmationRequest> = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      render: (_: unknown, __: ConfirmationRequest, index: number) => index + 1,
    },
    {
      title: 'Thông tin sinh viên',
      key: 'student',
      width: 240,
      render: (_: unknown, record) => (
        <div>
          <div className="text-[#2563eb] font-medium">{record.studentId}</div>
          <div>{record.studentName}</div>
          <div className="text-xs text-slate-500">Lớp: {record.className}</div>
        </div>
      ),
    },
    {
      title: 'Thông tin công ty',
      key: 'company',
      render: (_: unknown, record) => (
        <div className="text-sm">
          <div className="font-medium text-slate-900">{record.companyName}</div>
          <div className="text-xs text-slate-500">MST: {record.taxId}</div>
          <div className="text-xs text-slate-500">Mentor: {record.mentor}</div>
        </div>
      ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'regDate',
      key: 'regDate',
      width: 130,
      render: (value: string) => <span className="text-slate-600">{value}</span>,
    },
    {
      title: 'Trạng thái cấp',
      key: 'status',
      width: 140,
      render: (_: unknown, record) => {
        const meta = confirmationStatusMeta[record.status];
        return (
          <Tag style={{ margin: 0, borderRadius: 999, padding: '0 10px', border: 'none', backgroundColor: meta.bg, color: meta.color }}>
            {meta.label}
          </Tag>
        );
      },
    },
    {
      title: t(getKey('action')),
      key: 'actions',
      align: 'right',
      width: 220,
      render: (_: unknown, record) => {
        if (record.status === 'approved') {
          return <span className="text-xs text-slate-500">Đã xử lý</span>;
        }

        if (record.status === 'rejected') {
          return (
            <Space size={4}>
              <Button size="small" className="!h-8 !rounded-[8px] !px-3" onClick={() => handleConfirmationAction(record, 'pending')}>
                Đưa về chờ cấp
              </Button>
            </Space>
          );
        }

        return (
          <Space size={4}>
            <Button
              type="primary"
              size="small"
              className="!h-8 !rounded-[8px] !bg-[#00A65A] !border-0"
              onClick={() => handleConfirmationAction(record, 'approved')}
            >
              Cấp giấy
            </Button>
            <Button
              danger
              size="small"
              className="!h-8 !rounded-[8px]"
              onClick={() => handleConfirmationAction(record, 'rejected')}
            >
              Từ chối
            </Button>
          </Space>
        );
      },
    },
  ];

  const noCompanyColumns: ColumnsType<NoCompanyStudent> = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      render: (_: unknown, __: NoCompanyStudent, index: number) => index + 1,
    },
    { title: 'MSSV', dataIndex: 'studentId', key: 'studentId', width: 140, render: (value: string) => <span className="text-[#2563eb]">{value}</span> },
    { title: 'Họ tên', dataIndex: 'studentName', key: 'studentName' },
    { title: 'Lớp', dataIndex: 'className', key: 'className', width: 130 },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone', width: 140 },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status: NoCompanyStatus) => {
        const meta = noCompanyStatusMeta[status];
        return (
          <Tag style={{ margin: 0, borderRadius: 999, padding: '0 10px', border: 'none', backgroundColor: meta.bg, color: meta.color }}>
            {meta.label}
          </Tag>
        );
      },
    },
    {
      title: t(getKey('action')),
      key: 'actions',
      align: 'right',
      width: 180,
      render: (_: unknown, record) => (
        <Button type="text" className="!px-2 !font-medium !text-[#2563eb] hover:!bg-[#eff6ff]" onClick={() => message.success(`Đã gửi nhắc nhở cho ${record.studentName}`)}>
          Gửi nhắc nhở
        </Button>
      ),
    },
  ];

  return (
    <div className={cn('pb-4')}>
      <div className={cn('mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]')}>
        <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[#2196F3]/10 px-3 py-1 text-xs font-medium text-[#1976d2]')}>
          <SolutionOutlined />
          Quản lý thực tập tốt nghiệp
        </div>
        <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between')}>
          <div>
            <Typography.Title level={1} className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">
              {t(getKey('internship_students'))}
            </Typography.Title>
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
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl text-white', item.color)}>
                {item.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <Tabs
          activeKey={mode === 'confirmations' ? confirmationTab : noCompanyTab}
          onChange={(key) => {
            if (mode === 'confirmations') {
              setConfirmationTab(key as ConfirmationTab);
            } else {
              setNoCompanyTab(key as NoCompanyTab);
            }
          }}
          items={mode === 'confirmations'
            ? [
                { key: 'all', label: `Tất cả (${confirmationTabCounts.total})`, icon: <BankOutlined /> },
                { key: 'pending', label: `Chờ cấp (${confirmationTabCounts.pending})`, icon: <ClockCircleOutlined /> },
                { key: 'approved', label: `Đã cấp (${confirmationTabCounts.approved})`, icon: <CheckCircleOutlined /> },
                { key: 'rejected', label: `Bị từ chối (${confirmationTabCounts.rejected})`, icon: <CloseCircleOutlined /> },
              ]
            : [
                { key: 'all', label: `Tất cả (${noCompanyTabCounts.total})`, icon: <BankOutlined /> },
                { key: 'not_registered', label: `Chưa đăng ký (${noCompanyTabCounts.not_registered})`, icon: <CloseCircleOutlined /> },
                { key: 'searching', label: `Đang tìm (${noCompanyTabCounts.searching})`, icon: <ClockCircleOutlined /> },
              ]}
          className="batch-tabs"
        />
      </div>

      <Card className="mb-5 rounded-[20px] border border-slate-100 px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <div className="mb-1 text-sm font-medium text-slate-700">Chọn nghiệp vụ quản lý</div>
            <Select
              value={mode}
              onChange={(value) => setMode(value)}
              className="!h-11 !w-full"
              options={[
                { value: 'confirmations', label: 'Quản lý sinh viên đăng ký giấy xác nhận thực tập' },
                { value: 'no-company', label: 'Quản lý sinh viên chưa có công ty' },
              ]}
            />
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Chuyển giữa 2 luồng xử lý để xem nhanh danh sách đăng ký và danh sách sinh viên chưa có công ty.
            </div>
          </div>
        </div>
      </Card>

      {mode === 'confirmations' ? (
        <Card className="overflow-hidden rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <div className="text-base font-semibold text-navyDark">Danh sách đăng ký giấy xác nhận thực tập</div>
            <div className="mt-1 text-sm text-slate-500">Xem xét và cấp giấy xác nhận cho sinh viên đăng ký</div>
          </div>

          <Table
            rowKey="id"
            columns={confirmationColumns}
            dataSource={filteredConfirmationRows}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-600">
            Hiển thị {filteredConfirmationRows.length} đăng ký
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-orange-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-[#FFC107]" />
              <div className="text-sm font-medium text-navyDark">Sinh viên chưa có công ty thực tập</div>
              <Tag style={{ margin: 0, borderRadius: 999, border: 'none', backgroundColor: '#FFF7E6', color: '#D08A00' }}>
                {filteredNoCompanyRows.length}
              </Tag>
            </div>
            <Button
              type="primary"
              onClick={() => setRemindOpen(true)}
              className="!h-10 !rounded-[8px] !bg-primary !px-5 !font-medium hover:!bg-blueDark"
            >
              Nhắc nhở tất cả
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Input
                allowClear
                prefix={<SearchOutlined className="text-slate-400" />}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo MSSV, tên, lớp..."
                className="!h-11 !rounded-[12px] !border-slate-300"
              />
            </div>
            <div className="lg:col-span-3">
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="!h-11 !w-full"
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'not_registered', label: 'Chưa đăng ký' },
                  { value: 'searching', label: 'Đang tìm' },
                ]}
              />
            </div>
            <div className="lg:col-span-4">
              <Select
                value={classFilter}
                onChange={setClassFilter}
                className="!h-11 !w-full"
                options={[{ value: 'all', label: 'Tất cả lớp' }, ...classOptions.map((item) => ({ value: item, label: item }))]}
              />
            </div>
          </div>

          <Table
            rowKey="id"
            columns={noCompanyColumns}
            dataSource={filteredNoCompanyRows}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-600">
            Hiển thị {filteredNoCompanyRows.length} sinh viên
          </div>
        </Card>
      )}

      <Modal
        centered
        open={remindOpen}
        title="Nhắc nhở sinh viên chưa có công ty"
        onCancel={() => setRemindOpen(false)}
        destroyOnClose
        okText="Gửi nhắc nhở"
        cancelText={t(getKey('cancel_btn'))}
        onOk={remindAll}
      >
        <div className="space-y-3 text-sm text-slate-600">
          <p className="m-0">Hệ thống sẽ gửi thông báo nhắc nhở đến toàn bộ sinh viên đang chưa có công ty thực tập.</p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-2xl font-bold text-[#2196F3]">{summary.noCompany}</div>
                <div className="text-xs text-slate-500">Cần nhắc nhở</div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-2xl font-bold text-[#D08A00]">{filteredNoCompanyRows.length}</div>
                <div className="text-xs text-slate-500">Đang hiển thị</div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-2xl font-bold text-[#00A65A]">{summary.approved}</div>
                <div className="text-xs text-slate-500">Đã cấp giấy</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InternshipStudentsPage;
