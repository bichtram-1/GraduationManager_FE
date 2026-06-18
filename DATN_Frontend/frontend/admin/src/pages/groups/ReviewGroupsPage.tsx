import React, { useMemo, useState } from 'react';
import { Button, Space, Tag, Input, Table, message, Modal } from 'antd';
import { groupHooks } from '../../hooks/useGroups';
import { useTranslation } from 'react-i18next';
import { getKey, I18nKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE, cn } from '../../constants/commonConst';
import { formatNumber } from '@shared/utils/numberUtils';

const { Search } = Input;

const STATUS_META: Record<string, { labelKey: keyof I18nKey; color: string }> = {
  [STATUS_CODE.PENDING_UP]: { labelKey: 'status_pending', color: 'orange' },
  [STATUS_CODE.APPROVED_UP]: { labelKey: 'status_approved', color: 'green' },
  [STATUS_CODE.DISSOLVED]: { labelKey: 'status_rejected', color: 'red' },
  [STATUS_CODE.WARNING]: { labelKey: 'status_warning', color: 'gold' },
};

const ReviewGroupsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: q } = groupHooks.useFetchListGroups();
  const updateGroup = groupHooks.useUpdateGroup();
  const approveGroup = groupHooks.useApproveGroup();
  const rejectGroup = groupHooks.useRejectGroup();
  const groups = (q?.rows ?? []) as any[];

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = query.trim().toLowerCase();
    return groups.filter((g) => {
      if (statusFilter !== 'all' && g.status !== statusFilter) return false;
      if (!s) return true;
      return [g.code, g.title, g.supervisor].join(' ').toLowerCase().includes(s) || g.members.some((m: any) => m.name.toLowerCase().includes(s));
    });
  }, [groups, query, statusFilter]);

  const pending = groups.filter((g) => g.status === STATUS_CODE.PENDING_UP).length;
  const accepted = groups.filter((g) => g.status === STATUS_CODE.APPROVED_UP).length;
  const rejected = groups.filter((g) => g.status === STATUS_CODE.DISSOLVED).length;

  const doAction = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'reject') {
      Modal.confirm({
        title: t(getKey('confirm_reject_group')),
        content: t(getKey('confirm_reject_group_desc')),
        async onOk() {
          setSavingId(id);
          try {
            await rejectGroup.mutateAsync({ id });
            message.success(t(getKey('rejected_group_msg')));
          } catch (e) {
            message.error(t(getKey('update_status_err_msg')));
          } finally {
            setSavingId(null);
          }
        },
      });
      return;
    }

    setSavingId(id);
    try {
      await approveGroup.mutateAsync({ id });
      message.success(t(getKey('approved_group_msg')));
    } catch (e) {
      message.error(t(getKey('update_status_err_msg')));
    } finally {
      setSavingId(null);
    }
  };

  const doSetPending = async (id: string) => {
    setSavingId(id);
    try {
      await updateGroup.mutateAsync({ id, body: { status: STATUS_CODE.PENDING_UP }, index: 0, params: { page: 1, limit: 10 } });
      message.success(t(getKey('set_pending_group_msg')));
    } catch (e) {
      message.error(t(getKey('update_status_err_msg')));
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    { title: t(getKey('group_code')), dataIndex: 'code', key: 'code', render: (c: string) => <div className="text-primary font-bold">{c}</div> },
    { title: t(getKey('topic_name')), dataIndex: 'title', key: 'title', ellipsis: true, render: (titleText: string) => <div className="font-semibold">{titleText}</div> },
    { title: t(getKey('teacher')), dataIndex: 'supervisor', key: 'supervisor', ellipsis: true },
    { title: t(getKey('members')), key: 'members', ellipsis: true, render: (_: any, r: any) => r.members.map((m: any) => m.name).join(', ') },
    { title: t(getKey('group_status')), key: 'status', render: (_: any, r: any) => {
      const meta = STATUS_META[r.status];
      return <Tag color={meta?.color}>{meta ? t(getKey(meta.labelKey)) : r.status}</Tag>;
    } },
    { title: t(getKey('action')), key: 'action', render: (_: any, r: any) => (
      <Space>
        {r.status !== STATUS_CODE.APPROVED_UP && (
          <Button size="small" type="primary" loading={savingId === r.id} disabled={savingId === r.id} onClick={() => doAction(r.id, 'approve')}>{t(getKey('accept'))}</Button>
        )}
        {r.status !== STATUS_CODE.DISSOLVED && (
          <Button size="small" danger loading={savingId === r.id} disabled={savingId === r.id} onClick={() => doAction(r.id, 'reject')}>{t(getKey('reject'))}</Button>
        )}
        {(statusFilter === STATUS_CODE.APPROVED_UP || statusFilter === STATUS_CODE.DISSOLVED) && (
          <Button size="small" onClick={() => doSetPending(r.id)} loading={savingId === r.id} disabled={savingId === r.id}>{t(getKey('status_pending'))}</Button>
        )}
      </Space>
    ) },
  ];

  return (
    <div>
      <div className="mb-[18px]">
        <h1 className="m-0 text-[28px] font-bold">{t(getKey('group_review'))}</h1>
        <div className="text-gray-500">{t(getKey('group_review_desc'))}</div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="p-3 bg-white rounded-xl shadow-md min-w-[160px]">
          <div className="text-gray-500">{t(getKey('status_pending'))}</div>
          <div className="text-[22px] font-bold">{formatNumber(pending)}</div>
        </div>
        <div className="p-3 bg-white rounded-xl shadow-md min-w-[160px]">
          <div className="text-gray-500">{t(getKey('status_approved'))}</div>
          <div className="text-[22px] font-bold">{formatNumber(accepted)}</div>
        </div>
        <div className="p-3 bg-white rounded-xl shadow-md min-w-[160px]">
          <div className="text-gray-500">{t(getKey('status_rejected'))}</div>
          <div className="text-[22px] font-bold">{formatNumber(rejected)}</div>
        </div>
      </div>

      <div className="mb-3 flex justify-between gap-3">
        <Search placeholder={t(getKey('search_groups_placeholder'))} onSearch={(v) => setQuery(v)} allowClear className="w-[420px]" />
        <div>
          <Button type={statusFilter === 'all' ? 'primary' : 'default'} onClick={() => setStatusFilter('all')} className="mr-2">{t(getKey('all_tab'))}</Button>
          <Button type={statusFilter === STATUS_CODE.PENDING_UP ? 'primary' : 'default'} onClick={() => setStatusFilter(STATUS_CODE.PENDING_UP)} className="mr-2">{t(getKey('status_pending'))}</Button>
          <Button type={statusFilter === STATUS_CODE.APPROVED_UP ? 'primary' : 'default'} onClick={() => setStatusFilter(STATUS_CODE.APPROVED_UP)} className="mr-2">{t(getKey('status_approved'))}</Button>
          <Button type={statusFilter === STATUS_CODE.DISSOLVED ? 'primary' : 'default'} onClick={() => setStatusFilter(STATUS_CODE.DISSOLVED)}>{t(getKey('status_rejected'))}</Button>
        </div>
      </div>

      <Table rowKey="id" dataSource={filtered} columns={columns} />
    </div>
  );
};

export default ReviewGroupsPage;
