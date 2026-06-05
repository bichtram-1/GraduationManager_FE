import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Space, Tooltip, Button, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { IDetailGroup, IGroupMember } from '../../../type/GroupType';
import AddMemberModal from './AddMemberModal';

interface Props {
  detail?: IDetailGroup;
  sampleStudents?: IGroupMember[];
  readOnly?: boolean;
}

const statusOptions = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'WARNING', label: 'Có cảnh báo' },
  { value: 'MISSING', label: 'Thiếu thành viên' },
  { value: 'LOCKED', label: 'Bị khóa' },
  { value: 'DISSOLVED', label: 'Đã giải thể' },
];

const GroupForm: React.FC<Props> = ({ detail, sampleStudents, readOnly }) => {
  const [adding, setAdding] = useState(false);
  const formInstance = Form.useFormInstance();

  const onAdd = (_groupId: string, student: IGroupMember) => {
    // insert into form list so changes are saved on modal submit
    const members = formInstance.getFieldValue('members') || detail?.members || [];
    const exists = (members || []).some((m: IGroupMember) => m.id === student.id);
    if (exists) return Modal.info({ title: 'Đã tồn tại', content: 'Thành viên đã có trong nhóm.' });
    const newMembers = [...members, student];
    formInstance.setFieldsValue({ members: newMembers });
    setAdding(false);
  };

  const onRemove = (memberId: string) => {
    const members = formInstance.getFieldValue('members') || detail?.members || [];
    Modal.confirm({
      title: 'Xác nhận xóa thành viên',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc muốn xóa thành viên này khỏi nhóm?',
      async onOk() {
        const newMembers = (members || []).filter((m: IGroupMember) => m.id !== memberId);
        formInstance.setFieldsValue({ members: newMembers });
      },
    });
  };
  return (
    <>
      <Form.Item name="code" label="Mã nhóm" rules={[{ required: true }]}>
        <Input disabled={readOnly} />
      </Form.Item>

      <Form.Item name="title" label="Tên đề tài" rules={[{ required: true }]}>
        <Input disabled={readOnly} />
      </Form.Item>

      <Form.Item name="supervisor" label="Giảng viên hướng dẫn" rules={[{ required: true }]}>
        <Input disabled={readOnly} />
      </Form.Item>

      <Form.Item name="maxMembers" label="Số thành viên tối đa" rules={[{ required: true }]}>
        <InputNumber disabled={readOnly} min={1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="registrationBatch" label="Đợt đăng ký">
        <Input disabled={readOnly} />
      </Form.Item>

      <Form.Item name="status" label="Trạng thái">
        <Select disabled={readOnly} options={statusOptions} />
      </Form.Item>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">Thành viên</div>
          {!readOnly && <Button size="small" onClick={() => setAdding(true)}>Thêm thành viên</Button>}
        </div>

        <Form.List name="members" initialValue={detail?.members || []}>
          {(fields, { add, remove }) => (
            <div>
              {fields.map((field) => (
                <div key={field.key} className="flex items-center gap-2 mb-2">
                  <Form.Item noStyle shouldUpdate>
                    <Form.Item name={[field.name, 'code']} label={undefined} rules={[{ required: true }]}>
                      <Input disabled={readOnly} placeholder="Mã SV" style={{ width: 120 }} />
                    </Form.Item>
                  </Form.Item>
                  <Form.Item name={[field.name, 'name']} label={undefined} rules={[{ required: true }]} style={{ flex: 1 }}>
                    <Input disabled={readOnly} placeholder="Họ và tên" />
                  </Form.Item>
                  {!readOnly && <Button type="text" danger size="small" onClick={() => { onRemove(formInstance.getFieldValue(['members', field.name, 'id'])); remove(field.name); }}>Xóa</Button>}
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
