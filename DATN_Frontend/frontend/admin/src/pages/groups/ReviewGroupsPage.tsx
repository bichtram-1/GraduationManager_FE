import React, { useEffect, useMemo, useState } from 'react';
import { Button, Space, Tag, Input, Table, message, Modal, Card, Tooltip, Select } from 'antd';
import { groupHooks } from '../../hooks/useGroups';
import { useTranslation } from 'react-i18next';
import { getKey, I18nKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE } from '../../constants/commonConst';
import { formatNumber } from '@shared/utils/numberUtils';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import { useScrollContainer } from '../../hooks/ScrollContainerProvider';
import { TeamOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { IListGroup, IGroupMember } from '../../type/GroupType';

const STICKY_PAGINATION_HEIGHT = 57;

const { Search } = Input;

const STATUS_META: Record<string, { labelKey: keyof I18nKey; color: string }> = {
  [STATUS_CODE.PENDING_UP]: { labelKey: 'status_pending', color: 'orange' },
  [STATUS_CODE.APPROVED_UP]: { labelKey: 'status_approved', color: 'green' },
  [STATUS_CODE.DISSOLVED]: { labelKey: 'status_rejected', color: 'red' },
  [STATUS_CODE.WARNING]: { labelKey: 'status_warning', color: 'gold' },
  [STATUS_CODE.LOCKED]: { labelKey: 'status_rejected', color: 'red' },
  [STATUS_CODE.MISSING]: { labelKey: 'status_missing_members', color: 'blue' },
};

const ReviewGroupsPage: React.FC = () => {
  const { t } = useTranslation();
  const { selectedPeriod } = useGlobalVariable();
  const scrollContainerRef = useScrollContainer();
  const { data: q } = groupHooks.useFetchListGroups();
  const approveGroup = groupHooks.useApproveGroup();
  const rejectGroup = groupHooks.useRejectGroup();
  
  const rawGroups = (q?.rows ?? []) as IListGroup[];
  const groups = useMemo(() => {
    if (!selectedPeriod) return rawGroups;
    return rawGroups.filter((g) => g.registrationBatch === selectedPeriod.name);
  }, [rawGroups, selectedPeriod]);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [teacherFilter, setTeacherFilter] = useState<'all' | string>('all');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Danh sách giảng viên để lọc: chỉ những giảng viên có đề tài (nhóm) trong đúng đợt
  // đang chọn — lấy trực tiếp từ `groups` (đã lọc theo đợt ở trên), không cần gọi API riêng.
  const teacherOptions = useMemo(() => {
    const names = Array.from(new Set(groups.map((g) => g.supervisor).filter(Boolean)));
    return names.sort((a, b) => a.localeCompare(b));
  }, [groups]);

  const filtered = useMemo(() => {
    const s = query.trim().toLowerCase();
    return groups.filter((g) => {
      if (statusFilter !== 'all') {
        if (statusFilter === STATUS_CODE.PENDING_UP) {
          if (g.status !== STATUS_CODE.PENDING_UP && g.status !== STATUS_CODE.WARNING && g.status !== STATUS_CODE.MISSING) return false;
        } else if (statusFilter === STATUS_CODE.DISSOLVED) {
          if (g.status !== STATUS_CODE.DISSOLVED && g.status !== STATUS_CODE.LOCKED) return false;
        } else {
          if (g.status !== statusFilter) return false;
        }
      }
      if (teacherFilter !== 'all' && g.supervisor !== teacherFilter) return false;
      if (!s) return true;
      return [g.title, g.supervisor].join(' ').toLowerCase().includes(s) || g.members.some((m: IGroupMember) => m.name.toLowerCase().includes(s));
    });
  }, [groups, query, statusFilter, teacherFilter]);

  // Lọc/tìm kiếm thay đổi làm số trang thay đổi theo — về lại trang 1 để tránh đứng ở
  // trang trống (VD: đang ở trang 5 rồi lọc còn 2 trang).
  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, teacherFilter]);

  const pending = groups.filter((g) => g.status === STATUS_CODE.PENDING_UP || g.status === STATUS_CODE.WARNING || g.status === STATUS_CODE.MISSING).length;
  const accepted = groups.filter((g) => g.status === STATUS_CODE.APPROVED_UP).length;
  const rejected = groups.filter((g) => g.status === STATUS_CODE.DISSOLVED || g.status === STATUS_CODE.LOCKED).length;

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
          } catch (_e) {
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
    } catch (_e) {
      message.error(t(getKey('update_status_err_msg')));
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => <span className="font-semibold text-slate-500">{index + 1}</span>,
    },
    { title: t(getKey('topic_name')), dataIndex: 'title', key: 'title', width: 350, ellipsis: true, render: (titleText: string) => <div className="font-semibold text-slate-900">{titleText}</div> },
    { title: 'GVHD', dataIndex: 'supervisor', key: 'supervisor', width: 150, ellipsis: true, render: (s: string) => <span className="font-medium text-slate-700">{s}</span> },
    {
      title: t(getKey('members')),
      key: 'members',
      width: 300,
      render: (_: unknown, r: IListGroup) => (
        <div className="flex flex-col gap-1">
          {(r.members || []).map((m: IGroupMember) => (
            <Tooltip key={m.id} title={m.eligible !== false ? `${m.name} (${m.code || ''})` : `${m.name} (${m.code || ''}) — ${m.reason}`}>
              <div className="text-xs">
                <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${m.eligible !== false ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'}`}>
                  <span className="font-semibold">{m.name}</span>
                  {m.class ? <span className="text-slate-500 ml-1.5">— Lớp: {m.class}</span> : ''}
                  {m.eligible !== false ? '' : ' ⚠'}
                </span>
              </div>
            </Tooltip>
          ))}
        </div>
      ),
    },
    { title: t(getKey('group_status')), key: 'status', width: 120, render: (_: unknown, r: IListGroup) => {
      const meta = STATUS_META[r.status];
      return <Tag color={meta?.color || 'default'} className="!px-2 !py-[2px] !text-xs !font-medium">{meta ? t(getKey(meta.labelKey)) : r.status}</Tag>;
    } },
    { title: t(getKey('action')), key: 'action', width: 150, render: (_: unknown, r: IListGroup) => {
      const isApproved = r.status === STATUS_CODE.APPROVED_UP;
      const isRejected = r.status === STATUS_CODE.DISSOLVED || r.status === STATUS_CODE.LOCKED;
      const isPending = r.status === STATUS_CODE.PENDING_UP || r.status === STATUS_CODE.WARNING || r.status === STATUS_CODE.MISSING;

      return (
        <Space>
          {(isPending || isRejected) && (
            <Button size="small" type="primary" loading={savingId === r.id} disabled={savingId === r.id} onClick={() => doAction(r.id, 'approve')} className="rounded-md font-medium h-8">{t(getKey('accept'))}</Button>
          )}
          {(isPending || isApproved) && (
            <Button size="small" danger loading={savingId === r.id} disabled={savingId === r.id} onClick={() => doAction(r.id, 'reject')} className="rounded-md font-medium h-8">{t(getKey('reject'))}</Button>
          )}
        </Space>
      );
    } },
  ];

  return (
    <div className="pb-4">
      {/* Title block synchronized style */}
      <div className="mb-5 flex items-center justify-start rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-md)]/10 px-3 py-1 text-xs font-medium text-[var(--color-blue-login-mid)]">
            <TeamOutlined />
            {t(getKey('group_review'))}
          </div>
          <h1 className="m-0 text-[34px] font-bold leading-[40px] text-navyDark">{t(getKey('group_review'))}</h1>
          <p className="mt-2 mb-0 text-[18px] leading-[26px] text-grayDark">{t(getKey('group_review_desc'))}</p>
        </div>
      </div>

      {/* Stats synchronized style */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Pending */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] flex justify-between items-start">
          <div>
            <div className="text-sm text-amber-700 font-medium">{t(getKey('status_pending'))}</div>
            <div className="mt-1 text-[32px] font-bold leading-[38px] text-amber-800">{formatNumber(pending)}</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <ClockCircleOutlined style={{ fontSize: 20 }} />
          </div>
        </div>

        {/* Accepted */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] flex justify-between items-start">
          <div>
            <div className="text-sm text-emerald-700 font-medium">{t(getKey('status_approved'))}</div>
            <div className="mt-1 text-[32px] font-bold leading-[38px] text-emerald-800">{formatNumber(accepted)}</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <CheckCircleOutlined style={{ fontSize: 20 }} />
          </div>
        </div>

        {/* Rejected */}
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] flex justify-between items-start">
          <div>
            <div className="text-sm text-red-700 font-medium">{t(getKey('status_rejected'))}</div>
            <div className="mt-1 text-[32px] font-bold leading-[38px] text-red-800">{formatNumber(rejected)}</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <CloseCircleOutlined style={{ fontSize: 20 }} />
          </div>
        </div>
      </div>

      {/* Synchronized Card and table style */}
      <Card className="filter-table-card rounded-[18px] border border-slate-100 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 pb-0">
          <Search
            placeholder="Tìm kiếm theo tên đề tài, giảng viên hoặc thành viên..."
            onSearch={(v) => setQuery(v)}
            onChange={(e) => setQuery(e.target.value)}
            allowClear
            size="large"
            className="w-full md:w-[400px]"
          />
          <Select
            value={teacherFilter}
            onChange={(v) => setTeacherFilter(v)}
            size="large"
            className="w-full md:w-[240px]"
            showSearch
            optionFilterProp="label"
            options={[
              { value: 'all', label: 'Tất cả giảng viên' },
              ...teacherOptions.map((name) => ({ value: name, label: name })),
            ]}
          />
          <div className="flex flex-wrap gap-2">
            <Button type={statusFilter === 'all' ? 'primary' : 'default'} onClick={() => setStatusFilter('all')} className="rounded-lg h-10 font-medium">
              {t(getKey('all_tab'))} ({groups.length})
            </Button>
            <Button type={statusFilter === STATUS_CODE.PENDING_UP ? 'primary' : 'default'} onClick={() => setStatusFilter(STATUS_CODE.PENDING_UP)} className="rounded-lg h-10 font-medium">
              {t(getKey('status_pending'))} ({pending})
            </Button>
            <Button type={statusFilter === STATUS_CODE.APPROVED_UP ? 'primary' : 'default'} onClick={() => setStatusFilter(STATUS_CODE.APPROVED_UP)} className="rounded-lg h-10 font-medium">
              {t(getKey('status_approved'))} ({accepted})
            </Button>
            <Button type={statusFilter === STATUS_CODE.DISSOLVED ? 'primary' : 'default'} onClick={() => setStatusFilter(STATUS_CODE.DISSOLVED)} className="rounded-lg h-10 font-medium">
              {t(getKey('status_rejected'))} ({rejected})
            </Button>
          </div>
        </div>

        <div className="p-5 pt-2">
          <Table 
            rowKey="id" 
            dataSource={filtered} 
            columns={columns} 
            pagination={{
              current: page,
              pageSize: pageSize,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              },
              showSizeChanger: true,
              position: ['bottomCenter'],
              showTotal(total, range) {
                return <span className="pl-2">{`${t('showing')} ${range[0]} ${t('to')} ${range[1]} ${t('of')} ${total} ${t('entries')}`}</span>;
              },
            }}
            className="border border-slate-100 rounded-xl"
            scroll={{ x: 'max-content' }}
            sticky={{
              offsetHeader: 0,
              offsetScroll: STICKY_PAGINATION_HEIGHT,
              getContainer: () => scrollContainerRef?.current || window,
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default ReviewGroupsPage;
