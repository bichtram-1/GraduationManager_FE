'use client'

import React, { useState } from 'react'
import { Button, Avatar, Drawer, Menu } from 'antd'
import { MenuOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { clearCookie, getCookie } from '@shared/utils/cookie'
import { STORAGES } from '@shared/constants/storage'
import { APP_ROUTE } from '@/constants/routes'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { menuItems } from '../constants'
import styles from './HeaderWithSideBar.module.css'

const HeaderWithSideBar = () => {
  const router = useRouter()
  const [isOpenSidebar, setIsOpenSidebar] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const t = useTranslations('Header')
  const isSupportLanguage = process.env.NEXT_PUBLIC_IS_SUPPORT_LANGUAGE === 'TRUE'

  React.useEffect(() => {
    setToken(getCookie(STORAGES.ACCESS_TOKEN) || null)
  }, [])

  const handleLogout = () => {
    clearCookie(STORAGES.ACCESS_TOKEN)
    router.push(APP_ROUTE.login)
  }

  return (
    <>
      <header className={`${styles.header} flex items-center justify-between px-4 bg-white border-b border-black/10 shrink-0`}>
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-2">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setIsOpenSidebar(true)}
          />
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 6h11v20H4z" stroke="var(--primaryBlue)" strokeWidth="2.667" strokeLinejoin="round" />
              <path d="M15 6h13v20H15z" stroke="var(--primaryBlue)" strokeWidth="2.667" strokeLinejoin="round" />
              <path d="M15 6V26" stroke="var(--primaryBlue)" strokeWidth="2.667" strokeLinecap="round" />
            </svg>
            <span className="font-bold text-xl text-navyDark font-inter">
              {t('title')}
            </span>
          </div>
        </div>

        {/* Right: user actions */}
        {token ? (
          <div className="flex items-center gap-3">
            <Button
              icon={<Avatar size={20} icon={<UserOutlined />} className={`bg-transparent ${styles.avatarIcon}`} />}
              onClick={() => router.push('/stats')}
              className={styles.actionButton}
            >
              Nguyễn Văn A
            </Button>
            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className={styles.actionButton}
            >
              {t('logout')}
            </Button>
            {isSupportLanguage && <LanguageSwitcher />}
          </div>
        ) : (
          <Button type="text" onClick={() => router.push(APP_ROUTE.login)}>
            {t('login')}
          </Button>
        )}
      </header>

      <Drawer
        open={isOpenSidebar}
        onClose={() => setIsOpenSidebar(false)}
        placement="left"
        width={240}
        styles={{ header: { display: 'none' }, body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          className={styles.sidebarMenu}
          items={menuItems.map((item) => ({
            key: item.path,
            label: item.label,
            onClick: () => {
              router.push(item.path)
              setIsOpenSidebar(false)
            },
          }))}
        />
      </Drawer>
    </>
  )
}

export default HeaderWithSideBar

