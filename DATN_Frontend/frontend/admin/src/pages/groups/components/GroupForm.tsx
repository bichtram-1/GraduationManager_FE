import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { IDetailGroup, IGroupMember } from '../../../type/GroupType';
import AddMemberModal from './AddMemberModal';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE } from '../../../constants/commonConst';

interface Props {
  detail?: IDetailGroup;
  sampleStudents?: IGroupMember[];
  readOnly?: boolean;
}

const GroupForm: React.FC<Props> = ({ detail, sampleStudents, readOnly }) => {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);
  const formInstance = Form.useFormInstance();

  const statusOptions = [
    { value: STATUS_CODE.PENDING_UP, label: t(getKey('status_pending')) },
    { value: STATUS_CODE.APPROVED_UP, label: t(getKey('status_approved')) },
    { value: STATUS_CODE.WARNING, label: t(getKey('status_warning')) },
    { value: STATUS_CODE.MISSING, label: t(getKey('status_missing')) },
    { value: STATUS_CODE.LOCKED, label: t(getKey('status_locked')) },
    { value: STATUS_CODE.DISSOLVED, label: t(getKey('status_dissolved')) },
  ];

  const onAdd = (_groupId: string, student: IGroupMember) => {
    const members = formInstance.getFieldValue('members') || detail?.members || [];
    const exists = (members || []).some((m: IGroupMember) => m.id === student.id);
    if (exists) return Modal.info({ title: t(getKey('already_exists')), content: t(getKey('member_already_in_group')) });
    const newMembers = [...members, student];
    formInstance.setFieldsValue({ members: newMembers });
    setAdding(false);
  };

  const onRemove = (memberId: string) => {
    const members = formInstance.getFieldValue('members') || detail?.members || [];
    Modal.confirm({
      title: t(getKey('confirm_remove_member')),
      icon: <ExclamationCircleOutlined />,
      content: t(getKey('confirm_remove_member_desc')),
      async onOk() {
        const newMembers = (members || []).filter((m: IGroupMember) => m.id !== memberId);
        formInstance.setFieldsValue({ members: newMembers });
      },
    });
  };

  return (
    <>
      <Form.Item name="code" label={t(getKey('group_code'))} rules={[{ required: true }]}>
        <Input disabled={readOnly} />
      </Form.Item>

      <Form.Item name="title" label={t(getKey('topic_name'))} rules={[{ required: true }]}>
        <Input disabled={readOnly} />
      </Form.Item>

      <Form.Item name="supervisor" label={t(getKey('supervisor_teacher'))} rules={[{ required: true }]}>
        <Input disabled={readOnly} />
      </Form.Item>

      <Form.Item name="maxMembers" label={t(getKey('max_members_count'))} rules={[{ required: true }]}>
        <InputNumber disabled={readOnly} min={1} className="w-full" />
      </Form.Item>

      <Form.Item name="registrationBatch" label={t(getKey('registration_period'))}>
        <Input disabled={readOnly} />
      </Form.Item>

      <Form.Item name="status" label={t(getKey('status'))}>
        <Select disabled={readOnly} options={statusOptions} />
      </Form.Item>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">{t(getKey('members'))}</div>
          {!readOnly && <Button size="small" onClick={() => setAdding(true)}>{t(getKey('add_member'))}</Button>}
        </div>

        <Form.List name="members" initialValue={detail?.members || []}>
          {(fields, { add, remove }) => (
            <div>
              {fields.map((field) => (
                <div key={field.key} className="flex items-center gap-2 mb-2">
                  <Form.Item noStyle shouldUpdate>
                    <Form.Item name={[field.name, 'code']} label={undefined} rules={[{ required: true }]}>
                      <Input disabled={readOnly} placeholder={t(getKey('student_id_short'))} className="w-[120px]" />
                    </Form.Item>
                  </Form.Item>
                  <Form.Item name={[field.name, 'name']} label={undefined} rules={[{ required: true }]} className="flex-1">
                    <Input disabled={readOnly} placeholder={t(getKey('enter_student_name'))} />
                  </Form.Item>
                  {!readOnly && <Button type="text" danger size="small" onClick={() => { onRemove(formInstance.getFieldValue(['members', field.name, 'id'])); remove(field.name); }}>{t(getKey('delete'))}</Button>}
                </div>
              ))}
            </div>
          )}
        </Form.List>

      </div>

      {!readOnly && <AddMemberModal open={adding} onCancel={() => setAdding(false)} group={detail ?? null} sampleStudents={sampleStudents ?? []} onAdd={onAdd} />}
    </>
  );
};

export default GroupForm;
