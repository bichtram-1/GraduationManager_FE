import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import type { FormInstance } from 'antd';
import { STATUS_CODE, DATE_DISPLAY_FORMAT } from '../../../constants/commonConst';

type Props = {
  open: boolean;
  mode: 'create' | 'edit' | 'detail';
  form: FormInstance;
  onCancel: () => void;
  onOk: () => void;
};

const AssignmentModal: React.FC<Props> = ({ open, mode, form, onCancel, onOk }) => {
  const { t } = useTranslation();

  return (
    <Modal
      centered
      open={!!open}
      title={
        mode === 'create'
          ? t(getKey('add_assignment_title'))
          : mode === 'edit'
          ? t(getKey('edit_assignment_title'))
          : t(getKey('detail_assignment_title'))
      }
      onCancel={onCancel}
      okText={
        mode === 'create'
          ? t(getKey('add_new_btn'))
          : mode === 'edit'
          ? t(getKey('update_btn'))
          : undefined
      }
      cancelText={t(getKey('cancel_btn'))}
      onOk={onOk}
      footer={mode === 'detail' ? null : undefined}
    >
      <Form form={form} layout="vertical" className="pt-2">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Form.Item label={t(getKey('student_id'))} name="studentId" rules={[{ required: true, message: t(getKey('please_enter_student_id')) }]}>
            <Input disabled={mode !== 'create'} />
          </Form.Item>
          <Form.Item label={t(getKey('student_name'))} name="name" rules={[{ required: true, message: t(getKey('please_enter_fullname')) }]}>
            <Input disabled={mode === 'detail'} />
          </Form.Item>
          <Form.Item label={t(getKey('class_name'))} name="className" rules={[{ required: true, message: t(getKey('please_enter_class')) }]}>
            <Input disabled={mode === 'detail'} />
          </Form.Item>
          <Form.Item label={t(getKey('group_status'))} name="status" rules={[{ required: true, message: t(getKey('please_select_status')) }]}>
            <Select
              disabled={mode === 'detail'}
              options={[
                { value: STATUS_CODE.ASSIGNED, label: t(getKey('status_assigned')) },
                { value: STATUS_CODE.UNASSIGNED, label: t(getKey('status_unassigned')) },
              ]}
            />
          </Form.Item>
        </div>
        <Form.Item label={t(getKey('topic_name'))} name="topic">
          <Input disabled={mode === 'detail'} />
        </Form.Item>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Form.Item label={t(getKey('mentor'))} name="supervisor">
            <Input disabled={mode === 'detail'} />
          </Form.Item>
          <Form.Item label={t(getKey('assigned_date_label'))} name="assignedAt">
            <Input disabled={mode === 'detail'} placeholder={DATE_DISPLAY_FORMAT} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default AssignmentModal;
