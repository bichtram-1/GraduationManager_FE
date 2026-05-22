'use client'

import { Card, Button, Progress, Tag, Input } from 'antd'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { formatNumber } from '@shared/utils/numberUtils'
import { ACHIEVEMENT_STATUS, type AchievementStatusType } from '@/constants/status'
import { createGetKey } from '@/lib/i18/getKey'
import { StatsBarChartIcon } from './_icons/StatsBarChartIcon'
import { ActivateKeyIcon } from './_icons/ActivateKeyIcon'
import { AchievementTrophyIcon } from './_icons/AchievementTrophyIcon'
import { AchievementMedalIcon } from './_icons/AchievementMedalIcon'
import { WelcomeTrophyIcon } from './_icons/WelcomeTrophyIcon'

const achievements = [
  {
    id: 1,
    nameKey: 'achievementNewbieName',
    status: ACHIEVEMENT_STATUS.COMPLETED as AchievementStatusType,
    descriptionKey: 'achievementNeedOneCourse',
    currentCount: 2,
    targetCount: 1,
  },
]

const courses = [
  {
    id: 1,
    title: 'Phong Thủy Cơ Bản',
    description: 'Khóa học giới thiệu...',
    progress: 100,
    totalLessons: 3,
    completedLessons: 3,
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
]

export default function Page() {
  const router = useRouter()
  const t = useTranslations('HomePage')
  const getKey = createGetKey('HomePage')
  const [showActivate, setShowActivate] = useState(false)
  const [activateCode, setActivateCode] = useState('')

  return (
    <div className="bg-(--grayLightest) min-h-screen px-4 py-8">
      <div className="max-w-247 mx-auto flex flex-col gap-8">
        <div className="bg-linear-to-r from-(--blueGradientStart) to-(--blueGradientEnd) p-6 rounded-[10px] flex items-center gap-3">
          <div className="shrink-0 w-8 h-8">
            <WelcomeTrophyIcon />
          </div>
          <div>
            <p className="font-bold text-2xl leading-8 text-(--whiteColor)">Teacher portal</p>
            <p className="font-normal text-base leading-6 text-(--blueLight) mt-1">Welcome</p>
          </div>
        </div>

        <div>
          <p className="font-semibold text-lg text-(--blackSoft) mb-4">Your courses</p>
          {courses.map((course) => (
            <Card key={course.id} className="mb-4">
              <div className="p-4">{course.title}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
