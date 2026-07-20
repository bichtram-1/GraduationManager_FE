import React, { useState, useMemo, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Modal, Table, Tag, Tooltip } from 'antd';
import type { FormListFieldData } from 'antd';
import { ExclamationCircleOutlined, SwapOutlined } from '@ant-design/icons';
import type { IDetailGroup, IGroupMember } from '../../../type/GroupType';
import type { AssignmentRow } from '../../../type/AssignmentType';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE } from '../../../constants/commonConst';
import AddMemberModal from './AddMemberModal';
import { useGlobalVariable } from '../../../hooks/GlobalVariableProvider';
import { assignmentHooks } from '../../../hooks/useAssignments';
import { groupHooks } from '../../../hooks/useGroups';
import SwapMemberModal from './SwapMemberModal';

interface Props {
  detail?: IDetailGroup;
  sampleStudents?: IGroupMember[];
  disabled?: boolean;
  onPendingSwapChange?: (hasPending: boolean) => void;
}

const GroupForm: React.FC<Props> = ({ detail, disabled, onPendingSwapChange }) => {
  const { t } = useTranslation();
  const { selectedPeriod } = useGlobalVariable();
  const [adding, setAdding] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [pendingSwap, setPendingSwap] = useState<{ outName: string; inName: string } | null>(null);
  const formInstance = Form.useFormInstance();

  useEffect(() => {
    onPendingSwapChange?.(!!pendingSwap);
  }, [pendingSwap, onPendingSwapChange]);

  // Reset trạng thái hoán đổi xem-trước mỗi khi mở lại form cho 1 nhóm khác/nhóm mới
  useEffect(() => {
    setPendingSwap(null);
  }, [detail?.id]);

  useEffect(() => {
    if (detail) {
      formInstance.setFieldsValue({
        members: detail.members || []
      });
    }
  }, [detail, formInstance]);

  // Load all groups in the period
  const { data: groupList } = groupHooks.useFetchListGroups();
  const allGroupsList = useMemo(() => {
    const rawRows = (groupList?.rows ?? []) as IDetailGroup[];
    if (!selectedPeriod) return rawRows;
    return rawRows.filter((g) => g.registrationBatch === selectedPeriod.name);
  }, [groupList, selectedPeriod]);

  // Load all students of the current period from database
  const { data: assignmentList } = assignmentHooks.useFetchListAssignments({
    page: 1,
    limit: 1000,
    periodId: selectedPeriod?.id ?? 'none'
  });

  const otherGroupStudents = useMemo(() => {
    const rows = (assignmentList?.rows ?? []) as AssignmentRow[];
    const currentGroupId = detail?.id;
    return rows.filter((r) => {
      if (!r.groupId || String(r.groupId) === String(currentGroupId)) return false;
      if ((r.dieuKienLamDoAn ?? 'DAT') !== 'DAT') return false;

      // Lọc bỏ sinh viên thuộc nhóm đã bị từ chối (LOCKED) hoặc giải tán (DISSOLVED)
      const group = allGroupsList.find((g) => String(g.id) === String(r.groupId));
      if (group) {
        if (group.status === 'LOCKED' || group.status === 'DISSOLVED') {
          return false;
        }
      }
      return true;
    });
  }, [assignmentList, detail?.id, allGroupsList]);

  const dbStudents = useMemo(() => {
    const rows = (assignmentList?.rows ?? []) as AssignmentRow[];
    return rows.map((r) => ({
      id: r.studentId, // Use MSSV as ID
      name: r.name,
      code: r.studentId,
      class: r.className,
      eligible: true,
      reason: ''
    }));
  }, [assignmentList]);

  const statusOptions = [
    { value: STATUS_CODE.PENDING_UP, label: t(getKey('status_pending')), color: 'default' },
    { value: STATUS_CODE.APPROVED_UP, label: t(getKey('status_approved')), color: 'green' },
    { value: STATUS_CODE.WARNING, label: t(getKey('status_warning')), color: 'orange' },
    { value: STATUS_CODE.MISSING, label: t(getKey('status_missing')), color: 'blue' },
    { value: STATUS_CODE.LOCKED, label: t(getKey('status_locked')), color: 'red' },
    { value: STATUS_CODE.DISSOLVED, label: t(getKey('status_dissolved')), color: 'default' },
  ];

  const onAdd = (student: IGroupMember) => {
    const members = formInstance.getFieldValue('members') || [];
    const newMembers = [...members, student];
    formInstance.setFieldsValue({ members: newMembers });
    setAdding(false);
  };

  // Chỉ cập nhật xem-trước trong form (chưa gọi API) - thay thành viên bị hoán đổi đi bằng
  // thành viên mới, đồng thời ghi lại 2 mã sinh viên vào field ẩn để khi bấm "Cập nhật" thật
  // sự, payload gửi lên sẽ kèm theo và backend mới thực hiện hoán đổi chéo cả 2 nhóm.
  const onStageSwap = (studentOut: IGroupMember, studentIn: AssignmentRow) => {
    const members = (formInstance.getFieldValue('members') || []) as IGroupMember[];
    const newMembers = members
      .filter((m) => m.code !== studentOut.code)
      .concat([{ id: studentIn.studentId, code: studentIn.studentId, name: studentIn.name, class: studentIn.className }]);
    formInstance.setFieldsValue({
      members: newMembers,
      swapStudentIdA: studentOut.code,
      swapStudentIdB: studentIn.studentId,
    });
    setPendingSwap({ outName: studentOut.name, inName: studentIn.name });
  };

  const onRemove = (confirmCallback: () => void) => {
    Modal.confirm({
      title: t(getKey('confirm_remove_member')),
      icon: <ExclamationCircleOutlined />,
      content: t(getKey('confirm_remove_member_desc')),
      async onOk() {
        confirmCallback();
      },
    });
  };

  if (disabled) {
    const statusMeta = statusOptions.find((o) => o.value === detail?.status);
    return (
      <div className="space-y-8">
        {/* Basic text layout for general info details */}
        <div className="space-y-5 pb-6 border-b border-slate-100">
          <div>
            <span className="font-semibold text-slate-500">Tên đề tài:</span>{' '}
            <span className={`font-bold ${detail?.title ? 'text-slate-900' : 'text-slate-400 italic font-normal'}`}>
              {detail?.title || '— Chưa có đề tài'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Giảng viên hướng dẫn:</span>{' '}
            <span className="font-semibold text-slate-700">{detail?.supervisor || '—'}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Số lượng thành viên:</span>{' '}
            <span className="font-semibold text-slate-700">{detail?.maxMembers || 2}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Đợt đăng ký:</span>{' '}
            <span className="font-semibold text-slate-700">{detail?.registrationBatch || '—'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Trạng thái:</span>{' '}
            {detail?.status ? (
              <Tag color={statusMeta?.color || 'default'} className="!px-2.5 !py-0.5 !text-xs !font-medium">
                {statusMeta?.label || detail.status}
              </Tag>
            ) : '—'}
          </div>
        </div>

        {/* Members List Table */}
        <div>
          <div className="text-sm font-bold text-slate-900 mb-3">Thành viên nhóm</div>
          <Table
            dataSource={detail?.members || []}
            columns={[
              {
                title: 'MSSV',
                dataIndex: 'code',
                key: 'code',
                width: 140,
                render: (code: string) => <span className="font-medium text-slate-600">{code}</span>,
              },
              {
                title: 'Họ tên',
                dataIndex: 'name',
                key: 'name',
                render: (name: string, m: IGroupMember) => (
                  <span className={`font-semibold ${m.eligible !== false ? 'text-slate-900' : 'text-red-700'}`}>
                    {name} {m.eligible !== false ? '' : (
                      <Tooltip title={m.reason || 'Chưa đủ điều kiện làm đồ án'}>
                        <span className="text-red-500 ml-1 cursor-help">⚠</span>
                      </Tooltip>
                    )}
                  </span>
                ),
              },
              {
                title: 'Lớp',
                dataIndex: 'class',
                key: 'class',
                width: 140,
                render: (cls: string) => <span className="text-slate-600">{cls || '—'}</span>,
              },
            ]}
            pagination={false}
            size="small"
            rowKey="id"
            bordered
          />
        </div>
      </div>
    );
  }

  // Edit / Update mode
  return (
    <>
      <Form.Item name="title" label={`${t(getKey('topic_name'))} (lấy từ đề tài đã đăng ký, sửa qua Quản lý đề tài)`}>
        <Input disabled />
      </Form.Item>

      <Form.Item name="supervisor" label="Giảng viên hướng dẫn (lấy từ đề tài đã đăng ký)">
        <Input disabled />
      </Form.Item>

      <Form.Item name="maxMembers" label="Số lượng thành viên tối đa (lấy từ đề tài đã đăng ký)">
        <InputNumber min={1} max={10} className="w-full" disabled />
      </Form.Item>

      <Form.Item name="registrationBatch" label={t(getKey('registration_period'))}>
        <Input disabled />
      </Form.Item>

      <Form.Item name="swapStudentIdA" noStyle>
        <Input style={{ display: 'none' }} />
      </Form.Item>
      <Form.Item name="swapStudentIdB" noStyle>
        <Input style={{ display: 'none' }} />
      </Form.Item>

      {pendingSwap && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Đang xem trước hoán đổi: <strong>{pendingSwap.outName}</strong> → <strong>{pendingSwap.inName}</strong>.
          Thay đổi này chỉ chính thức lưu khi bạn bấm &quot;Cập nhật&quot;; bấm &quot;Hủy&quot; sẽ bỏ qua.
        </div>
      )}

      {detail?.status && (
        <Form.Item label={t(getKey('status'))}>
          <Tag color={statusOptions.find((o) => o.value === detail.status)?.color || 'default'} className="!px-2.5 !py-0.5 !text-xs !font-medium">
            {statusOptions.find((o) => o.value === detail.status)?.label || detail.status}
          </Tag>
        </Form.Item>
      )}

      <div className="mt-5">
        <Form.List name="members">
          {(fields, { remove }) => {
            const columns = [
              {
                title: 'MSSV',
                key: 'code',
                width: 150,
                render: (_: unknown, field: FormListFieldData) => {
                  const code = formInstance.getFieldValue(['members', field.name, 'code']);
                  return (
                    <div>
                      <span className="font-semibold text-slate-600">{code}</span>
                      <Form.Item name={[field.name, 'code']} noStyle>
                        <Input style={{ display: 'none' }} />
                      </Form.Item>
                      <Form.Item name={[field.name, 'id']} noStyle>
                        <Input style={{ display: 'none' }} />
                      </Form.Item>
                    </div>
                  );
                }
              },
              {
                title: 'Họ tên',
                key: 'name',
                render: (_: unknown, field: FormListFieldData) => {
                  const name = formInstance.getFieldValue(['members', field.name, 'name']);
                  return (
                    <div>
                      <span className="font-semibold text-slate-900">{name}</span>
                      <Form.Item name={[field.name, 'name']} noStyle>
                        <Input style={{ display: 'none' }} />
                      </Form.Item>
                    </div>
                  );
                }
              },
              {
                title: 'Lớp',
                key: 'class',
                width: 150,
                render: (_: unknown, field: FormListFieldData) => {
                  const cls = formInstance.getFieldValue(['members', field.name, 'class']);
                  return (
                    <div>
                      <span className="text-slate-600">{cls || '—'}</span>
                      <Form.Item name={[field.name, 'class']} noStyle>
                        <Input style={{ display: 'none' }} />
                      </Form.Item>
                    </div>
                  );
                }
              },
            ];

            return (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800">Thành viên nhóm</div>
                  <div className="flex gap-2">
                    <Button
                      type="primary"
                      size="small"
                      ghost
                      icon={<SwapOutlined />}
                      onClick={() => setSwapping(true)}
                      disabled={detail?.status === 'LOCKED' || detail?.status === 'DISSOLVED'}
                    >
                      Hoán đổi
                    </Button>
                  </div>
                </div>
                <Table
                  dataSource={fields}
                  columns={columns}
                  pagination={false}
                  size="small"
                  rowKey="key"
                  bordered
                />
              </div>
            );
          }}
        </Form.List>
      </div>

      {!disabled && (
        <AddMemberModal
          open={adding}
          onCancel={() => setAdding(false)}
          group={detail ?? null}
          sampleStudents={dbStudents}
          groups={allGroupsList}
          currentGroupMembers={formInstance.getFieldValue('members') || []}
          onAdd={onAdd}
        />
      )}

      {!disabled && (
        <SwapMemberModal
          open={swapping}
          onCancel={() => setSwapping(false)}
          currentGroupMembers={formInstance.getFieldValue('members') || []}
          otherGroupStudents={otherGroupStudents}
          onStageSwap={onStageSwap}
        />
      )}
    </>
  );
};

export default GroupForm;
