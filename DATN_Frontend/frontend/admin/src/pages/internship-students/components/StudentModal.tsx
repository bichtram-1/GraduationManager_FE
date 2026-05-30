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

const StudentModal: React.FC<Props> = ({ open, mode, form, onCancel, onOk }) => {
  const { t } = useTranslation();

  return (
    <Modal
      centered
      open={!!open}
      title={
        mode === 'create'
          ? 'Thêm sinh viên chưa có công ty'
          : mode === 'edit'
            ? 'Chỉnh sửa sinh viên'
            : 'Chi tiết sinh viên'
      }
      onCancel={onCancel}
      okText={mode === 'create' ? 'Thêm mới' : mode === 'edit' ? 'Cập nhật' : undefined}
      cancelText={t(getKey('cancel_btn'))}
      onOk={onOk}
      footer={mode === 'detail' ? null : undefined}
    >
      <Form form={form} layout="vertical" className="pt-2">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Form.Item label="MSSV" name="studentId" rules={[{ required: true, message: 'Vui lòng nhập MSSV' }]}>
            <Input disabled={mode === 'detail'} />
          </Form.Item>
          <Form.Item label="Họ tên" name="studentName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input disabled={mode === 'detail'} />
          </Form.Item>
          <Form.Item label="Lớp" name="className" rules={[{ required: true, message: 'Vui lòng nhập lớp' }]}>
            <Input disabled={mode === 'detail'} />
          </Form.Item>
          <Form.Item label="SĐT" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input disabled={mode === 'detail'} />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select disabled={mode === 'detail'} options={[{ value: 'not_registered', label: 'Chưa đăng ký' }, { value: 'searching', label: 'Đang tìm' }]} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default StudentModal;
