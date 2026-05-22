'use client'

import { Card, Button, Progress, Input } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { formatNumber } from '@shared/utils/numberUtils'
import { createGetKey } from '@/lib/i18/getKey'

const ProfilePage = () => {
  const router = useRouter()
  const t = useTranslations('StatsPage')
  const getKey = createGetKey('StatsPage')

  const [editingInfo, setEditingInfo] = useState(false)
  const [editingPw, setEditingPw] = useState(false)
  const [name, setName] = useState('Nguyễn Văn A')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  return (
    <div className="bg-(--grayLightest) min-h-screen px-4 pt-6 pb-8">
      <div className="max-w-247 mx-auto">
        <Button type="text" onClick={() => router.back()} className="mb-6">Back</Button>
        <div className="grid grid-cols-1 md:grid-cols-[308px_1fr] gap-6 items-start">
          <div className="flex flex-col gap-6">
            <Card className="p-4">Profile</Card>
          </div>
          <Card className="p-4">Courses</Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
