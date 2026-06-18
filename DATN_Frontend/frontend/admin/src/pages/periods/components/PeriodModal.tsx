import React from 'react';
import { Modal, Form, Input, InputNumber, Select } from 'antd';
import type { FormInstance } from 'antd';
import type { BatchType } from '../../../type/PeriodType';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE, DATE_DISPLAY_FORMAT } from '../../../constants/commonConst';

type Props = {
  open: boolean;
  modalMode: 'create' | 'edit' | 'detail';
  tab: BatchType;
  form: FormInstance;
  onCancel: () => void;
  onOk: () => void;
};

const PeriodModal: React.FC<Props> = ({ open, modalMode, tab, form, onCancel, onOk }) => {
  const { t } = useTranslation();

  return (
    <Modal
      centered
      open={!!open}
      title={
        modalMode === 'create'
          ? tab === 'tttn'
            ? t(getKey('create_tttn_period'))
            : t(getKey('create_datn_period'))
          : modalMode === 'edit'
            ? t(getKey('edit_period'))
            : t(getKey('detail_period'))
      }
      onCancel={onCancel}
      destroyOnHidden
      width={820}
      okText={
        modalMode === 'create'
          ? t(getKey('create_period_btn'))
          : modalMode === 'edit'
            ? t(getKey('update_btn'))
            : undefined
      }
      cancelText={t(getKey('cancel_btn'))}
      okButtonProps={{ className: '!h-10 !rounded-lg !font-medium' }}
      cancelButtonProps={{ className: '!h-10 !rounded-lg !font-medium' }}
      onOk={onOk}
      footer={modalMode === 'detail' ? null : undefined}
    >
      <Form form={form} layout="vertical" className="max-h-[75vh] overflow-y-auto pr-1">
        <Form.Item name="type" hidden>
          <Input />
        </Form.Item>

        <Form.Item label={t(getKey('period_name_label'))} name="name" rules={[{ required: true, message: t(getKey('period_name_required')) }]}>
          <Input disabled={modalMode === 'detail'} placeholder={tab === 'tttn' ? 'VD: TTTN HK1/2026-2027' : 'VD: ĐATN HK1/2026-2027'} />
        </Form.Item>

        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
          <Form.Item label={t(getKey('start_date'))} name="startDate" rules={[{ required: true, message: t(getKey('start_date_required')) }]}>
            <Input disabled={modalMode === 'detail'} placeholder={DATE_DISPLAY_FORMAT} />
          </Form.Item>
          <Form.Item label={t(getKey('end_date'))} name="endDate" rules={[{ required: true, message: t(getKey('end_date_required')) }]}>
            <Input disabled={modalMode === 'detail'} placeholder={DATE_DISPLAY_FORMAT} />
          </Form.Item>
          <Form.Item label={t(getKey('reg_deadline_label'))} name="regDeadline" rules={[{ required: true, message: t(getKey('reg_deadline_required')) }]}>
            <Input disabled={modalMode === 'detail'} placeholder={DATE_DISPLAY_FORMAT} />
          </Form.Item>
          <Form.Item label={t(getKey('status'))} name="status" rules={[{ required: true, message: t(getKey('please_select_status')) }]}>
            <Select disabled={modalMode === 'detail'} options={[
              { value: STATUS_CODE.OPEN, label: t(getKey('period_status_open')) },
              { value: STATUS_CODE.PUBLISHED, label: t(getKey('period_status_published')) },
              { value: STATUS_CODE.GRADING, label: t(getKey('period_status_grading')) },
              { value: STATUS_CODE.CLOSED, label: t(getKey('period_status_closed')) }
            ]} />
          </Form.Item>
        </div>

        {(form.getFieldValue('type') || tab) === 'tttn' ? (
          <div className="mt-4 space-y-4 rounded-md border border-blue-200 bg-blue-50/40 p-4">
            <div className="text-sm font-medium text-gray-700">{t(getKey('tttn_config_title'))}</div>
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
              <Form.Item label={t(getKey('companies_number_label'))} name="numberDN">
                <InputNumber disabled={modalMode === 'detail'} className="!w-full" min={0} />
              </Form.Item>
              <Form.Item label={t(getKey('students_number_label'))} name="numberSV">
                <InputNumber disabled={modalMode === 'detail'} className="!w-full" min={0} />
              </Form.Item>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4 rounded-md border border-green-200 bg-green-50/40 p-4">
            <div className="text-sm font-medium text-gray-700">{t(getKey('datn_config_title'))}</div>
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
              <Form.Item label={t(getKey('topics_number_label'))} name="numberTopics">
                <InputNumber disabled={modalMode === 'detail'} className="!w-full" min={0} />
              </Form.Item>
              <Form.Item label={t(getKey('councils_number_label'))} name="numberCouncils">
                <InputNumber disabled={modalMode === 'detail'} className="!w-full" min={0} />
              </Form.Item>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default PeriodModal;
