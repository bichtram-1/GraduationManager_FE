'use client'

import { Button } from 'antd'
import { STORAGES } from '@shared/constants/storage'
import { setCookie } from '@shared/utils/cookie'
import { useRouter } from 'next/navigation'

export function LanguageSwitcher() {
  const router = useRouter()

  const switchTo = (locale: 'vi') => {
    setCookie(STORAGES.LANGUAGE, locale)
    router.refresh()
  }

  return (
    <div className="flex gap-3">
      <Button type="primary" onClick={() => switchTo('vi')}>VI</Button>
    </div>
  )
}
