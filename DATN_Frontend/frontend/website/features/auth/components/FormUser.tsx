'use client'

import React from 'react'
import { Form, Input, Button, Alert, Card, Typography } from 'antd'
import { setCookie } from '@shared/utils/cookie'
import { STORAGES } from '@shared/constants/storage'
import { useRouter } from 'next/navigation'
import { APP_ROUTE } from '@/constants/routes'
import { FormMode, IFormAuth } from '../types'
import { useLogin } from '../hooks/useLogin'
import { PASSWORD_PATTERN } from '@shared/constants/regex'

interface AuthFormProps {
  mode: FormMode
}

const FormUser: React.FC<AuthFormProps> = ({ mode }) => {
  const router = useRouter()
  const [form] = Form.useForm<IFormAuth>()

  const { error, isMutating: isLoading } = useLogin()

  const onSubmit = (data: IFormAuth) => {
    console.log(data)
    setCookie(STORAGES.ACCESS_TOKEN, data)
    router.push(APP_ROUTE.home)
  }

  return (
    <Card style={{ width: 400, margin: '0 auto' }}>
      <Typography.Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
        {mode === 'login' ? 'Login' : 'Sign Up'}
      </Typography.Title>

      <Form form={form} layout="vertical" onFinish={onSubmit} disabled={isLoading}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input size="middle" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Password is required' },
            { min: 6, message: 'Min 6 characters' },
          ]}
        >
          <Input.Password size="middle" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </Button>
        </Form.Item>

        {error && (
          <Alert type="error" message={(error as Error).message} showIcon />
        )}
      </Form>
    </Card>
  )
}

export default FormUser
