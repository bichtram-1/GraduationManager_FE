import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { Button, Modal, Tooltip, Tag, Input, Select, Space, message, Form } from 'antd';
import { SwapOutlined, SearchOutlined } from '@ant-design/icons';
import AddMemberModal from './components/AddMemberModal';
import MergeModal from './components/MergeModal';
import FilterTable from '../../components/shared/table/FilterTable';
import GroupForm from './components/GroupForm';
import type { GroupStatus, IGroupMember, IListGroup, IDetailGroup, ICreateGroup, IUpdateGroup } from '../../type/GroupType';
import { groupHooks } from '../../hooks/useGroups';
import type { BaseListParams, ListResponseTypeObject } from '@shared/types/GeneralType';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { STATUS_CODE } from '../../constants/commonConst';
import { formatNumber } from '@shared/utils/numberUtils';

type Student = IGroupMember & { eligible?: boolean; reason?: string };
type Group = IListGroup & {
  id: string;
  code: string;
  title: string;
  supervisor: string;
  members: Student[];
  maxMembers: number;
  status: GroupStatus | 'PENDING' | 'APPROVED' | 'MISSING' | 'LOCKED' | 'DISSOLVED' | 'WARNING';
  registrationBatch: string;
};

const sampleStudents: Student[] = [
  { id: 's1', name: 'Nguyễn Văn A', code: 'SV001', eligible: true },
  { id: 's2', name: 'Trần Thị B', code: 'SV002', eligible: true },
  { id: 's3', name: 'Lê Văn C', code: 'SV003', eligible: false, reason: 'Nợ môn' },
  { id: 's4', name: 'Phạm Thị D', code: 'SV004', eligible: false, reason: 'Chưa đủ tín chỉ' },
  { id: 's5', name: 'Hoàng Văn E', code: 'SV005', eligible: true },
];

const getStatusMeta = (t: any) => ({
  [STATUS_CODE.PENDING_UP]: { label: t(getKey('status_pending')), color: 'default' },
  [STATUS_CODE.APPROVED_UP]: { label: t(getKey('status_approved_group')), color: 'green' },
  [STATUS_CODE.WARNING]: { label: t(getKey('status_warning_group')), color: 'orange' },
  [STATUS_CODE.MISSING]: { label: t(getKey('status_missing_members')), color: 'blue' },
  [STATUS_CODE.LOCKED]: { label: t(getKey('status_locked')), color: 'red' },
  [STATUS_CODE.DISSOLVED]: { label: t(getKey('status_dissolved')), color: 'default' },
} as const);

const GroupsAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [addModalGroup, setAddModalGroup] = useState<IListGroup | null>(null);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeLeft, setMergeLeft] = useState<string | null>(null);
  const [mergeRight, setMergeRight] = useState<string | null>(null);
  const { data: groupList } = groupHooks.useFetchListGroups();
  const updateGroupMutation = groupHooks.useUpdateGroup();
  const deleteGroupMutation = groupHooks.useDeleteGroup();
  
  const groups = (groupList?.rows as Group[] | undefined) ?? [];
  const supervisors = useMemo(() => Array.from(new Set(groups.map((g) => g.supervisor))), [groups]);

  const total = groups.length;
  const enough = groups.filter((g) => g.status === STATUS_CODE.APPROVED_UP).length;
  const withWarnings = groups.filter((g) => g.status === STATUS_CODE.WARNING).length;
  const missing = groups.filter((g) => g.status === STATUS_CODE.MISSING).length;

  async function addMemberToGroup(groupId: string, student: IGroupMember, _force = false) {
    const group = groups.find((item) => item.id === groupId);
    if (!group) return;
    const already = group.members.find((member) => member.id === student.id);
    if (already) return;
    const newMembers = [...group.members, student];
    const newStatus = newMembers.length < 2 ? STATUS_CODE.MISSING : group.status === STATUS_CODE.LOCKED ? STATUS_CODE.LOCKED : group.status;
    await updateGroupMutation.mutateAsync({
      id: groupId,
      body: { members: newMembers, status: newStatus },
      index: 0,
      params: { page: 1, limit: 10 },
    });
    setAddModalGroup(null);
    message.success(t(getKey('add_member_sim_success')));
  }

  async function removeMemberFromGroup(groupId: string, memberId: string) {
    const group = groups.find((item) => item.id === groupId);
    if (!group) return;
    const newMembers = group.members.filter((m) => m.id !== memberId);
    const newStatus = newMembers.length < 2 ? STATUS_CODE.MISSING : group.status === STATUS_CODE.LOCKED ? STATUS_CODE.LOCKED : group.status;
    await updateGroupMutation.mutateAsync({ id: groupId, body: { members: newMembers, status: newStatus }, index: 0, params: { page: 1, limit: 10 } });
    message.success(t(getKey('remove_member_sim_success')));
  }

  async function doMergeWithMembers(moveMemberIds?: string[] | undefined) {
    if (!mergeLeft || !mergeRight) return message.error(t(getKey('merge_select_groups_error')));
    if (mergeLeft === mergeRight) return message.error(t(getKey('merge_same_group_error')));
    const left = groups.find((g) => g.id === mergeLeft)!;
    const right = groups.find((g) => g.id === mergeRight)!;
    const membersToMove = moveMemberIds && moveMemberIds.length ? right.members.filter((m) => moveMemberIds.includes(m.id)) : right.members;
    const totalMembers = left.members.length + membersToMove.length;
    if (totalMembers > left.maxMembers) return message.error(t(getKey('merge_max_members_error')));
    Modal.confirm({
      title: t(getKey('merge_groups_confirm_title')),
      content: t(getKey('merge_groups_confirm_content'), { left: left.code, right: right.code, count: formatNumber(totalMembers) }),
      okText: t(getKey('confirm_btn')),
      cancelText: t(getKey('cancel_btn')),
      async onOk() {
        await updateGroupMutation.mutateAsync({
          id: left.id,
          body: { members: [...left.members, ...membersToMove] },
          index: 0,
          params: { page: 1, limit: 10 },
        });
        const remaining = right.members.filter((m) => !membersToMove.some((mm) => mm.id === m.id));
        const rightBody: any = remaining.length ? { members: remaining } : { status: STATUS_CODE.DISSOLVED };
        await updateGroupMutation.mutateAsync({ id: right.id, body: rightBody, index: 0, params: { page: 1, limit: 10 } });
        setMergeMode(false);
        setMergeLeft(null);
        setMergeRight(null);
        message.success(t(getKey('merge_groups_sim_success')));
      },
    });
  }

  const columns = [
    {
      title: t(getKey('group_code')),
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <span className="font-semibold text-primary">{code}</span>,
    },
    { title: t(getKey('topic_name')), dataIndex: 'title', key: 'title', ellipsis: true, render: (tText: string) => <div className="font-semibold text-slate-900">{tText}</div> },
    { title: t(getKey('teacher')), dataIndex: 'supervisor', key: 'supervisor', ellipsis: true, render: (s: string) => <span className="font-medium text-slate-700">{s}</span> },
    {
      title: t(getKey('members')),
      key: 'members',
      render: (_: unknown, record: IListGroup) => (
        <Space>
          {(record.members || []).map((m) => (
            <Tooltip key={m.id} title={m.eligible !== false ? m.name : `${m.name} — ${m.reason}`}>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${m.eligible !== false ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'}`}>
                {m.name.split(' ').slice(-1)}{m.eligible !== false ? '' : ' ⚠'}
              </span>
            </Tooltip>
          ))}
        </Space>
      ),
    },
    {
      title: t(getKey('group_status')),
      key: 'status',
      render: (_: unknown, r: IListGroup) => {
        const meta = getStatusMeta(t)[r.status as Group['status']];
        return <Tag color={meta?.color || 'default'} className="!px-2 !py-[2px] !text-xs !font-medium">{meta?.label || r.status}</Tag>;
      },
    },
    { title: t(getKey('members')), key: 'count', render: (_: unknown, r: IListGroup) => `${formatNumber(r.members.length)}/${formatNumber(r.maxMembers)}` },
  ];

  const statusMetaObj = getStatusMeta(t);

  return (
    <div className="pb-4">
      <div className="mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-light)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
          {t(getKey('group_management'))}
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="m-0 text-[34px] font-bold leading-[40px] text-slate-900">{t(getKey('group_management'))}</h1>
            <p className="mt-2 mb-0 text-[17px] leading-[26px] text-slate-600">{t(getKey('group_management_desc'))}</p>
          </div>
          <div />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="text-sm text-slate-500">{t(getKey('total_groups'))}</div>
          <div className="mt-1 text-[32px] font-bold leading-[38px] text-slate-900">{formatNumber(total)}</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="text-sm text-emerald-700">{t(getKey('eligible'))}</div>
          <div className="mt-1 text-[32px] font-bold leading-[38px] text-emerald-700">{formatNumber(enough)}</div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="text-sm text-amber-700">{t(getKey('warning'))}</div>
          <div className="mt-1 text-[32px] font-bold leading-[38px] text-amber-700">{formatNumber(withWarnings)}</div>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="text-sm text-sky-700">{t(getKey('missing_members'))}</div>
          <div className="mt-1 text-[32px] font-bold leading-[38px] text-sky-700">{formatNumber(missing)}</div>
        </div>
      </div>

      <FilterTable<IListGroup, IDetailGroup, ICreateGroup, IUpdateGroup>
        title={t(getKey('group_list'))}
        createButtonLabel={undefined}
        columns={columns}
        useQueryHook={(params: BaseListParams) => {
          const typedParams = params as BaseListParams & { keyword?: string; status?: string; supervisor?: string };
          const query = groupHooks.useFetchListGroups();
          const normalizedKeyword = (typedParams.keyword ?? '').trim().toLowerCase();
          const status = typedParams.status;
          const supervisor = typedParams.supervisor;

          const allRows = (query.data?.rows ?? groups) as IListGroup[];
          const filteredRows = allRows.filter((g) => {
            if (normalizedKeyword) {
              const inGroup = [g.code, g.title, g.supervisor, g.registrationBatch].join(' ').toLowerCase().includes(normalizedKeyword);
              const inMembers = g.members.some((m) => `${m.name} ${m.code || ''}`.toLowerCase().includes(normalizedKeyword));
              if (!inGroup && !inMembers) return false;
            }
            if (status && g.status !== status) return false;

            if (supervisor && g.supervisor !== supervisor) return false;
            return true;
          });

          const data = { rows: filteredRows, total: filteredRows.length };
          return {
            ...query,
            data,
          } as UseQueryResult<ListResponseTypeObject<IListGroup>, Error>;
        }}
        filterRender={() => (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            <Form.Item name="keyword" className={"xl:col-span-6 !mb-0"}>
              <Input
                allowClear
                prefix={<SearchOutlined className={"text-slate-400"} />}
                placeholder={t(getKey('search_groups_placeholder_full'))}
                className={"!h-11 !rounded-[12px] !border-slate-300"}
              />
            </Form.Item>
            <Form.Item name="status" className={"xl:col-span-3 !mb-0"}>
              <Select allowClear placeholder={t(getKey('status'))} className={"!h-11 !w-full"} options={Object.keys(statusMetaObj).map((k) => ({ value: k, label: statusMetaObj[k as Group['status']].label }))} />
            </Form.Item>
            <Form.Item name="supervisor" className={"xl:col-span-3 !mb-0"}>
              <Select allowClear placeholder={t(getKey('teacher'))} className={"!h-11 !w-full"} options={supervisors.map((s) => ({ value: s, label: s }))} />
            </Form.Item>
          </div>
        )}
        updateInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <GroupForm sampleStudents={sampleStudents} />,
            modalProps: { centered: true, width: 720, title: t(getKey('group_management')) },
            modalFunc: updateGroupMutation,
          }
        }}
        detailInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <GroupForm readOnly />,
            modalProps: { centered: true, width: 720, title: t(getKey('group_management')), footer: null },
            modalFunc: groupHooks.useFetchDetailGroup as unknown as (id: string, enable: boolean) => UseQueryResult<IDetailGroup, Error>,
          }
        }}
        deleteInfo={{ type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: deleteGroupMutation as unknown as UseMutationResult<IListGroup, AxiosError, { id: string; params: BaseListParams }> } }}
        formatInitialValues={(g) => ({ code: g?.code ?? '', title: g?.title ?? '', supervisor: g?.supervisor ?? '', members: g?.members ?? [], maxMembers: g?.maxMembers ?? 2, status: g?.status ?? STATUS_CODE.PENDING_UP, registrationBatch: g?.registrationBatch ?? '' })}
        formatFormValues={(v) => v as unknown as ICreateGroup}
        actions={{
          isDetail: true,
          isEdit: true,
          isDelete: true,
          customAction: (record) => {
            const r = record as Group;
            return (
              <div className="pointer-events-auto">
                <Space>
                  <Tooltip title={t(getKey('group_review'))}>
                    <Button type="text" size="small" onClick={() => { setMergeMode(true); setMergeLeft(r.id); }} icon={<SwapOutlined />} />
                  </Tooltip>
                </Space>
              </div>
            );
          },
        }}
      />

      {addModalGroup && (
        <AddMemberModal
          open={!!addModalGroup}
          group={addModalGroup}
          onCancel={() => setAddModalGroup(null)}
          sampleStudents={sampleStudents}
          onAdd={addMemberToGroup}
        />
      )}

      {mergeMode && (
        <MergeModal
          open={mergeMode}
          onCancel={() => { setMergeMode(false); setMergeLeft(null); setMergeRight(null); }}
          onOk={doMergeWithMembers}
          mergeLeft={mergeLeft}
          mergeRight={mergeRight}
          setMergeLeft={setMergeLeft}
          setMergeRight={setMergeRight}
          groups={groups}
        />
      )}
    </div>
  );
};

export default GroupsAdminPage;
