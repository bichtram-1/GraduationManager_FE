import React from 'react';
import { Modal, Form, Input, InputNumber, Select } from 'antd';
import type { FormInstance } from 'antd';
import type { BatchType } from '../../../type/PeriodType';

type Props = {
  open: boolean;
  modalMode: 'create' | 'edit' | 'detail';
  tab: BatchType;
  form: FormInstance;
  onCancel: () => void;
  onOk: () => void;
};

const PeriodModal: React.FC<Props> = ({ open, modalMode, tab, form, onCancel, onOk }) => (
  <Modal
    centered
    open={!!open}
    title={
      modalMode === 'create'
        ? tab === 'tttn'
          ? 'Tạo đợt TTTN'
          : 'Tạo đợt ĐATN'
        : modalMode === 'edit'
          ? 'Chỉnh sửa đợt'
          : 'Chi tiết đợt'
    }
    onCancel={onCancel}
    destroyOnHidden
    width={820}
    okText={modalMode === 'create' ? 'Tạo đợt' : modalMode === 'edit' ? 'Cập nhật' : undefined}
    cancelText="Hủy"
    okButtonProps={{ className: '!h-10 !rounded-lg !font-medium' }}
    cancelButtonProps={{ className: '!h-10 !rounded-lg !font-medium' }}
    onOk={onOk}
    footer={modalMode === 'detail' ? null : undefined}
  >
    <Form form={form} layout="vertical" className="max-h-[75vh] overflow-y-auto pr-1">
      <Form.Item name="type" hidden>
        <Input />
      </Form.Item>

      <Form.Item label="Tên đợt" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên đợt' }]}>
        <Input disabled={modalMode === 'detail'} placeholder={tab === 'tttn' ? 'VD: TTTN HK1/2026-2027' : 'VD: ĐATN HK1/2026-2027'} />
      </Form.Item>

      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
        <Form.Item label="Bắt đầu" name="startDate" rules={[{ required: true, message: 'Vui lòng nhập ngày bắt đầu' }]}>
          <Input disabled={modalMode === 'detail'} placeholder="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item label="Kết thúc" name="endDate" rules={[{ required: true, message: 'Vui lòng nhập ngày kết thúc' }]}>
          <Input disabled={modalMode === 'detail'} placeholder="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item label="Hạn đăng ký" name="regDeadline" rules={[{ required: true, message: 'Vui lòng nhập hạn đăng ký' }]}>
          <Input disabled={modalMode === 'detail'} placeholder="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
          <Select disabled={modalMode === 'detail'} options={[{ value: 'open', label: 'Đang mở' }, { value: 'published', label: 'Đã công bố' }, { value: 'grading', label: 'Chấm điểm' }, { value: 'closed', label: 'Đã đóng' }]} />
        </Form.Item>
      </div>

      {(form.getFieldValue('type') || tab) === 'tttn' ? (
        <div className="mt-4 space-y-4 rounded-md border border-blue-200 bg-blue-50/40 p-4">
          <div className="text-sm font-medium text-gray-700">Cấu hình riêng cho TTTN</div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <Form.Item label="Số doanh nghiệp" name="numberDN">
              <InputNumber disabled={modalMode === 'detail'} className="!w-full" min={0} />
            </Form.Item>
            <Form.Item label="Số sinh viên" name="numberSV">
              <InputNumber disabled={modalMode === 'detail'} className="!w-full" min={0} />
            </Form.Item>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4 rounded-md border border-green-200 bg-green-50/40 p-4">
          <div className="text-sm font-medium text-gray-700">Cấu hình riêng cho ĐATN</div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <Form.Item label="Số nhóm/đề tài" name="numberTopics">
              <InputNumber disabled={modalMode === 'detail'} className="!w-full" min={0} />
            </Form.Item>
            <Form.Item label="Số hội đồng" name="numberCouncils">
              <InputNumber disabled={modalMode === 'detail'} className="!w-full" min={0} />
            </Form.Item>
          </div>
        </div>
      )}
    </Form>
  </Modal>
);

export default PeriodModal;
