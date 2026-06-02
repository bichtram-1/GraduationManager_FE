import React from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import type { BatchType } from '../../../type/PeriodType';

type Props = {
  tab: BatchType;
  disabled?: boolean;
};

const PeriodForm: React.FC<Props> = ({ tab, disabled }) => (
  <>
    <Form.Item name="type" hidden>
      <Input />
    </Form.Item>

    <Form.Item name="name" label="Tên đợt" rules={[{ required: true, message: 'Vui lòng nhập tên đợt' }]}>
      <Input disabled={disabled} placeholder={tab === 'tttn' ? 'VD: TTTN HK1/2026-2027' : 'VD: ĐATN HK1/2026-2027'} />
    </Form.Item>

    <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
      <Form.Item name="startDate" label="Bắt đầu" rules={[{ required: true, message: 'Vui lòng nhập ngày bắt đầu' }]}>
        <Input disabled={disabled} placeholder="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item name="endDate" label="Kết thúc" rules={[{ required: true, message: 'Vui lòng nhập ngày kết thúc' }]}>
        <Input disabled={disabled} placeholder="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item name="regDeadline" label="Hạn đăng ký" rules={[{ required: true, message: 'Vui lòng nhập hạn đăng ký' }]}>
        <Input disabled={disabled} placeholder="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
        <Select disabled={disabled} options={[{ value: 'open', label: 'Đang mở' }, { value: 'published', label: 'Đã công bố' }, { value: 'grading', label: 'Chấm điểm' }, { value: 'closed', label: 'Đã đóng' }]} />
      </Form.Item>
    </div>

    {(tab === 'tttn') ? (
        <div className="mt-4 space-y-4 rounded-md border border-blue-200 bg-blue-50/40 p-4">
          <div className="text-sm font-medium text-gray-700">Cấu hình riêng cho TTTN</div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <Form.Item name="numberDN" label="Số doanh nghiệp">
              <InputNumber disabled={disabled} className="!w-full" min={0} />
            </Form.Item>
            <Form.Item name="numberSV" label="Số sinh viên">
              <InputNumber disabled={disabled} className="!w-full" min={0} />
            </Form.Item>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4 rounded-md border border-green-200 bg-green-50/40 p-4">
          <div className="text-sm font-medium text-gray-700">Cấu hình riêng cho ĐATN</div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <Form.Item name="numberTopics" label="Số nhóm/đề tài">
              <InputNumber disabled={disabled} className="!w-full" min={0} />
            </Form.Item>
            <Form.Item name="numberCouncils" label="Số hội đồng">
              <InputNumber disabled={disabled} className="!w-full" min={0} />
            </Form.Item>
          </div>
        </div>
      )}
  </>
);

export default PeriodForm;
