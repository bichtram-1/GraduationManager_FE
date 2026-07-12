import { BookOutlined, SearchOutlined } from '@ant-design/icons';
import { Card, Tag, Input, Space, Button, Form, Select, Dropdown, Modal, message } from 'antd';
import FilterTable from '../../components/shared/table/FilterTable';
import TopicForm from './components/TopicForm';
import type { IListTopic, ICreateTopic, IUpdateTopic, TopicStatus } from '../../type/TopicType';
import { topicHooks } from '../../hooks/useTopics';
import { useMemo, useCallback } from 'react';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE, cn } from '../../constants/commonConst';
import { formatNumber } from '@shared/utils/numberUtils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTopicStatusMeta = (t: any) => ({
  [STATUS_CODE.PENDING]: { label: t(getKey('status_pending')), className: '!bg-[var(--color-gold-light)] !text-[var(--color-gold-medium)]' },
  [STATUS_CODE.APPROVED]: { label: t(getKey('status_approved')), className: '!bg-[var(--color-green-light)] !text-[var(--color-green-medium)]' },
  [STATUS_CODE.REJECTED]: { label: t(getKey('status_rejected')), className: '!bg-[var(--color-red-light)] !text-[var(--color-red-medium)]' },
} as const);

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

  const confirmStatusChange = useCallback((record: IListTopic, status: TopicStatus) => {
    const meta = getTopicStatusMeta(t)[status];
    const label = meta.label;
    let rejectReasonValue = '';

    const handleOk = () => {
      if (status === STATUS_CODE.REJECTED && !rejectReasonValue.trim()) {
        message.error(t(getKey('reject_reason_required')));
        return Promise.reject(new Error(t(getKey('reject_reason_required'))));
      }

      return new Promise<void>((resolve, reject) => {
        updateTopicMutation.mutate(
          {
            id: record.id,
            body: {
              status,
              rejectReason: status === STATUS_CODE.REJECTED ? rejectReasonValue : ''
            },
            index: 0,
            params: { page: 1, limit: 10, periodId: selectedPeriod?.id || '' }
          },
          {
            onSuccess: () => {
              message.success(t(getKey('update_confirmation_success'), { name: record.name, status: label.toLowerCase() }));
              resolve();
            },
            onError: (error) => {
              message.error(error.message || t(getKey('config_error_message')));
              reject(error);
            }
          }
        );
      });
    };

    Modal.confirm({
      centered: true,
      title: t(getKey('change_review_status_confirm_title'), { name: record.name, status: label.toLowerCase() }),
      content:
        status === STATUS_CODE.REJECTED ? (
          <div className="flex flex-col gap-2 pt-2">
            <p className="m-0">{t(getKey('change_topic_status_rejected_content'))}</p>
            <Input.TextArea
              rows={3}
              placeholder={t(getKey('please_enter_reject_reason'))}
              onChange={(e) => {
                rejectReasonValue = e.target.value;
              }}
            />
          </div>
        ) : status === STATUS_CODE.APPROVED ? (
          t(getKey('change_topic_status_approved_content'))
        ) : (
          t(getKey('change_topic_status_pending_content'))
        ),
      okText: t(getKey('confirm_btn')),
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: status === STATUS_CODE.REJECTED ? { danger: true } : undefined,
      onOk: handleOk,
    });
  }, [t, updateTopicMutation, selectedPeriod?.id]);

  const columns = useMemo(() => [
    { title: t(getKey('topic_code')), dataIndex: 'code', key: 'code', render: (v: string) => <span className="text-primary font-medium">{v}</span> },
    { title: t(getKey('topic_name')), dataIndex: 'name', key: 'name', ellipsis: true },
    { title: t(getKey('teacher')), dataIndex: 'teacher', key: 'teacher', width: 200, ellipsis: true, render: (v: string) => <span className="text-slate-600">{v}</span> },
    { title: t(getKey('slots')), dataIndex: 'slots', key: 'slots', width: 120 },
    {
      title: t(getKey('group_status')),
      key: 'status',
      width: 260,
      render: (_: unknown, record: IListTopic) => {
        const meta = getTopicStatusMeta(t)[record.status as keyof ReturnType<typeof getTopicStatusMeta>];
        
        if (isPeriodClosed) {
          return (
            <Tag className={cn('!m-0 !rounded-full !px-2.5 !py-[2px] !border-none', meta?.className)}>
              {meta ? meta.label : record.status}
            </Tag>
          );
        }

        const menuItems = record.status === STATUS_CODE.APPROVED
          ? [
              { key: STATUS_CODE.PENDING, label: t(getKey('change_to_pending')) },
              { key: STATUS_CODE.REJECTED, label: t(getKey('change_to_rejected')) },
            ]
          : record.status === STATUS_CODE.REJECTED
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
            <Tag className={cn('!m-0 !rounded-full !px-2.5 !py-[2px] !border-none', meta?.className)}>
              {meta ? meta.label : record.status}
            </Tag>
            <Dropdown
              trigger={['click']}
              menu={{
                items: menuItems,
                onClick: ({ key }) => confirmStatusChange(record, key as TopicStatus),
              }}
            >
              <Button type="text" size="small" className="!h-8 !rounded-[8px] !px-2 !font-medium !text-[var(--color-primary)] hover:!bg-[var(--color-blue-light)]">
                {t(getKey('change_status_btn'))}
              </Button>
            </Dropdown>
          </Space>
        );
      }
    },
    { title: t(getKey('reject_reason')), dataIndex: 'rejectReason', key: 'rejectReason', ellipsis: true, render: (v: string) => v || '—' },
  ], [t, isPeriodClosed, confirmStatusChange]);

  return (
    <div className="pb-4">
      <div className="mb-5 flex items-center justify-start rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-md)]/10 px-3 py-1 text-xs font-medium text-[var(--color-blue-login-mid)]">
            <BookOutlined /> {t(getKey('topic_category'))}
          </div>
          <h1 className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">{t(getKey('topic_management'))}</h1>
          <p className="mt-2 mb-0 text-[18px] leading-[26px] text-grayDark">{t(getKey('topic_management_desc'))}</p>
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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Topics Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="text-sm text-slate-500">{t(getKey('total_topics'))}</div>
          <div className="mt-1 text-[32px] font-bold leading-[38px] text-slate-900">{formatNumber(rows.length)}</div>
        </div>
        {/* Pending Card */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="text-sm text-amber-700">{t(getKey('status_pending'))}</div>
          <div className="mt-1 text-[32px] font-bold leading-[38px] text-amber-700">{formatNumber(rows.filter((r: IListTopic) => r.status === STATUS_CODE.PENDING).length)}</div>
        </div>
        {/* Approved Card */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="text-sm text-emerald-700">{t(getKey('status_approved'))}</div>
          <div className="mt-1 text-[32px] font-bold leading-[38px] text-emerald-700">{formatNumber(rows.filter((r: IListTopic) => r.status === STATUS_CODE.APPROVED).length)}</div>
        </div>
        {/* Rejected Card */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="text-sm text-rose-700">{t(getKey('status_rejected'))}</div>
          <div className="mt-1 text-[32px] font-bold leading-[38px] text-rose-700">{formatNumber(rows.filter((r: IListTopic) => r.status === STATUS_CODE.REJECTED).length)}</div>
        </div>
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
              modalFunc: updateTopicMutation as any,
            },
          }}
          deleteInfo={isPeriodClosed ? undefined : {
            type: 'modal',
            modalInfo: {
              modalContent: null,
              modalProps: {},
              modalFunc: deleteTopicMutation as any,
            },
          }}
          detailInfo={{
            type: 'modal',
            modalInfo: {
              modalContent: <TopicForm disabled />,
              modalProps: { centered: true, width: 640, title: t(getKey('detail_topic')), footer: null },
              modalFunc: topicHooks.useFetchDetailTopic as any,
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
            fileUrl: detail.fileUrl || '',
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
