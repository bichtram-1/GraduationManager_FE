import { Form, Input, Select, Upload, Button, Modal, message } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE } from '../../../constants/commonConst';
import {
  FilePdfOutlined,
  FileWordOutlined,
  FileUnknownOutlined,
  EyeOutlined,
  DeleteOutlined,
  UploadOutlined,
  LinkOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import { uploadApi } from '../../../api/uploadApi';

type Props = {
  disabled?: boolean;
};

interface FileFieldProps {
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
}

const FileField: React.FC<FileFieldProps> = ({ value, onChange, disabled }) => {
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const getFileName = (url: string) => {
    if (!url) return '';
    try {
      const decoded = decodeURIComponent(url);
      const parts = decoded.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart.replace(/^\d+_/, '');
    } catch (e) {
      return 'tailieu_detai';
    }
  };

  const getFileIcon = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.endsWith('.pdf')) return <FilePdfOutlined className="text-red-500 text-2xl" />;
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) return <FileWordOutlined className="text-blue-500 text-2xl" />;
    if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif')) {
      return <FileImageOutlined className="text-green-500 text-2xl" />;
    }
    return <FileUnknownOutlined className="text-gray-500 text-2xl" />;
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadApi.uploadSingleAndGetUrl(file);
      if (url) {
        onChange?.(url);
        message.success('Tải lên file thành công!');
      } else {
        message.error('Không lấy được URL của file đã tải lên!');
      }
    } catch (error) {
      console.error(error);
      message.error('Tải lên file thất bại!');
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    const isImage = /\.(png|jpe?g|gif|webp)$/i.test(value);
    const isPdf = /\.pdf$/i.test(value);
    const isDoc = /\.(docx?|xlsx?|pptx?)$/i.test(value);

    let previewSrc = value;
    if (isDoc) {
      previewSrc = `https://docs.google.com/gview?url=${encodeURIComponent(value)}&embedded=true`;
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            {getFileIcon(value)}
            <span className="truncate font-medium text-slate-700" title={getFileName(value)}>
              {getFileName(value)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setPreviewVisible(true)}
              className="!rounded-lg"
            >
              Xem online
            </Button>
            <Button
              type="default"
              size="small"
              icon={<LinkOutlined />}
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="!rounded-lg"
            >
              Mở tab mới
            </Button>
            {!disabled && (
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onChange?.('')}
                className="!rounded-lg hover:!bg-red-50"
              />
            )}
          </div>
        </div>

        <Modal
          title={
            <div className="flex items-center justify-between pr-8">
              <span className="font-semibold text-slate-800">Xem trực tuyến: {getFileName(value)}</span>
              <Button
                type="link"
                icon={<LinkOutlined />}
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                Mở trong tab mới
              </Button>
            </div>
          }
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={null}
          width="80vw"
          centered
          className="preview-modal"
          styles={{ body: { height: '75vh', padding: 0 } }}
        >
          {isImage ? (
            <div className="flex h-full w-full items-center justify-center bg-slate-900/5 p-4">
              <img src={value} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain shadow-md" />
            </div>
          ) : isPdf || isDoc ? (
            <iframe
              src={previewSrc}
              title="File Preview"
              className="h-full w-full border-0"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center text-slate-500">
              <FileUnknownOutlined className="text-4xl text-slate-300" />
              <p className="m-0 text-sm">
                Định dạng này không hỗ trợ xem trực tuyến trực tiếp.<br />
                Vui lòng mở trong tab mới hoặc tải về để xem nội dung.
              </p>
              <Button
                type="primary"
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                icon={<LinkOutlined />}
                className="mt-2"
              >
                Mở trong tab mới
              </Button>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  if (disabled) {
    return <span className="text-slate-400 italic">Không có tài liệu đính kèm</span>;
  }

  return (
    <Upload
      beforeUpload={(file) => {
        handleUpload(file);
        return false;
      }}
      showUploadList={false}
      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
    >
      <Button icon={<UploadOutlined />} loading={uploading} className="!rounded-lg">
        Tải lên tài liệu đề tài (PDF, Word, PNG)
      </Button>
    </Upload>
  );
};

const TopicForm: React.FC<Props> = ({ disabled = false }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
      <Form.Item label={t(getKey('topic_name'))} name="name" rules={[{ required: true, message: t(getKey('please_enter_topic_name')) }]}>
        <Input disabled={disabled} placeholder="VD: Phân tích dữ liệu giáo dục" />
      </Form.Item>

      <Form.Item label={t(getKey('teacher'))} name="teacher" rules={[{ required: true, message: t(getKey('please_enter_teacher')) }]}>
        <Input disabled={disabled} placeholder="VD: TS. Nguyễn Văn X" />
      </Form.Item>

      <Form.Item label={t(getKey('slots'))} name="slots" rules={[{ required: true, message: t(getKey('please_enter_slots')) }]}>
        <Input disabled={disabled} placeholder="VD: 0/3" />
      </Form.Item>

      <Form.Item label={t(getKey('status'))} name="status" rules={[{ required: true, message: t(getKey('please_select_status')) }]}>
        <Select
          disabled={disabled}
          options={[
            { value: STATUS_CODE.PENDING, label: t(getKey('status_pending')) },
            { value: STATUS_CODE.APPROVED, label: t(getKey('status_approved_topic')) },
            { value: STATUS_CODE.REJECTED, label: t(getKey('status_rejected_topic')) },
          ]}
        />
      </Form.Item>

      <Form.Item
        label="Tài liệu đề tài"
        name="fileUrl"
        className="md:col-span-2"
      >
        <FileField disabled={disabled} />
      </Form.Item>

      <Form.Item
        label={t(getKey('reject_reason'))}
        name="rejectReason"
        className="md:col-span-2"
        dependencies={['status']}
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (getFieldValue('status') === STATUS_CODE.REJECTED && (!value || !value.trim())) {
                return Promise.reject(new Error(t(getKey('reject_reason_required'))));
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <Input.TextArea disabled={disabled} rows={3} placeholder={t(getKey('please_enter_reject_reason'))} />
      </Form.Item>
    </div>
  );
};

export default TopicForm;
