import { Form, Input, InputNumber, Select } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';

type Props = {
  disabled?: boolean;
};

const companyFieldOptions = [
  { value: 'Phần mềm & công nghệ', label: 'Phần mềm & công nghệ' },
  { value: 'Thương mại điện tử', label: 'Thương mại điện tử' },
  { value: 'Gia công phần mềm', label: 'Gia công phần mềm' },
  { value: 'Công nghệ số', label: 'Công nghệ số' },
];

const companyStatusOptions = [
  { value: 'active', label: 'company_active' },
  { value: 'pending', label: 'company_pending' },
  { value: 'paused', label: 'company_paused' },
];

const reviewStatusOptions = [
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Đã từ chối' },
];

const CompanyForm: React.FC<Props> = ({ disabled = false }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
      <Form.Item label={t(getKey('company_name'))} name="name" rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}>
          <Input disabled={disabled} placeholder="VD: FPT Software" />
      </Form.Item>
      <Form.Item label={t(getKey('company_tax_id'))} name="taxId" rules={[{ required: true, message: 'Vui lòng nhập mã số thuế' }]}>
          <Input disabled={disabled} placeholder="VD: 0101243150" />
      </Form.Item>
      <Form.Item label={t(getKey('company_field'))} name="field" rules={[{ required: true, message: 'Vui lòng chọn lĩnh vực' }]}>
          <Select disabled={disabled} options={companyFieldOptions} />
      </Form.Item>
      <Form.Item label={t(getKey('company_status'))} name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
          <Select
            disabled={disabled}
            options={companyStatusOptions.map((option) => ({
              value: option.value,
              label: t(getKey(option.label)),
            }))}
          />
      </Form.Item>
      <Form.Item label={t(getKey('company_contact'))} name="contact" rules={[{ required: true, message: 'Vui lòng nhập người liên hệ' }]}>
          <Input disabled={disabled} placeholder="VD: Nguyễn Văn Hùng" />
      </Form.Item>
      <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
          <Input disabled={disabled} placeholder="0901234567" />
      </Form.Item>
      <Form.Item label={t(getKey('email'))} name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
          <Input disabled={disabled} placeholder="contact@company.com" />
      </Form.Item>
      <Form.Item label="Số đối tác" name="partners">
          <InputNumber disabled={disabled} className="!w-full" min={0} />
      </Form.Item>
      <Form.Item label="Số sinh viên đang hợp tác" name="students">
          <InputNumber disabled={disabled} className="!w-full" min={0} />
      </Form.Item>
      <Form.Item label="Trạng thái duyệt" name="reviewStatus">
          <Select
            disabled={disabled}
            options={reviewStatusOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
      </Form.Item>
    </div>
  );
};

export default CompanyForm;