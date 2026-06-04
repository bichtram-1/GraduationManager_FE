import {
  DeleteOutlined,
  EyeOutlined,
  FormOutlined,
  PlusOutlined,
  ReadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tag, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import FilterTable from '../../components/shared/table/FilterTable';
import PeriodForm from './components/PeriodForm';
import { periodHooks } from '../../hooks/usePeriods';
import type { BatchStatus, BatchType, ICreatePeriod, IUpdatePeriod, IListPeriod, IDetailPeriod } from '../../type/PeriodType';
import type { BaseListParams } from '@shared/types/GeneralType';

type PeriodModalMode = 'create' | 'edit' | 'detail';

const statusMap: Record<BatchStatus, { label: string; color: string; background: string }> = {
  open: { label: 'Đang mở', color: '#00A65A', background: '#E8F9EE' },
  published: { label: 'Đã công bố', color: '#2B6CB0', background: '#EBF4FF' },
  grading: { label: 'Chấm điểm', color: '#D08A00', background: '#FFF7E6' },
  closed: { label: 'Đã đóng', color: '#C53030', background: '#FFEDED' },
};

const batchTabs: Array<{ key: BatchType; label: string; icon: JSX.Element }> = [
  { key: 'tttn', label: 'Đợt Thực tập (TTTN)', icon: <TeamOutlined /> },
  { key: 'datn', label: 'Đợt Đồ án (ĐATN)', icon: <ReadOutlined /> },
];

const PeriodsPage = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<BatchType>('tttn');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BatchStatus>('all');
  const listParams = { page: 1, limit: 10, type: tab, status: statusFilter, keyword };
  const createPeriodMutation = periodHooks.useCreatePeriod();
  const updatePeriodMutation = periodHooks.useUpdatePeriod();
  const deletePeriodMutation = periodHooks.useDeletePeriod();

  const handleTabChange = (key: string) => {
    const nextTab = key as BatchType;
    setTab(nextTab);
  };


  // FilterTable will handle modal lifecycle; we keep mutations here to pass into props

  const columns = useMemo<ColumnsType<IListPeriod>>(
    () => [
      {
        title: 'Tên đợt',
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => <span className="font-medium text-[#2563eb]">{name}</span>,
      },
      {
        title: 'Bắt đầu',
        dataIndex: 'startDate',
        key: 'startDate',
        render: (value: string) => <span className="text-slate-600">{value}</span>,
      },
      {
        title: 'Kết thúc',
        dataIndex: 'endDate',
        key: 'endDate',
        render: (value: string) => <span className="text-slate-600">{value}</span>,
      },
      {
        title: 'Hạn ĐK',
        dataIndex: 'regDeadline',
        key: 'regDeadline',
        render: (value: string) => <span className="text-slate-600">{value}</span>,
      },
      ...(tab === 'tttn'
        ? [
            {
              title: 'Số DN',
              dataIndex: 'numberDN',
              key: 'numberDN',
              render: (value?: number) => <span>{value ?? '-'}</span>,
            },
            {
              title: 'Số SV',
              dataIndex: 'numberSV',
              key: 'numberSV',
              render: (value?: number) => <span>{value ?? '-'}</span>,
            },
          ]
        : [
            {
              title: 'Số đề tài',
              dataIndex: 'numberTopics',
              key: 'numberTopics',
              render: (value?: number) => <span>{value ?? '-'}</span>,
            },
            {
              title: 'Số hội đồng',
              dataIndex: 'numberCouncils',
              key: 'numberCouncils',
              render: (value?: number) => <span>{value ?? '-'}</span>,
            },
          ]),
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (value: BatchStatus) => {
          const badge = statusMap[value];
          return (
            <Tag
              style={{
                margin: 0,
                borderRadius: 999,
                padding: '0 10px',
                border: 'none',
                backgroundColor: badge.background,
                color: badge.color,
              }}
            >
              {badge.label}
            </Tag>
          );
        },
      },
      // actions column is provided by FilterTable
    ],
    [tab],
  );

  return (
    <div className="pb-4">
      <div className="mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#2196F3]/10 px-3 py-1 text-xs font-medium text-[#1976d2]">
          <TeamOutlined />
          Danh mục đợt
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="m-0 text-[34px] font-bold leading-[40px] text-navyDark">Quản lý đợt</h1>
            <p className="mt-2 mb-0 text-[18px] leading-[26px] text-grayDark">Vòng đời các đợt TTTN / ĐATN</p>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <Tabs
          activeKey={tab}
          onChange={handleTabChange}
          items={batchTabs.map((item) => ({
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

      <FilterTable<IListPeriod, IDetailPeriod, ICreatePeriod, IUpdatePeriod>
        title="Danh sách đợt"
        pageTitle="Quản lý đợt"
        createButtonLabel="Tạo đợt mới"
        columns={columns}
        useQueryHook={(params) => periodHooks.useFetchListPeriods(params)}
        paramVariables={listParams}
        filterRender={() => (
          <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <Form.Item name="keyword" className="m-0">
                <Input allowClear placeholder="Tìm theo tên đợt, mã đợt, thời gian..." onChange={(e) => setKeyword(e.target.value)} />
              </Form.Item>
            </div>
            <div className="xl:col-span-4">
              <Form.Item name="status" className="m-0" initialValue={statusFilter}>
                <Select
                  onChange={(v) => setStatusFilter(v)}
                  className="!w-full"
                  options={[
                    { value: 'all', label: 'Tất cả trạng thái' },
                    { value: 'open', label: 'Đang mở' },
                    { value: 'published', label: 'Đã công bố' },
                    { value: 'grading', label: 'Chấm điểm' },
                    { value: 'closed', label: 'Đã đóng' },
                  ]}
                />
              </Form.Item>
            </div>
          </div>
        )}
        createInfo={{ type: 'modal', modalInfo: { modalContent: <PeriodForm tab={tab} allowStudentListUpload />, modalProps: { centered: true, width: 820, title: 'Tạo đợt mới' }, modalFunc: createPeriodMutation } }}
        updateInfo={{ type: 'modal', modalInfo: { modalContent: <PeriodForm tab={tab} />, modalProps: { centered: true, width: 820, title: 'Chỉnh sửa đợt' }, modalFunc: updatePeriodMutation } }}
        deleteInfo={{ type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: deletePeriodMutation as unknown as import('@tanstack/react-query').UseMutationResult<IListPeriod, import('axios').AxiosError, { id: string; params: BaseListParams }> } }}
        detailInfo={{ type: 'modal', modalInfo: { modalContent: <PeriodForm tab={tab} disabled />, modalProps: { centered: true, width: 820, title: 'Chi tiết đợt', footer: null }, modalFunc: periodHooks.useFetchDetailPeriod as unknown as (id: string, enable: boolean) => import('@tanstack/react-query').UseQueryResult<IDetailPeriod, Error> } }}
        formatInitialValues={(data: any) => data || {}}
        formatFormValues={(values: Record<string, unknown>) => values as unknown as ICreatePeriod}
      />
    </div>
  );
};

export default PeriodsPage;