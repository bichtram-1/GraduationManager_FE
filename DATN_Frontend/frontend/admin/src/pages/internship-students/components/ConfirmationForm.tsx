import { Form, Input, Select } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE } from '../../../constants/commonConst';
import CustomDatePicker from '../../../components/shared/input/CustomDatePicker';

type Props = { disabled?: boolean };

const ConfirmationForm: React.FC<Props> = ({ disabled = false }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Form.Item label={t(getKey('student_id'))} name="studentId" rules={[{ required: true, message: t(getKey('please_enter_student_id')) }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label={t(getKey('student_name'))} name="studentName" rules={[{ required: true, message: t(getKey('please_enter_fullname')) }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label={t(getKey('class_name'))} name="className" rules={[{ required: true, message: t(getKey('please_enter_class')) }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label={t(getKey('registration_date'))} name="regDate" rules={[{ required: true, message: t(getKey('please_enter_registration_date')) }]}>
        <CustomDatePicker disabled={disabled} />
      </Form.Item>

      <Form.Item label={t(getKey('company_label'))} name="companyName" rules={[{ required: true, message: t(getKey('please_enter_company_name')) }]} className="md:col-span-2">
        <Input disabled={disabled} />
      </Form.Item>

      <Form.Item label={t(getKey('company_address'))} name="companyAddress" rules={[{ required: true, message: t(getKey('please_enter_company_address')) }]} className="md:col-span-2">
        <Input disabled={disabled} />
      </Form.Item>

      <Form.Item label={t(getKey('internship_location'))} name="internshipLocation" rules={[{ required: true, message: t(getKey('please_enter_internship_location')) }]} className="md:col-span-2">
        <Input disabled={disabled} />
      </Form.Item>

      <Form.Item label={t(getKey('internship_position'))} name="position" className="md:col-span-2">
        <Input disabled={disabled} placeholder="VD: Thực tập sinh Backend Developer" />
      </Form.Item>

      <Form.Item label={t(getKey('company_tax_id'))} name="taxId" rules={[{ required: true, message: t(getKey('please_enter_tax_id')) }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label={t(getKey('mentor_label'))} name="mentor" rules={[{ required: true, message: t(getKey('please_enter_mentor')) }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label={t(getKey('status'))} name="status" rules={[{ required: true, message: t(getKey('please_select_status')) }]}>
        <Select
          disabled={disabled}
          options={[
            { value: STATUS_CODE.PENDING, label: t(getKey('pending_list')) },
            { value: STATUS_CODE.APPROVED, label: t(getKey('approved_list')) },
            { value: STATUS_CODE.REJECTED, label: t(getKey('rejected_list')) },
          ]}
        />
      </Form.Item>
    </div>
  );
};

export default ConfirmationForm;
