import { BankOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SearchOutlined, TeamOutlined, DeleteOutlined, FileExcelOutlined, DownloadOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Card, Dropdown, Form, Input, message, Modal, Select, Space, Tag, Tabs, Typography, Tooltip, Upload, Alert } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import FilterTable from '../../components/shared/table/FilterTable';
import type { ColumnsType } from 'antd/es/table';
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
import * as XLSX from 'xlsx';

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
  address?: string;
  field: string;
  contact: string;
  phone: string;
  email: string;
  status: CompanyStatus;
  reviewStatus: ReviewStatus;
  published: boolean;
  firstStudent?: string;
  students?: number;       // SV đã duyệt (DA_DUYET + CHO_CAP_GIAY)
  pendingStudents?: number; // SV đang chờ duyệt (CHO_DUYET) — sẽ bị tự động từ chối nếu tạm dừng
};
const getReviewMeta = (t: (key: string) => string) => ({
  [STATUS_CODE.APPROVED]: { label: t(getKey('status_approved')), className: 'bg-[var(--color-green-light)] text-[var(--color-green-medium)]' },
  [STATUS_CODE.REJECTED]: { label: t(getKey('status_rejected')), className: 'bg-[var(--color-red-light)] text-[var(--color-red-medium)]' },
  [STATUS_CODE.PENDING]: { label: t(getKey('status_pending')), className: 'bg-[var(--color-gold-light)] text-[var(--color-gold-medium)]' },
} as const);

