import { BankOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, FileTextOutlined, SearchOutlined, SolutionOutlined, TeamOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tag, Tabs, Typography, Dropdown, message } from 'antd';
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
type ModalMode = 'create' | 'edit' | 'detail';

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
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [confirmationModalMode, setConfirmationModalMode] = useState<ModalMode>('create');
  const [selectedConfirmation, setSelectedConfirmation] = useState<ConfirmationRequest | null>(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [studentModalMode, setStudentModalMode] = useState<ModalMode>('create');
  const [selectedStudent, setSelectedStudent] = useState<NoCompanyStudent | null>(null);
  const [confirmationForm] = Form.useForm();
  const [studentForm] = Form.useForm();

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

  const openCreateConfirmation = () => {
    setConfirmationModalMode('create');
    setSelectedConfirmation(null);
    confirmationForm.resetFields();
    confirmationForm.setFieldsValue({ status: 'pending' });
    setConfirmationModalOpen(true);
  };

  const openEditConfirmation = (record: ConfirmationRequest) => {
    setConfirmationModalMode('edit');
    setSelectedConfirmation(record);
    confirmationForm.setFieldsValue(record);
    setConfirmationModalOpen(true);
  };

  const openDetailConfirmation = (record: ConfirmationRequest) => {
    setConfirmationModalMode('detail');
    setSelectedConfirmation(record);
    confirmationForm.setFieldsValue(record);
    setConfirmationModalOpen(true);
  };

  const deleteConfirmation = (record: ConfirmationRequest) => {
    Modal.confirm({
      centered: true,
      title: 'Xóa đăng ký?',
      content: `Bạn có chắc muốn xóa hồ sơ của ${record.studentName}?`,
      okText: 'Xóa',
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: { danger: true },
      onOk: () => {
        setConfirmationRows((prev) => prev.filter((item) => item.id !== record.id));
        message.success('Đã xóa hồ sơ đăng ký');
      },
    });
  };

  const submitConfirmation = async () => {
    try {
      const values = await confirmationForm.validateFields();
      if (confirmationModalMode === 'edit' && selectedConfirmation) {
        setConfirmationRows((prev) =>
          prev.map((item) =>
            item.id === selectedConfirmation.id
              ? {
                  ...item,
                  ...values,
                }
              : item
          )
        );
        message.success('Đã cập nhật hồ sơ đăng ký');
      } else {
        const nextId = `CR${String(confirmationRows.length + 1).padStart(3, '0')}`;
        setConfirmationRows((prev) => [
          {
            id: nextId,
            studentId: values.studentId,
            studentName: values.studentName,
            className: values.className,
            companyName: values.companyName,
            taxId: values.taxId,
            mentor: values.mentor,
            regDate: values.regDate,
            status: values.status,
          },
          ...prev,
        ]);
        message.success('Đã thêm hồ sơ đăng ký');
      }
      setConfirmationModalOpen(false);
      setSelectedConfirmation(null);
      confirmationForm.resetFields();
    } catch {
      // noop
    }
  };

  const openCreateStudent = () => {
    setStudentModalMode('create');
    setSelectedStudent(null);
    studentForm.resetFields();
    studentForm.setFieldsValue({ status: 'not_registered' });
    setStudentModalOpen(true);
  };

  const openEditStudent = (record: NoCompanyStudent) => {
    setStudentModalMode('edit');
    setSelectedStudent(record);
    studentForm.setFieldsValue(record);
    setStudentModalOpen(true);
  };

  const openDetailStudent = (record: NoCompanyStudent) => {
    setStudentModalMode('detail');
    setSelectedStudent(record);
    studentForm.setFieldsValue(record);
    setStudentModalOpen(true);
  };

  const deleteStudent = (record: NoCompanyStudent) => {
    Modal.confirm({
      centered: true,
      title: 'Xóa sinh viên?',
      content: `Bạn có chắc muốn xóa ${record.studentName} khỏi danh sách?`,
      okText: 'Xóa',
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: { danger: true },
      onOk: () => {
        setNoCompanyRows((prev) => prev.filter((item) => item.id !== record.id));
        message.success('Đã xóa sinh viên');
      },
    });
  };

  const submitStudent = async () => {
    try {
      const values = await studentForm.validateFields();
      if (studentModalMode === 'edit' && selectedStudent) {
        setNoCompanyRows((prev) =>
          prev.map((item) =>
            item.id === selectedStudent.id
              ? {
                  ...item,
                  ...values,
                }
              : item
          )
        );
        message.success('Đã cập nhật sinh viên');
      } else {
        const nextId = `NC${String(noCompanyRows.length + 1).padStart(3, '0')}`;
        setNoCompanyRows((prev) => [
          {
            id: nextId,
            studentId: values.studentId,
            studentName: values.studentName,
            className: values.className,
            phone: values.phone,
            status: values.status,
          },
          ...prev,
        ]);
        message.success('Đã thêm sinh viên');
      }
      setStudentModalOpen(false);
      setSelectedStudent(null);
      studentForm.resetFields();
    } catch {
      // noop
    }
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
      width: 200,
      render: (_: unknown, record) => {
        const meta = confirmationStatusMeta[record.status];
        const menuItems = record.status === 'approved'
          ? [{ key: 'pending', label: 'Đưa về chờ cấp' }, { key: 'rejected', label: 'Đổi thành bị từ chối' }]
          : record.status === 'rejected'
            ? [{ key: 'pending', label: 'Đưa về chờ cấp' }, { key: 'approved', label: 'Đổi thành đã cấp' }]
            : [{ key: 'approved', label: 'Đổi thành đã cấp' }, { key: 'rejected', label: 'Đổi thành bị từ chối' }];

        return (
          <Space size={8} wrap>
            <Tag style={{ margin: 0, borderRadius: 999, padding: '0 10px', border: 'none', backgroundColor: meta.bg, color: meta.color }}>
              {meta.label}
            </Tag>
            <Dropdown
              trigger={["click"]}
              menu={{
                items: menuItems,
                onClick: ({ key }) => changeConfirmationStatus(record.id, key as ConfirmationStatus),
              }}
            >
              <Button type="text" size="small" className="!h-8 !rounded-[8px] !px-2 !font-medium !text-[#2563eb] hover:!bg-[#eff6ff]">
                Đổi trạng thái
              </Button>
            </Dropdown>
          </Space>
        );
      },
    },
    {
      title: t(getKey('action')),
      key: 'actions',
      align: 'right',
      width: 180,
      render: (_: unknown, record) => {
        if (record.status === 'approved') {
          return <span className="text-xs text-slate-500">Đã xử lý</span>;
        }

        if (record.status === 'rejected') {
          return (
            <Space size={4}>
              <Button type="text" size="small" className="!px-2" title="Đưa về chờ cấp" onClick={() => changeConfirmationStatus(record.id, 'pending')}>
                <ClockCircleOutlined />
              </Button>
            </Space>
          );
        }

        return (
          <Space size={4}>
            <Button type="text" size="small" className="!px-2" title="Cấp giấy" onClick={() => handleConfirmationAction(record, 'approved')}>
              <CheckCircleOutlined className="text-[#00A65A]" />
            </Button>
            <Button type="text" size="small" danger className="!px-2" title="Từ chối" onClick={() => handleConfirmationAction(record, 'rejected')}>
              <CloseCircleOutlined />
            </Button>
            <Button type="text" size="small" className="!px-2" onClick={() => openDetailConfirmation(record)} title="Xem">
              <EyeOutlined />
            </Button>
            <Button type="text" size="small" className="!px-2 text-[#0f766e]" onClick={() => openEditConfirmation(record)} title="Sửa">
              <EditOutlined />
            </Button>
            <Button type="text" size="small" danger className="!px-2" onClick={() => deleteConfirmation(record)} title="Xóa">
              <DeleteOutlined />
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
      width: 160,
      render: (_: unknown, record) => (
        <Space size={4}>
          <Button type="text" size="small" className="!px-2 !font-medium !text-[#2563eb] hover:!bg-[#eff6ff]" title="Nhắc nhở" onClick={() => message.success(`Đã gửi nhắc nhở cho ${record.studentName}`)}>
            <SendOutlined />
          </Button>
          <Button type="text" size="small" className="!px-2" onClick={() => openDetailStudent(record)} title="Xem">
            <EyeOutlined />
          </Button>
          <Button type="text" size="small" className="!px-2 text-[#0f766e]" onClick={() => openEditStudent(record)} title="Sửa">
            <EditOutlined />
          </Button>
          <Button type="text" size="small" danger className="!px-2" onClick={() => deleteStudent(record)} title="Xóa">
            <DeleteOutlined />
          </Button>
        </Space>
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
            <div className="rounded-[16px] border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Chuyển giữa 2 luồng xử lý để xem nhanh danh sách đăng ký và danh sách sinh viên chưa có công ty.
            </div>
          </div>
        </div>
      </Card>

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
            <div className="flex items-center justify-between gap-3">
              <div className="text-base font-semibold text-navyDark">Danh sách đăng ký giấy xác nhận thực tập</div>
              <Button type="primary" onClick={openCreateConfirmation} className="!h-9 !rounded-[8px] !px-4 !font-medium">
                Thêm hồ sơ
              </Button>
            </div>
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
            <Button onClick={openCreateStudent} className="!h-10 !rounded-[8px] !px-5 !font-medium">
              Thêm sinh viên
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

      <Modal
        centered
        open={confirmationModalOpen}
        title={
          confirmationModalMode === 'create'
            ? 'Thêm hồ sơ đăng ký'
            : confirmationModalMode === 'edit'
              ? 'Chỉnh sửa hồ sơ đăng ký'
              : 'Chi tiết hồ sơ đăng ký'
        }
        onCancel={() => {
          setConfirmationModalOpen(false);
          setSelectedConfirmation(null);
          confirmationForm.resetFields();
        }}
        okText={confirmationModalMode === 'create' ? 'Thêm mới' : confirmationModalMode === 'edit' ? 'Cập nhật' : undefined}
        cancelText={t(getKey('cancel_btn'))}
        onOk={submitConfirmation}
        footer={confirmationModalMode === 'detail' ? null : undefined}
      >
        <Form form={confirmationForm} layout="vertical" className="pt-2">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Form.Item label="MSSV" name="studentId" rules={[{ required: true, message: 'Vui lòng nhập MSSV' }]}>
              <Input disabled={confirmationModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="Họ tên" name="studentName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
              <Input disabled={confirmationModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="Lớp" name="className" rules={[{ required: true, message: 'Vui lòng nhập lớp' }]}>
              <Input disabled={confirmationModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="Ngày đăng ký" name="regDate" rules={[{ required: true, message: 'Vui lòng nhập ngày đăng ký' }]}>
              <Input disabled={confirmationModalMode === 'detail'} placeholder="DD/MM/YYYY" />
            </Form.Item>
          </div>
          <Form.Item label="Công ty" name="companyName" rules={[{ required: true, message: 'Vui lòng nhập công ty' }]}>
            <Input disabled={confirmationModalMode === 'detail'} />
          </Form.Item>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Form.Item label="Mã số thuế" name="taxId" rules={[{ required: true, message: 'Vui lòng nhập mã số thuế' }]}>
              <Input disabled={confirmationModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="Mentor" name="mentor" rules={[{ required: true, message: 'Vui lòng nhập mentor' }]}>
              <Input disabled={confirmationModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
              <Select
                disabled={confirmationModalMode === 'detail'}
                options={[
                  { value: 'pending', label: 'Chờ cấp' },
                  { value: 'approved', label: 'Đã cấp' },
                  { value: 'rejected', label: 'Bị từ chối' },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        centered
        open={studentModalOpen}
        title={
          studentModalMode === 'create'
            ? 'Thêm sinh viên chưa có công ty'
            : studentModalMode === 'edit'
              ? 'Chỉnh sửa sinh viên'
              : 'Chi tiết sinh viên'
        }
        onCancel={() => {
          setStudentModalOpen(false);
          setSelectedStudent(null);
          studentForm.resetFields();
        }}
        okText={studentModalMode === 'create' ? 'Thêm mới' : studentModalMode === 'edit' ? 'Cập nhật' : undefined}
        cancelText={t(getKey('cancel_btn'))}
        onOk={submitStudent}
        footer={studentModalMode === 'detail' ? null : undefined}
      >
        <Form form={studentForm} layout="vertical" className="pt-2">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Form.Item label="MSSV" name="studentId" rules={[{ required: true, message: 'Vui lòng nhập MSSV' }]}>
              <Input disabled={studentModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="Họ tên" name="studentName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
              <Input disabled={studentModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="Lớp" name="className" rules={[{ required: true, message: 'Vui lòng nhập lớp' }]}>
              <Input disabled={studentModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="SĐT" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
              <Input disabled={studentModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
              <Select
                disabled={studentModalMode === 'detail'}
                options={[
                  { value: 'not_registered', label: 'Chưa đăng ký' },
                  { value: 'searching', label: 'Đang tìm' },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default InternshipStudentsPage;
