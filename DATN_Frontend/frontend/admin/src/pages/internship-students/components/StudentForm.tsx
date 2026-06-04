import { Form, Input, Select } from 'antd';
import React from 'react';

type Props = { disabled?: boolean };

const StudentForm: React.FC<Props> = ({ disabled = false }) => {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Form.Item label="MSSV" name="studentId" rules={[{ required: true, message: 'Vui lòng nhập MSSV' }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label="Họ tên" name="studentName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label="Lớp" name="className" rules={[{ required: true, message: 'Vui lòng nhập lớp' }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label="SĐT" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
        <Select disabled={disabled} options={[{ value: 'not_registered', label: 'Chưa đăng ký' }, { value: 'searching', label: 'Đang tìm' }]} />
      </Form.Item>
    </div>
  );
};

export default StudentForm;
