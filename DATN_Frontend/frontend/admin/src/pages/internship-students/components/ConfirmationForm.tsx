import { Form, Input, Select } from 'antd';
import React from 'react';

type Props = { disabled?: boolean };

const ConfirmationForm: React.FC<Props> = ({ disabled = false }) => {
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
      <Form.Item label="Ngày đăng ký" name="regDate" rules={[{ required: true, message: 'Vui lòng nhập ngày đăng ký' }]}>
        <Input disabled={disabled} placeholder="DD/MM/YYYY" />
      </Form.Item>

      <Form.Item label="Công ty" name="companyName" rules={[{ required: true, message: 'Vui lòng nhập công ty' }]} className="md:col-span-2">
        <Input disabled={disabled} />
      </Form.Item>

      <Form.Item label="Địa chỉ công ty" name="companyAddress" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ công ty' }]} className="md:col-span-2">
        <Input disabled={disabled} />
      </Form.Item>

      <Form.Item label="Địa điểm thực tập" name="internshipLocation" rules={[{ required: true, message: 'Vui lòng nhập địa điểm thực tập' }]} className="md:col-span-2">
        <Input disabled={disabled} />
      </Form.Item>

      <Form.Item label="Mã số thuế" name="taxId" rules={[{ required: true, message: 'Vui lòng nhập mã số thuế' }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label="Mentor" name="mentor" rules={[{ required: true, message: 'Vui lòng nhập mentor' }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
        <Select disabled={disabled} options={[{ value: 'pending', label: 'Chờ cấp' }, { value: 'approved', label: 'Đã cấp' }, { value: 'rejected', label: 'Bị từ chối' }]} />
      </Form.Item>
    </div>
  );
};

export default ConfirmationForm;
