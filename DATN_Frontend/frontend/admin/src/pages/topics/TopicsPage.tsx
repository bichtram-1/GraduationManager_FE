import { BookOutlined, SearchOutlined } from '@ant-design/icons';
import { Card, Tag, Input, Space, Button, Form, Select } from 'antd';
import FilterTable from '../../components/shared/table/FilterTable';
import TopicForm from './components/TopicForm';
import type { IListTopic, ICreateTopic, IUpdateTopic } from '../../type/TopicType';
import { topicHooks } from '../../hooks/useTopics';
import { useMemo } from 'react';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE, cn } from '../../constants/commonConst';
import { formatNumber } from '@shared/utils/numberUtils';

const topicStatusMeta = {
  [STATUS_CODE.PENDING]: { labelKey: 'status_pending' as const, className: '!bg-[var(--color-gold-light)] !text-[var(--color-gold-medium)]' },
  [STATUS_CODE.APPROVED]: { labelKey: 'status_approved' as const, className: '!bg-[var(--color-green-light)] !text-[var(--color-green-medium)]' },
  [STATUS_CODE.REJECTED]: { labelKey: 'status_rejected' as const, className: '!bg-[var(--color-red-light)] !text-[var(--color-red-medium)]' },
} as const;

const TopicsPage = () => {
  const { t } = useTranslation();
  const { selectedPeriod } = useGlobalVariable();
  const { data: topicList } = topicHooks.useFetchListTopics({
    page: 1,
    limit: 1000,
    periodId: selectedPeriod?.id || '',
  });
  const updateTopicMutation = topicHooks.useUpdateTopic();
  const deleteTopicMutation = topicHooks.useDeleteTopic();

  const rows = topicList?.rows ?? [];
  const isPeriodClosed = selectedPeriod?.status === STATUS_CODE.CLOSED;

  const columns = [
    { title: t(getKey('topic_code')), dataIndex: 'code', key: 'code', render: (v: string) => <span className="text-primary font-medium">{v}</span> },
    { title: t(getKey('topic_name')), dataIndex: 'name', key: 'name', ellipsis: true },
    { title: t(getKey('teacher')), dataIndex: 'teacher', key: 'teacher', width: 200, ellipsis: true, render: (v: string) => <span className="text-slate-600">{v}</span> },
    { title: t(getKey('slots')), dataIndex: 'slots', key: 'slots', width: 120, render: (v: number) => formatNumber(v) },
    {
      title: t(getKey('group_status')), key: 'status', width: 160, render: (_: unknown, record: IListTopic) => {
        const meta = topicStatusMeta[record.status as keyof typeof topicStatusMeta];
        return <Tag className={cn('!m-0 !rounded-full !px-2.5 !py-[2px] !border-none', meta?.className)}>{meta ? t(getKey(meta.labelKey)) : record.status}</Tag>;
      }
    },
    { title: t(getKey('reject_reason')), dataIndex: 'rejectReason', key: 'rejectReason', ellipsis: true, render: (v: string) => v || '—' },
  ];

  return (
    <div className="pb-4">
      <div className="mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <BookOutlined /> {t(getKey('topic_category'))}
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">{t(getKey('topic_management'))}</h1>
            <p className="mt-2 mb-0 text-[18px] leading-[26px] text-grayDark">{t(getKey('topic_management_desc'))}</p>
          </div>
        </div>
      </div>

      {selectedPeriod && (
        <div className={cn('mb-5 p-4 rounded-[18px] border flex items-center justify-between shadow-[0_12px_28px_rgba(15,23,42,0.02)]',
          isPeriodClosed ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
        )}>
          <div>
            {t(getKey('showing'))} {t(getKey('topic_management'))} {t(getKey('of'))}: <strong className="underline">{selectedPeriod.name}</strong>
            {isPeriodClosed && ` (${t(getKey('read_only_data_locked'))})`}
          </div>
          {isPeriodClosed && <Tag color="error">{t(getKey('read_only_tag'))}</Tag>}
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {useMemo(() => [
          { label: t(getKey('total_topics')), value: rows.length, color: 'bg-primary/90' },
          { label: t(getKey('status_pending')), value: rows.filter((r) => r.status === STATUS_CODE.PENDING).length, color: 'bg-[var(--color-gold-medium)]' },
          { label: t(getKey('status_approved')), value: rows.filter((r) => r.status === STATUS_CODE.APPROVED).length, color: 'bg-[var(--color-green-medium)]' },
          { label: t(getKey('status_rejected')), value: rows.filter((r) => r.status === STATUS_CODE.REJECTED).length, color: 'bg-[var(--color-red-medium)]' },
        ], [rows, t]).map((item) => (
          <Card key={item.label} className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="mt-2 text-3xl font-bold text-navyDark">{formatNumber(item.value)}</div>
              </div>
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl text-white', item.color)}>
                <BookOutlined />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <FilterTable<IListTopic, IListTopic, ICreateTopic, IUpdateTopic>
          title={t(getKey('topic_list'))}
          columns={columns}
          useQueryHook={topicHooks.useFetchListTopics}
          paramVariables={useMemo(() => ({ page: 1, limit: 10, periodId: selectedPeriod?.id || '' }), [selectedPeriod?.id])}
          updateInfo={isPeriodClosed ? undefined : {
            type: 'modal',
            modalInfo: {
              modalContent: <TopicForm />,
              modalProps: { centered: true, width: 640, title: t(getKey('edit_topic')) },
              modalFunc: updateTopicMutation,
            },
          }}
          deleteInfo={isPeriodClosed ? undefined : {
            type: 'modal',
            modalInfo: {
              modalContent: null,
              modalProps: {},
              modalFunc: deleteTopicMutation,
            },
          }}
          detailInfo={{
            type: 'modal',
            modalInfo: {
              modalContent: <TopicForm disabled />,
              modalProps: { centered: true, width: 640, title: t(getKey('detail_topic')), footer: null },
              modalFunc: topicHooks.useFetchDetailTopic,
            },
          }}
          actions={{
            isDetail: true,
            isEdit: !isPeriodClosed,
            isDelete: !isPeriodClosed,
          }}
          formatInitialValues={(detail: IListTopic) => ({
            name: detail.name,
            teacher: detail.teacher,
            slots: detail.slots,
            status: detail.status,
            rejectReason: detail.rejectReason || '',
          })}
          formatFormValues={(values: Record<string, unknown>) => values as ICreateTopic | IUpdateTopic}
          filterRender={() => (
            <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-12">
              <Form.Item name="keyword" className="xl:col-span-8 !mb-0">
                <Input
                  allowClear
                  prefix={<SearchOutlined className="text-slate-400" />}
                  placeholder={t(getKey('search_topics_placeholder'))}
                  className="!h-11 !rounded-[12px] !border-slate-300"
                />
              </Form.Item>

              <Form.Item name="status" className="xl:col-span-4 !mb-0">
                <Select
                  allowClear
                  placeholder={t(getKey('group_status'))}
                  className="!h-11 !w-full"
                  options={[
                    { value: 'all', label: t(getKey('all_tab')) },
                    { value: STATUS_CODE.PENDING, label: t(getKey('status_pending')) },
                    { value: STATUS_CODE.APPROVED, label: t(getKey('status_approved')) },
                    { value: STATUS_CODE.REJECTED, label: t(getKey('status_rejected')) },
                  ]}
                />
              </Form.Item>
            </div>
          )}
        />
      </Card>
    </div>
  );
};

export default TopicsPage;
