import React from 'react';
import { Form, Input, Button, Space, Upload, Typography, message, AutoComplete, Select } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { IDetailClass } from '../../../type/ClassType';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import * as XLSX from 'xlsx';
import { classHooks } from '../../../hooks/useClasses';
import CustomDatePicker from '../../../components/shared/input/CustomDatePicker';
import dayjs from 'dayjs';

type Props = {
  disabled?: boolean;
  detail?: IDetailClass | null;
  // File Excel/CSV được giữ cục bộ ở đây (không phải trong antd Form) và chỉ thật sự được
  // tải lên server ở bước submit cuối cùng (xem formatFormValues trong ClassesAdminPage.tsx),
  // tránh trường hợp file mồ côi trên storage nếu admin chọn file rồi đóng modal mà không tạo lớp.
  onFileSelected?: (file: File | null) => void;
};

const ClassForm: React.FC<Props> = ({ disabled = false, detail, onFileSelected }) => {
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
    onFileSelected?.(null);
    if (detail) {
      form.setFieldsValue(detail as unknown as Record<string, unknown>);
      setStudentListFileName(detail.studentListFileName || '');
    } else {
      form.resetFields();
      setStudentListFileName('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, form]);

  const parseExcelFile = (file: File): Promise<Array<{ id: string; name: string; code: string; phone?: string; gender?: string; dateOfBirth?: dayjs.Dayjs }>> => {
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
          let phoneCol = -1;
          let genderCol = -1;
          let dobCol = -1;

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
              if (
                cellClean.includes('điện thoại') ||
                cellClean.includes('sđt') ||
                cellClean.includes('phone')
              ) {
                phoneCol = colIndex;
              }
              if (cellClean.includes('giới tính') || cellClean.includes('gender')) {
                genderCol = colIndex;
              }
              if (
                cellClean.includes('ngày sinh') ||
                cellClean.includes('ngaysinh') ||
                cellClean.includes('ngay_sinh') ||
                cellClean.includes('birth') ||
                cellClean.includes('dob')
              ) {
                dobCol = colIndex;
              }
            }
          }

          const parsedMembers: Array<{ id: string; name: string; code: string; phone?: string; gender?: string; dateOfBirth?: dayjs.Dayjs }> = [];
          const seenCodes = new Set<string>();
          const duplicates: string[] = [];

          for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            if (!row) continue;
            const code = row[mssvCol] ? String(row[mssvCol]).trim() : '';
            const name = row[nameCol] ? String(row[nameCol]).trim() : '';
            const email = emailCol >= 0 && row[emailCol] ? String(row[emailCol]).trim() : '';
            const phone = phoneCol >= 0 && row[phoneCol] ? String(row[phoneCol]).trim() : '';
            
            let gender = 'Nam';
            if (genderCol >= 0 && row[genderCol]) {
              const genderVal = String(row[genderCol]).toLowerCase().trim();
              if (genderVal.includes('nữ') || genderVal.includes('female') || genderVal.includes('nu')) {
                gender = 'Nu';
              } else if (genderVal.includes('khác') || genderVal.includes('other') || genderVal.includes('khac')) {
                gender = 'Khac';
              }
            }

            let dateOfBirth: dayjs.Dayjs | undefined = undefined;
            if (dobCol >= 0 && row[dobCol]) {
              const dobVal = row[dobCol];
              if (typeof dobVal === 'number') {
                const dateObj = XLSX.SSF.parse_date_code(dobVal);
                const dobStr = `${dateObj.y}-${String(dateObj.m).padStart(2, '0')}-${String(dateObj.d).padStart(2, '0')}`;
                dateOfBirth = dayjs(dobStr);
              } else {
                const dobStr = String(dobVal).trim();
                const dmy = dobStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
                if (dmy) {
                  dateOfBirth = dayjs(`${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`);
                } else {
                  const ymd = dobStr.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
                  if (ymd) {
                    dateOfBirth = dayjs(`${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`);
                  }
                }
              }
            }

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

              if (phone) {
                if (!/^0[0-9]{9}$/.test(phone)) {
                  reject(new Error(`File Excel - Dòng ${rowIndex + 1}: Số điện thoại '${phone}' không hợp lệ (phải gồm 10 chữ số bắt đầu bằng số 0).`));
                  return;
                }
              }

              if (dateOfBirth) {
                if (!dateOfBirth.isValid()) {
                  reject(new Error(`File Excel - Dòng ${rowIndex + 1}: Ngày sinh không hợp lệ.`));
                  return;
                }
                const age = dayjs().diff(dateOfBirth, 'year');
                if (age < 18) {
                  reject(new Error(`File Excel - Dòng ${rowIndex + 1}: Sinh viên phải đủ 18 tuổi trở lên.`));
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
                phone: phone || undefined,
                gender,
                dateOfBirth,
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

  // Chỉ đọc/parse file Excel cục bộ (không cần mạng) để hiển thị ngay danh sách sinh viên.
  // File thật sự chỉ được tải lên server ở bước submit cuối cùng (xem formatFormValues ở
  // ClassesAdminPage.tsx, đọc field ẩn "studentListFile"), tránh trường hợp file mồ côi trên
  // storage nếu admin chọn file rồi đóng modal mà không bấm "Tạo lớp".
  const handleStudentListUpload = async (file: File) => {
    const isValidFile = /\.(csv|xls|xlsx)$/i.test(file.name);
    if (!isValidFile) {
      message.error(t(getKey('select_csv_excel_error')) || 'Vui lòng chọn file Excel hoặc CSV!');
      return false;
    }

    try {
      const parsedMembers = await parseExcelFile(file);

      form.setFieldsValue({
        studentListUrl: undefined,
        studentListFileName: file.name,
        members: parsedMembers,
      });
      onFileSelected?.(file);
      setStudentListFileName(file.name);
      message.success(t(getKey('upload_student_list_success')) || 'Đã đọc danh sách sinh viên, file sẽ được lưu khi bạn tạo lớp!');
    } catch (err) {
      form.setFieldsValue({
        studentListUrl: undefined,
        studentListFileName: undefined,
        members: [],
      });
      onFileSelected?.(null);
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
              <div key={f.key} className="grid grid-cols-1 gap-x-3 gap-y-2 md:grid-cols-5 items-start mb-3 border border-slate-100 rounded-lg p-3 bg-slate-50/30 relative pr-10">
                <Form.Item
                  {...f}
                  name={[f.name, 'code']}
                  validateTrigger="onBlur"
                  rules={[
                    { required: true, message: 'Vui lòng nhập MSSV!' },
                    { pattern: /^0[0-9]{9}$/, message: 'MSSV gồm 10 số bắt đầu bằng 0!' },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const members = form.getFieldValue('members') || [];
                        const matches = members.filter((m: any) => m && m.code && m.code.trim() === value.trim());
                        if (matches.length > 1) {
                          return Promise.reject('MSSV bị trùng!');
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Input placeholder="Mã số sinh viên (MSSV)" disabled={disabled} />
                </Form.Item>
                <Form.Item
                  {...f}
                  name={[f.name, 'name']}
                  validateTrigger="onBlur"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                >
                  <Input placeholder="Họ và tên" disabled={disabled} />
                </Form.Item>
                <Form.Item
                  {...f}
                  name={[f.name, 'phone']}
                  validateTrigger="onBlur"
                  rules={[
                    { pattern: /^0[0-9]{9}$/, message: 'SĐT gồm 10 số bắt đầu bằng 0!' }
                  ]}
                >
                  <Input placeholder="Số điện thoại" disabled={disabled} />
                </Form.Item>
                <Form.Item
                  {...f}
                  name={[f.name, 'gender']}
                >
                  <Select placeholder="Chọn giới tính" disabled={disabled} options={[
                    { value: 'Nam', label: 'Nam' },
                    { value: 'Nu', label: 'Nữ' },
                    { value: 'Khac', label: 'Khác' },
                  ]} />
                </Form.Item>
                <Form.Item
                  {...f}
                  name={[f.name, 'dateOfBirth']}
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value) {
                          const selectedDate = new Date(value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (selectedDate > today) {
                            return Promise.reject(new Error('Ngày sinh không hợp lệ!'));
                          }
                          const minBirthDate = new Date(
                            today.getFullYear() - 18,
                            today.getMonth(),
                            today.getDate()
                          );
                          if (selectedDate > minBirthDate) {
                            return Promise.reject(new Error('Sinh viên phải đủ 18 tuổi trở lên!'));
                          }
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <CustomDatePicker disabled={disabled} format="DD/MM/YYYY" placeholder="Ngày sinh" />
                </Form.Item>
                {!disabled && (
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => remove(f.name)}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  />
                )}
              </div>
            ))}

            {!disabled && (
              <Form.Item>
                <Button type="dashed" onClick={() => add({ id: `s${Date.now()}`, name: '', code: '', phone: '', gender: 'Nam', dateOfBirth: undefined })} block>
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
