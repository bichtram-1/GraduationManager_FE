import { Form, Input, Select } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE } from '../../../constants/commonConst';

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
  { value: STATUS_CODE.ACTIVE, label: 'company_active' },
  { value: STATUS_CODE.PENDING, label: 'company_pending' },
  { value: STATUS_CODE.PAUSED, label: 'company_paused' },
];

const reviewStatusOptions = [
  { value: STATUS_CODE.PENDING, label: 'pending_status' },
  { value: STATUS_CODE.APPROVED, label: 'approved_status' },
  { value: STATUS_CODE.REJECTED, label: 'status_rejected' },
];

const CompanyForm: React.FC<Props> = ({ disabled = false }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
      <Form.Item label={t(getKey('company_name'))} name="name" rules={[{ required: true, message: t(getKey('please_enter_company_name')) }]}>
          <Input disabled={disabled} placeholder="VD: FPT Software" />
      </Form.Item>
      <Form.Item label={t(getKey('company_tax_id'))} name="taxId">
          <Input disabled={disabled} placeholder="VD: 0101243150" />
      </Form.Item>
      <Form.Item label={t(getKey('company_field'))} name="field" rules={[{ required: true, message: t(getKey('please_select_field')) }]}>
          <Select disabled={disabled} options={companyFieldOptions} />
      </Form.Item>
      <Form.Item label={t(getKey('company_status'))} name="status" initialValue={STATUS_CODE.PENDING} rules={[{ required: true, message: t(getKey('please_select_status')) }]}>
          <Select
            disabled={disabled}
            options={companyStatusOptions.map((option) => ({
              value: option.value,
              label: t(getKey(option.label as any)),
            }))}
          />
      </Form.Item>
      <Form.Item label={t(getKey('company_contact'))} name="contact">
          <Input disabled={disabled} placeholder="VD: Nguyễn Văn Hùng" />
      </Form.Item>
      <Form.Item label={t(getKey('phone_number'))} name="phone">
          <Input disabled={disabled} placeholder="0901234567" />
      </Form.Item>
      <Form.Item label={t(getKey('email'))} name="email" rules={[{ type: 'email', message: t(getKey('email_invalid')) }]}>
          <Input disabled={disabled} placeholder="contact@company.com" />
      </Form.Item>
      <Form.Item label={t(getKey('review_status'))} name="reviewStatus">
          <Select
            disabled={disabled}
            options={reviewStatusOptions.map((option) => ({
              value: option.value,
              label: t(getKey(option.label as any)),
            }))}
          />
      </Form.Item>
    </div>
  );
};

export default CompanyForm;