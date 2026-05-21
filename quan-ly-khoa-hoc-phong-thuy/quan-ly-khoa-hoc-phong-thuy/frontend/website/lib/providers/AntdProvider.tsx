'use client'

import '@ant-design/v5-patch-for-react-19'
import React from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs'
import { ConfigProvider, App } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { COLORS } from '@/lib/constants/colors'

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState(() => createCache())

  useServerInsertedHTML(() => (
    <style id="antd" dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }} />
  ))

  return (
    <StyleProvider cache={cache}>
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            // antd cần giá trị hex thực để tính derived colors (hover, active…)
            // → dùng COLORS constant thay vì var(--...) để antd hoạt động đúng
            colorPrimary: COLORS.primaryBlue,
            borderRadius: 8,
            fontFamily: 'Inter, sans-serif',
          },
        }}
      >
        <App>
          {children}
        </App>
      </ConfigProvider>
    </StyleProvider>
  )
}
