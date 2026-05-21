// ===== Modal Thêm / Chỉnh sửa User =====
// Dùng chung cho 2 mode: Thêm mới và Chỉnh sửa.
// FilterTable inject prop `detail` qua React.cloneElement khi mở modal edit/detail.
// Khi `detail` có id → edit mode; không có → create mode.

import { Button, Flex, Form, Input, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import CustomInput from '@shared/components/input/CustomInput';
import { PASSWORD_PATTERN } from '@shared/constants/regex';
import { generateRandomPassword } from '@shared/utils/password-generator';
import { DEFAULT_PASSWORD } from '../../../constants/commonConst';
import { SearchSelect } from '@shared/components/select/SearchSelect';
import { achievementHooks } from '../../../hooks/useAchievements';
import { userHooks } from '../../../hooks/useUsers';
import { IDetailUser } from 'src/type/UserType';

// I prefix cho interface (convention của dự án)
interface IModalCreateEditUser {
  /** Injected by FilterTable via cloneElement when opening update/detail modal. */
  detail?: IDetailUser;
}

const ModalCreateEditUser = ({ detail }: IModalCreateEditUser) => {
  const { t } = useTranslation();
  const isEditMode = !!detail?.id; // true = đang sửa, false = đang thêm mới

  // form instance dùng để set/validate field password từ bên ngoài Form.Item
  const form = Form.useFormInstance();

  // Hook gọi API reset password — isPending dùng để hiện loading state trên button
  const { mutate: resetUserPassword, isPending: isResetting } =
    userHooks.useResetUserPassword();

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
          {isEditMode ? t(getKey('edit_user_title')) : t(getKey('add_user_title'))}
        </h2>
        {/* Chỉ hiện nút reset khi đang ở edit mode */}
        {isEditMode && (
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

      {/* id ẩn — FilterTable dùng để biết đang sửa record nào */}
      <Form.Item name="id" hidden>
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
          <CustomInput placeholder={t(getKey('full_name'))} />
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
          <CustomInput placeholder={t(getKey('email'))} readOnly={isEditMode} />
        </Form.Item>
      </Flex>

      {/* ===== Mật khẩu — chỉ hiện ở create mode ===== */}
      {/* Edit mode: reset qua nút "Đặt lại mật khẩu" ở header, không cần field này */}
      {!isEditMode && (
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
      {isEditMode && (
        <Form.Item name="password" hidden>
          <Input />
        </Form.Item>
      )}

      {/* ===== Danh hiệu (tùy chọn) ===== */}
      <Form.Item label={t(getKey('achievement_optional'))} name="achievement">
        {/*
          labelInValue: SearchSelect emit { value, label } thay vì raw string ID.
          Backend nhận IValueLabel trực tiếp — không cần convert ở frontend.
        */}
        <SearchSelect
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          useQueryHook={achievementHooks.useFetchListAchievements as any}
          fieldNames={{ label: 'name', value: 'id' }}
          labelInValue
          placeholder={t(getKey('no_achievement'))}
          className="h-10 rounded-lg"
        />
      </Form.Item>
      <p className="-mt-4 mb-4 text-xs text-grayMedium">
        {t(getKey('achievement_note'))}
      </p>

      {/* Nhắc nhở mật khẩu mặc định — chỉ hiện ở edit mode để admin biết khi reset */}
      {isEditMode && (
        <p className="text-sm text-btnDelete">
          {t(getKey('default_password'))}: {DEFAULT_PASSWORD}
        </p>
      )}
    </>
  );
};

export default ModalCreateEditUser;
