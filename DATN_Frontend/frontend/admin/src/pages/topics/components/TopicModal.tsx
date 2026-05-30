import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import type { FormInstance } from 'antd';

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
          ? 'Thêm đề tài'
          : mode === 'edit'
            ? 'Chỉnh sửa đề tài'
            : 'Chi tiết đề tài'
      }
      onCancel={onCancel}
      okText={mode === 'create' ? 'Thêm mới' : mode === 'edit' ? 'Cập nhật' : undefined}
      cancelText={t(getKey('cancel_btn'))}
      onOk={onOk}
      footer={mode === 'detail' ? null : undefined}
    >
      <Form form={form} layout="vertical" className="pt-2">
        <Form.Item label="Tên đề tài" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên đề tài' }]}>
          <Input disabled={mode === 'detail'} placeholder="VD: Phân tích dữ liệu giáo dục" />
        </Form.Item>
        <Form.Item label="Giảng viên đề xuất" name="teacher" rules={[{ required: true, message: 'Vui lòng nhập giảng viên' }]}>
          <Input disabled={mode === 'detail'} placeholder="VD: TS. Nguyễn Văn X" />
        </Form.Item>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Form.Item label="Slot" name="slots" rules={[{ required: true, message: 'Vui lòng nhập slot' }]}>
            <Input disabled={mode === 'detail'} placeholder="VD: 0/3" />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select
              disabled={mode === 'detail'}
              options={[
                { value: 'pending', label: 'Chờ duyệt' },
                { value: 'approved', label: 'Đã duyệt' },
                { value: 'rejected', label: 'Từ chối' },
              ]}
            />
          </Form.Item>
        </div>
        <Form.Item label="Lý do từ chối" name="rejectReason">
          <Input.TextArea disabled={mode === 'detail'} rows={3} placeholder="Nhập lý do từ chối (nếu có)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TopicModal;
