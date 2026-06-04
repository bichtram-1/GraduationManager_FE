import React from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import type { IDetailGroup } from '../../type/GroupType';

interface Props {
  detail?: IDetailGroup;
}

const statusOptions = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'WARNING', label: 'Có cảnh báo' },
  { value: 'MISSING', label: 'Thiếu thành viên' },
  { value: 'LOCKED', label: 'Bị khóa' },
  { value: 'DISSOLVED', label: 'Đã giải thể' },
];

const GroupForm: React.FC<Props> = () => {
  return (
    <>
      <Form.Item name="code" label="Mã nhóm" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="title" label="Tên đề tài" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="supervisor" label="Giảng viên hướng dẫn" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="maxMembers" label="Số thành viên tối đa" rules={[{ required: true }]}>
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="registrationBatch" label="Đợt đăng ký">
        <Input />
      </Form.Item>

      <Form.Item name="status" label="Trạng thái">
        <Select options={statusOptions} />
      </Form.Item>
    </>
  );
};

export default GroupForm;
