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
import { STATUS_CODE, cn } from '../../constants/commonConst';
import { formatNumber } from '@shared/utils/numberUtils';

type PeriodModalMode = 'create' | 'edit' | 'detail';

const getStatusMeta = (t: any) => ({
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

  const handleTabChange = (key: string) => {
    const nextTab = key as BatchType;
    setTab(nextTab);
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
      ...(tab === 'tttn'
        ? [
            {
              title: t(getKey('companies_count')),
              dataIndex: 'numberDN',
              key: 'numberDN',
              render: (value?: number) => <span>{value !== undefined ? formatNumber(value) : '-'}</span>,
            },
            {
              title: t(getKey('students_count_short')),
              dataIndex: 'numberSV',
              key: 'numberSV',
              render: (value?: number) => <span>{value !== undefined ? formatNumber(value) : '-'}</span>,
            },
          ]
        : [
            {
              title: t(getKey('topics_count')),
              dataIndex: 'numberTopics',
              key: 'numberTopics',
              render: (value?: number) => <span>{value !== undefined ? formatNumber(value) : '-'}</span>,
            },
            {
              title: t(getKey('councils_count')),
              dataIndex: 'numberCouncils',
              key: 'numberCouncils',
              render: (value?: number) => <span>{value !== undefined ? formatNumber(value) : '-'}</span>,
            },
          ]),
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
    [tab, t],
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
        </div>
      </div>

      <div className="mb-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <Tabs activeKey={tab} onChange={handleTabChange} items={batchTabs} />
      </div>

      <Card className="overflow-hidden rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <FilterTable<IListPeriod, IDetailPeriod, ICreatePeriod, IUpdatePeriod>
          title={t(getKey('period_list'))}
          pageTitle={t(getKey('period_management'))}
          createButtonLabel={t(getKey('create_period'))}
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
          createInfo={{ type: 'modal', modalInfo: { modalContent: <PeriodForm tab={tab} allowStudentListUpload />, modalProps: { centered: true, width: 820, title: t(getKey('create_period')) }, modalFunc: createPeriodMutation } }}
          updateInfo={{ type: 'modal', modalInfo: { modalContent: <PeriodForm tab={tab} />, modalProps: { centered: true, width: 820, title: t(getKey('edit_period')) }, modalFunc: updatePeriodMutation } }}
          detailInfo={{ type: 'modal', modalInfo: { modalContent: <PeriodForm tab={tab} disabled />, modalProps: { centered: true, width: 820, title: t(getKey('detail_period')), footer: null }, modalFunc: periodHooks.useFetchDetailPeriod as unknown as (id: string, enable: boolean) => import('@tanstack/react-query').UseQueryResult<IDetailPeriod, Error> } }}
          deleteInfo={{ type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: deletePeriodMutation } }}
        />
      </Card>
    </div>
  );
};

export default PeriodsPage;