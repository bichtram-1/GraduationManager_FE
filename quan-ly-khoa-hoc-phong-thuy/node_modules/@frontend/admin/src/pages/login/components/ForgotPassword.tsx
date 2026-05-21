import {
  Button,
  Flex,
  Form,
  Input,
  Typography
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PASSWORD_PATTERN } from '@shared/constants/regex';
import { ROUTES } from '../../../constants/routers';
import { useChangePassword, useVerifyEmail, useVerifyOtp } from '../../../hooks/useChangePassword';
import { getKey } from '@shared/types/I18nKeyType';
import { STORAGES } from '@shared/constants/storage';
import { useOtpCooldown } from '../../../hooks/useOtpCooldown';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import { getCookie } from '@shared/utils/cookie';
import { formatSecondsToMMSS } from '@shared/utils/DateUtils';
import { AxiosError } from 'axios';
import { GeneralErrorType } from '@shared/types/GeneralType';
import { ErrorId } from '../../../constants/customError';
import { cn } from '../../../constants/commonConst';
import { ArrowLeftOutlined } from '@ant-design/icons';

const FORGOT_PW_STEP = {
  EMAIL: 'email',
  OTP: 'otp',
  RESET: 'reset',
} as const;

type Step = typeof FORGOT_PW_STEP[keyof typeof FORGOT_PW_STEP];

