import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { Button, Modal, Tooltip, Tag, Input, Select, Space, message, Form, Card } from 'antd';
import { SwapOutlined, SearchOutlined, TeamOutlined, CheckCircleOutlined, ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
import MergeModal from './components/MergeModal';
import FilterTable from '../../components/shared/table/FilterTable';
import GroupForm from './components/GroupForm';
import type { GroupStatus, IGroupMember, IListGroup, IDetailGroup, ICreateGroup, IUpdateGroup } from '../../type/GroupType';
import { groupHooks } from '../../hooks/useGroups';
import type { BaseListParams, ListResponseTypeObject } from '@shared/types/GeneralType';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { TFunction } from 'i18next';
import { STATUS_CODE } from '../../constants/commonConst';
import { formatNumber } from '@shared/utils/numberUtils';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';

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

const getStatusMeta = (t: TFunction) => ({
  [STATUS_CODE.PENDING_UP]: { label: t(getKey('status_pending')), color: 'default' },
  [STATUS_CODE.APPROVED_UP]: { label: t(getKey('status_approved_group')), color: 'green' },
  [STATUS_CODE.WARNING]: { label: t(getKey('status_warning_group')), color: 'orange' },
  [STATUS_CODE.MISSING]: { label: t(getKey('status_missing_members')), color: 'blue' },
  [STATUS_CODE.LOCKED]: { label: t('status_rejected') || 'Từ chối', color: 'red' },
  [STATUS_CODE.DISSOLVED]: { label: t(getKey('status_dissolved')), color: 'default' },
} as const);

const GroupsAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { selectedPeriod } = useGlobalVariable();
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeLeft, setMergeLeft] = useState<string | null>(null);
  const [mergeRight, setMergeRight] = useState<string | null>(null);
  const { data: groupList } = groupHooks.useFetchListGroups();
  const updateGroupMutation = groupHooks.useUpdateGroup();
  const deleteGroupMutation = groupHooks.useDeleteGroup();
  
  const isPeriodClosed = selectedPeriod?.status === STATUS_CODE.CLOSED;
  const rawGroups = (groupList?.rows as Group[] | undefined) ?? [];
  const groups = useMemo(() => {
    if (!selectedPeriod) return rawGroups;
    return rawGroups.filter((g) => g.registrationBatch === selectedPeriod.name);
  }, [rawGroups, selectedPeriod]);

  const supervisors = useMemo(() => Array.from(new Set(groups.map((g) => g.supervisor))), [groups]);

  const total = groups.length;
  const enough = groups.filter((g) => g.status === STATUS_CODE.APPROVED_UP).length;
  const withWarnings = groups.filter((g) => g.status === STATUS_CODE.WARNING).length;
  const missing = groups.filter((g) => g.status === STATUS_CODE.MISSING).length;

  async function doMergeWithMembers(moveMemberIds?: string[] | undefined) {
    if (isPeriodClosed) return;
    if (!mergeLeft || !mergeRight) return message.error(t(getKey('merge_select_groups_error')));
    if (mergeLeft === mergeRight) return message.error(t(getKey('merge_same_group_error')));
    const left = groups.find((g) => g.id === mergeLeft)!;
    const right = groups.find((g) => g.id === mergeRight)!;
    const membersToMove = moveMemberIds && moveMemberIds.length ? right.members.filter((m) => moveMemberIds.includes(m.id)) : right.members;
    const totalMembers = left.members.length + membersToMove.length;
    if (totalMembers > left.maxMembers) return message.error(t(getKey('merge_max_members_error')));
    Modal.confirm({
      title: t(getKey('merge_groups_confirm_title')),
      content: (t(getKey('merge_groups_confirm_content'), { left: left.code || `Nhóm #${left.id}`, right: right.code || `Nhóm #${right.id}`, count: totalMembers }) as string),
      okText: t(getKey('confirm_btn')),
      cancelText: t(getKey('cancel_btn')),
      async onOk() {
        // Cập nhật thêm thành viên vào Nhóm chính (Nhóm đích - left)
        await updateGroupMutation.mutateAsync({
          id: left.id,
          body: { members: [...left.members, ...membersToMove] },
          index: 0,
          params: { page: 1, limit: 10 },
        });

        // Kiểm tra số thành viên còn lại ở Nhóm phụ (Nhóm cũ - right)
        const remaining = right.members.filter((m) => !membersToMove.some((mm) => mm.id === m.id));
        if (remaining.length > 0) {
          // Nếu nhóm cũ vẫn còn thành viên lẻ khác, cập nhật lại danh sách thành viên còn lại
          await updateGroupMutation.mutateAsync({
            id: right.id,
            body: { members: remaining },
            index: 0,
            params: { page: 1, limit: 10 },
          });
        } else {
          // Nếu nhóm cũ không còn thành viên nào, tiến hành XÓA MỀM nhóm cũ ra khỏi hệ thống
          await deleteGroupMutation.mutateAsync({
            id: right.id,
            params: { page: 1, limit: 10 },
          });
        }

        setMergeMode(false);
        setMergeLeft(null);
        setMergeRight(null);
        message.success(t(getKey('merge_groups_sim_success')));
      },
    });
  }

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => <span className="font-semibold text-slate-500">{index + 1}</span>,
    },
    { title: t(getKey('topic_name')), dataIndex: 'title', key: 'title', ellipsis: true, render: (tText: string) => <div className="font-semibold text-slate-900">{tText}</div> },
    { title: 'GVHD', dataIndex: 'supervisor', key: 'supervisor', width: 200, className: 'whitespace-nowrap', render: (s: string) => <span className="font-medium text-slate-700">{s}</span> },
    {
      title: 'SVTH',
      key: 'members',
      render: (_: unknown, record: IListGroup) => (
        <div className="flex flex-col gap-1">
          {(record.members || []).map((m) => (
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
    {
      title: 'Điều kiện bảo vệ',
      key: 'defense_eligibility',
      render: (_: unknown, record: IListGroup) => {
        const hdan = record.ket_qua_huong_dan;
        const pbien = record.ket_qua_phan_bien;

        if (hdan === 'DAT' && pbien === 'DAT') {
          return <Tag color="green" className="m-0 rounded-full font-medium">Đủ điều kiện bảo vệ</Tag>;
        }
        if (hdan === 'DAT' && pbien === 'KHONG_DAT') {
          return <Tag color="red" className="m-0 rounded-full font-medium">Không đạt phản biện</Tag>;
        }
        if (hdan === 'DAT') {
          return <Tag color="blue" className="m-0 rounded-full font-medium">Đạt GVHD (Chờ phản biện)</Tag>;
        }
        if (hdan === 'KHONG_DAT') {
          return <Tag color="red" className="m-0 rounded-full font-medium">Không đạt GVHD</Tag>;
        }
        return <Tag color="warning" className="m-0 rounded-full font-medium text-amber-600 bg-amber-50 border-amber-200">Chưa đánh giá GVHD</Tag>;
      }
    },
    {
      title: t(getKey('group_status')),
      key: 'status',
      render: (_: unknown, r: IListGroup) => {
        const meta = getStatusMeta(t)[r.status as Group['status']];
        return <Tag color={meta?.color || 'default'} className="!px-2 !py-[2px] !text-xs !font-medium">{meta?.label || r.status}</Tag>;
      },
    },
  ];

  const statusMetaObj = getStatusMeta(t);

  return (
    <div className="pb-4">
      <div className="mb-5 flex items-center justify-start rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-md)]/10 px-3 py-1 text-xs font-medium text-[var(--color-blue-login-mid)]">
            <TeamOutlined />
            {t(getKey('group_management'))}
          </div>
          <h1 className="m-0 text-[34px] font-bold leading-[40px] text-navyDark">{t(getKey('group_management'))}</h1>
          <p className="mt-2 mb-0 text-[18px] leading-[26px] text-grayDark">{t(getKey('group_management_desc'))}</p>
        </div>
      </div>

      {selectedPeriod && (
        <div className={`mb-5 p-4 rounded-[18px] border flex items-center justify-between shadow-[0_12px_28px_rgba(15,23,42,0.02)] ${
          isPeriodClosed ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          <div>
            {t(getKey('showing'))} {t(getKey('group_management'))} {t(getKey('of'))}: <strong className="underline">{selectedPeriod.name}</strong>
            {isPeriodClosed && ` (${t(getKey('read_only_data_locked'))})`}
          </div>
          {isPeriodClosed && <Tag color="error">{t(getKey('read_only_tag'))}</Tag>}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Groups */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] flex justify-between items-start">
          <div>
            <div className="text-sm text-slate-500">{t(getKey('total_groups'))}</div>
            <div className="mt-1 text-[32px] font-bold leading-[38px] text-slate-900">{formatNumber(total)}</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <TeamOutlined style={{ fontSize: 20 }} />
          </div>
        </div>

        {/* Eligible */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] flex justify-between items-start">
          <div>
            <div className="text-sm text-emerald-700">{t(getKey('eligible'))}</div>
            <div className="mt-1 text-[32px] font-bold leading-[38px] text-emerald-700">{formatNumber(enough)}</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <CheckCircleOutlined style={{ fontSize: 20 }} />
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] flex justify-between items-start">
          <div>
            <div className="text-sm text-amber-700">{t(getKey('warning'))}</div>
            <div className="mt-1 text-[32px] font-bold leading-[38px] text-amber-700">{formatNumber(withWarnings)}</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <ExclamationCircleOutlined style={{ fontSize: 20 }} />
          </div>
        </div>

        {/* Missing */}
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] flex justify-between items-start">
          <div>
            <div className="text-sm text-sky-700">{t(getKey('missing_members'))}</div>
            <div className="mt-1 text-[32px] font-bold leading-[38px] text-sky-700">{formatNumber(missing)}</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <UserOutlined style={{ fontSize: 20 }} />
          </div>
        </div>
      </div>

      <Card className="rounded-[18px] border border-slate-100 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <FilterTable<IListGroup, IDetailGroup, ICreateGroup, IUpdateGroup>
          title={t(getKey('group_list'))}
          createButtonLabel={undefined}
          columns={columns}
        useQueryHook={(params: BaseListParams) => {
          const typedParams = params as BaseListParams & { keyword?: string; status?: string; supervisor?: string; topicDirection?: string };
          const query = groupHooks.useFetchListGroups();
          const normalizedKeyword = (typedParams.keyword ?? '').trim().toLowerCase();
          const status = typedParams.status;
          const supervisor = typedParams.supervisor;
          const topicDirection = typedParams.topicDirection;

          const allRows = (query.data?.rows ?? groups) as IListGroup[];
          const filteredRows = allRows.filter((g) => {
            // Lọc theo đợt hoạt động được chọn ở header
            if (selectedPeriod && g.registrationBatch !== selectedPeriod.name) {
              return false;
            }

            if (normalizedKeyword) {
              const inGroup = (g.title || '').toLowerCase().includes(normalizedKeyword);
              const inMembers = g.members.some((m) => `${m.name} ${m.code || ''}`.toLowerCase().includes(normalizedKeyword));
              if (!inGroup && !inMembers) return false;
            }
            if (status && g.status !== status) return false;

            if (supervisor && g.supervisor !== supervisor) return false;
            if (topicDirection && g.topicDirection !== topicDirection) return false;
            return true;
          });

          // Sắp xếp các nhóm cùng đề tài nằm cạnh nhau để dễ kiểm soát
          filteredRows.sort((a, b) => {
            const titleA = a.title || '';
            const titleB = b.title || '';
            return titleA.localeCompare(titleB, 'vi');
          });

          const data = { rows: filteredRows, total: filteredRows.length };
          return {
            ...query,
            data,
          } as UseQueryResult<ListResponseTypeObject<IListGroup>, Error>;
        }}
        filterRender={() => (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            <Form.Item name="keyword" className={"xl:col-span-4 !mb-0"}>
              <Input
                allowClear
                prefix={<SearchOutlined className={"text-slate-400"} />}
                placeholder="Tìm kiếm theo tên đề tài, tên hoặc MSSV thành viên..."
                className={"!h-11 !rounded-[12px] !border-slate-300"}
              />
            </Form.Item>
            <Form.Item name="status" className={"xl:col-span-2 !mb-0"}>
              <Select allowClear placeholder={t(getKey('status'))} className={"!h-11 !w-full"} options={Object.keys(statusMetaObj).map((k) => ({ value: k, label: statusMetaObj[k as Group['status']].label }))} />
            </Form.Item>
            <Form.Item name="supervisor" className={"xl:col-span-3 !mb-0"}>
              <Select allowClear placeholder={t(getKey('teacher'))} className={"!h-11 !w-full"} options={supervisors.map((s) => ({ value: s, label: s }))} />
            </Form.Item>
            <Form.Item name="topicDirection" className={"xl:col-span-3 !mb-0"}>
              <Select
                allowClear
                placeholder="Hướng đề tài"
                className={"!h-11 !w-full"}
                options={[
                  { value: 'PHAN_MEM', label: 'Phần mềm' },
                  { value: 'MANG_MAY_TINH', label: 'Mạng máy tính' },
                ]}
              />
            </Form.Item>
          </div>
        )}
        updateInfo={isPeriodClosed ? undefined : {
          type: 'modal',
          modalInfo: {
            modalContent: <GroupForm />,
            modalProps: { centered: true, width: 720, title: 'Chỉnh sửa nhóm Đồ Án Tốt Nghiệp' },
            modalFunc: updateGroupMutation,
          }
        }}
        detailInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <GroupForm disabled />,
            modalProps: { centered: true, width: 720, title: 'Chi tiết nhóm', footer: null },
            modalFunc: groupHooks.useFetchDetailGroup as unknown as (id: string, enable: boolean) => UseQueryResult<IDetailGroup, Error>,
          }
        }}
        deleteInfo={isPeriodClosed ? undefined : { type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: deleteGroupMutation as unknown as UseMutationResult<IListGroup, AxiosError, { id: string; params: BaseListParams }> } }}
        formatInitialValues={(g) => ({ code: g?.code ?? '', title: g?.title ?? '', supervisor: g?.supervisor ?? '', members: g?.members ?? [], maxMembers: g?.maxMembers ?? 2, status: g?.status ?? STATUS_CODE.PENDING_UP, registrationBatch: g?.registrationBatch ?? '' })}
        formatFormValues={(v) => v as unknown as ICreateGroup}
        actions={{
          isDetail: true,
          isEdit: !isPeriodClosed,
          isDelete: !isPeriodClosed,
          customAction: isPeriodClosed ? undefined : (record) => {
            const r = record as Group;
            const isMergeable = r.status === STATUS_CODE.MISSING || r.status === STATUS_CODE.WARNING;
            return (
              <div className="pointer-events-auto">
                <Space>
                  <Tooltip title="Ghép nhóm">
                    <span>
                      <Button
                        type="text"
                        size="small"
                        onClick={() => { setMergeMode(true); setMergeLeft(r.id); }}
                        icon={<SwapOutlined />}
                        disabled={!isMergeable}
                      />
                    </span>
                  </Tooltip>
                </Space>
              </div>
            );
          },
        }}
      />
      </Card>

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
