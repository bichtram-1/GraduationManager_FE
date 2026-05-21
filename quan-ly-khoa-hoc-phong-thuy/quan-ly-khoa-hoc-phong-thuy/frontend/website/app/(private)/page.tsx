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
  {
    id: 2,
    nameKey: 'achievementExpertName',
    status: ACHIEVEMENT_STATUS.CURRENT as AchievementStatusType,
    descriptionKey: 'achievementNeedTwoCourses',
    currentCount: 2,
    targetCount: 2,
  },
  {
    id: 3,
    nameKey: 'achievementMasterName',
    status: ACHIEVEMENT_STATUS.PENDING as AchievementStatusType,
    descriptionKey: 'achievementNeedThreeCourses',
    currentCount: 2,
    targetCount: 3,
    remainingCourses: 1,
  },
]

const courses = [
  {
    id: 1,
    title: 'Phong Thủy Cơ Bản',
    description: 'Khóa học giới thiệu các kiến thức nền tảng về phong thủy, bao gồm âm dương ngũ hành, bát quái và cách bố trí không gian sống hợp lý.',
    progress: 100,
    totalLessons: 3,
    completedLessons: 3,
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    id: 2,
    title: 'Phong Thủy Nhà Ở',
    description: 'Học cách áp dụng phong thủy vào thiết kế và bố trí nhà ở để mang lại vận khí tốt cho gia đình.',
    progress: 100,
    totalLessons: 3,
    completedLessons: 3,
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
  },
]

// Card border + background colors mapped per achievement status
const achievementCardClassByStatus: Record<AchievementStatusType, string> = {
  [ACHIEVEMENT_STATUS.COMPLETED]: 'border-(--greenMedium) bg-(--greenPale)',
  [ACHIEVEMENT_STATUS.CURRENT]: 'border-(--yellowGold) bg-(--yellowPale)',
  [ACHIEVEMENT_STATUS.PENDING]: 'border-(--grayBorder) bg-(--grayLightest)',
}

const achievementIconClassByStatus: Record<AchievementStatusType, string> = {
  [ACHIEVEMENT_STATUS.COMPLETED]: 'bg-(--greenMedium)',
  [ACHIEVEMENT_STATUS.CURRENT]: 'bg-(--yellowGold)',
  [ACHIEVEMENT_STATUS.PENDING]: 'bg-(--grayBorder)',
}

const achievementNameClassByStatus: Record<AchievementStatusType, string> = {
  [ACHIEVEMENT_STATUS.COMPLETED]: 'text-(--greenMedium)',
  [ACHIEVEMENT_STATUS.CURRENT]: 'text-(--yellowDark)',
  [ACHIEVEMENT_STATUS.PENDING]: 'text-(--grayMedium)',
}

