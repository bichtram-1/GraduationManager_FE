import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import type { FormInstance } from 'antd';
import { STATUS_CODE } from '../../../constants/commonConst';

type Props = {
  open: boolean;
  mode: 'create' | 'edit' | 'detail';
  form: FormInstance;
  onCancel: () => void;
  onOk: () => void;
};

const TopicModal: React.FC<Props> = ({ open, mode, form, onCancel, onOk }) => {
  const { t } = useTranslation();

  return (
    <Modal
      centered
      open={open}
      title={
        mode === 'create'
          ? t(getKey('add_topic_title'))
          : mode === 'edit'
            ? t(getKey('edit_topic'))
            : t(getKey('detail_topic'))
      }
      onCancel={onCancel}
      okText={mode === 'create' ? t(getKey('add_new_btn')) : mode === 'edit' ? t(getKey('update_btn')) : undefined}
      cancelText={t(getKey('cancel_btn'))}
      onOk={onOk}
      footer={mode === 'detail' ? null : undefined}
    >
      <Form form={form} layout="vertical" className="pt-2">
        <Form.Item label={t(getKey('topic_name'))} name="name" rules={[{ required: true, message: t(getKey('please_enter_topic_name')) }]}>
          <Input disabled={mode === 'detail'} placeholder="VD: Phân tích dữ liệu giáo dục" />
        </Form.Item>
        <Form.Item label={t(getKey('proposing_teacher_label'))} name="teacher" rules={[{ required: true, message: t(getKey('please_enter_teacher')) }]}>
          <Input disabled={mode === 'detail'} placeholder="VD: TS. Nguyễn Văn X" />
        </Form.Item>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Form.Item label={t(getKey('slots'))} name="slots" rules={[{ required: true, message: t(getKey('please_enter_slots')) }]}>
            <Input disabled={mode === 'detail'} placeholder="VD: 0/3" />
          </Form.Item>
          <Form.Item label={t(getKey('status'))} name="status" rules={[{ required: true, message: t(getKey('please_select_status')) }]}>
            <Select
              disabled={mode === 'detail'}
              options={[
                { value: STATUS_CODE.PENDING, label: t(getKey('status_pending')) },
                { value: STATUS_CODE.APPROVED, label: t(getKey('status_approved_topic')) },
                { value: STATUS_CODE.REJECTED, label: t(getKey('status_rejected_topic')) },
              ]}
            />
          </Form.Item>
        </div>
        <Form.Item label={t(getKey('reject_reason'))} name="rejectReason">
          <Input.TextArea disabled={mode === 'detail'} rows={3} placeholder={t(getKey('please_enter_reject_reason'))} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TopicModal;