export type FormChangePasswordValues = {
  email: string;
  code: string;
  newPassword: string;
  confirmNewPassword: string;
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormChangePasswordValues>();
  const { t } = useTranslation();
  dayjs.extend(utc)
  // Step state
  const [step, setStep] = useState<Step>(FORGOT_PW_STEP.EMAIL);

  // Store "session" returned by BE after OTP verification
  const [session, setSession] = useState<string>("");

  // Mutation for each step
  const verifyEmailMutation = useVerifyEmail();
  const verifyOtpMutation = useVerifyOtp();
  const changePwMutation = useChangePassword();

  const { secondsLeft, startCooldown, stopCooldown } = useOtpCooldown(STORAGES.OTP_DEADLINE, 60);

  // ---- STEP ACTIONS ----
  const onGetCode = async () => {
    const email = form.getFieldValue('email');
    await form.validateFields(['email']); // validate email before sending
    verifyEmailMutation.mutate(
      { email },
      {
        onSuccess: ((_, { email }) => {
          setStep(FORGOT_PW_STEP.OTP);
          startCooldown(email);
        }),
        onError(error, variables) {
          // If error is AUTH_00025 (resend more than 3 times in 15 minutes), start 15-minute cooldown
          const errorId = (error as AxiosError<GeneralErrorType>).response?.data
            ?.error_id;
          if (errorId === ErrorId.AUTH_00025) {
            startCooldown(variables.email, 900);
          }
        },
      },
    );
  };

  const onVerifyOtp = async () => {
    const { email, code } = form.getFieldsValue(['email', 'code']);
    await form.validateFields(['code']); // validate OTP code before sending
    verifyOtpMutation.mutate(
      { email, code },
      {
        onSuccess: (data) => {
          setSession(data?.results?.object?.sessionId); // store sessionId if available
          setStep(FORGOT_PW_STEP.RESET);
          stopCooldown();
        },
      }
    );
  };

  const onChangePassword = async () => {
    const { email, newPassword, confirmNewPassword } = form.getFieldsValue();
    await form.validateFields(['newPassword', 'confirmNewPassword']); // validate password before sending
    changePwMutation.mutate(
      { email, newPassword, confirmNewPassword, sessionId: session },
      {
        onSuccess: () => {
          navigate(ROUTES.LOGIN);
        },
      }
    );
  };

  const getButtonText = () => {
    switch (step) {
      case FORGOT_PW_STEP.EMAIL:
        return t(getKey("send_reset_link"));
      case FORGOT_PW_STEP.OTP:
        return t(getKey("verify_otp"));
      case FORGOT_PW_STEP.RESET:
        return t(getKey("reset_password"));
      default:
        return '';
    }
  }

  const getButtonOnClick = () => {
    switch (step) {
      case FORGOT_PW_STEP.EMAIL:
        return onGetCode;
      case FORGOT_PW_STEP.OTP:
        return onVerifyOtp;
      case FORGOT_PW_STEP.RESET:
        return onChangePassword;
      default:
        return () => {};
    }
  };

  // Check if cooldown exists in cookie, if so switch to OTP step
  useEffect(() => {
    if (secondsLeft > 0) {
      setStep(FORGOT_PW_STEP.OTP);
    }
  }, [step, secondsLeft])

  return (
    <>
      {/* Header */}
      <div className={cn('mb-6')}>
        <h2 className={cn('m-0 text-2xl font-semibold text-blackSoft')}>
          {t(getKey("forgot_password_title"))}
        </h2>
        <p className={cn('m-0 mt-1 text-sm text-grayMedium')}>
          {t(getKey("forgot_password_subtitle"))}
        </p>
      </div>

      <Form<FormChangePasswordValues>
          disabled={verifyEmailMutation.isPending || verifyOtpMutation.isPending || changePwMutation.isPending}
          className={cn('w-full')}
          layout="vertical"
          form={form}
        >
          {/* Email - always visible on every step */}
          <Form.Item
            label={
              <span className={cn('text-sm font-medium text-blackSoft')}>
                {t(getKey("email"))}
              </span>
            }
            name="email"
            initialValue={getCookie(STORAGES.OTP_DEADLINE)?.email || ''}
            required
            rules={[
              {
                required: true,
                whitespace: true,
                message: t(getKey("email_required")),
              },
              { type: 'email', message: t(getKey("email_invalid")) },
            ]}
          >
            <Input
              placeholder="email@example.com"
              size="large"
              type="email"
              disabled={step !== FORGOT_PW_STEP.EMAIL}
              className={cn('!rounded-lg')}
            />
          </Form.Item>

          {/* OTP: only visible on step 2 */}
          {step === FORGOT_PW_STEP.OTP && (
            <Form.Item
              label={
                <span className={cn('text-sm font-medium text-blackSoft')}>
                  {t(getKey("otp_code"))}
                </span>
              }
              className={cn('!mb-0')}
              name="code"
              rules={[
                { required: true, message: t(getKey("otp_required")) },
                { len: 6, message: t(getKey("otp_invalid")) },
              ]}
            >
              <Input.OTP
                length={6}
                size="large"
                formatter={(str) => str.toUpperCase()}
              />
            </Form.Item>
          )}

          {/* Cooldown timer */}
          {step === FORGOT_PW_STEP.OTP && (
            <Flex
              align="center"
              gap={16}
              className={cn('mt-3')}
            >
              <Typography.Text>
                {t(getKey("resend_available")) + (secondsLeft > 0 ?  ` ${t(getKey("in"))}: ${formatSecondsToMMSS(secondsLeft)}` : '')}
              </Typography.Text>
              <Button
                disabled={secondsLeft > 0}
                htmlType='button'
                onClick={onGetCode}
                type="link"
              >
                {t(getKey("resend_otp"))}
              </Button>
            </Flex>
          )}

          {/* NEW PASSWORD + CONFIRM: only visible on step 3 */}
          {step === FORGOT_PW_STEP.RESET && (
            <>
              <Form.Item
                label={
                  <span className={cn('text-sm font-medium text-blackSoft')}>
                    {t(getKey("new_password"))}
                  </span>
                }
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: t(getKey("password_required")),
                  },
                  {
                    pattern: PASSWORD_PATTERN,
                    message: t(getKey("password_invalid")),
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder={t(getKey("enter_password"))}
                  className={cn('!rounded-lg')}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className={cn('text-sm font-medium text-blackSoft')}>
                    {t(getKey("confirm_password"))}
                  </span>
                }
                name="confirmNewPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: t(getKey("confirm_password_required")) },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                      return Promise.reject(new Error(t(getKey("passwords_do_not_match"))));
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder={t(getKey("reenter_new_password"))}
                  className={cn('!rounded-lg')}
                />
              </Form.Item>
            </>
          )}

          <Form.Item className={cn('!mb-0 !mt-4')}>
            <Button
              type="primary"
              block
              size="large"
              htmlType="button"
              loading={verifyEmailMutation.isPending || verifyOtpMutation.isPending || changePwMutation.isPending}
              onClick={getButtonOnClick()}
              className={cn('!rounded-lg !text-base !font-medium')}
            >
              {getButtonText()}
            </Button>
          </Form.Item>

          <Form.Item className={cn('!mb-0')}>
            <Button
              type="text"
              block
              size="large"
              htmlType="button"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(ROUTES.LOGIN)}
              className={cn('!rounded-lg !text-base !font-medium !text-blackSoft')}
            >
              {t(getKey("back_to_login"))}
            </Button>
          </Form.Item>
        </Form>
    </>
  );
};

export default ForgotPassword;
