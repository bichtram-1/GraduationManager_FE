import React from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Select, Space, Typography, Upload, message } from 'antd';
import type { BatchType } from '../../../type/PeriodType';
import { uploadApi } from '../../../api/uploadApi';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE, DATE_DISPLAY_FORMAT } from '../../../constants/commonConst';

type Props = {
  tab: BatchType;
  disabled?: boolean;
  allowStudentListUpload?: boolean;
};

const PeriodForm: React.FC<Props> = ({ tab, disabled, allowStudentListUpload = false }) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const [studentListFileName, setStudentListFileName] = React.useState('');

  const handleStudentListUpload = async (file: File) => {
    const isValidFile = /\.(csv|xls|xlsx)$/i.test(file.name);
    if (!isValidFile) {
      message.error(t(getKey('select_csv_excel_error')));
      return false;
    }

    try {
      const uploadedUrl = await uploadApi.uploadSingleAndGetUrl(file, 'users');
      form.setFieldsValue({
        studentListUrl: uploadedUrl,
        studentListFileName: file.name,
      });
      setStudentListFileName(file.name);
      message.success(t(getKey('upload_student_list_success')));
    } catch {
      form.setFieldsValue({
        studentListUrl: undefined,
        studentListFileName: undefined,
      });
      setStudentListFileName('');
      message.error(t(getKey('upload_student_list_error')));
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
          label={t(getKey('upload_student_list_label'))}
          rules={[{ required: true, message: t(getKey('upload_student_list_required')) }]}
        >
          <Space direction="vertical" size={8} className="w-full">
            <Upload beforeUpload={handleStudentListUpload} maxCount={1} showUploadList={false} disabled={disabled}>
              <Button icon={<UploadOutlined />} disabled={disabled}>
                {t(getKey('select_csv_excel_file'))}
              </Button>
            </Upload>
            <Typography.Text type="secondary">
              {studentListFileName || t(getKey('no_file_uploaded'))}
            </Typography.Text>
          </Space>
        </Form.Item>
      )}

      <Form.Item name="studentListFileName" hidden>
        <Input />
      </Form.Item>

      {disabled && (form.getFieldValue('studentListUrl') || form.getFieldValue('studentListFileName')) && (
        <div className="mb-4 rounded-md border border-slate-200 bg-slate-50/80 p-4">
          <div className="text-sm font-medium text-gray-700">{t(getKey('uploaded_student_list'))}</div>
          <div className="mt-2 flex flex-col gap-2 text-sm text-slate-600">
            <span>
              {t(getKey('file_label'))}:{' '}
              <span className="font-medium text-slate-800">
                {form.getFieldValue('studentListFileName') || t(getKey('no_file_name'))}
              </span>
            </span>
            {form.getFieldValue('studentListUrl') ? (
              <Button type="link" href={form.getFieldValue('studentListUrl')} target="_blank" rel="noreferrer" className="w-fit p-0">
                {t(getKey('view_download_student_list'))}
              </Button>
            ) : null}
          </div>
        </div>
      )}

      <Form.Item name="name" label={t(getKey('period_name_label'))} rules={[{ required: true, message: t(getKey('period_name_required')) }]}>
        <Input disabled={disabled} placeholder={tab === 'tttn' ? 'VD: TTTN HK1/2026-2027' : 'VD: ĐATN HK1/2026-2027'} />
      </Form.Item>

      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
        <Form.Item name="startDate" label={t(getKey('start_date'))} rules={[{ required: true, message: t(getKey('start_date_required')) }]}>
          <Input disabled={disabled} placeholder={DATE_DISPLAY_FORMAT} />
        </Form.Item>
        <Form.Item name="endDate" label={t(getKey('end_date'))} rules={[{ required: true, message: t(getKey('end_date_required')) }]}>
          <Input disabled={disabled} placeholder={DATE_DISPLAY_FORMAT} />
        </Form.Item>
        <Form.Item name="regDeadline" label={t(getKey('reg_deadline_label'))} rules={[{ required: true, message: t(getKey('reg_deadline_required')) }]}>
          <Input disabled={disabled} placeholder={DATE_DISPLAY_FORMAT} />
        </Form.Item>
        <Form.Item name="status" label={t(getKey('status'))} rules={[{ required: true, message: t(getKey('please_select_status')) }]}>
          <Select disabled={disabled} options={[
            { value: STATUS_CODE.OPEN, label: t(getKey('period_status_open')) },
            { value: STATUS_CODE.PUBLISHED, label: t(getKey('period_status_published')) },
            { value: STATUS_CODE.GRADING, label: t(getKey('period_status_grading')) },
            { value: STATUS_CODE.CLOSED, label: t(getKey('period_status_closed')) }
          ]} />
        </Form.Item>
      </div>

      {(tab === 'tttn') ? (
        <div className="mt-4 space-y-4 rounded-md border border-blue-200 bg-blue-50/40 p-4">
          <div className="text-sm font-medium text-gray-700">{t(getKey('tttn_config_title'))}</div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <Form.Item name="numberDN" label={t(getKey('companies_number_label'))}>
              <InputNumber disabled={disabled} className="!w-full" min={0} />
            </Form.Item>
            <Form.Item name="numberSV" label={t(getKey('students_number_label'))}>
              <InputNumber disabled={disabled} className="!w-full" min={0} />
            </Form.Item>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4 rounded-md border border-green-200 bg-green-50/40 p-4">
          <div className="text-sm font-medium text-gray-700">{t(getKey('datn_config_title'))}</div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <Form.Item name="numberTopics" label={t(getKey('topics_number_label'))}>
              <InputNumber disabled={disabled} className="!w-full" min={0} />
            </Form.Item>
            <Form.Item name="numberCouncils" label={t(getKey('councils_number_label'))}>
              <InputNumber disabled={disabled} className="!w-full" min={0} />
            </Form.Item>
          </div>
        </div>
      )}
    </>
  );
};

export default PeriodForm;
