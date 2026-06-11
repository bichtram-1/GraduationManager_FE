import { Button, Checkbox, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../../hooks/useAuth';
import { getKey } from '@shared/types/I18nKeyType';
import { DataLoginType } from '../../type/UserLoginType';
import { cn, USER_ROLE } from '../../constants/commonConst';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { formatNumber } from '@shared/utils/numberUtils';

const ROLE_OPTIONS = [
  { value: USER_ROLE.ADMIN, hint: 'admin@caothang.edu.vn' },
] as const;

const LoginPage = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const [loginFailedCount] = useState<number>(0);
  const [role] = useState<typeof USER_ROLE.ADMIN>(USER_ROLE.ADMIN);

  const onFinishForm = (payload: DataLoginType) => {
    loginMutation.mutate(payload);
  };

  return (
    <div>
      <div className={cn('mb-6 flex flex-col items-center text-center')}>
        <img
          src="/images/image-3.png"
          alt="Trường Cao đẳng Kỹ thuật Cao Thắng"
          className={cn('mb-4 h-20 w-20 object-contain')}
        />
        <h2 className={cn('m-0 text-3xl font-semibold text-slate-900')}>{t(getKey('login'))}</h2>
        <p className={cn('m-0 mt-2 text-sm leading-6 text-slate-500')}>
          {t(getKey('title_login'))}
        </p>
      </div>

      <Form
        disabled={loginMutation.isPending}
        onFinish={onFinishForm}
        className={cn('w-full')}
        layout="vertical"
        form={form}
      >
        <Form.Item
          label={<span className={cn('text-sm font-medium text-slate-700')}>{t(getKey('email'))}</span>}
          name="email"
          required
          rules={[
            {
              required: true,
              whitespace: true,
              message: t(getKey('email_required')),
            },
            { type: 'email', message: t(getKey('email_invalid')) },
          ]}
        >
          <Input
            placeholder={ROLE_OPTIONS.find((item) => item.value === role)?.hint}
            size="large"
            type="email"
            prefix={<UserOutlined className={cn('text-slate-400')} />}
            className={cn('!h-11 !rounded-xl !border-slate-300')}
          />
        </Form.Item>

        <Form.Item
          label={<span className={cn('text-sm font-medium text-slate-700')}>{t(getKey('password'))}</span>}
          name="password"
          required
          rules={[
            {
              required: true,
              whitespace: true,
              message: t(getKey('password_required')),
            },
          ]}
        >
          <Input.Password
            placeholder="••••••••"
            size="large"
            prefix={<LockOutlined className={cn('text-slate-400')} />}
            className={cn('!h-11 !rounded-xl !border-slate-300')}
          />
        </Form.Item>

        {loginFailedCount > 0 && (
          <Typography.Text className={cn('mb-4 mt-[-12px] block text-btnDelete')}>
            {t(getKey('login_failed_attempts'), { count: formatNumber(loginFailedCount) })}
          </Typography.Text>
        )}

        <div className={cn('mb-4 flex items-center justify-between gap-4 text-sm')}>
          <Checkbox className={cn('text-slate-600')}>{t(getKey('remember_me'))}</Checkbox>
        </div>

        <Form.Item className={cn('!mb-0')}>
          <Button
            type="primary"
            block
            size="large"
            htmlType="submit"
            loading={loginMutation.isPending}
            className={cn(
              '!h-11 !rounded-xl !border-0 !bg-[linear-gradient(90deg,var(--color-blue-login-start)_0%,var(--color-blue-login-mid)_50%,var(--color-blue-login-end)_100%)] !text-base !font-semibold !shadow-[var(--shadow-login-btn)]'
            )}
          >
            {t(getKey('login'))}
          </Button>
        </Form.Item>

        <div className={cn('my-5 flex items-center')}>
          <div className={cn('h-px flex-1 bg-slate-200')} />
          <div className={cn('px-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400')}>{t(getKey('or'))}</div>
          <div className={cn('h-px flex-1 bg-slate-200')} />
        </div>

        <Form.Item className={cn('!mb-0')}>
          <Button
            block
            size="large"
            className={cn('!h-11 !rounded-xl !border-slate-300 !text-slate-700 hover:!border-[var(--color-blue-login-mid)] hover:!text-[var(--color-blue-login-mid)]')}
          >
            <span className={cn('mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-semibold text-[var(--color-blue-google)] shadow-sm')}>
              G
            </span>
            {t(getKey('login_with_google'))}
          </Button>
        </Form.Item>
      </Form>

      <div className={cn('mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500')}>
        © 2026 Trường Cao đẳng Kỹ thuật Cao Thắng
      </div>
    </div>
  );
};

export default LoginPage;
