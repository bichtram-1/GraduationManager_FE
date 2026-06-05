import React from 'react';
import { Form, Input, Button, Space } from 'antd';
import type { IDetailClass } from '../../../type/ClassType';

type Props = {
  disabled?: boolean;
  detail?: IDetailClass | null;
};

const ClassForm: React.FC<Props> = ({ disabled = false, detail }) => {
  const form = Form.useFormInstance();

  React.useEffect(() => {
    if (detail) form.setFieldsValue(detail as any);
    else form.resetFields();
  }, [detail, form]);

  return (
    <>
      <Form.Item name="code" label="Mã lớp" rules={[{ required: true, message: 'Vui lòng nhập mã lớp' }]}> 
        <Input disabled={disabled} />
      </Form.Item>

      <Form.Item name="name" label="Tên lớp" rules={[{ required: true, message: 'Vui lòng nhập tên lớp' }]}>
        <Input disabled={disabled} />
      </Form.Item>

      <Form.Item name="year" label="Niên khóa">
        <Input disabled={disabled} />
      </Form.Item>

      <Form.Item name="supervisor" label="Giảng viên chủ nhiệm">
        <Input disabled={disabled} />
      </Form.Item>

      <Form.List name="members">
        {(fields, { add, remove }) => (
          <div>
            <div className="mb-2 font-medium">Thành viên</div>
            {fields.map((f) => (
              <Space key={f.key} style={{ display: 'flex', marginBottom: 8 }} align="start">
                <Form.Item {...f} name={[f.name, 'name']} rules={[{ required: true, message: 'Tên bắt buộc' }]}>
                  <Input placeholder="Họ tên" disabled={disabled} />
                </Form.Item>
                <Form.Item {...f} name={[f.name, 'code']}>
                  <Input placeholder="MSSV" disabled={disabled} />
                </Form.Item>
                {!disabled && (
                  <Button danger onClick={() => remove(f.name)}>
                    Xóa
                  </Button>
                )}
              </Space>
            ))}

            {!disabled && (
              <Form.Item>
                <Button type="dashed" onClick={() => add({ id: `s${Date.now()}`, name: '', code: '' })} block>
                  Thêm sinh viên
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
