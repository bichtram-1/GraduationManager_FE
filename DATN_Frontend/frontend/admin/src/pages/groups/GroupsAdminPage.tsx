import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { Button, Modal, Tooltip, Tag, Input, Select, Space, message, Form } from 'antd';
import { SwapOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import AddMemberModal from './components/AddMemberModal';
import MergeModal from './components/MergeModal';
import FilterTable from '../../components/shared/table/FilterTable';
import GroupForm from './components/GroupForm';
import type { GroupStatus, IGroupMember, IListGroup, IDetailGroup, ICreateGroup, IUpdateGroup } from '../../type/GroupType';
import { groupHooks } from '../../hooks/useGroups';
import type { BaseListParams, ListResponseTypeObject } from '@shared/types/GeneralType';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';

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

const STATUS_META: Record<Group['status'], { label: string; color: string }> = {
  PENDING: { label: 'Chờ duyệt', color: 'default' },
  APPROVED: { label: 'Đã duyệt', color: 'green' },
  WARNING: { label: 'Có cảnh báo', color: 'orange' },
  MISSING: { label: 'Thiếu thành viên', color: 'blue' },
  LOCKED: { label: 'Bị khóa', color: 'red' },
  DISSOLVED: { label: 'Đã giải thể', color: 'default' },
};

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
  const enough = groups.filter((g) => g.status === 'APPROVED').length;
  const withWarnings = groups.filter((g) => g.status === 'WARNING').length;
  const missing = groups.filter((g) => g.status === 'MISSING').length;



  function openAddMember(g: Group) {
    setAddModalGroup(g);
  }

  async function addMemberToGroup(groupId: string, student: IGroupMember, _force = false) {
    const group = groups.find((item) => item.id === groupId);
    if (!group) return;
    const already = group.members.find((member) => member.id === student.id);
    if (already) return;
    const newMembers = [...group.members, student];
    const newStatus = newMembers.length < 2 ? 'MISSING' : group.status === 'LOCKED' ? 'LOCKED' : group.status;
    await updateGroupMutation.mutateAsync({
      id: groupId,
      body: { members: newMembers, status: newStatus },
      index: 0,
      params: { page: 1, limit: 10 },
    });
    setAddModalGroup(null);
    message.success('Đã thêm thành viên (mô phỏng)');
  }

  async function removeMemberFromGroup(groupId: string, memberId: string) {
    const group = groups.find((item) => item.id === groupId);
    if (!group) return;
    const newMembers = group.members.filter((m) => m.id !== memberId);
    const newStatus = newMembers.length < 2 ? 'MISSING' : group.status === 'LOCKED' ? 'LOCKED' : group.status;
    await updateGroupMutation.mutateAsync({ id: groupId, body: { members: newMembers, status: newStatus }, index: 0, params: { page: 1, limit: 10 } });
    message.success('Đã xóa thành viên (mô phỏng)');
  }

  // removeMember handled via Update mutation or AddMemberModal flows

  // delete handled by FilterTable delete flow

  function doMerge() {
    return doMergeWithMembers(undefined);
  }

  async function doMergeWithMembers(moveMemberIds?: string[] | undefined) {
    if (!mergeLeft || !mergeRight) return message.error('Chọn cả nhóm chính và nhóm phụ');
    if (mergeLeft === mergeRight) return message.error('Không thể chọn cùng nhóm');
    const left = groups.find((g) => g.id === mergeLeft)!;
    const right = groups.find((g) => g.id === mergeRight)!;
    const membersToMove = moveMemberIds && moveMemberIds.length ? right.members.filter((m) => moveMemberIds.includes(m.id)) : right.members;
    const totalMembers = left.members.length + membersToMove.length;
    if (totalMembers > left.maxMembers) return message.error('Vượt quá số lượng tối đa của nhóm chính');
    Modal.confirm({
      title: 'Xác nhận ghép nhóm',
      content: `${left.code} ← ${right.code}\nSau ghép: ${totalMembers} thành viên.`,
      async onOk() {
        await updateGroupMutation.mutateAsync({
          id: left.id,
          body: { members: [...left.members, ...membersToMove] },
          index: 0,
          params: { page: 1, limit: 10 },
        });
        // remove moved members from right; if none remain, dissolve
        const remaining = right.members.filter((m) => !membersToMove.some((mm) => mm.id === m.id));
        const rightBody: any = remaining.length ? { members: remaining } : { status: 'DISSOLVED' };
        await updateGroupMutation.mutateAsync({ id: right.id, body: rightBody, index: 0, params: { page: 1, limit: 10 } });
        setMergeMode(false);
        setMergeLeft(null);
        setMergeRight(null);
        message.success('Ghép nhóm thành công (mô phỏng)');
      },
    });
  }

  const columns = [
    {
      title: 'Mã nhóm',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <span className="font-semibold text-[#2563eb]">{code}</span>,
    },
    { title: 'Tên đề tài', dataIndex: 'title', key: 'title', render: (t: string) => <div className="font-semibold text-slate-900">{t}</div> },
    { title: 'Giảng viên hướng dẫn', dataIndex: 'supervisor', key: 'supervisor', render: (s: string) => <span className="font-medium text-slate-700">{s}</span> },
    {
      title: 'Thành viên',
      key: 'members',
      render: (_: unknown, record: IListGroup) => (
        <Space>
          {record.members.map((m) => (
            <Tooltip key={m.id} title={m.eligible ? m.name : `${m.name} — ${m.reason}`}>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${m.eligible ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'}`}>
                {m.name.split(' ').slice(-1)}{m.eligible ? '' : ' ⚠'}
              </span>
            </Tooltip>
          ))}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: unknown, r: IListGroup) => {
          const meta = STATUS_META[r.status as GroupStatus];
        return <Tag color={meta.color} className="!px-2 !py-[2px] !text-xs !font-medium">{meta.label}</Tag>;
      },
    },
      { title: 'Số thành viên', key: 'count', render: (_: unknown, r: IListGroup) => `${r.members.length}/${r.maxMembers}` },
  ];

  return (
    <div className="pb-4">
      <div className="mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#1976d2]/10 px-3 py-1 text-xs font-medium text-[#1976d2]">
          Quản trị nhóm
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="m-0 text-[34px] font-bold leading-[40px] text-slate-900">Quản lý Nhóm Đồ án</h1>
            <p className="mt-2 mb-0 text-[17px] leading-[26px] text-slate-600">Quản lý nhóm sinh viên, trạng thái, thành viên và thao tác nhanh.</p>
          </div>
          <div />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="text-sm text-slate-500">Tổng nhóm</div>
          <div className="mt-1 text-[32px] font-bold leading-[38px] text-slate-900">{total}</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="text-sm text-emerald-700">Đủ điều kiện</div>
          <div className="mt-1 text-[32px] font-bold leading-[38px] text-emerald-700">{enough}</div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="text-sm text-amber-700">Cảnh báo</div>
          <div className="mt-1 text-[32px] font-bold leading-[38px] text-amber-700">{withWarnings}</div>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="text-sm text-sky-700">Thiếu thành viên</div>
          <div className="mt-1 text-[32px] font-bold leading-[38px] text-sky-700">{missing}</div>
        </div>
      </div>

      <FilterTable<IListGroup, IDetailGroup, ICreateGroup, IUpdateGroup>
        title="Danh sách nhóm"
        createButtonLabel={undefined}
        columns={columns}
        useQueryHook={(params: BaseListParams) => {
          const typedParams = params as BaseListParams & { keyword?: string; status?: string; registrationBatch?: string; supervisor?: string };
          const query = groupHooks.useFetchListGroups();
          const normalizedKeyword = (typedParams.keyword ?? '').trim().toLowerCase();
          const status = typedParams.status;
          const batch = typedParams.registrationBatch;
          const supervisor = typedParams.supervisor;

          const allRows = (query.data?.rows ?? groups) as IListGroup[];
          const filteredRows = allRows.filter((g) => {
            if (normalizedKeyword) {
              const inGroup = [g.code, g.title, g.supervisor, g.registrationBatch].join(' ').toLowerCase().includes(normalizedKeyword);
              const inMembers = g.members.some((m) => `${m.name} ${m.code || ''}`.toLowerCase().includes(normalizedKeyword));
              if (!inGroup && !inMembers) return false;
            }
            if (status && g.status !== status) return false;
            if (batch && g.registrationBatch !== batch) return false;
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
            <Form.Item name="keyword" className={"xl:col-span-5 !mb-0"}>
              <Input
                allowClear
                prefix={<SearchOutlined className={"text-slate-400"} />}
                placeholder={"Tìm nhóm, mã, đề tài, sinh viên, giảng viên"}
                className={"!h-11 !rounded-[12px] !border-slate-300"}
              />
            </Form.Item>
            <Form.Item name="registrationBatch" className={"xl:col-span-3 !mb-0"}>
              <Select allowClear placeholder="Đợt đăng ký" className={"!h-11 !w-full"} options={[{value: 'HK1/2024', label: 'HK1/2024'}, {value: 'HK2/2024', label: 'HK2/2024'}]} />
            </Form.Item>
            <Form.Item name="status" className={"xl:col-span-2 !mb-0"}>
              <Select allowClear placeholder="Trạng thái" className={"!h-11 !w-full"} options={Object.keys(STATUS_META).map((k) => ({ value: k, label: STATUS_META[k as Group['status']].label }))} />
            </Form.Item>
            <Form.Item name="supervisor" className={"xl:col-span-2 !mb-0"}>
              <Select allowClear placeholder="Giảng viên" className={"!h-11 !w-full"} options={supervisors.map((s) => ({ value: s, label: s }))} />
            </Form.Item>
          </div>
        )}
        paramVariables={{ page: 1, limit: 10 }}
        actions={{
          isDetail: true,
          isEdit: true,
          isDelete: true,
          isDeleteDisabled: (record) => (record as IListGroup).status === 'DISSOLVED',
          customAction: (record: unknown) => {
            const r = record as IListGroup;
            return (
              <div className="pointer-events-auto">
                <Space>
                  <Tooltip title="Ghép nhóm">
                    <Button type="text" size="small" onClick={() => { setMergeMode(true); setMergeLeft(r.id); }} icon={<SwapOutlined />} />
                  </Tooltip>
                </Space>
              </div>
            );
          },
        }}
        deleteInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: null,
            modalProps: {},
                // cast to expected mutation type so FilterTable's generics align
                modalFunc: groupHooks.useDeleteGroup() as unknown as UseMutationResult<IListGroup, AxiosError, { id: string; params: BaseListParams }>,
          },
        }}
        updateInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <GroupForm sampleStudents={sampleStudents} />,
            modalProps: {},
            modalFunc: groupHooks.useUpdateGroup(),
          },
        }}
        detailInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <GroupForm readOnly />,
            modalProps: { footer: null },
            // cast detail hook signature to match FilterTable expected type
            modalFunc: groupHooks.useFetchDetailGroup as unknown as (id: string, enable: boolean) => UseQueryResult<IDetailGroup, Error>,
          },
        }}
      />

      {/* Drawer removed: edit/detail handled by FilterTable modal with GroupForm */}

      <AddMemberModal open={!!addModalGroup} onCancel={() => setAddModalGroup(null)} group={addModalGroup} sampleStudents={sampleStudents} onAdd={addMemberToGroup} />

      <MergeModal open={mergeMode} onCancel={() => setMergeMode(false)} onOk={doMerge} mergeLeft={mergeLeft} mergeRight={mergeRight} setMergeLeft={setMergeLeft} setMergeRight={setMergeRight} groups={groups} />
    </div>
  );
};

export default GroupsAdminPage;
