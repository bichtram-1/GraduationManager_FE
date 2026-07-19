import { BankOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SearchOutlined, SendOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, Form, Input, message, Modal, Select, Space, Tag, Tabs, Typography, Tooltip } from 'antd';
import FilterTable from '../../components/shared/table/FilterTable';
import type { ColumnsType } from 'antd/es/table';
import PublishModal from './components/PublishModal';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, STATUS_CODE } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import { companyHooks } from '../../hooks/useCompanies';
import CompanyForm from './components/CompanyForm';
import type { ICreateCompany, IDetailCompany, IUpdateCompany } from '../../type/CompanyType';
import type { BaseListParams } from '@shared/types/GeneralType';
import type { UseQueryResult } from '@tanstack/react-query';
import { formatNumber } from '@shared/utils/numberUtils';

type CompanyStatus = 'active' | 'pending' | 'paused';
type ReviewStatus = 'pending' | 'approved' | 'rejected';
type CompanyTab = 'all' | ReviewStatus;

type CompanyListParams = BaseListParams & {
  keyword?: string;
  fieldFilter?: string;
  statusFilter?: CompanyStatus | 'all';
};

type CompanyRow = {
  id: string;
  name: string;
  taxId: string;
  field: string;
  contact: string;
  phone: string;
  email: string;
  status: CompanyStatus;
  reviewStatus: ReviewStatus;
  published: boolean;
};
const getReviewMeta = (t: (key: string) => string) => ({
  [STATUS_CODE.APPROVED]: { label: t(getKey('status_approved')), className: 'bg-[var(--color-green-light)] text-[var(--color-green-medium)]' },
  [STATUS_CODE.REJECTED]: { label: t(getKey('status_rejected')), className: 'bg-[var(--color-red-light)] text-[var(--color-red-medium)]' },
  [STATUS_CODE.PENDING]: { label: t(getKey('status_pending')), className: 'bg-[var(--color-gold-light)] text-[var(--color-gold-medium)]' },
} as const);