export default function Page() {
  const router = useRouter()
  const t = useTranslations('HomePage')
  const getKey = createGetKey('HomePage')
  const [showActivate, setShowActivate] = useState(false)
  const [activateCode, setActivateCode] = useState('')

  return (
    <div className="bg-(--grayLightest) min-h-screen px-4 py-8">
      <div className="max-w-247 mx-auto flex flex-col gap-8">

        {/* Welcome Banner */}
        <div className="bg-linear-to-r from-(--blueGradientStart) to-(--blueGradientEnd) p-6 rounded-[10px] flex items-center gap-3">
          <div className="shrink-0 w-8 h-8">
            <WelcomeTrophyIcon />
          </div>
          <div>
            <p className="font-bold text-2xl leading-8 text-(--whiteColor)">
              {t(getKey('welcomeTitle'), { name: '' })}
            </p>
            <p className="font-normal text-base leading-6 text-(--blueLight) mt-1">
              {t(getKey('welcomeSubtitle'))}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            onClick={() => router.push('/stats')}
            className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)] cursor-pointer"
            styles={{ body: { padding: 24 } }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[10px] flex items-center justify-center bg-(--blueLightest)">
                <StatsBarChartIcon />
              </div>
              <div>
                <p className="font-semibold text-base text-(--blackSoft)">
                  {t(getKey('statsTitle'))}
                </p>
                <p className="text-sm text-(--grayMedium) mt-0.5">
                  {t(getKey('statsSubtitle'))}
                </p>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => setShowActivate(!showActivate)}
            className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)] cursor-pointer"
            styles={{ body: { padding: 24 } }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[10px] flex items-center justify-center bg-(--greenPale)">
                <ActivateKeyIcon />
              </div>
              <div>
                <p className="font-semibold text-base text-(--blackSoft)">
                  {t(getKey('activateTitle'))}
                </p>
                <p className="text-sm text-(--grayMedium) mt-0.5">
                  {t(getKey('activateSubtitle'))}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Activate Code Section */}
        {showActivate && (
          <Card className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]" styles={{ body: { padding: 24 } }}>
            <p className="font-semibold text-lg text-(--blackSoft) mb-2">
              {t(getKey('activateTitle'))}
            </p>
            <p className="text-(--grayMedium) mb-4">
              {t(getKey('activateDescription'))}
            </p>
            <div className="flex gap-2">
              <Input
                placeholder={t(getKey('activatePlaceholder'))}
                value={activateCode}
                onChange={(e) => setActivateCode(e.target.value)}
                className="flex-1"
              />
              <Button type="primary" className="h-10 rounded-lg font-medium">
                {t(getKey('activateButton'))}
              </Button>
            </div>
          </Card>
        )}

        {/* Achievement Section */}
        <Card className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]" styles={{ body: { padding: 24 } }}>
          <div className="flex items-center gap-2 mb-2">
            <AchievementTrophyIcon />
            <p className="font-semibold text-lg text-(--blackSoft)">
              {t(getKey('rankingTitle'))}
            </p>
          </div>
          <p className="text-base text-(--grayMedium) mb-4">
            {t(getKey('rankingSubtitle'))}
          </p>

          <div className="flex flex-col gap-3">
            {achievements.map((item) => {
              const completedLabel = `${formatNumber(item.currentCount)}/${formatNumber(item.targetCount)}`
              return (
                <div
                  key={item.id}
                  className={`flex justify-between items-center p-4 rounded-[10px] border ${achievementCardClassByStatus[item.status]}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievementIconClassByStatus[item.status]}`}>
                      <AchievementMedalIcon />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-base ${achievementNameClassByStatus[item.status]}`}>
                          {t(getKey(item.nameKey as Parameters<typeof getKey>[0]))}
                        </p>
                        {item.status === ACHIEVEMENT_STATUS.COMPLETED && (
                          <Tag color="green">{t(getKey('achievementCompleted'))}</Tag>
                        )}
                        {item.status === ACHIEVEMENT_STATUS.CURRENT && (
                          <Tag color="gold">{t(getKey('achievementCurrent'))}</Tag>
                        )}
                      </div>
                      <p className="text-sm text-(--grayDark) mt-0.5">
                        {t(getKey(item.descriptionKey as Parameters<typeof getKey>[0]))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base text-(--blackSoft)">
                      {completedLabel}
                    </p>
                    {item.remainingCourses != null && (
                      <span className="text-xs text-(--grayMedium)">
                        {t(getKey('achievementRemaining'), { count: formatNumber(item.remainingCourses) })}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Courses Section */}
        <div>
          <p className="font-semibold text-lg text-(--blackSoft) mb-4">
            {t(getKey('yourCoursesTitle'))}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <Card
                key={course.id}
                onClick={() => router.push(`/courses/${course.id}`)}
                className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)] overflow-hidden cursor-pointer"
                styles={{ body: { padding: 0 } }}
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 flex flex-col gap-3">
                  <p className="font-semibold text-base text-(--blackSoft) truncate">
                    {course.title}
                  </p>
                  <p className="text-sm text-(--grayDark) line-clamp-2">
                    {course.description}
                  </p>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-(--grayDark)">
                        {t(getKey('progressLabel'))}
                      </span>
                      <span className="text-sm font-medium text-(--blackSoft)">
                        {formatNumber(course.progress)}%
                      </span>
                    </div>
                    <Progress percent={course.progress} showInfo={false} />
                  </div>
                  <Button
                    type="primary"
                    className="h-10 rounded-lg font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t(getKey('completeLabel'))}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
