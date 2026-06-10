// ===== Modal Thêm / Chỉnh sửa User =====
// Dùng chung cho 2 mode: Thêm mới và Chỉnh sửa.
// FilterTable inject prop `detail` qua React.cloneElement khi mở modal edit/detail.
// Khi `detail` có id → edit mode; không có → create mode.

import { Button, Flex, Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import CustomInput from '../../../components/shared/input/CustomInput';
import { PASSWORD_PATTERN } from '@shared/constants/regex';
import { generateRandomPassword } from '@shared/utils/password-generator';
import { DEFAULT_PASSWORD, USER_ROLE, STATUS_CODE } from '../../../constants/commonConst';
// SearchSelect (achievements) removed — not used
import { userHooks } from '../../../hooks/useUsers';
import { IDetailUser, UserRoleType } from 'src/type/UserType';

// I prefix cho interface (convention của dự án)
interface IModalCreateEditUser {
  /** Injected by FilterTable via cloneElement when opening update/detail modal. */
  detail?: IDetailUser;
  mode?: 'create' | 'edit' | 'detail';
  role: UserRoleType;
}

const ModalCreateEditUser = ({ detail, mode = 'create', role }: IModalCreateEditUser) => {
  const { t } = useTranslation();
  const isDetailMode = mode === 'detail';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  // form instance dùng để set/validate field password từ bên ngoài Form.Item
  const form = Form.useFormInstance();

  if (!form) {
    return null;
  }

  // Hook gọi API reset password — isPending dùng để hiện loading state trên button
  const { mutate: resetUserPassword, isPending: isResetting } =
    userHooks.useResetUserPassword();

  useEffect(() => {
    if (!isCreateMode) return;

    if (!form.getFieldValue('role')) {
      form.setFieldValue('role', role);
    }
    if (!form.getFieldValue('status')) {
      form.setFieldValue('status', 'active');
    }
  }, [form, isCreateMode, role]);

  // Tạo password ngẫu nhiên và điền vào field, validate lại ngay để clear lỗi cũ
  const handleGenerateRandomPassword = () => {
    form?.setFieldValue('password', generateRandomPassword(10));
    form?.validateFields(['password']);
  };

  // Yêu cầu xác nhận trước khi reset — tránh bấm nhầm vì thao tác không hoàn tác được
  const handleResetPasswordConfirm = () => {
    Modal.confirm({
      title: t(getKey('reset_password_confirm_title')),
      content: t(getKey('reset_password_confirm_content')),
      okText: t(getKey('save_btn')),
      cancelText: t(getKey('cancel_btn')),
      onOk: () => {
        if (!detail?.id) return;
        resetUserPassword({ id: detail.id });
      },
    });
  };

  return (
    <>
      {/* ===== Header: title + nút đặt lại mật khẩu (chỉ edit mode) ===== */}
      <Flex justify="space-between" align="flex-start" className="mb-1">
        <h2 className="text-[18px] font-semibold leading-[18px] tracking-[-0.45px] text-blackSoft">
          {isDetailMode
            ? 'Chi tiết người dùng'
            : isEditMode
              ? t(getKey('edit_user_title'))
              : t(getKey('add_user_title'))}
        </h2>
        {/* Chỉ hiện nút reset khi đang ở edit mode */}
        {isEditMode && !isDetailMode && (
          <Button
            type="link"
            danger
            ghost
            loading={isResetting}
            onClick={handleResetPasswordConfirm}
            className="p-0 h-auto text-sm font-medium"
          >
            {t(getKey('reset_password'))}
          </Button>
        )}
      </Flex>
      <p className="mb-6 text-sm leading-5 text-grayMedium">
        {t(getKey('add_user_desc'))}
      </p>

      <Form.Item name="role" hidden initialValue={role}>
        <Input />
      </Form.Item>

      {/* ===== Họ tên + Email (2 cột) ===== */}
      <Flex gap={16}>
        <Form.Item
          label={t(getKey('full_name'))}
          name="name"
          rules={[{ required: true, message: t(getKey('user_name_required')) }]}
          className="flex-1"
        >
          {/* CustomInput đã có style chuẩn của dự án — không cần thêm className */}
          <CustomInput
            placeholder={t(getKey('full_name'))}
            readOnly={isDetailMode}
          />
        </Form.Item>

        <Form.Item
          label={t(getKey('email'))}
          name="email"
          rules={[
            { required: true, message: t(getKey('user_email_required')) },
            { type: 'email', message: t(getKey('email_invalid')) },
          ]}
          className="flex-1"
        >
          {/* Email không cho sửa khi edit — email là định danh tài khoản */}
          <CustomInput
            placeholder={t(getKey('email'))}
            readOnly={isEditMode || isDetailMode}
          />
        </Form.Item>
      </Flex>

      <Flex gap={16}>
        <Form.Item
          label={role === USER_ROLE.STUDENT ? t(getKey('student_id')) : t(getKey('teacher_id'))}
          name="id"
          rules={[{ required: isCreateMode, message: t(getKey('please_enter_user_id')) }]}
          className="flex-1"
        >
          <CustomInput
            placeholder={role === USER_ROLE.STUDENT ? t(getKey('enter_student_id')) : t(getKey('enter_teacher_id'))}
            readOnly={!isCreateMode || isDetailMode}
          />
        </Form.Item>

        <Form.Item
          label={role === USER_ROLE.STUDENT ? t(getKey('class')) : t(getKey('department'))}
          name="className"
          className="flex-1"
        >
          <CustomInput
            placeholder={role === USER_ROLE.STUDENT ? t(getKey('example_class')) : t(getKey('example_department'))}
            readOnly={isDetailMode}
          />
        </Form.Item>
      </Flex>

      <Flex gap={16}>
        <Form.Item label={t(getKey('phone_number'))} name="phone" className="flex-1">
          <CustomInput
            placeholder="VD: 0901234567"
            readOnly={isDetailMode}
          />
        </Form.Item>

        <Form.Item label={t(getKey('status'))} name="status" className="flex-1">
          <Select
            disabled={isDetailMode}
            placeholder={t(getKey('status'))}
            options={[
              { value: STATUS_CODE.ACTIVE, label: t(getKey('status_active')) },
              { value: STATUS_CODE.INACTIVE, label: t(getKey('status_inactive')) },
              { value: STATUS_CODE.DELETED, label: t(getKey('status_deleted')) },
            ]}
          />
        </Form.Item>
      </Flex>

      {/* ===== Mật khẩu — chỉ hiện ở create mode ===== */}
      {/* Edit mode: reset qua nút "Đặt lại mật khẩu" ở header, không cần field này */}
      {isCreateMode && !isDetailMode && (
        <Form.Item
          name="password"
          initialValue={DEFAULT_PASSWORD}
          label={
            // Label có 2 phần: text + nút tạo ngẫu nhiên — dùng Flex để layout
            <Flex align="center" justify="space-between" className="w-full">
              <span>{t(getKey('password'))}</span>
              <Button
                size="small"
                type="link"
                onClick={handleGenerateRandomPassword}
                className="p-0 h-auto"
              >
                {t(getKey('generate_random_password'))}
              </Button>
            </Flex>
          }
          // Tailwind arbitrary selector: cho label chiếm full width để button align right
          className="[&_.ant-form-item-label]:w-full [&_.ant-form-item-label>label]:w-full"
          rules={[
            { required: true, message: t(getKey('password_field_required')) },
            // Validate độ mạnh: ít nhất 8 ký tự, có chữ hoa, thường, số, ký tự đặc biệt
            { pattern: PASSWORD_PATTERN, message: t(getKey('password_invalid')) },
          ]}
        >
          <CustomInput.Password placeholder={t(getKey('password'))} />
        </Form.Item>
      )}

      {/* Edit mode: field password ẩn — chỉ được submit khi user xác nhận reset */}
      {!isCreateMode && (
        <Form.Item name="password" hidden>
          <Input />
        </Form.Item>
      )}

      {/* ===== Danh hiệu (tùy chọn) ===== */}
      {/* Achievements section removed */}

      {/* Nhắc nhở mật khẩu mặc định — chỉ hiện ở edit mode để admin biết khi reset */}
      {isEditMode && !isDetailMode && (
        <p className="text-sm text-btnDelete">
          {t(getKey('default_password'))}: {DEFAULT_PASSWORD}
        </p>
      )}
    </>
  );
};

export default ModalCreateEditUser;
