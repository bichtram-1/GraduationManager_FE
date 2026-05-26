import { BankOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, PauseCircleOutlined, PlusOutlined, SearchOutlined, SendOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, Form, Input, InputNumber, message, Modal, Select, Space, Table, Tag, Tabs, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';

type CompanyStatus = 'active' | 'pending' | 'paused';
type ReviewStatus = 'pending' | 'approved' | 'rejected';
type CompanyTab = 'all' | ReviewStatus;
type CompanyModalMode = 'create' | 'edit' | 'detail';

type CompanyRow = {
  id: string;
  name: string;
  taxId: string;
  field: string;
  contact: string;
  phone: string;
  email: string;
  partners: number;
  students: number;
  status: CompanyStatus;
  reviewStatus: ReviewStatus;
};

const COMPANY_ROWS: CompanyRow[] = [
  { id: 'C001', name: 'FPT Software', taxId: '0101243150', field: 'Phần mềm & công nghệ', contact: 'Nguyễn Văn Hùng', phone: '0901234567', email: 'hungnv@fpt.com', partners: 4, students: 18, status: 'active', reviewStatus: 'approved' },
  { id: 'C002', name: 'VNG Corporation', taxId: '0303010740', field: 'Công nghệ số', contact: 'Lê Thị Mai', phone: '0909111222', email: 'mai.lt@vng.com', partners: 2, students: 9, status: 'active', reviewStatus: 'approved' },
  { id: 'C003', name: 'TMA Solutions', taxId: '0309876543', field: 'Gia công phần mềm', contact: 'Trần Minh Khoa', phone: '0933444555', email: 'khoa.tm@tma.com', partners: 1, students: 5, status: 'pending', reviewStatus: 'pending' },
  { id: 'C004', name: 'Shopee Vietnam', taxId: '0315643210', field: 'Thương mại điện tử', contact: 'Phạm Thị Linh', phone: '0911222333', email: 'linh.pt@shopee.vn', partners: 3, students: 12, status: 'paused', reviewStatus: 'rejected' },
];

const statusMeta: Record<CompanyStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Đang hoạt động', color: '#00A65A', bg: '#E8F9EE' },
  pending: { label: 'Chờ duyệt', color: '#D08A00', bg: '#FFF7E6' },
  paused: { label: 'Tạm dừng', color: '#C53030', bg: '#FFEDED' },
};

const reviewMeta: Record<ReviewStatus, { label: string; color: string; bg: string }> = {
  approved: { label: 'Đã duyệt', color: '#00A65A', bg: '#E8F9EE' },
  rejected: { label: 'Đã từ chối', color: '#C53030', bg: '#FFEDED' },
  pending: { label: 'Chờ duyệt', color: '#D08A00', bg: '#FFF7E6' },
};

