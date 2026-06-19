import React from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import type { BatchType } from '../../../type/PeriodType';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE, DATE_DISPLAY_FORMAT } from '../../../constants/commonConst';
import { classHooks } from '../../../hooks/useClasses';

type Props = {
  tab: BatchType;
  disabled?: boolean;
  allowStudentListUpload?: boolean;
};

const PeriodForm: React.FC<Props> = ({ tab, disabled }) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();

  React.useEffect(() => {
    if (form) {
      form.setFieldValue('type', tab);
    }
  }, [form, tab]);

  const { data: classesData, isLoading: isClassesLoading } = classHooks.useFetchListClasses();
  const classesList = React.useMemo(() => {
    if (!classesData) return [];
    if (Array.isArray(classesData)) return classesData;
    if (Array.isArray((classesData as any).rows)) return (classesData as any).rows;
    return [];
  }, [classesData]);

  const classOptions = React.useMemo(() => {
    return classesList.map((c: any) => ({
      value: c.id,
      label: `${c.code} - ${c.name}`,
    }));
  }, [classesList]);

  return (
    <>
      <Form.Item name="type" initialValue={tab} hidden>
        <Input />
      </Form.Item>

      <Form.Item
        name="classIds"
        label={t(getKey('class_label')) || 'Lớp học'}
        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một lớp học!' }]}
      >
        <Select
          mode="multiple"
          allowClear
          loading={isClassesLoading}
          disabled={disabled}
          placeholder="Chọn các lớp học tham gia đợt..."
          optionFilterProp="label"
          options={classOptions}
          className="w-full"
        />
      </Form.Item>


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
