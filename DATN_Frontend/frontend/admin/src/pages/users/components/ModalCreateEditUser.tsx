// ===== Modal Thêm / Chỉnh sửa User =====
// Dùng chung cho 2 mode: Thêm mới và Chỉnh sửa.
// FilterTable inject prop `detail` qua React.cloneElement khi mở modal edit/detail.
// Khi `detail` có id → edit mode; không có → create mode.

import { Flex, Form, Input, Select } from 'antd';
import { useEffect, useMemo } from 'react';
import CustomInput from '../../../components/shared/input/CustomInput';
import CustomDatePicker from '../../../components/shared/input/CustomDatePicker';
import { USER_ROLE, STATUS_CODE, DATE_FORMAT } from '../../../constants/commonConst';
// SearchSelect (achievements) removed — not used
import { classHooks } from '../../../hooks/useClasses';
import { IDetailUser, UserRoleType } from 'src/type/UserType';
import type { IListClass } from '../../../type/ClassType';

// I prefix cho interface (convention của dự án)
interface IModalCreateEditUser {
  /** Injected by FilterTable via cloneElement when opening update/detail modal. */
  detail?: IDetailUser;
  mode?: 'create' | 'edit' | 'detail';
  role: UserRoleType;
}

const ModalCreateEditUser = ({ mode = 'create', role }: IModalCreateEditUser) => {
  const isDetailMode = mode === 'detail';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  // form instance dùng để set/validate field password từ bên ngoài Form.Item
  const form = Form.useFormInstance();

  const { data: classesData } = classHooks.useFetchListClasses();

  const classOptions = useMemo(() => {
    if (!classesData?.rows) return [];
    return classesData.rows.map((cls: IListClass) => ({
      value: cls.name,
      label: cls.name,
    }));
  }, [classesData]);

  const specializationOptions = [
    { value: 'Phần mềm', label: 'Phần mềm' },
    { value: 'Phần cứng', label: 'Phần cứng' },
  ];

  const mssvValue = Form.useWatch('id', form);

  useEffect(() => {
    if (form && role === USER_ROLE.STUDENT && isCreateMode) {
      form.setFieldValue('email', mssvValue ? `${mssvValue}@caothang.edu.vn` : '');
      form.validateFields(['email']).catch(() => {});
    }
  }, [mssvValue, role, isCreateMode, form]);

  useEffect(() => {
    if (!form || !isCreateMode) return;

    if (!form.getFieldValue('role')) {
      form.setFieldValue('role', role);
    }
    if (!form.getFieldValue('status')) {
      form.setFieldValue('status', 'active');
    }
  }, [form, isCreateMode, role]);

  if (!form) {
    return null;
  }

  const titleText = useMemo(() => {
    const isStudent = role === USER_ROLE.STUDENT;
    if (isDetailMode) return isStudent ? 'Chi tiết sinh viên' : 'Chi tiết giảng viên';
    if (isEditMode) return isStudent ? 'Chỉnh sửa sinh viên' : 'Chỉnh sửa giảng viên';
    return isStudent ? 'Thêm sinh viên mới' : 'Thêm giảng viên mới';
  }, [isDetailMode, isEditMode, role]);

  const descText = useMemo(() => {
    if (isDetailMode) return 'Xem thông tin chi tiết của tài khoản.';
    if (isEditMode) return 'Vui lòng cập nhật các thông tin của tài khoản dưới đây.';
    return 'Vui lòng điền đầy đủ các thông tin dưới đây để tạo tài khoản mới.';
  }, [isDetailMode, isEditMode]);

  return (
    <>
      {/* ===== Header: title ===== */}
      <Flex justify="space-between" align="flex-start" className="mb-1">
        <h2 className="text-[18px] font-semibold leading-[18px] tracking-[-0.45px] text-blackSoft">
          {titleText}
        </h2>
      </Flex>
      <p className="mb-6 text-sm leading-5 text-grayMedium">
        {descText}
      </p>

      {role === USER_ROLE.STUDENT ? (
        <Form.Item name="role" hidden initialValue={isCreateMode ? USER_ROLE.STUDENT : undefined}>
          <Input />
        </Form.Item>
      ) : (
        <Form.Item name="role" hidden initialValue={isCreateMode ? USER_ROLE.TEACHER : undefined}>
          <Input />
        </Form.Item>
      )}

      {role === USER_ROLE.TEACHER ? (
        <>
          {/* Row 1: Họ và tên + Email */}
          <Flex gap={16}>
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              className="flex-1"
            >
              <CustomInput
                placeholder="Nhập họ và tên"
                readOnly={isDetailMode}
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không đúng định dạng!' },
              ]}
              className="flex-1"
            >
              <CustomInput
                placeholder="Nhập email"
                readOnly={isDetailMode}
              />
            </Form.Item>
          </Flex>

          {/* Row 2: Số điện thoại + Giới tính */}
          <Flex gap={16}>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              className="flex-1"
              rules={[
                {
                  pattern: /^0[0-9]{9}$/,
                  message: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0!',
                },
              ]}
            >
              <CustomInput
                placeholder="Ví dụ: 0901234567"
                maxLength={10}
                readOnly={isDetailMode}
              />
            </Form.Item>

            <Form.Item label="Giới tính" name="gender" className="flex-1">
              <Select
                disabled={isDetailMode}
                placeholder="Chọn giới tính"
                options={[
                  { value: 'Nam', label: 'Nam' },
                  { value: 'Nu', label: 'Nữ' },
                  { value: 'Khac', label: 'Khác' },
                ]}
              />
            </Form.Item>
          </Flex>

          {/* Row 3: Ngày sinh + Học vị */}
          <Flex gap={16}>
            <Form.Item
              label="Ngày sinh"
              name="dateOfBirth"
              className="flex-1"
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
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <CustomDatePicker
                disabled={isDetailMode}
                format={DATE_FORMAT}
              />
            </Form.Item>

            <Form.Item label="Học vị" name="academicDegree" className="flex-1">
              <Select
                disabled={isDetailMode}
                placeholder="Chọn học vị"
                options={[
                  { value: 'ThS', label: 'Thạc sĩ (ThS)' },
                  { value: 'TS', label: 'Tiến sĩ (TS)' },
                  { value: 'PGS.TS', label: 'Phó Giáo sư, Tiến sĩ (PGS.TS)' },
                  { value: 'GS.TS', label: 'Giáo sư, Tiến sĩ (GS.TS)' },
                  { value: 'CN', label: 'Cử nhân (CN)' },
                  { value: 'KS', label: 'Kỹ sư (KS)' },
                ]}
              />
            </Form.Item>
          </Flex>

          {/* Row 4: Chuyên môn + Trạng thái hoạt động */}
          <Flex gap={16}>
            <Form.Item
              label="Chuyên môn"
              name="specialization"
              className="flex-1"
              rules={[{ required: true, message: 'Vui lòng chọn chuyên môn!' }]}
            >
              <Select
                showSearch
                placeholder="Chọn chuyên môn"
                disabled={isDetailMode}
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={specializationOptions}
              />
            </Form.Item>

            {!isCreateMode ? (
              <Form.Item label="Trạng thái hoạt động" name="status" className="flex-1">
                <Select
                  disabled={isDetailMode}
                  placeholder="Chọn trạng thái"
                  options={[
                    { value: STATUS_CODE.ACTIVE, label: 'Đang hoạt động' },
                    { value: STATUS_CODE.INACTIVE, label: 'Khóa tài khoản' },
                    { value: STATUS_CODE.DELETED, label: 'Đã xóa' },
                  ]}
                />
              </Form.Item>
            ) : (
              <>
                <Form.Item name="status" hidden initialValue={STATUS_CODE.ACTIVE}>
                  <Input />
                </Form.Item>
                <div className="flex-1" />
              </>
            )}
          </Flex>
        </>
      ) : (
        <>
          {/* Row 1: MSSV + Họ và tên */}
          <Flex gap={16}>
            <Form.Item
              label="Mã số sinh viên (MSSV)"
              name="id"
              rules={[
                { required: isCreateMode, message: 'Vui lòng nhập mã số sinh viên!' },
                { pattern: /^0[0-9]+$/, message: 'Mã số sinh viên phải là số bắt đầu bằng số 0!' },
                { max: 10, message: 'Mã số sinh viên không được vượt quá 10 ký tự!' }
              ]}
              className="flex-1"
            >
              <CustomInput
                placeholder="Nhập mã số sinh viên"
                readOnly={!isCreateMode || isDetailMode}
              />
            </Form.Item>

            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              className="flex-1"
            >
              <CustomInput
                placeholder="Nhập họ và tên"
                readOnly={isDetailMode}
              />
            </Form.Item>
          </Flex>

          {/* Row 2: Email + Lớp học */}
          <Flex gap={16}>
            <Form.Item
              label="Email"
              name="email"
              dependencies={['id']}
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                {
                  pattern: /^0[0-9]{9}@caothang\.edu\.vn$/,
                  message: 'Email sinh viên không hợp lệ!',
                },
              ]}
              className="flex-1"
            >
              <CustomInput
                placeholder="Email đăng nhập"
                readOnly={true}
              />
            </Form.Item>

            <Form.Item
              label="Lớp học"
              name="className"
              rules={[{ required: true, message: 'Vui lòng chọn lớp học!' }]}
              className="flex-1"
            >
              <Select
                showSearch
                placeholder="Chọn lớp học"
                disabled={isDetailMode}
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={classOptions}
              />
            </Form.Item>
          </Flex>

          {/* Row 3: Số điện thoại + Giới tính */}
          <Flex gap={16}>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              className="flex-1"
              rules={[
                {
                  pattern: /^0[0-9]{9}$/,
                  message: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0!',
                },
              ]}
            >
              <CustomInput
                placeholder="Ví dụ: 0901234567"
                maxLength={10}
                readOnly={isDetailMode}
              />
            </Form.Item>

            <Form.Item label="Giới tính" name="gender" className="flex-1">
              <Select
                disabled={isDetailMode}
                placeholder="Chọn giới tính"
                options={[
                  { value: 'Nam', label: 'Nam' },
                  { value: 'Nu', label: 'Nữ' },
                  { value: 'Khac', label: 'Khác' },
                ]}
              />
            </Form.Item>
          </Flex>

          {/* Row 4: Ngày sinh + Trạng thái hoạt động */}
          <Flex gap={16}>
            <Form.Item
              label="Ngày sinh"
              name="dateOfBirth"
              className="flex-1"
              rules={[
                { required: isCreateMode, message: 'Vui lòng nhập ngày sinh!' },
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
                        return Promise.reject(
                          new Error('Sinh viên phải đủ 18 tuổi trở lên!')
                        );
                      }
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <CustomDatePicker
                disabled={isDetailMode}
                format={DATE_FORMAT}
              />
            </Form.Item>

            {!isCreateMode ? (
              <Form.Item label="Trạng thái hoạt động" name="status" className="flex-1">
                <Select
                  disabled={isDetailMode}
                  placeholder="Chọn trạng thái"
                  options={[
                    { value: STATUS_CODE.ACTIVE, label: 'Đang hoạt động' },
                    { value: STATUS_CODE.INACTIVE, label: 'Khóa tài khoản' },
                    { value: STATUS_CODE.DELETED, label: 'Đã xóa' },
                  ]}
                />
              </Form.Item>
            ) : (
              <>
                <Form.Item name="status" hidden initialValue={STATUS_CODE.ACTIVE}>
                  <Input />
                </Form.Item>
                <div className="flex-1" />
              </>
            )}
          </Flex>
        </>
      )}

      {/* ===== Danh hiệu (tùy chọn) ===== */}
      {/* Achievements section removed */}
    </>
  );
};

export default ModalCreateEditUser;
