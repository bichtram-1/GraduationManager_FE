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

const AssignmentModal: React.FC<Props> = ({ open, mode, form, onCancel, onOk }) => {
  const { t } = useTranslation();

  return (
    <Modal
      centered
      open={!!open}
      title={mode === 'create' ? 'Thêm phân công' : mode === 'edit' ? 'Chỉnh sửa phân công' : 'Chi tiết phân công'}
      onCancel={onCancel}
      okText={mode === 'create' ? 'Thêm mới' : mode === 'edit' ? 'Cập nhật' : undefined}
      cancelText={t(getKey('cancel_btn'))}
      onOk={onOk}
      footer={mode === 'detail' ? null : undefined}
    >
      <Form form={form} layout="vertical" className="pt-2">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Form.Item label="MSSV" name="studentId" rules={[{ required: true, message: 'Vui lòng nhập MSSV' }]}>
            <Input disabled={mode !== 'create'} />
          </Form.Item>
          <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input disabled={mode === 'detail'} />
          </Form.Item>
          <Form.Item label="Lớp" name="className" rules={[{ required: true, message: 'Vui lòng nhập lớp' }]}>
            <Input disabled={mode === 'detail'} />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select
              disabled={mode === 'detail'}
              options={[
                { value: 'assigned', label: 'Đã phân công' },
                { value: 'unassigned', label: 'Chưa phân công' },
              ]}
            />
          </Form.Item>
        </div>
        <Form.Item label="Đề tài" name="topic">
          <Input disabled={mode === 'detail'} />
        </Form.Item>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Form.Item label="Giảng viên hướng dẫn" name="supervisor">
            <Input disabled={mode === 'detail'} />
          </Form.Item>
          <Form.Item label="Ngày phân công" name="assignedAt">
            <Input disabled={mode === 'detail'} placeholder="DD/MM/YYYY" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default AssignmentModal;
