import React from 'react';
import { Form, Input, Button, Space, Upload, Typography, message, AutoComplete } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { IDetailClass } from '../../../type/ClassType';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { uploadApi } from '../../../api/uploadApi';
import * as XLSX from 'xlsx';
import { classHooks } from '../../../hooks/useClasses';

type Props = {
  disabled?: boolean;
  detail?: IDetailClass | null;
};

const ClassForm: React.FC<Props> = ({ disabled = false, detail }) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const [studentListFileName, setStudentListFileName] = React.useState('');

  const { data: metadata } = classHooks.useFetchClassMetadata();

  const classNameOptions = React.useMemo(() => {
    return (metadata?.names || []).map((name) => ({ value: name }));
  }, [metadata]);

  const levelOptions = React.useMemo(() => {
    return (metadata?.levels || []).map((level) => ({ value: level }));
  }, [metadata]);

  const courseOptions = React.useMemo(() => {
    return (metadata?.courses || []).map((course) => ({ value: course }));
  }, [metadata]);

  const majorOptions = React.useMemo(() => {
    return (metadata?.majors || []).map((major) => ({ value: major }));
  }, [metadata]);

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
          let emailCol = -1;

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
              if (cellClean.includes('email')) {
                emailCol = colIndex;
              }
            }
          }

          const parsedMembers: Array<{ id: string; name: string; code: string }> = [];
          const seenCodes = new Set<string>();
          const duplicates: string[] = [];

          for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            if (!row) continue;
            const code = row[mssvCol] ? String(row[mssvCol]).trim() : '';
            const name = row[nameCol] ? String(row[nameCol]).trim() : '';
            const email = emailCol >= 0 && row[emailCol] ? String(row[emailCol]).trim() : '';

            if (code && name) {
              if (!/^0[0-9]{9}$/.test(code)) {
                reject(new Error(`File Excel - Dòng ${rowIndex + 1}: MSSV '${code}' không hợp lệ (phải gồm 10 chữ số bắt đầu bằng số 0).`));
                return;
              }

              if (email) {
                const expectedEmail = `${code.toLowerCase()}@caothang.edu.vn`;
                if (email.toLowerCase() !== expectedEmail) {
                  reject(new Error(`File Excel - Dòng ${rowIndex + 1}: Email '${email}' không khớp với MSSV '${code}' (phải là '${expectedEmail}').`));
                  return;
                }
              }

              if (seenCodes.has(code)) {
                duplicates.push(code);
              }
              seenCodes.add(code);
              parsedMembers.push({
                id: `s_${Date.now()}_${rowIndex}`,
                name,
                code,
              });
            }
          }

          if (duplicates.length > 0) {
            reject(new Error(`File Excel có các MSSV bị trùng lặp: ${duplicates.join(', ')}`));
            return;
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
      const parsedMembers = await parseExcelFile(file);
      const uploadedUrl = await uploadApi.uploadSingleAndGetUrl(file, 'users');

      form.setFieldsValue({
        studentListUrl: uploadedUrl,
        studentListFileName: file.name,
        members: parsedMembers,
      });
      setStudentListFileName(file.name);
      message.success(t(getKey('upload_student_list_success')) || 'Tải danh sách sinh viên thành công!');
    } catch (err) {
      form.setFieldsValue({
        studentListUrl: undefined,
        studentListFileName: undefined,
        members: [],
      });
      setStudentListFileName('');
      message.error((err as Error)?.message || t(getKey('upload_student_list_error')) || 'Lỗi khi tải file!');
    }

    return false;
  };

  return (
    <>
      <Form.Item
        name="name"
        label={t(getKey('class_name_full'))}
        validateTrigger="onBlur"
        rules={[
          { required: true, message: t(getKey('please_input_class_name')) },
          { max: 255, message: 'Tên lớp không được vượt quá 255 ký tự.' },
          { pattern: /^(CĐ|CĐN|CDN|cđ|cđn|cdn)\s+(TH\s+)?\d{2}[a-zA-ZĐđ0-9]+$/, message: 'Tên lớp phải đúng định dạng (Ví dụ: CĐ TH 23DĐD, CĐ TH 21DĐ).' },
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const existingNames = metadata?.names || [];
              const cleanValue = value.trim();
              if (detail && detail.name && detail.name.trim() === cleanValue) {
                return Promise.resolve();
              }
              if (existingNames.includes(cleanValue)) {
                return Promise.reject('Tên lớp này đã tồn tại trong hệ thống!');
              }
              return Promise.resolve();
            }
          }
        ]}
      >
        <AutoComplete
          options={classNameOptions}
          disabled={disabled}
          placeholder="Chọn hoặc nhập tên lớp..."
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
        />
      </Form.Item>

      <Form.Item
        name="level"
        label={t(getKey('education_level'))}
        validateTrigger="onBlur"
        rules={[
          { required: true, message: 'Vui lòng chọn hoặc nhập bậc đào tạo!' },
          { max: 255, message: 'Bậc đào tạo không được vượt quá 255 ký tự.' },
          { validator: (_, value) => !value || ['Cao đẳng', 'Cao đẳng nghề'].includes(value) ? Promise.resolve() : Promise.reject('Bậc đào tạo phải là "Cao đẳng" hoặc "Cao đẳng nghề"!') }
        ]}
      >
        <AutoComplete
          options={levelOptions}
          disabled={disabled}
          placeholder="Chọn hoặc nhập bậc đào tạo..."
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
        />
      </Form.Item>

      <Form.Item
        name="course"
        label={t(getKey('course_class_term'))}
        validateTrigger="onBlur"
        dependencies={['name']}
        rules={[
          { required: true, message: 'Vui lòng chọn hoặc nhập khóa học!' },
          { max: 255, message: 'Khóa học không được vượt quá 255 ký tự.' },
          { pattern: /^[1-9]\d{3}$/, message: 'Khóa học phải là năm học hợp lệ gồm 4 chữ số (Ví dụ: 2023)!' },
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const name = form.getFieldValue('name');
              if (name) {
                const match = name.match(/(?:CĐ|CĐN|CDN|cđ|cđn|cdn)\s+(?:TH\s+)?(\d{2})/i);
                if (match) {
                  const classYearSuffix = match[1];
                  const courseYearSuffix = value.slice(-2);
                  if (classYearSuffix !== courseYearSuffix) {
                    return Promise.reject(`Năm học trong tên lớp (${classYearSuffix}) không khớp với năm học của khóa học (${value})!`);
                  }
                }
              }
              return Promise.resolve();
            }
          }
        ]}
      >
        <AutoComplete
          options={courseOptions}
          disabled={disabled}
          placeholder="Chọn hoặc nhập khóa học..."
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
        />
      </Form.Item>

      <Form.Item
        name="major"
        label={t(getKey('major_branch'))}
        validateTrigger="onBlur"
        dependencies={['name']}
        rules={[
          { required: true, message: 'Vui lòng chọn hoặc nhập chuyên ngành!' },
          { max: 255, message: 'Chuyên ngành không được vượt quá 255 ký tự.' },
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const allowed = [
                'Lập trình di động', 'Lập trình Web', 'Mạng máy tính', 'Công nghệ phần mềm',
                'lập trình di động', 'lập trình web', 'mạng máy tính', 'công nghệ phần mềm'
              ];
              if (!allowed.includes(value)) {
                return Promise.reject('Chuyên ngành không hợp lệ!');
              }
              const name = form.getFieldValue('name');
              if (name) {
                const nameUpper = name.toUpperCase();
                const majorClean = value.toLowerCase().trim();
                if (nameUpper.includes('WEB')) {
                  if (majorClean !== 'lập trình web') {
                    return Promise.reject('Tên lớp chứa ký hiệu "WEB" nên chuyên ngành phải là "Lập trình Web"!');
                  }
                } else if (nameUpper.includes('MMT')) {
                  if (majorClean !== 'mạng máy tính') {
                    return Promise.reject('Tên lớp chứa ký hiệu "MMT" nên chuyên ngành phải là "Mạng máy tính"!');
                  }
                } else if (nameUpper.includes('PM')) {
                  if (majorClean !== 'công nghệ phần mềm') {
                    return Promise.reject('Tên lớp chứa ký hiệu "PM" nên chuyên ngành phải là "Công nghệ phần mềm"!');
                  }
                } else if (nameUpper.includes('DĐ')) {
                  if (majorClean !== 'lập trình di động') {
                    return Promise.reject('Tên lớp chứa ký hiệu "DĐ" nên chuyên ngành phải là "Lập trình di động"!');
                  }
                }
              }
              return Promise.resolve();
            }
          }
        ]}
      >
        <AutoComplete
          options={majorOptions}
          disabled={disabled}
          placeholder="Chọn hoặc nhập chuyên ngành..."
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
        />
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
                <Form.Item
                  {...f}
                  name={[f.name, 'name']}
                  validateTrigger="onBlur"
                  rules={[{ required: true, message: t(getKey('student_name_required')) }]}
                >
                  <Input placeholder={t(getKey('student_name'))} disabled={disabled} />
                </Form.Item>
                <Form.Item
                  {...f}
                  name={[f.name, 'code']}
                  validateTrigger="onBlur"
                  rules={[
                    { required: true, message: 'Vui lòng nhập MSSV!' },
                    { pattern: /^0[0-9]{9}$/, message: 'MSSV phải gồm 10 chữ số bắt đầu bằng số 0!' },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const members = form.getFieldValue('members') || [];
                        const matches = members.filter((m: any) => m && m.code && m.code.trim() === value.trim());
                        if (matches.length > 1) {
                          return Promise.reject('MSSV này bị trùng trong danh sách!');
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
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
