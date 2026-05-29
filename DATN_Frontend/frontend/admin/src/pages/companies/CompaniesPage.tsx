import { BankOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SearchOutlined, SendOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, Input, message, Modal, Select, Space, Tag, Tabs, Typography } from 'antd';
import FilterTable from '../../components/shared/table/FilterTable';
import type { ColumnsType } from 'antd/es/table';
import PublishModal from './components/PublishModal';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import { companyHooks } from '../../hooks/useCompanies';
import CompanyForm from './components/CompanyForm';
import type { ICreateCompany, IDetailCompany, IUpdateCompany } from '../../type/CompanyType';
import type { BaseListParams } from '@shared/types/GeneralType';
import type { UseQueryResult } from '@tanstack/react-query';

type CompanyStatus = 'active' | 'pending' | 'paused';
type ReviewStatus = 'pending' | 'approved' | 'rejected';
type CompanyTab = 'all' | ReviewStatus;

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

const reviewMeta: Record<ReviewStatus, { label: string; color: string; bg: string }> = {
  approved: { label: 'Đã duyệt', color: '#00A65A', bg: '#E8F9EE' },
  rejected: { label: 'Đã từ chối', color: '#C53030', bg: '#FFEDED' },
  pending: { label: 'Chờ duyệt', color: '#D08A00', bg: '#FFF7E6' },
};

const CompaniesPage = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<CompanyTab>('all');
  const [publishOpen, setPublishOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CompanyStatus>('all');
  const { data: companyList } = companyHooks.useFetchListCompanies();
  const createCompanyMutation = companyHooks.useCreateCompany();
  const updateCompanyMutation = companyHooks.useUpdateCompany();
  const deleteCompanyMutation = companyHooks.useDeleteCompany();
  const companyRows = (companyList?.rows ?? COMPANY_ROWS) as CompanyRow[];

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

  const useFilteredCompanyListQuery = (_params: BaseListParams) => {
    const query = companyHooks.useFetchListCompanies();

    return {
      ...query,
      data: query.data
        ? {
            ...query.data,
            rows: filteredRows,
            total: filteredRows.length,
          }
        : query.data,
      } as UseQueryResult<{ rows: CompanyRow[]; total: number }, Error>;
  };

  const handleDelete = (record: CompanyRow) => {
    Modal.confirm({
      centered: true,
      title: 'Xóa công ty?',
      content: `Bạn có chắc muốn xóa ${record.name}?`,
      okText: 'Xóa',
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: { danger: true },
      onOk: () => deleteCompanyMutation.mutate({ id: record.id, params: { page: 1, limit: 10 } }, { onSuccess: () => message.success('Đã xóa công ty') }),
    });
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
      onOk: () => updateCompanyMutation.mutate({ id: record.id, body: { reviewStatus }, index: 0, params: { page: 1, limit: 10 } }, { onSuccess: () => message.success(`Đã cập nhật ${record.name} sang ${label.toLowerCase()}`) }),
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
          <Button
            icon={<SendOutlined />}
            onClick={() => setPublishOpen(true)}
            className="!h-10 !rounded-[8px] !border-[#2196F3] !px-5 !font-medium !text-[#2196F3] hover:!border-[#1976d2] hover:!text-[#1976d2]"
          >
            Công bố danh sách
          </Button>
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
        <FilterTable<CompanyRow, IDetailCompany, ICreateCompany, IUpdateCompany>
          title={t(getKey('company_list'))}
          createButtonLabel={t(getKey('add_company'))}
          columns={columns}
          useQueryHook={useFilteredCompanyListQuery}
          createInfo={{
            type: 'modal',
            modalInfo: {
              modalContent: <CompanyForm />,
              modalProps: {
                centered: true,
                width: 720,
                title: 'Thêm công ty',
              },
              modalFunc: createCompanyMutation,
            },
          }}
          updateInfo={{
            type: 'modal',
            modalInfo: {
              modalContent: <CompanyForm />,
              modalProps: {
                centered: true,
                width: 720,
                title: 'Chỉnh sửa công ty',
              },
              modalFunc: updateCompanyMutation,
            },
          }}
          detailInfo={{
            type: 'modal',
            modalInfo: {
              modalContent: <CompanyForm disabled />,
              modalProps: {
                centered: true,
                width: 720,
                title: 'Chi tiết công ty',
                footer: null,
              },
              modalFunc: companyHooks.useFetchDetailCompany,
            },
          }}
          formatInitialValues={(detail: IDetailCompany) => ({
            name: detail.name,
            taxId: detail.taxId,
            field: detail.field,
            contact: detail.contact,
            phone: detail.phone || '',
            email: detail.email || '',
            partners: detail.partners ?? 0,
            students: detail.students ?? 0,
            status: detail.status,
            reviewStatus: detail.reviewStatus ?? 'pending',
          })}
          formatFormValues={(values: Record<string, unknown>) => values as ICreateCompany | IUpdateCompany}
          filterRender={() => (
            <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-12">
              <div className="xl:col-span-5">
                <Input
                  allowClear
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  prefix={<SearchOutlined className="text-slate-400" />}
                  placeholder={t(getKey('search_by_company_name'))}
                  className="!h-11 !rounded-[12px] !border-slate-300"
                />
              </div>
              <div className="xl:col-span-7">
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
          )}
          actions={{
            isDetail: true,
            isEdit: true,
            isDelete: false,
            customAction: (record: unknown) => {
              const r = record as CompanyRow;
              return (
                <div className="pointer-events-auto">
                  <Space size={4}>
                    <Button type="text" size="small" danger className="!px-2 pointer-events-auto" onClick={() => handleDelete(r)} title="Xóa">
                      <DeleteOutlined />
                    </Button>
                  </Space>
                </div>
              );
            },
          }}
        />
      </Card>

      <PublishModal open={publishOpen} onCancel={() => setPublishOpen(false)} onOk={() => setPublishOpen(false)} companyStats={companyStats} reviewStats={reviewStats} />
    </div>
  );
};

export default CompaniesPage;