import React from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Select, Space, Typography, Upload, message } from 'antd';
import type { BatchType } from '../../../type/PeriodType';
import { uploadApi } from '../../../api/uploadApi';

type Props = {
  tab: BatchType;
  disabled?: boolean;
  allowStudentListUpload?: boolean;
};

const PeriodForm: React.FC<Props> = ({ tab, disabled, allowStudentListUpload = false }) => {
  const form = Form.useFormInstance();
  const [studentListFileName, setStudentListFileName] = React.useState('');

  const handleStudentListUpload = async (file: File) => {
    const isValidFile = /\.(csv|xls|xlsx)$/i.test(file.name);
    if (!isValidFile) {
      message.error('Vui lòng chọn file CSV hoặc Excel');
      return false;
    }

    try {
      const uploadedUrl = await uploadApi.uploadSingleAndGetUrl(file, 'users');
      form.setFieldsValue({
        studentListUrl: uploadedUrl,
        studentListFileName: file.name,
      });
      setStudentListFileName(file.name);
      message.success('Đã tải danh sách sinh viên');
    } catch {
      form.setFieldsValue({
        studentListUrl: undefined,
        studentListFileName: undefined,
      });
      setStudentListFileName('');
      message.error('Tải danh sách sinh viên thất bại');
    }

    return false;
  };

  return (
    <>
      <Form.Item name="type" hidden>
        <Input />
      </Form.Item>

      {allowStudentListUpload && !disabled && (
        <Form.Item
          name="studentListUrl"
          label="Tải danh sách sinh viên vào đợt"
          rules={[{ required: true, message: 'Vui lòng tải danh sách sinh viên vào đợt' }]}
        >
          <Space direction="vertical" size={8} className="w-full">
            <Upload beforeUpload={handleStudentListUpload} maxCount={1} showUploadList={false} disabled={disabled}>
              <Button icon={<UploadOutlined />} disabled={disabled}>
                Chọn file CSV / Excel
              </Button>
            </Upload>
            <Typography.Text type="secondary">
              {studentListFileName || 'Chưa có file nào được tải lên'}
            </Typography.Text>
          </Space>
        </Form.Item>
      )}

      <Form.Item name="studentListFileName" hidden>
        <Input />
      </Form.Item>

      {disabled && (form.getFieldValue('studentListUrl') || form.getFieldValue('studentListFileName')) && (
        <div className="mb-4 rounded-md border border-slate-200 bg-slate-50/80 p-4">
          <div className="text-sm font-medium text-gray-700">Danh sách sinh viên đã tải</div>
          <div className="mt-2 flex flex-col gap-2 text-sm text-slate-600">
            <span>
              File:{' '}
              <span className="font-medium text-slate-800">
                {form.getFieldValue('studentListFileName') || 'Chưa có tên file'}
              </span>
            </span>
            {form.getFieldValue('studentListUrl') ? (
              <Button type="link" href={form.getFieldValue('studentListUrl')} target="_blank" rel="noreferrer" className="w-fit p-0">
                Xem / tải file danh sách sinh viên
              </Button>
            ) : null}
          </div>
        </div>
      )}

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
};

export default PeriodForm;
