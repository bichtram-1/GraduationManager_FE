import React from 'react';
import { Form, Input, Select } from 'antd';
import type { IDetailAssignment } from '../../../type/AssignmentType';

type Props = {
  disabled?: boolean;
};

const AssignmentForm: React.FC<Props> = ({ disabled }) => (
  <>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Form.Item label="MSSV" name="studentId" rules={[{ required: true, message: 'Vui lòng nhập MSSV' }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label="Lớp" name="className" rules={[{ required: true, message: 'Vui lòng nhập lớp' }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
        <Select disabled={disabled} options={[{ value: 'assigned', label: 'Đã phân công' }, { value: 'unassigned', label: 'Chưa phân công' }]} />
      </Form.Item>
    </div>

    <Form.Item label="Đề tài" name="topic">
      <Input disabled={disabled} />
    </Form.Item>

    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Form.Item label="Giảng viên hướng dẫn" name="supervisor">
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label="Ngày phân công" name="assignedAt">
        <Input disabled={disabled} placeholder="DD/MM/YYYY" />
      </Form.Item>
    </div>
  </>
);

export default AssignmentForm;
