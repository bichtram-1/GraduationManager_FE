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

const ConfirmationModal: React.FC<Props> = ({ open, mode, form, onCancel, onOk }) => {
  const { t } = useTranslation();

  return (
    <Modal
      centered
      open={!!open}
      title={
        mode === 'create'
          ? 'Thêm hồ sơ đăng ký'
          : mode === 'edit'
            ? 'Chỉnh sửa hồ sơ đăng ký'
            : 'Chi tiết hồ sơ đăng ký'
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
          <Form.Item label="Ngày đăng ký" name="regDate" rules={[{ required: true, message: 'Vui lòng nhập ngày đăng ký' }]}>
            <Input disabled={mode === 'detail'} placeholder="DD/MM/YYYY" />
          </Form.Item>
        </div>
        <Form.Item label="Công ty" name="companyName" rules={[{ required: true, message: 'Vui lòng nhập công ty' }]}>
          <Input disabled={mode === 'detail'} />
        </Form.Item>
        <Form.Item label="Địa chỉ công ty" name="companyAddress" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ công ty' }]}>
          <Input disabled={mode === 'detail'} />
        </Form.Item>
        <Form.Item label="Địa điểm thực tập" name="internshipLocation" rules={[{ required: true, message: 'Vui lòng nhập địa điểm thực tập' }]}>
          <Input disabled={mode === 'detail'} />
        </Form.Item>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Form.Item label="Mã số thuế" name="taxId" rules={[{ required: true, message: 'Vui lòng nhập mã số thuế' }]}>
            <Input disabled={mode === 'detail'} />
          </Form.Item>
          <Form.Item label="Mentor" name="mentor" rules={[{ required: true, message: 'Vui lòng nhập mentor' }]}>
            <Input disabled={mode === 'detail'} />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select disabled={mode === 'detail'} options={[{ value: 'pending', label: 'Chờ cấp' }, { value: 'approved', label: 'Đã cấp' }, { value: 'rejected', label: 'Bị từ chối' }]} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default ConfirmationModal;
