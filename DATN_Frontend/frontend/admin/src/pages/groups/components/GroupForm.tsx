import React, { useState, useMemo } from 'react';
import { Form, Input, InputNumber, Select, Button, Modal, Table, Tag, Tooltip } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { IDetailGroup, IGroupMember } from '../../../type/GroupType';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE } from '../../../constants/commonConst';
import AddMemberModal from './AddMemberModal';
import { useGlobalVariable } from '../../../hooks/GlobalVariableProvider';
import { assignmentHooks } from '../../../hooks/useAssignments';
import { groupHooks } from '../../../hooks/useGroups';

interface Props {
  detail?: IDetailGroup;
  sampleStudents?: IGroupMember[];
  readOnly?: boolean;
}

const GroupForm: React.FC<Props> = ({ detail, readOnly }) => {
  const { t } = useTranslation();
  const { selectedPeriod } = useGlobalVariable();
  const [adding, setAdding] = useState(false);
  const formInstance = Form.useFormInstance();

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

  const dbStudents = useMemo(() => {
    const rows = (assignmentList?.rows ?? []) as any[];
    return rows.map((r) => {
      // Mock eligibility for specific student codes for demo
      const ineligibleCodes = ['0306231007', '0306231033', 'SV003', 'SV004'];
      const isEligible = !ineligibleCodes.includes(r.studentId);
      return {
        id: r.studentId, // Use MSSV as ID
        name: r.name,
        code: r.studentId,
        class: r.className,
        eligible: isEligible,
        reason: isEligible ? '' : 'Chưa đủ điều kiện làm đồ án'
      };
    });
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

  if (readOnly) {
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
      <Form.Item name="title" label={t(getKey('topic_name'))} rules={[{ required: true, message: 'Vui lòng nhập tên đề tài' }]}>
        <Input />
      </Form.Item>

      <Form.Item name="supervisor" label="Giảng viên hướng dẫn" rules={[{ required: true, message: 'Vui lòng nhập giảng viên hướng dẫn' }]}>
        <Input />
      </Form.Item>

      <Form.Item name="maxMembers" label="Số lượng thành viên" rules={[{ required: true }]}>
        <InputNumber min={1} className="w-full" />
      </Form.Item>

      <Form.Item name="registrationBatch" label={t(getKey('registration_period'))}>
        <Input />
      </Form.Item>

      {detail?.status && (
        <Form.Item label={t(getKey('status'))}>
          <Tag color={statusOptions.find((o) => o.value === detail.status)?.color || 'default'} className="!px-2.5 !py-0.5 !text-xs !font-medium">
            {statusOptions.find((o) => o.value === detail.status)?.label || detail.status}
          </Tag>
        </Form.Item>
      )}

      <div className="mt-5">
        <Form.List name="members">
          {(fields, { add, remove }) => {
            const columns = [
              {
                title: 'MSSV',
                key: 'code',
                width: 150,
                render: (_: any, field: any) => {
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
                render: (_: any, field: any) => {
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
                render: (_: any, field: any) => {
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
              {
                title: 'Hành động',
                key: 'action',
                width: 100,
                render: (_: any, field: any) => (
                  <Button
                    type="link"
                    danger
                    onClick={() => {
                      onRemove(() => remove(field.name));
                    }}
                  >
                    Xóa
                  </Button>
                ),
              },
            ];

            return (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800">Thành viên nhóm</div>
                  <Button type="dashed" size="small" onClick={() => setAdding(true)}>
                    Thêm thành viên
                  </Button>
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

      {!readOnly && (
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
    </>
  );
};

export default GroupForm;