const CompaniesPage = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<CompanyTab>('all');
  const [publishOpen, setPublishOpen] = useState(false);
  const { data: companyList } = companyHooks.useFetchListCompanies();
  const createCompanyMutation = companyHooks.useCreateCompany();
  const updateCompanyMutation = companyHooks.useUpdateCompany();
  const deleteCompanyMutation = companyHooks.useDeleteCompany();
  const publishCompaniesMutation = companyHooks.usePublishCompanies();
  const companyRows = (companyList?.rows ?? []) as CompanyRow[];

  const useFilteredCompanyListQuery = (params: BaseListParams) => {
    const query = companyHooks.useFetchListCompanies();
    const typedParams = params as CompanyListParams;
    const normalizedKeyword = (typedParams.keyword ?? '').trim().toLowerCase();
    const filteredRows = (tab === 'all' ? companyRows : companyRows.filter((row) => row.reviewStatus === tab))
      .filter((row) => {
        const byKeyword =
          !normalizedKeyword ||
          [row.id, row.name, row.taxId, row.contact, row.email, row.field]
            .join(' ')
            .toLowerCase()
            .includes(normalizedKeyword);
        const byField = !typedParams.fieldFilter || typedParams.fieldFilter === 'all' || row.field === typedParams.fieldFilter;
        const byStatus = !typedParams.statusFilter || typedParams.statusFilter === 'all' || row.status === typedParams.statusFilter;

        return byKeyword && byField && byStatus;
      });

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
      title: t(getKey('delete_company_confirm_title')),
      content: t(getKey('delete_company_confirm_content'), { name: record.name }),
      okText: t(getKey('delete')),
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: { danger: true },
      onOk: () => deleteCompanyMutation.mutate({ id: record.id, params: { page: 1, limit: 10 } }, { onSuccess: () => message.success(t(getKey('delete_company_success'))) }),
    });
  };

  const companyStats = useMemo(() => ({
    total: companyRows.length,
    active: companyRows.filter((item) => item.status === STATUS_CODE.ACTIVE).length,
    pending: companyRows.filter((item) => item.status === STATUS_CODE.PENDING).length,
    paused: companyRows.filter((item) => item.status === STATUS_CODE.PAUSED).length,
  }), [companyRows]);

  const reviewStats = useMemo(() => ({
    total: companyRows.length,
    pending: companyRows.filter((item) => item.reviewStatus === STATUS_CODE.PENDING).length,
    approved: companyRows.filter((item) => item.reviewStatus === STATUS_CODE.APPROVED).length,
    rejected: companyRows.filter((item) => item.reviewStatus === STATUS_CODE.REJECTED).length,
  }), [companyRows]);

  const unpublishedCount = useMemo(
    () => companyRows.filter((item) => item.status === STATUS_CODE.ACTIVE && !item.published).length,
    [companyRows]
  );

  const handlePublish = () => {
    publishCompaniesMutation.mutate(undefined, {
      onSuccess: (data) => {
        message.success(data?.message || 'Công bố danh sách công ty thành công!');
        setPublishOpen(false);
      },
      onError: () => {
        message.error('Có lỗi xảy ra khi công bố danh sách công ty!');
      },
    });
  };

  const confirmReviewChange = (record: CompanyRow, reviewStatus: ReviewStatus) => {
    const meta = getReviewMeta(t)[reviewStatus];
    const label = meta.label;
    Modal.confirm({
      centered: true,
      title: t(getKey('change_review_status_confirm_title'), { name: record.name, status: label.toLowerCase() }),
      content:
        reviewStatus === STATUS_CODE.REJECTED
          ? t(getKey('change_review_status_rejected_content'))
          : reviewStatus === STATUS_CODE.APPROVED
            ? t(getKey('change_review_status_approved_content'))
            : t(getKey('change_review_status_pending_content')),
      okText: t(getKey('confirm_btn')),
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: reviewStatus === STATUS_CODE.REJECTED ? { danger: true } : undefined,
      onOk: () => updateCompanyMutation.mutate(
        { id: record.id, body: { reviewStatus }, index: 0, params: { page: 1, limit: 10 } },
        { onSuccess: () => message.success(t(getKey('update_company_status_success'), { name: record.name, status: label.toLowerCase() })) }
      ),
    });
  };

  const columns = useMemo<ColumnsType<CompanyRow>>(() => [
    {
      title: t(getKey('company_name')),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (value: string, record) => (
        <div className="truncate">
          <div className="flex items-center gap-2 truncate">
            <span className="font-medium text-[var(--color-primary)] truncate" title={value}>{value}</span>
            {record.reviewStatus === STATUS_CODE.PENDING && (
              <Tag color="purple" className="m-0 rounded-md text-[10px] py-0 px-1.5 border-none">
                Tự khai báo
              </Tag>
            )}
            {record.status === STATUS_CODE.ACTIVE && !record.published && (
              <Tag color="blue" className="m-0 rounded-md text-[10px] py-0 px-1.5 border-none">
                Mới, chưa công bố
              </Tag>
            )}
          </div>
          <div className="text-xs text-slate-500 truncate">{record.field}</div>
        </div>
      ),
    },
    { title: t(getKey('company_tax_id')), dataIndex: 'taxId', key: 'taxId', width: 140 },
    { title: t(getKey('company_contact')), dataIndex: 'contact', key: 'contact', width: 180, ellipsis: true },
    { title: t(getKey('phone_number')), dataIndex: 'phone', key: 'phone', width: 140 },
    { title: t(getKey('email')), dataIndex: 'email', key: 'email', ellipsis: true },
    {
      title: t(getKey('status')),
      key: 'reviewStatus',
      width: 260,
      render: (_: unknown, record) => {
        const reviewStyle = getReviewMeta(t)[record.reviewStatus];
        const menuItems = record.reviewStatus === STATUS_CODE.APPROVED
          ? [
              { key: STATUS_CODE.PENDING, label: t(getKey('change_to_pending')) },
              { key: STATUS_CODE.REJECTED, label: t(getKey('change_to_rejected')) },
            ]
          : record.reviewStatus === STATUS_CODE.REJECTED
            ? [
                { key: STATUS_CODE.PENDING, label: t(getKey('change_to_pending')) },
                { key: STATUS_CODE.APPROVED, label: t(getKey('change_to_approved')) },
              ]
            : [
                { key: STATUS_CODE.APPROVED, label: t(getKey('change_to_approved')) },
                { key: STATUS_CODE.REJECTED, label: t(getKey('change_to_rejected')) },
              ];

        return (
          <Space size={8} wrap>
            <Tag className={cn("m-0 rounded-full px-[10px] py-0 border-none", reviewStyle.className)}>
              {reviewStyle.label}
            </Tag>
            <Dropdown
              trigger={['click']}
              menu={{
                items: menuItems,
                onClick: ({ key }) => confirmReviewChange(record, key as ReviewStatus),
              }}
            >
              <Button type="text" size="small" className="!h-8 !rounded-[8px] !px-2 !font-medium !text-[var(--color-primary)] hover:!bg-[var(--color-blue-light)]">
                {t(getKey('change_status_btn'))}
              </Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ], [t]);

  const tabItems = [
    { key: 'all', label: `${t(getKey('all'))} (${formatNumber(reviewStats.total)})`, icon: <BankOutlined /> },
    { key: 'approved', label: `${t(getKey('status_approved'))} (${formatNumber(reviewStats.approved)})`, icon: <CheckCircleOutlined /> },
    { key: 'pending', label: `${t(getKey('status_pending'))} (${formatNumber(reviewStats.pending)})`, icon: <ClockCircleOutlined /> },
    { key: 'rejected', label: `${t(getKey('status_rejected'))} (${formatNumber(reviewStats.rejected)})`, icon: <CloseCircleOutlined /> },
  ];

  return (
    <div className={cn('pb-4')}>
      <div className={cn('mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]')}>
        <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-light)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]')}>
          <TeamOutlined />
          {t(getKey('company_directory'))}
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
            className="!h-10 !rounded-[8px] !border-[var(--color-primary)] !px-5 !font-medium !text-[var(--color-primary)] hover:!border-[var(--color-primary)] hover:!text-[var(--color-primary)]"
          >
            {t(getKey('publish_list_btn'))}
          </Button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t(getKey('company_list')), value: companyStats.total, color: 'bg-[var(--color-primary)]' },
          { label: t(getKey('company_active')), value: companyStats.active, color: 'bg-[var(--color-green-medium)]' },
          { label: t(getKey('company_pending')), value: companyStats.pending, color: 'bg-[var(--color-gold-medium)]' },
          { label: t(getKey('company_paused')), value: companyStats.paused, color: 'bg-[var(--color-red-medium)]' },
        ].map((item) => (
          <Card key={item.label} className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="mt-2 text-3xl font-bold text-navyDark">{formatNumber(item.value)}</div>
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

      <Card className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
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
                title: t(getKey('add_company')),
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
                title: t(getKey('edit_company')),
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
                title: t(getKey('detail_company')),
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
            status: detail.status,
            reviewStatus: detail.reviewStatus ?? STATUS_CODE.PENDING,
          })}
          formatFormValues={(values: Record<string, unknown>) => values as ICreateCompany | IUpdateCompany}
          filterRender={() => (
            <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-12">
              <Form.Item name="keyword" className="xl:col-span-5 !mb-0">
                <Input
                  allowClear
                  prefix={<SearchOutlined className="text-slate-400" />}
                  placeholder={t(getKey('search_by_company_name'))}
                  className="!h-11 !rounded-[12px] !border-slate-300"
                />
              </Form.Item>
              <Form.Item name="fieldFilter" className="xl:col-span-4 !mb-0">
                <Select
                  allowClear
                  placeholder={t(getKey('all_fields'))}
                  className="!h-11 !w-full"
                  options={[
                    { value: 'all', label: t(getKey('all_fields')) },
                    { value: 'Phần mềm', label: 'Phần mềm' },
                    { value: 'Mạng máy tính', label: 'Mạng máy tính' },
                    { value: 'An toàn thông tin', label: 'An toàn thông tin' },
                    { value: 'Hệ thống thông tin', label: 'Hệ thống thông tin' },
                    { value: 'Trí tuệ nhân tạo', label: 'Trí tuệ nhân tạo' },
                    { value: 'Thiết kế đồ họa / UI-UX', label: 'Thiết kế đồ họa / UI-UX' },
                    { value: 'Thương mại điện tử', label: 'Thương mại điện tử' },
                    { value: 'Phần cứng & Nhúng', label: 'Phần cứng & Nhúng' },
                    { value: 'Fintech', label: 'Fintech' },
                    { value: 'Internet', label: 'Internet' },
                    { value: 'Viễn thông', label: 'Viễn thông' },
                    { value: 'Khác', label: 'Khác' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="statusFilter" className="xl:col-span-3 !mb-0">
                <Select
                  allowClear
                  placeholder={t(getKey('all_status'))}
                  className="!h-11 !w-full"
                  options={[
                    { value: 'all', label: t(getKey('all_status')) },
                    { value: STATUS_CODE.ACTIVE, label: t(getKey('company_active')) },
                    { value: STATUS_CODE.PENDING, label: t(getKey('company_pending')) },
                    { value: STATUS_CODE.PAUSED, label: t(getKey('company_paused')) },
                  ]}
                />
              </Form.Item>
            </div>
          )}
          actions={{
            isDetail: true,
            isEdit: true,
            isDelete: false,
            customAction: (record: unknown) => {
              const r = record as CompanyRow & { students?: number };
              const hasInterns = r.students && r.students > 0;
              return (
                <div className="pointer-events-auto">
                  <Space size={4}>
                    {hasInterns ? (
                      <Tooltip title="Không thể xóa doanh nghiệp đang có sinh viên thực tập đã được phê duyệt">
                        <Button type="text" size="small" disabled className="!px-2 text-slate-300 cursor-not-allowed" style={{ color: '#cbd5e1' }}>
                          <DeleteOutlined />
                        </Button>
                      </Tooltip>
                    ) : (
                      <Button type="text" size="small" danger className="!px-2 pointer-events-auto" onClick={() => handleDelete(r)} title={t(getKey('delete'))}>
                        <DeleteOutlined />
                      </Button>
                    )}
                  </Space>
                </div>
              );
            },
          }}
        />
      </Card>

      <PublishModal
        open={publishOpen}
        onCancel={() => setPublishOpen(false)}
        onOk={handlePublish}
        confirmLoading={publishCompaniesMutation.isPending}
        companyStats={companyStats}
        reviewStats={reviewStats}
        unpublishedCount={unpublishedCount}
      />
    </div>
  );
};

export default CompaniesPage;