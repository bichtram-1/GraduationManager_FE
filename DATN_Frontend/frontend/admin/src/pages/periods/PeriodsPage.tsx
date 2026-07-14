import {
  ReadOutlined,
  TeamOutlined,
  UserAddOutlined,
  SearchOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Select, Tag, Tabs, Tooltip, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import FilterTable from '../../components/shared/table/FilterTable';
import PeriodForm from './components/PeriodForm';
import { periodHooks } from '../../hooks/usePeriods';
import { userHooks } from '../../hooks/useUsers';
import type { BatchStatus, BatchType, ICreatePeriod, IUpdatePeriod, IListPeriod, IDetailPeriod } from '../../type/PeriodType';
import { STATUS_CODE, cn } from '../../constants/commonConst';

const getStatusMeta = (t: (key: string) => string) => ({
  [STATUS_CODE.OPEN]: { label: t(getKey('period_status_open')), className: '!bg-[var(--color-green-light)] !text-[var(--color-green-medium)]' },
  [STATUS_CODE.PUBLISHED]: { label: t(getKey('period_status_published')), className: '!bg-[var(--color-blue-light)] !text-[var(--color-blue-medium)]' },
  [STATUS_CODE.GRADING]: { label: t(getKey('period_status_grading')), className: '!bg-[var(--color-gold-light)] !text-[var(--color-gold-medium)]' },
  [STATUS_CODE.CLOSED]: { label: t(getKey('period_status_closed')), className: '!bg-[var(--color-red-light)] !text-[var(--color-red-medium)]' },
} as const);

const PeriodsPage = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<BatchType>('tttn');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BatchStatus>('all');
  const listParams = { page: 1, limit: 10, type: tab, status: statusFilter, keyword };
  const createPeriodMutation = periodHooks.useCreatePeriod();
  const updatePeriodMutation = periodHooks.useUpdatePeriod();
  const deletePeriodMutation = periodHooks.useDeletePeriod();

  const [statusModalRecord, setStatusModalRecord] = useState<IListPeriod | null>(null);
  const [newStatus, setNewStatus] = useState<BatchStatus | undefined>(undefined);

  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [addStudentForm] = Form.useForm();
  const [studentSearchKeyword, setStudentSearchKeyword] = useState('');

  const { data: searchStudentsData, isLoading: isSearchStudentsLoading } = userHooks.useFetchListUsers({
    role: 'student',
    keyword: studentSearchKeyword,
    page: 1,
    limit: 15,
  });

  const searchStudentsList = useMemo(() => {
    if (!searchStudentsData) return [];
    if (Array.isArray(searchStudentsData)) return searchStudentsData;
    const dataWithRows = searchStudentsData as { rows?: unknown[] };
    if (Array.isArray(dataWithRows.rows)) return dataWithRows.rows;
    return [];
  }, [searchStudentsData]);

  const searchStudentOptions = useMemo(() => {
    return (searchStudentsList as { id: string; name: string; className?: string | null }[]).map((sv) => ({
      value: sv.id,
      label: `${sv.id} - ${sv.name} (${sv.className || 'Không lớp'})`,
    }));
  }, [searchStudentsList]);

  const { data: allPeriodsData } = periodHooks.useFetchListPeriods({
    page: 1,
    limit: 100,
  });

  const periodOptions = useMemo(() => {
    if (!allPeriodsData || !allPeriodsData.rows) return [];
    return allPeriodsData.rows.map((p: IListPeriod) => ({
      value: p.id,
      label: `${p.name} (${p.type === 'tttn' ? 'TTTN' : 'ĐATN'})`,
    }));
  }, [allPeriodsData]);

  const addStudentMutation = periodHooks.useAddStudentToPeriods();

  const handleAddStudentSubmit = async (values: { studentId: string; periodIds: string[]; reason?: string }) => {
    addStudentMutation.mutate(
      {
        studentId: values.studentId,
        periodIds: values.periodIds,
      },
      {
        onSuccess: () => {
          message.success('Thêm sinh viên vào các đợt thành công!');
          setIsAddStudentModalOpen(false);
          addStudentForm.resetFields();
          setStudentSearchKeyword('');
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          message.error(msg || 'Có lỗi xảy ra khi thêm sinh viên!');
        },
      }
    );
  };

  const handleTabChange = (key: string) => {
    const nextTab = key as BatchType;
    setTab(nextTab);
  };

  const openStatusModal = (record: IListPeriod) => {
    setStatusModalRecord(record);
    setNewStatus(record.status);
  };

  const closeStatusModal = () => {
    setStatusModalRecord(null);
    setNewStatus(undefined);
  };

  const handleChangeStatusSubmit = () => {
    if (!statusModalRecord || !newStatus) return;
    updatePeriodMutation.mutate(
      {
        id: statusModalRecord.id,
        body: { status: newStatus } as IUpdatePeriod,
        index: 0,
        params: listParams,
      },
      {
        onSuccess: () => {
          message.success('Cập nhật trạng thái đợt thành công!');
          closeStatusModal();
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          message.error(msg || 'Có lỗi xảy ra khi cập nhật trạng thái đợt!');
        },
      }
    );
  };

  const batchTabs = useMemo(() => [
    { key: 'tttn' as const, label: t(getKey('period_management')) + ' (TTTN)', icon: <TeamOutlined /> },
    { key: 'datn' as const, label: t(getKey('period_management')) + ' (ĐATN)', icon: <ReadOutlined /> },
  ], [t]);

  const columns = useMemo<ColumnsType<IListPeriod>>(
    () => [
      {
        title: t(getKey('create_period')),
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        render: (name: string) => <span className="font-medium text-primary">{name}</span>,
      },
      {
        title: t(getKey('start_date')),
        dataIndex: 'startDate',
        key: 'startDate',
        render: (value: string) => <span className="text-slate-600">{value}</span>,
      },
      {
        title: t(getKey('end_date')),
        dataIndex: 'endDate',
        key: 'endDate',
        render: (value: string) => <span className="text-slate-600">{value}</span>,
      },
      {
        title: t(getKey('registration_deadline')),
        dataIndex: 'regDeadline',
        key: 'regDeadline',
        render: (value: string) => <span className="text-slate-600">{value}</span>,
      },
      {
        title: t(getKey('group_status')),
        dataIndex: 'status',
        key: 'status',
        render: (value: BatchStatus) => {
          const badge = getStatusMeta(t)[value];
          return (
            <Tag className={cn('!m-0 !rounded-full !px-2.5 !py-[2px] !border-none', badge?.className)}>
              {badge?.label || value}
            </Tag>
          );
        },
      },
    ],
    [t],
  );

  return (
    <div className="pb-4">
      <div className="mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <TeamOutlined />
          {t(getKey('period_management'))}
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">
              {t(getKey('period_management'))}
            </h1>
            <p className="mt-2 mb-0 text-[18px] leading-[26px] text-grayDark">
              {t(getKey('period_management_desc'))}
            </p>
          </div>
          <Button
            type="default"
            icon={<UserAddOutlined className="text-primary" />}
            onClick={() => setIsAddStudentModalOpen(true)}
            className="!h-10 !rounded-[8px] !border-primary !text-primary !px-5 !flex !items-center !gap-2 !font-medium hover:!bg-primary/5 hover:!border-primary/80"
          >
            <span className="text-primary text-base font-medium text-center w-full">
              Thêm sinh viên thủ công
            </span>
          </Button>
        </div>
      </div>

      <div className="mb-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <Tabs activeKey={tab} onChange={handleTabChange} items={batchTabs} />
      </div>

      <Card className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <FilterTable<IListPeriod, IDetailPeriod, ICreatePeriod, IUpdatePeriod>
          title={t(getKey('period_list'))}
          pageTitle={t(getKey('period_management'))}
          createButtonLabel={tab === 'tttn' ? 'Tạo đợt TTTN mới' : 'Tạo đợt ĐATN mới'}
          columns={columns}
          useQueryHook={periodHooks.useFetchListPeriods}
          paramVariables={listParams}
          filterRender={() => (
            <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-12">
              <Form.Item name="keyword" className="xl:col-span-8 !mb-0">
                <Input
                  allowClear
                  placeholder={t(getKey('search_period_placeholder'))}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="!h-11 !rounded-[12px] !border-slate-300"
                />
              </Form.Item>
              <Form.Item name="status" className="xl:col-span-4 !mb-0">
                <Select
                  allowClear
                  placeholder={t(getKey('group_status'))}
                  onChange={(v) => setStatusFilter(v || 'all')}
                  className="!h-11 !w-full"
                  options={[
                    { value: 'all', label: t(getKey('all_tab')) },
                    { value: STATUS_CODE.OPEN, label: t(getKey('period_status_open')) },
                    { value: STATUS_CODE.PUBLISHED, label: t(getKey('period_status_published')) },
                    { value: STATUS_CODE.GRADING, label: t(getKey('period_status_grading')) },
                    { value: STATUS_CODE.CLOSED, label: t(getKey('period_status_closed')) },
                  ]}
                />
              </Form.Item>
            </div>
          )}
          createInfo={{ type: 'modal', modalInfo: { modalContent: <PeriodForm tab={tab} />, modalProps: { centered: true, width: 820, title: tab === 'tttn' ? 'Tạo đợt TTTN mới' : 'Tạo đợt ĐATN mới' }, modalFunc: createPeriodMutation } }}
          updateInfo={{ type: 'modal', modalInfo: { modalContent: <PeriodForm tab={tab} />, modalProps: { centered: true, width: 820, title: t(getKey('edit_period')) }, modalFunc: updatePeriodMutation } }}
          actions={{
            isDetail: true,
            isEdit: true,
            isDelete: true,
            isDeleteDisabled: (record) => (record as IListPeriod).status === STATUS_CODE.CLOSED,
            customAction: (record) => {
              const period = record as IListPeriod;
              return (
                <div className="pointer-events-auto">
                  <Tooltip title="Đổi trạng thái đợt">
                    <Button
                      type="text"
                      size="small"
                      className="!px-2 pointer-events-auto"
                      onClick={() => openStatusModal(period)}
                    >
                      <SwapOutlined className="text-[var(--color-primary)]" />
                    </Button>
                  </Tooltip>
                </div>
              );
            },
          }}
          detailInfo={{ type: 'modal', modalInfo: { modalContent: <PeriodForm tab={tab} disabled />, modalProps: { centered: true, width: 820, title: t(getKey('detail_period')), footer: null }, modalFunc: periodHooks.useFetchDetailPeriod as unknown as (id: string, enable: boolean) => import('@tanstack/react-query').UseQueryResult<IDetailPeriod, Error> } }}
          deleteInfo={{ type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: deletePeriodMutation as unknown as UseMutationResult<IListPeriod, AxiosError, { id: string; params: import('@shared/types/GeneralType').BaseListParams }> } }}
          formatFormValues={(values) => ({
            ...values,
            type: (values.type as BatchType) || tab,
          } as ICreatePeriod)}
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserAddOutlined className="text-primary text-xl" />
            <span className="text-lg font-bold text-slate-800">Thêm sinh viên thủ công</span>
          </div>
        }
        open={isAddStudentModalOpen}
        onCancel={() => {
          setIsAddStudentModalOpen(false);
          addStudentForm.resetFields();
          setStudentSearchKeyword('');
        }}
        onOk={() => addStudentForm.submit()}
        confirmLoading={addStudentMutation.isPending}
        centered
        width={550}
        okText="Thêm vào các đợt"
        cancelText="Hủy"
        okButtonProps={{ className: '!h-10 !px-5 !rounded-lg !bg-primary' }}
        cancelButtonProps={{ className: '!h-10 !px-5 !rounded-lg' }}
      >
        <Form
          form={addStudentForm}
          layout="vertical"
          onFinish={handleAddStudentSubmit}
          className="pt-4"
        >
          <Form.Item
            name="studentId"
            label="Chọn sinh viên"
            rules={[{ required: true, message: 'Vui lòng chọn một sinh viên!' }]}
          >
            <Select
              showSearch
              placeholder="Tìm kiếm sinh viên theo tên hoặc MSSV..."
              defaultActiveFirstOption={false}
              suffixIcon={<SearchOutlined />}
              filterOption={false}
              onSearch={(val) => setStudentSearchKeyword(val)}
              notFoundContent={isSearchStudentsLoading ? 'Đang tìm...' : 'Không tìm thấy sinh viên'}
              options={searchStudentOptions}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="periodIds"
            label="Chọn đợt đăng ký"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một đợt đăng ký!' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn các đợt để thêm sinh viên này vào..."
              optionFilterProp="label"
              options={periodOptions}
              className="w-full"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <SwapOutlined className="text-primary text-xl" />
            <span className="text-lg font-bold text-slate-800">Đổi trạng thái đợt</span>
          </div>
        }
        open={!!statusModalRecord}
        onCancel={closeStatusModal}
        onOk={handleChangeStatusSubmit}
        confirmLoading={updatePeriodMutation.isPending}
        centered
        width={420}
        okText="Cập nhật"
        cancelText="Hủy"
        okButtonProps={{ className: '!h-10 !px-5 !rounded-lg !bg-primary' }}
        cancelButtonProps={{ className: '!h-10 !px-5 !rounded-lg' }}
      >
        {statusModalRecord && (
          <div className="pt-4">
            <div className="mb-4 text-sm text-slate-600">
              Đợt: <span className="font-medium text-slate-900">{statusModalRecord.name}</span>
            </div>
            <div className="mb-2 text-sm font-medium text-slate-700">Trạng thái mới</div>
            <Select
              value={newStatus}
              onChange={(v) => setNewStatus(v)}
              className="!h-11 !w-full"
              options={[
                { value: STATUS_CODE.OPEN, label: t(getKey('period_status_open')) },
                { value: STATUS_CODE.PUBLISHED, label: t(getKey('period_status_published')) },
                { value: STATUS_CODE.GRADING, label: t(getKey('period_status_grading')) },
                { value: STATUS_CODE.CLOSED, label: t(getKey('period_status_closed')) },
              ]}
            />
            <p className="mt-3 text-xs text-slate-400">
              Lưu ý: mỗi loại đợt (TTTN/ĐATN) chỉ được có 1 đợt ở trạng thái chưa đóng (Đang mở/Đã công bố/Đang chấm điểm) tại một thời điểm. Hệ thống sẽ báo lỗi nếu còn đợt khác cùng loại chưa đóng.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PeriodsPage;