const CompaniesPage = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<CompanyTab>('all');
  const { data: companyList } = companyHooks.useFetchListCompanies();
  const createCompanyMutation = companyHooks.useCreateCompany();
  const updateCompanyMutation = companyHooks.useUpdateCompany();
  const deleteCompanyMutation = companyHooks.useDeleteCompany();
  const companyRows = (companyList?.rows ?? []) as CompanyRow[];

  const importMutation = companyHooks.useImportCompanies();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewData, setPreviewData] = useState<unknown[][]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const handleImportSubmit = () => {
    if (fileList.length === 0) {
      message.error('Vui lòng chọn file Excel.');
      return;
    }

    const formData = new FormData();
    const fileObj = (fileList[0] as unknown as { originFileObj?: File }).originFileObj || (fileList[0] as unknown as File);
    formData.append('file', fileObj);

    setImportErrors([]);
    setImportSuccessMessage(null);

    importMutation.mutate(formData, {
      onSuccess: (res) => {
        if (res.success) {
          message.success(res.message || 'Import doanh nghiệp thành công.');
          setImportSuccessMessage(res.message);
          setTimeout(() => {
            handleCloseImportModal();
          }, 2000);
        }
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { errors?: string[]; message?: string } }; message?: string };
        const errors = err?.response?.data?.errors;
        const msg = err?.response?.data?.message;
        if (Array.isArray(errors)) {
          setImportErrors(errors);
          message.error(msg || 'Import thất bại, vui lòng kiểm tra lại file.');
        } else {
          message.error(msg || err?.message || 'Có lỗi xảy ra khi import.');
        }
      },
    });
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setFileList([]);
    setImportErrors([]);
    setImportSuccessMessage(null);
    setPreviewData([]);
  };

  const handleExportExcel = () => {
    const listToExport = companyRows;
    if (listToExport.length === 0) {
      message.warning('Không có dữ liệu doanh nghiệp để xuất.');
      return;
    }
    
    const exportData = listToExport.map(row => ({
      'Tên doanh nghiệp': row.name || '',
      'Mã số thuế': row.taxId || '',
      'Lĩnh vực hoạt động': row.field || '',
      'Địa chỉ trụ sở': row.address || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách doanh nghiệp');
    XLSX.writeFile(workbook, 'Danh_sach_doanh_nghiep.xlsx');
    message.success('Xuất file Excel thành công.');
  };

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

  const confirmReviewChange = (record: CompanyRow, reviewStatus: ReviewStatus) => {
    const meta = getReviewMeta(t)[reviewStatus];
    const label = meta.label;

    const doUpdate = () =>
      updateCompanyMutation.mutate(
        { id: record.id, body: { reviewStatus }, index: 0, params: { page: 1, limit: 10 } },
        { onSuccess: () => message.success(t(getKey('update_company_status_success'), { name: record.name, status: label.toLowerCase() })) }
      );

    // Chỉ tạm dừng (rejected = NGUNG_HOAT_DONG) mới cần cảnh báo
    if (reviewStatus === STATUS_CODE.REJECTED) {
      const activeCount  = record.students ?? 0;   // DA_DUYET + CHO_CAP_GIAY
      const pendingCount = record.pendingStudents ?? 0; // CHO_DUYET
      const hasAffected  = activeCount > 0 || pendingCount > 0;

      Modal.confirm({
        centered: true,
        icon: <ExclamationCircleFilled className="!text-amber-500" />,
        title: `Tạm dừng công ty “${record.name}”?`,
        content: (
          <div className="text-sm space-y-2 mt-1">
            {hasAffected ? (
              <>
                <p className="font-medium text-amber-700">⚠️ Công ty này đang có sinh viên liên quan:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  {activeCount > 0 && (
                    <li>
                      <span className="font-semibold text-green-700">{activeCount} SV đã được duyệt</span>
                      {' '}(DA_DUYET / Chờ cấp giấy) — <span className="text-slate-500">không bị ảnh hưởng, vẫn xử lý bình thường</span>
                    </li>
                  )}
                  {pendingCount > 0 && (
                    <li>
                      <span className="font-semibold text-red-600">{pendingCount} SV đang chờ duyệt</span>
                      {' '}— <span className="text-red-500 font-medium">sẽ bị tự động từ chối ngay!</span>
                    </li>
                  )}
                </ul>
              </>
            ) : (
              <p className="text-slate-600">Công ty này không có sinh viên nào đang ký trong đợt hoạt động.</p>
            )}
            <p className="text-slate-500 text-xs pt-1">
              Sau khi tạm dừng, sinh viên sẽ không thấy công ty này trong danh sách chọn khai báo.
            </p>
          </div>
        ),
        okText: 'Vẫn tạm dừng',
        cancelText: t(getKey('cancel_btn')),
        okButtonProps: { danger: true },
        onOk: doUpdate,
      });
      return;
    }

    // Các trường hợp khác (approved / pending): modal đơn giản như cũ
    Modal.confirm({
      centered: true,
      title: t(getKey('change_review_status_confirm_title'), { name: record.name, status: label.toLowerCase() }),
      content:
        reviewStatus === STATUS_CODE.APPROVED
          ? t(getKey('change_review_status_approved_content'))
          : t(getKey('change_review_status_pending_content')),
      okText: t(getKey('confirm_btn')),
      cancelText: t(getKey('cancel_btn')),
      onOk: doUpdate,
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
          </div>
          <div className="text-xs text-slate-500 truncate">{record.field}</div>
        </div>
      ),
    },
    { title: t(getKey('company_tax_id')), dataIndex: 'taxId', key: 'taxId', width: 140 },
    {
      title: 'Người khai báo đầu tiên',
      dataIndex: 'firstStudent',
      key: 'firstStudent',
      ellipsis: true,
      render: (v: string) => <span className="text-slate-600 font-medium">{v || 'Hệ thống'}</span>
    },
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
          <div className="flex items-center gap-2 whitespace-nowrap">
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
          </div>
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
          extraHeaderActions={
            <Space size={8}>
              <Button
                type="primary"
                ghost
                icon={<FileExcelOutlined />}
                onClick={() => setIsImportModalOpen(true)}
                className="!h-10 !rounded-[8px] !px-4 !flex !items-center !gap-2 !font-medium"
              >
                <span>Import Excel</span>
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportExcel}
                className="!h-10 !rounded-[8px] !px-4 !flex !items-center !gap-2 !font-medium"
              >
                <span>Xuất Excel</span>
              </Button>
            </Space>
          }
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

      <Modal
        title={
          <Space>
            <FileExcelOutlined className="text-green-600 text-xl" />
            <span className="font-bold text-lg text-slate-800">Import doanh nghiệp từ Excel</span>
          </Space>
        }
        open={isImportModalOpen}
        onCancel={handleCloseImportModal}
        footer={[
          <Button key="cancel" onClick={handleCloseImportModal} className="!h-10 !px-4 !rounded-lg">
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={importMutation.isPending}
            onClick={handleImportSubmit}
            disabled={fileList.length === 0}
            className="!h-10 !px-4 !rounded-lg !bg-primary hover:!bg-blueDark"
          >
            Import
          </Button>,
        ]}
        width={600}
        destroyOnClose
        centered
        maskClosable={false}
      >
        <div className="py-4">
          <div className="space-y-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2 items-center justify-center text-center">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Tải file Excel dữ liệu doanh nghiệp lên hệ thống <span className="text-red-500">*</span>
              </label>
              <Upload
                accept=".xlsx, .xls"
                fileList={fileList}
                beforeUpload={(file) => {
                  setFileList([file]);
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const parsed = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    setPreviewData(parsed.slice(0, 6) as unknown[][]);
                  };
                  reader.readAsBinaryString(file);
                  return false;
                }}
                onRemove={() => {
                  setFileList([]);
                  setPreviewData([]);
                }}
                className="w-full flex justify-center"
              >
                {fileList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-blue-50/50 hover:border-primary transition cursor-pointer w-[480px] text-center min-h-[140px] px-8">
                    <FileExcelOutlined className="text-4xl text-green-500 mb-3 animate-pulse" />
                    <div className="text-sm font-semibold text-slate-700">Kéo thả hoặc nhấp để chọn file Excel</div>
                    <div className="text-xs text-slate-400 mt-1">Chấp nhận định dạng .xlsx, .xls</div>
                  </div>
                ) : null}
              </Upload>
            </div>

            {previewData.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="text-xs font-semibold text-slate-500">Xem trước dữ liệu (tối đa 5 dòng đầu):</div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50 p-2 max-h-48">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-medium bg-slate-100">
                        {previewData[0]?.map((col: unknown, i: number) => (
                          <th key={i} className="p-1.5 font-medium">{String(col) || `Cột ${i+1}`}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(previewData.slice(1) as unknown[][]).map((row: unknown[], i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {(previewData[0] as unknown[])?.map((_: unknown, j: number) => (
                            <td key={j} className="p-1.5 truncate max-w-[150px]" title={row[j] !== undefined ? String(row[j]) : ''}>{row[j] !== undefined ? String(row[j]) : '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {importSuccessMessage && (
              <Alert
                message="Thành công"
                description={importSuccessMessage}
                type="success"
                showIcon
              />
            )}

            {importErrors.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <div className="text-sm font-bold text-red-600 inline-flex items-center gap-1">
                  <ExclamationCircleFilled /> Danh sách lỗi dòng dữ liệu ({importErrors.length} lỗi):
                </div>
                <div className="max-h-60 overflow-y-auto border border-red-100 rounded-lg bg-red-50/30 p-3 text-xs text-red-700 space-y-1 font-mono">
                  {importErrors.map((err, idx) => (
                    <div key={idx} className="border-b border-red-100/50 pb-1 last:border-0 last:pb-0">
                      • {err}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CompaniesPage;