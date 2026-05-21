import { Button, Flex, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routers';
import { useLogin } from '../../hooks/useAuth';
import { getKey } from '@shared/types/I18nKeyType';
import { DataLoginType } from '../../type/UserLoginType';
import { cn } from '../../constants/commonConst';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import LogoImg from '/images/logo-dashboard.png';

const LoginPage = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const [loginFailedCount] = useState<number>(0);
  const [role, setRole] = useState<'admin' | 'teacher' | 'student'>('admin');

  const onFinishForm = (payload: DataLoginType) => {
    loginMutation.mutate(payload);
  };

  return (
    <>
      {/* Header */}
      <div className={cn('flex flex-col items-center mb-6')}>
        <img src={LogoImg} alt="logo" className={cn('w-20 h-20 object-contain mb-4')} />
        <h2 className={cn('m-0 text-2xl font-semibold text-blackSoft')}>Đăng nhập</h2>
        <p className={cn('m-0 mt-1 text-sm text-grayMedium')}>Chọn vai trò và nhập tài khoản đã được cấp</p>
      </div>

      {/* Role tabs */}
      <div className={cn('mb-5 flex gap-2')}> 
        <button type="button" onClick={() => setRole('admin')} className={cn(`px-4 py-2 rounded-full ${role==='admin' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`)}>Quản trị viên</button>
        <button type="button" onClick={() => setRole('teacher')} className={cn(`px-4 py-2 rounded-full ${role==='teacher' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`)}>Giảng viên</button>
        <button type="button" onClick={() => setRole('student')} className={cn(`px-4 py-2 rounded-full ${role==='student' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`)}>Sinh viên</button>
      </div>

      {/* Form */}
      <Form
        disabled={loginMutation.isPending}
        onFinish={onFinishForm}
        className={cn('w-full')}
        layout="vertical"
        form={form}
      >
        <Form.Item
          label={
            <span className={cn('text-sm font-medium text-blackSoft')}>
              {t(getKey('email'))}
            </span>
          }
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
            placeholder="admin@caothang.edu.vn"
            size="large"
            type="email"
            prefix={<UserOutlined />}
            className={cn('!rounded-lg')}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className={cn('text-sm font-medium text-blackSoft')}>
              {t(getKey('password'))}
            </span>
          }
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
            prefix={<LockOutlined />}
            className={cn('!rounded-lg')}
          />
        </Form.Item>

        {loginFailedCount > 0 && (
          <Typography.Text
            className={cn('mb-4 mt-[-12px] block text-btnDelete')}
          >
            {t(getKey('login_failed_attempts'), { count: loginFailedCount })}
          </Typography.Text>
        )}

        {/* Forgot password link */}
        <Flex justify="end" className={cn('-mt-2 mb-4')}>
          <Link
            to={ROUTES.FORGOTPW}
            className={cn('text-sm text-primary no-underline hover:underline')}
          >
            {t(getKey('forgot_password'))}
          </Link>
        </Flex>

        {/* Login button */}
        <Form.Item className={cn('!mb-3')}>
          <Button
            type="primary"
            block
            size="large"
            htmlType="submit"
            loading={loginMutation.isPending}
            className={cn('!rounded-lg !text-base !font-medium')}
          >
            → Đăng nhập
          </Button>
        </Form.Item>

        <div className={cn('flex items-center my-4')}>
          <div className={cn('flex-1 h-px bg-gray-200')}></div>
          <div className={cn('px-3 text-sm text-gray-400')}>hoặc</div>
          <div className={cn('flex-1 h-px bg-gray-200')}></div>
        </div>

        <Form.Item className={cn('!mb-0')}>
          <Button block size="large" className={cn('!rounded-lg !border !bg-white')}>
            <span className={cn('mr-3 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-sm')}>G</span>
            Đăng nhập bằng Google
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default LoginPage;
