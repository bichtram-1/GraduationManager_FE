import { Form, Input, Select } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';

type Props = {
  disabled?: boolean;
};

const TopicForm: React.FC<Props> = ({ disabled = false }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
      <Form.Item label={t(getKey('topic_name'))} name="name" rules={[{ required: true, message: 'Vui lòng nhập tên đề tài' }]}>
        <Input disabled={disabled} placeholder="VD: Phân tích dữ liệu giáo dục" />
      </Form.Item>

      <Form.Item label={t(getKey('teacher'))} name="teacher" rules={[{ required: true, message: 'Vui lòng nhập giảng viên' }]}>
        <Input disabled={disabled} placeholder="VD: TS. Nguyễn Văn X" />
      </Form.Item>

      <Form.Item label="Slot" name="slots" rules={[{ required: true, message: 'Vui lòng nhập slot' }]}>
        <Input disabled={disabled} placeholder="VD: 0/3" />
      </Form.Item>

      <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
        <Select
          disabled={disabled}
          options={[
            { value: 'pending', label: 'Chờ duyệt' },
            { value: 'approved', label: 'Đã duyệt' },
            { value: 'rejected', label: 'Từ chối' },
          ]}
        />
      </Form.Item>

      <Form.Item label="Lý do từ chối" name="rejectReason" className="md:col-span-2">
        <Input.TextArea disabled={disabled} rows={3} placeholder="Nhập lý do từ chối (nếu có)" />
      </Form.Item>
    </div>
  );
};

export default TopicForm;
