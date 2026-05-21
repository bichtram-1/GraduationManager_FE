import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Image, Input, Upload } from 'antd';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { IMAGE_FALLBACK } from '../../../constants/commonConst';
import { uploadApi } from '../../../api/uploadApi';

const { TextArea } = Input;

const ModalCreateUpdateCourse = ({ isEdit = false }: { isEdit?: boolean }) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const thumbnailValue = Form.useWatch('image', form);
  const [localPreview, setLocalPreview] = useState<string>('');

  const handleUploadThumbnail = async (options: UploadRequestOption) => {
    const { file, onSuccess, onError } = options;

    try {
      const imageUrl = await uploadApi.uploadSingleAndGetUrl(file as File, 'contents');
      if (!imageUrl) {
        throw new Error('Upload succeeded but no image URL returned');
      }

      form.setFieldValue('image', imageUrl);
      setLocalPreview(imageUrl);
      onSuccess?.({ imageUrl });
    } catch (error) {
      onError?.(error as Error);
    }
  };

  // thumbnailValue có thể là File (mới chọn) hoặc string URL (edit mode)
  const previewSrc = localPreview || (typeof thumbnailValue === 'string' ? thumbnailValue : '');

  return (
    <>
      <h2 className="text-[18px] font-semibold leading-[18px] tracking-[-0.45px] text-blackSoft mb-1">
        {isEdit ? t(getKey('edit_course_title')) : t(getKey('create_course_title'))}
      </h2>
      <p className="mb-6 text-sm leading-5 text-grayMedium">
        {isEdit ? t(getKey('edit_course_desc')) : t(getKey('create_course_desc'))}
      </p>

      <Form.Item
        label={t(getKey('course_name'))}
        name="name"
        rules={[{ required: true, message: t(getKey('course_name_required')) }]}
      >
        <Input className="!h-10 !rounded-lg !border-graySilver" />
      </Form.Item>

      <Form.Item
        label={t(getKey('course_description'))}
        name="description"
      >
        <TextArea rows={3} className="!rounded-lg !border-graySilver" />
      </Form.Item>

      <Form.Item
        label={t(getKey('course_thumbnail'))}
        name="image"
      >
        <Upload
          accept="image/*"
          showUploadList={false}
          style={{ display: 'block' }}
          customRequest={handleUploadThumbnail}
        >
          <Button
            block
            icon={<UploadOutlined />}
            className="!h-10 !rounded-lg !border-graySilver !font-medium"
          >
            {t(getKey('choose_image'))}
          </Button>
        </Upload>
      </Form.Item>

      {previewSrc && (
        <Image
          src={previewSrc}
          alt="preview"
          className="!rounded-[10px] object-cover"
          width="100%"
          height={128}
          preview={false}
          fallback={IMAGE_FALLBACK}
        />
      )}
    </>
  );
};

export default ModalCreateUpdateCourse;
