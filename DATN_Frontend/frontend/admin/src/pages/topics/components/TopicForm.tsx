import { Form, Input, Select } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE } from '../../../constants/commonConst';

type Props = {
  disabled?: boolean;
};

const TopicForm: React.FC<Props> = ({ disabled = false }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
      <Form.Item label={t(getKey('topic_name'))} name="name" rules={[{ required: true, message: t(getKey('please_enter_topic_name')) }]}>
        <Input disabled={disabled} placeholder="VD: Phân tích dữ liệu giáo dục" />
      </Form.Item>

      <Form.Item label={t(getKey('teacher'))} name="teacher" rules={[{ required: true, message: t(getKey('please_enter_teacher')) }]}>
        <Input disabled={disabled} placeholder="VD: TS. Nguyễn Văn X" />
      </Form.Item>

      <Form.Item label={t(getKey('slots'))} name="slots" rules={[{ required: true, message: t(getKey('please_enter_slots')) }]}>
        <Input disabled={disabled} placeholder="VD: 0/3" />
      </Form.Item>

      <Form.Item label={t(getKey('status'))} name="status" rules={[{ required: true, message: t(getKey('please_select_status')) }]}>
        <Select
          disabled={disabled}
          options={[
            { value: STATUS_CODE.PENDING, label: t(getKey('status_pending')) },
            { value: STATUS_CODE.APPROVED, label: t(getKey('status_approved_topic')) },
            { value: STATUS_CODE.REJECTED, label: t(getKey('status_rejected_topic')) },
          ]}
        />
      </Form.Item>

      <Form.Item
        label={t(getKey('reject_reason'))}
        name="rejectReason"
        className="md:col-span-2"
        dependencies={['status']}
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (getFieldValue('status') === STATUS_CODE.REJECTED && (!value || !value.trim())) {
                return Promise.reject(new Error(t(getKey('reject_reason_required'))));
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <Input.TextArea disabled={disabled} rows={3} placeholder={t(getKey('please_enter_reject_reason'))} />
      </Form.Item>
    </div>
  );
};

export default TopicForm;
