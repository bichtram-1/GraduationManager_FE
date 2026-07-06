import React from 'react';
import { Modal, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import type { FormInstance } from 'antd';
import AssignmentForm from './AssignmentForm';

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
        <AssignmentForm mode={mode} />
      </Form>
    </Modal>
  );
};

export default AssignmentModal;
