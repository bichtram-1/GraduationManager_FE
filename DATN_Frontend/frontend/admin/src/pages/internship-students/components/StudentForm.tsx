import { Form, Input, Select } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE } from '../../../constants/commonConst';

type Props = { disabled?: boolean };

const StudentForm: React.FC<Props> = ({ disabled = false }) => {
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
      <Form.Item label={t(getKey('phone_number'))} name="phone" rules={[{ required: true, message: t(getKey('please_enter_phone')) }]}>
        <Input disabled={disabled} />
      </Form.Item>
      <Form.Item label={t(getKey('status'))} name="status" rules={[{ required: true, message: t(getKey('please_select_status')) }]}>
        <Select
          disabled={disabled}
          options={[
            { value: STATUS_CODE.NOT_REGISTERED, label: t(getKey('not_registered_list')) },
            { value: STATUS_CODE.HAS_COMPANY, label: t(getKey('has_company_list')) },
          ]}
        />
      </Form.Item>
      <Form.Item label="Tên công ty" name="companyName">
        <Input disabled={true} />
      </Form.Item>
      <Form.Item label="Vị trí thực tập" name="internshipLocation">
        <Input disabled={true} />
      </Form.Item>
    </div>
  );
};

export default StudentForm;
