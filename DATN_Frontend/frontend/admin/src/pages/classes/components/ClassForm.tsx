import React from 'react';
import { Form, Input, Button, Space } from 'antd';
import type { IDetailClass } from '../../../type/ClassType';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';

type Props = {
  disabled?: boolean;
  detail?: IDetailClass | null;
};

const ClassForm: React.FC<Props> = ({ disabled = false, detail }) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();

  React.useEffect(() => {
    if (detail) form.setFieldsValue(detail as any);
    else form.resetFields();
  }, [detail, form]);

  return (
    <>
      <Form.Item name="code" label={t(getKey('class_code'))} rules={[{ required: true, message: t(getKey('please_input_class_code')) }]}> 
        <Input disabled={disabled} />
      </Form.Item>

      <Form.Item name="name" label={t(getKey('class_name_full'))} rules={[{ required: true, message: t(getKey('please_input_class_name')) }]}>
        <Input disabled={disabled} />
      </Form.Item>

      <Form.Item name="level" label={t(getKey('education_level'))}>
        <Input disabled={disabled} />
      </Form.Item>

      <Form.Item name="course" label={t(getKey('course_class_term'))}>
        <Input disabled={disabled} />
      </Form.Item>

      <Form.Item name="major" label={t(getKey('major_branch'))}>
        <Input disabled={disabled} />
      </Form.Item>

      <Form.Item name="supervisor" label={t(getKey('supervisor_teacher'))}>
        <Input disabled={disabled} />
      </Form.Item>

      <Form.List name="members">
        {(fields, { add, remove }) => (
          <div>
            <div className="mb-2 font-medium">{t(getKey('members'))}</div>
            {fields.map((f) => (
              <Space key={f.key} className="flex mb-2" align="start">
                <Form.Item {...f} name={[f.name, 'name']} rules={[{ required: true, message: t(getKey('student_name_required')) }]}>
                  <Input placeholder={t(getKey('student_name'))} disabled={disabled} />
                </Form.Item>
                <Form.Item {...f} name={[f.name, 'code']}>
                  <Input placeholder={t(getKey('student_id'))} disabled={disabled} />
                </Form.Item>
                {!disabled && (
                  <Button danger onClick={() => remove(f.name)}>
                    {t(getKey('delete'))}
                  </Button>
                )}
              </Space>
            ))}

            {!disabled && (
              <Form.Item>
                <Button type="dashed" onClick={() => add({ id: `s${Date.now()}`, name: '', code: '' })} block>
                  {t(getKey('add_student'))}
                </Button>
              </Form.Item>
            )}
          </div>
        )}
      </Form.List>
    </>
  );
};

export default ClassForm;
