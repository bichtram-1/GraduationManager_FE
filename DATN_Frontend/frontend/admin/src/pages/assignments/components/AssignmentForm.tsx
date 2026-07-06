import React from 'react';
import { Form, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE } from '../../../constants/commonConst';
import CustomDatePicker from '../../../components/shared/input/CustomDatePicker';

type Props = {
  mode?: 'create' | 'edit' | 'detail';
};

const AssignmentForm: React.FC<Props> = ({ mode = 'edit' }) => {
  const { t } = useTranslation();
  const disabled = mode === 'detail';
  const studentIdDisabled = mode !== 'create';
  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Form.Item label={t(getKey('student_id'))} name="studentId" rules={[{ required: true, message: t(getKey('please_enter_student_id')) }]}>
          <Input disabled={studentIdDisabled} />
        </Form.Item>
        <Form.Item label={t(getKey('student_name'))} name="name" rules={[{ required: true, message: t(getKey('please_enter_fullname')) }]}>
          <Input disabled={disabled} />
        </Form.Item>
        <Form.Item label={t(getKey('class_name'))} name="className" rules={[{ required: true, message: t(getKey('please_enter_class')) }]}>
          <Input disabled={disabled} />
        </Form.Item>
        <Form.Item label={t(getKey('group_status'))} name="status" rules={[{ required: true, message: t(getKey('please_select_status')) }]}>
          <Select disabled={disabled} options={[
            { value: STATUS_CODE.ASSIGNED, label: t(getKey('status_assigned')) },
            { value: STATUS_CODE.UNASSIGNED, label: t(getKey('status_unassigned')) }
          ]} />
        </Form.Item>
      </div>

      <Form.Item label={t(getKey('topic_name'))} name="topic">
        <Input disabled={disabled} />
      </Form.Item>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Form.Item label={t(getKey('mentor'))} name="supervisor">
          <Input disabled={disabled} />
        </Form.Item>
        <Form.Item label={t(getKey('assigned_date_label'))} name="assignedAt">
          <CustomDatePicker disabled={disabled} />
        </Form.Item>
      </div>
    </>
  );
};

export default AssignmentForm;