const CompaniesPage = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<CompanyTab>('all');
  const [companyRows, setCompanyRows] = useState(COMPANY_ROWS);
  const [open, setOpen] = useState(false);
  const [modalMode, setModalMode] = useState<CompanyModalMode>('create');
  const [selectedCompany, setSelectedCompany] = useState<CompanyRow | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CompanyStatus>('all');
  const [form] = Form.useForm();

  const filteredRows = useMemo(
    () => (tab === 'all' ? companyRows : companyRows.filter((row) => row.reviewStatus === tab))
      .filter((row) => {
        const normalizedKeyword = keyword.trim().toLowerCase();
        const byKeyword =
          !normalizedKeyword ||
          [row.id, row.name, row.taxId, row.contact, row.email, row.field]
            .join(' ')
            .toLowerCase()
            .includes(normalizedKeyword);
        const byField = fieldFilter === 'all' || row.field === fieldFilter;
        const byStatus = statusFilter === 'all' || row.status === statusFilter;

        return byKeyword && byField && byStatus;
      }),
    [companyRows, tab, keyword, fieldFilter, statusFilter],
  );

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedCompany(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'pending',
      reviewStatus: 'pending',
      partners: 0,
      students: 0,
    });
    setOpen(true);
  };

  const handleOpenEdit = (record: CompanyRow) => {
    setModalMode('edit');
    setSelectedCompany(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const handleOpenDetail = (record: CompanyRow) => {
    setModalMode('detail');
    setSelectedCompany(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const handleDelete = (record: CompanyRow) => {
    Modal.confirm({
      centered: true,
      title: 'Xóa công ty?',
      content: `Bạn có chắc muốn xóa ${record.name}?`,
      okText: 'Xóa',
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: { danger: true },
      onOk: () => {
        setCompanyRows((prev) => prev.filter((row) => row.id !== record.id));
        message.success('Đã xóa công ty');
      },
    });
  };

  const handleSubmitCompany = async () => {
    try {
      const values = await form.validateFields();

      if (modalMode === 'edit' && selectedCompany) {
        setCompanyRows((prev) =>
          prev.map((row) =>
            row.id === selectedCompany.id
              ? {
                  ...row,
                  ...values,
                }
              : row
          )
        );
        message.success('Đã cập nhật công ty');
      } else {
        const nextId = `C${String(companyRows.length + 1).padStart(3, '0')}`;
        setCompanyRows((prev) => [
          {
            id: nextId,
            name: values.name,
            taxId: values.taxId,
            field: values.field,
            contact: values.contact,
            phone: values.phone,
            email: values.email,
            partners: Number(values.partners || 0),
            students: Number(values.students || 0),
            status: values.status,
            reviewStatus: values.reviewStatus,
          },
          ...prev,
        ]);
        message.success('Đã thêm công ty mới');
      }

      setOpen(false);
      form.resetFields();
      setSelectedCompany(null);
    } catch {
      // noop: validation handled by antd form
    }
  };

  const companyStats = useMemo(() => ({
    total: companyRows.length,
    active: companyRows.filter((item) => item.status === 'active').length,
    pending: companyRows.filter((item) => item.status === 'pending').length,
    paused: companyRows.filter((item) => item.status === 'paused').length,
  }), [companyRows]);

  const reviewStats = useMemo(() => ({
    total: companyRows.length,
    pending: companyRows.filter((item) => item.reviewStatus === 'pending').length,
    approved: companyRows.filter((item) => item.reviewStatus === 'approved').length,
    rejected: companyRows.filter((item) => item.reviewStatus === 'rejected').length,
  }), [companyRows]);

  const updateReviewStatus = (companyId: string, reviewStatus: ReviewStatus) => {
    setCompanyRows((prev) => prev.map((row) => (row.id === companyId ? { ...row, reviewStatus } : row)));
  };

  const confirmReviewChange = (record: CompanyRow, reviewStatus: ReviewStatus) => {
    const label = reviewMeta[reviewStatus].label;
    Modal.confirm({
      centered: true,
      title: `Chuyển ${record.name} sang ${label.toLowerCase()}?`,
      content:
        reviewStatus === 'rejected'
          ? 'Công ty sẽ được chuyển sang trạng thái từ chối và không còn nằm trong nhóm được ưu tiên công bố.'
          : reviewStatus === 'approved'
            ? 'Công ty sẽ được duyệt để tiếp tục hiển thị trong danh sách hợp tác.'
            : 'Trạng thái sẽ được đưa về chờ duyệt để xem xét lại.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: reviewStatus === 'rejected' ? { danger: true } : undefined,
      onOk: () => {
        updateReviewStatus(record.id, reviewStatus);
        message.success(`Đã cập nhật ${record.name} sang ${label.toLowerCase()}`);
      },
    });
  };

  const columns = useMemo<ColumnsType<CompanyRow>>(() => [
    {
      title: t(getKey('company_name')),
      dataIndex: 'name',
      key: 'name',
      render: (value: string, record) => (
        <div>
          <div className="font-medium text-[#2563eb]">{value}</div>
          <div className="text-xs text-slate-500">{record.field}</div>
        </div>
      ),
    },
    { title: t(getKey('company_tax_id')), dataIndex: 'taxId', key: 'taxId', width: 140 },
    { title: t(getKey('company_contact')), dataIndex: 'contact', key: 'contact', width: 180 },
    { title: 'Điện thoại', dataIndex: 'phone', key: 'phone', width: 140 },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
    { title: 'Đối tác', dataIndex: 'partners', key: 'partners', width: 100, render: (value: number) => <span>{value}</span> },
    { title: 'SV', dataIndex: 'students', key: 'students', width: 80, render: (value: number) => <span>{value}</span> },
    {
      title: 'Trạng thái',
      key: 'reviewStatus',
      width: 260,
      render: (_: unknown, record) => {
        const reviewStyle = reviewMeta[record.reviewStatus];
        const menuItems = record.reviewStatus === 'approved'
          ? [
              { key: 'pending', label: 'Chuyển sang chờ duyệt' },
              { key: 'rejected', label: 'Chuyển sang bị từ chối' },
            ]
          : record.reviewStatus === 'rejected'
            ? [
                { key: 'pending', label: 'Chuyển sang chờ duyệt' },
                { key: 'approved', label: 'Chuyển sang đã duyệt' },
              ]
            : [
                { key: 'approved', label: 'Chuyển sang đã duyệt' },
                { key: 'rejected', label: 'Chuyển sang bị từ chối' },
              ];

        return (
          <Space size={8} wrap>
            <Tag style={{ margin: 0, borderRadius: 999, padding: '0 10px', border: 'none', backgroundColor: reviewStyle.bg, color: reviewStyle.color }}>
              {reviewStyle.label}
            </Tag>
            <Dropdown
              trigger={['click']}
              menu={{
                items: menuItems,
                onClick: ({ key }) => confirmReviewChange(record, key as ReviewStatus),
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
      render: (_: unknown, record) => (
        <Space size={4}>
          <Button type="text" size="small" className="!px-2" onClick={() => handleOpenDetail(record)}>Xem</Button>
          <Button type="text" size="small" className="!px-2" onClick={() => handleOpenEdit(record)}>Sửa</Button>
          <Button type="text" size="small" danger className="!px-2" onClick={() => handleDelete(record)}>Xóa</Button>
        </Space>
      ),
    },
  ], [t]);

  const tabItems = [
    { key: 'all', label: `Tất cả (${reviewStats.total})`, icon: <BankOutlined /> },
    { key: 'approved', label: `Đã duyệt (${reviewStats.approved})`, icon: <CheckCircleOutlined /> },
    { key: 'pending', label: `Chờ duyệt (${reviewStats.pending})`, icon: <ClockCircleOutlined /> },
    { key: 'rejected', label: `Bị từ chối (${reviewStats.rejected})`, icon: <CloseCircleOutlined /> },
  ];

  return (
    <div className={cn('pb-4')}>
      <div className={cn('mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]')}>
        <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[#2196F3]/10 px-3 py-1 text-xs font-medium text-[#1976d2]')}>
          <TeamOutlined />
          Danh mục doanh nghiệp
        </div>
        <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between')}>
          <div>
            <Typography.Title level={1} className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">
              {t(getKey('company_management'))}
            </Typography.Title>
            <p className={cn('mt-2 mb-0 text-[18px] leading-[26px] text-grayDark')}>{t(getKey('company_management_desc'))}</p>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t(getKey('company_list')), value: companyStats.total, color: 'bg-[#2196F3]' },
          { label: t(getKey('company_active')), value: companyStats.active, color: 'bg-[#00A65A]' },
          { label: t(getKey('company_pending')), value: companyStats.pending, color: 'bg-[#D08A00]' },
          { label: t(getKey('company_paused')), value: companyStats.paused, color: 'bg-[#C53030]' },
        ].map((item) => (
          <Card key={item.label} className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="mt-2 text-3xl font-bold text-navyDark">{item.value}</div>
              </div>
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl text-white', item.color)}>
                <BankOutlined />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <Tabs
          activeKey={tab}
          onChange={(key) => setTab(key as CompanyTab)}
          items={tabItems.map((item) => ({
            key: item.key,
            label: (
              <span className="flex items-center gap-2 text-sm font-medium">
                {item.icon}
                {item.label}
              </span>
            ),
          }))}
          className="batch-tabs"
        />
      </div>

      <Card className="overflow-hidden rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[18px] font-bold text-navyDark">{t(getKey('company_list'))}</div>
            <div className="mt-1 text-sm text-slate-500">Danh sách doanh nghiệp hợp tác với hệ thống</div>
          </div>
          <Space wrap size={8}>
            <Button
              icon={<SendOutlined />}
              onClick={() => setPublishOpen(true)}
              className="!h-10 !rounded-[8px] !border-[#2196F3] !px-5 !font-medium !text-[#2196F3] hover:!border-[#1976d2] hover:!text-[#1976d2]"
            >
              Công bố danh sách
            </Button>
            <Button type="primary" icon={<PlusOutlined className="text-white" />} onClick={handleOpenCreate} className="!h-10 !rounded-[8px] !bg-primary !px-5 !flex !items-center !gap-2 !font-medium hover:!bg-blueDark">
              <span className="text-white text-base font-medium text-center w-full">{t(getKey('add_company'))}</span>
            </Button>
          </Space>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <Input allowClear prefix={<SearchOutlined className="text-slate-400" />} placeholder={t(getKey('search_by_company_name'))} className="!h-11 !rounded-[12px] !border-slate-300" />
          </div>
          <div className="xl:col-span-3">
            <Input
              allowClear
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder={t(getKey('search_by_company_name'))}
              className="!h-11 !rounded-[12px] !border-slate-300"
            />
          </div>
          <div className="xl:col-span-4">
            <Space.Compact block>
              <Select
                value={fieldFilter}
                onChange={setFieldFilter}
                className="!h-11 !w-[55%]"
                options={[
                  { value: 'all', label: 'Tất cả lĩnh vực' },
                  { value: 'Phần mềm & công nghệ', label: 'Phần mềm & công nghệ' },
                  { value: 'Thương mại điện tử', label: 'Thương mại điện tử' },
                  { value: 'Gia công phần mềm', label: 'Gia công phần mềm' },
                  { value: 'Công nghệ số', label: 'Công nghệ số' },
                ]}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="!h-11 !w-[45%]"
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'active', label: t(getKey('company_active')) },
                  { value: 'pending', label: t(getKey('company_pending')) },
                  { value: 'paused', label: t(getKey('company_paused')) },
                ]}
              />
            </Space.Compact>
          </div>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredRows}
          pagination={{
            total: filteredRows.length,
            pageSize: 10,
            position: ['bottomCenter'],
            showQuickJumper: false,
            showTotal(total, range) {
              return <span className="pl-2">Hiển thị {range[0]} đến {range[1]} trong {total} mục</span>;
            },
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        centered
        open={open}
        title={modalMode === 'create' ? 'Thêm công ty' : modalMode === 'edit' ? 'Chỉnh sửa công ty' : 'Chi tiết công ty'}
        onCancel={() => {
          setOpen(false);
          setSelectedCompany(null);
          form.resetFields();
        }}
        destroyOnHidden
        width={720}
        okText={modalMode === 'create' ? t(getKey('add_company')) : modalMode === 'edit' ? t(getKey('update_btn')) : undefined}
        cancelText={t(getKey('cancel_btn'))}
        onOk={handleSubmitCompany}
        footer={modalMode === 'detail' ? null : undefined}
      >
        <Form form={form} layout="vertical" className="max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <Form.Item label={t(getKey('company_name'))} name="name" rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}>
              <Input disabled={modalMode === 'detail'} placeholder="VD: FPT Software" />
            </Form.Item>
            <Form.Item label={t(getKey('company_tax_id'))} name="taxId" rules={[{ required: true, message: 'Vui lòng nhập mã số thuế' }]}>
              <Input disabled={modalMode === 'detail'} placeholder="VD: 0101243150" />
            </Form.Item>
            <Form.Item label={t(getKey('company_field'))} name="field" rules={[{ required: true, message: 'Vui lòng chọn lĩnh vực' }]}>
              <Select disabled={modalMode === 'detail'} options={[{ value: 'Phần mềm & công nghệ', label: 'Phần mềm & công nghệ' }, { value: 'Thương mại điện tử', label: 'Thương mại điện tử' }, { value: 'Gia công phần mềm', label: 'Gia công phần mềm' }, { value: 'Công nghệ số', label: 'Công nghệ số' }]} />
            </Form.Item>
            <Form.Item label={t(getKey('company_status'))} name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
              <Select disabled={modalMode === 'detail'} options={[{ value: 'active', label: t(getKey('company_active')) }, { value: 'pending', label: t(getKey('company_pending')) }, { value: 'paused', label: t(getKey('company_paused')) }]} />
            </Form.Item>
            <Form.Item label={t(getKey('company_contact'))} name="contact" rules={[{ required: true, message: 'Vui lòng nhập người liên hệ' }]}>
              <Input disabled={modalMode === 'detail'} placeholder="VD: Nguyễn Văn Hùng" />
            </Form.Item>
            <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
              <Input disabled={modalMode === 'detail'} placeholder="0901234567" />
            </Form.Item>
            <Form.Item label={t(getKey('email'))} name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
              <Input disabled={modalMode === 'detail'} placeholder="contact@company.com" />
            </Form.Item>
            <Form.Item label="Số đối tác" name="partners">
              <InputNumber disabled={modalMode === 'detail'} className="!w-full" min={0} />
            </Form.Item>
            <Form.Item label="Số sinh viên đang hợp tác" name="students">
              <InputNumber disabled={modalMode === 'detail'} className="!w-full" min={0} />
            </Form.Item>
            <Form.Item label="Trạng thái duyệt" name="reviewStatus">
              <Select
                disabled={modalMode === 'detail'}
                options={[
                  { value: 'pending', label: 'Chờ duyệt' },
                  { value: 'approved', label: 'Đã duyệt' },
                  { value: 'rejected', label: 'Đã từ chối' },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        centered
        open={publishOpen}
        title="Công bố danh sách công ty"
        onCancel={() => setPublishOpen(false)}
        destroyOnHidden
        width={560}
        okText="Công bố"
        cancelText={t(getKey('cancel_btn'))}
        okButtonProps={{ className: '!h-10 !rounded-lg !font-medium' }}
        cancelButtonProps={{ className: '!h-10 !rounded-lg !font-medium' }}
        onOk={() => setPublishOpen(false)}
      >
        <div className="space-y-3 text-sm text-slate-600">
          <p className="m-0">
            Chỉ các công ty đã được duyệt sẽ xuất hiện trong danh sách công bố.
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 font-medium text-slate-900">Tóm tắt hiện tại</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-2xl font-bold text-[#2196F3]">{companyStats.total}</div>
                <div className="text-xs text-slate-500">Tổng công ty</div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-2xl font-bold text-[#00A65A]">{reviewStats.approved}</div>
                <div className="text-xs text-slate-500">Đã duyệt</div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-2xl font-bold text-[#D08A00]">{reviewStats.pending}</div>
                <div className="text-xs text-slate-500">Chờ duyệt</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CompaniesPage;