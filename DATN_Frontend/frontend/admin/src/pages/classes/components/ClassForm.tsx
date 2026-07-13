import React from 'react';
import { Form, Input, Button, Space, Upload, Typography, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { IDetailClass } from '../../../type/ClassType';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { uploadApi } from '../../../api/uploadApi';
import * as XLSX from 'xlsx';

type Props = {
  disabled?: boolean;
  detail?: IDetailClass | null;
};

const ClassForm: React.FC<Props> = ({ disabled = false, detail }) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const [studentListFileName, setStudentListFileName] = React.useState('');

  React.useEffect(() => {
    if (detail) {
      form.setFieldsValue(detail as unknown as Record<string, unknown>);
      setStudentListFileName(detail.studentListFileName || '');
    } else {
      form.resetFields();
      setStudentListFileName('');
    }
  }, [detail, form]);

  const parseExcelFile = (file: File): Promise<Array<{ id: string; name: string; code: string }>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

          if (rows.length <= 1) {
            resolve([]);
            return;
          }

          // Tìm dòng tiêu đề
          let headerRowIndex = 0;
          let mssvCol = 0;
          let nameCol = 1;

          for (let i = 0; i < Math.min(3, rows.length); i++) {
            const row = rows[i];
            if (!row) continue;
            for (let colIndex = 0; colIndex < row.length; colIndex++) {
              const cellValue = row[colIndex];
              if (cellValue === undefined || cellValue === null) continue;
              const cellClean = String(cellValue).toLowerCase().trim();
              if (
                cellClean.includes('mssv') ||
                cellClean.includes('mã số') ||
                cellClean.includes('sinh viên id') ||
                cellClean.includes('code') ||
                cellClean.includes('ms')
              ) {
                mssvCol = colIndex;
                headerRowIndex = i;
              }
              if (
                cellClean.includes('họ tên') ||
                cellClean.includes('tên') ||
                cellClean.includes('name') ||
                cellClean.includes('fullname')
              ) {
                nameCol = colIndex;
                headerRowIndex = i;
              }
            }
          }

          const parsedMembers: Array<{ id: string; name: string; code: string }> = [];
          for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            if (!row) continue;
            const code = row[mssvCol] ? String(row[mssvCol]).trim() : '';
            const name = row[nameCol] ? String(row[nameCol]).trim() : '';

            if (code && name) {
              parsedMembers.push({
                id: `s_${Date.now()}_${rowIndex}`,
                name,
                code,
              });
            }
          }

          resolve(parsedMembers);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleStudentListUpload = async (file: File) => {
    const isValidFile = /\.(csv|xls|xlsx)$/i.test(file.name);
    if (!isValidFile) {
      message.error(t(getKey('select_csv_excel_error')) || 'Vui lòng chọn file Excel hoặc CSV!');
      return false;
    }

    try {
      const uploadedUrl = await uploadApi.uploadSingleAndGetUrl(file, 'users');
      const parsedMembers = await parseExcelFile(file);

      form.setFieldsValue({
        studentListUrl: uploadedUrl,
        studentListFileName: file.name,
        members: parsedMembers,
      });
      setStudentListFileName(file.name);
      message.success(t(getKey('upload_student_list_success')) || 'Tải danh sách sinh viên thành công!');
    } catch {
      form.setFieldsValue({
        studentListUrl: undefined,
        studentListFileName: undefined,
      });
      setStudentListFileName('');
      message.error(t(getKey('upload_student_list_error')) || 'Lỗi khi tải file!');
    }

    return false;
  };

  return (
    <>
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

      {!disabled && !detail && (
        <Form.Item
          name="studentListUrl"
          label="Tải file danh sách sinh viên vào lớp"
          rules={[{ required: false }]}
        >
          <Space direction="vertical" size={8} className="w-full">
            <Upload beforeUpload={handleStudentListUpload} maxCount={1} showUploadList={false}>
              <Button icon={<UploadOutlined />}>
                {t(getKey('select_csv_excel_file')) || 'Chọn file Excel/CSV'}
              </Button>
            </Upload>
            <Typography.Text type="secondary">
              {studentListFileName || t(getKey('no_file_uploaded')) || 'Chưa tải file nào'}
            </Typography.Text>
          </Space>
        </Form.Item>
      )}

      <Form.Item name="studentListFileName" hidden>
        <Input />
      </Form.Item>

      {disabled && (form.getFieldValue('studentListUrl') || form.getFieldValue('studentListFileName')) && (
        <div className="mb-4 rounded-md border border-slate-200 bg-slate-50/80 p-4">
          <div className="text-sm font-medium text-gray-700">File danh sách sinh viên đã tải lên</div>
          <div className="mt-2 flex flex-col gap-2 text-sm text-slate-600">
            <span>
              Tên file:{' '}
              <span className="font-medium text-slate-800">
                {form.getFieldValue('studentListFileName')}
              </span>
            </span>
            {form.getFieldValue('studentListUrl') ? (
              <Button type="link" href={form.getFieldValue('studentListUrl')} target="_blank" rel="noreferrer" className="w-fit p-0">
                Tải xuống danh sách
              </Button>
            ) : null}
          </div>
        </div>
      )}

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
