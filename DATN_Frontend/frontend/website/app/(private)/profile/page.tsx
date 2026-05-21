'use client'

import { Card, Button, Progress, Input } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { formatNumber } from '@shared/utils/numberUtils'
import { createGetKey } from '@/lib/i18/getKey'

const courses = [
  {
    id: 1,
    title: 'Phong Thủy Cơ Bản',
    description: 'Khóa học giới thiệu các kiến thức nền tảng về phong thủy, bao gồm âm dương ngũ hành, bát quái và cách bố trí không gian sống hợp lý.',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    lessons: [1, 2, 3],
    progress: 100,
  },
  {
    id: 2,
    title: 'Phong Thủy Nhà Ở',
    description: 'Học cách áp dụng phong thủy vào thiết kế và bố trí nhà ở để mang lại vận khí tốt cho gia đình.',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    lessons: [1, 2, 3],
    progress: 100,
  },
]

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

        {/* Back button */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          className="text-(--blackSoft) font-medium text-base px-0 mb-6 hover:bg-transparent hover:underline"
        >
          {t(getKey('backButton'))}
        </Button>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-[308px_1fr] gap-6 items-start">

          {/* Left column */}
          <div className="flex flex-col gap-6">

            {/* Personal Info Card */}
            <Card className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]" styles={{ body: { padding: 24 } }}>
              <p className="font-semibold text-lg tracking-tight text-(--blackSoft) mb-4">
                {t(getKey('personalInfoTitle'))}
              </p>

              {!editingInfo ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full bg-(--blueLight) flex items-center justify-center">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                      <path d="M13.33 74.67C13.33 57.1 25.1 42.67 40 42.67s26.67 14.43 26.67 32" stroke="var(--primaryBlue)" strokeWidth="6.667" strokeLinecap="round" />
                      <circle cx="40" cy="23.33" r="13.33" stroke="var(--primaryBlue)" strokeWidth="6.667" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-lg text-(--blackSoft) text-center">{name}</p>
                    <p className="text-(--grayMedium) mt-0.5 text-center">user1@gmail.com</p>
                  </div>
                  <Button
                    block
                    onClick={() => setEditingInfo(true)}
                    className="border border-(--grayBorderMedium) rounded-lg text-(--blackSoft) font-medium text-sm h-10"
                  >
                    {t(getKey('editButton'))}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center">
                    <div className="relative w-32 h-32">
                      <div className="w-32 h-32 rounded-full bg-(--blueLight) flex items-center justify-center">
                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                          <path d="M13.33 74.67C13.33 57.1 25.1 42.67 40 42.67s26.67 14.43 26.67 32" stroke="var(--primaryBlue)" strokeWidth="6.667" strokeLinecap="round" />
                          <circle cx="40" cy="23.33" r="13.33" stroke="var(--primaryBlue)" strokeWidth="6.667" />
                        </svg>
                      </div>
                      <div className="absolute bottom-0 right-0 w-9 h-8 bg-(--primaryBlue) rounded-full flex items-center justify-center cursor-pointer">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M1.5 9.5V10.5H10.5V9.5" stroke="var(--whiteColor)" strokeWidth="1" strokeLinecap="round" />
                          <path d="M6 7.5V1.5M6 1.5L3.5 4M6 1.5L8.5 4" stroke="var(--whiteColor)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-sm text-(--blackSoft) mb-1.5">{t(getKey('fullNameLabel'))}</p>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div>
                    <p className="font-medium text-sm text-(--blackSoft) mb-1.5">{t(getKey('emailLabel'))}</p>
                    <Input value="user1@gmail.com" disabled />
                    <span className="block text-(--grayMedium) mt-1">
                      {t(getKey('emailCannotChange'))}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button type="primary" className="flex-1 rounded-lg font-medium text-base h-10">{t(getKey('saveButton'))}</Button>
                    <Button onClick={() => setEditingInfo(false)} className="flex-1 rounded-lg font-medium text-base h-10">{t(getKey('cancelButton'))}</Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Stats Overview Card */}
            <Card className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]" styles={{ body: { padding: 24 } }}>
              <p className="font-semibold text-lg tracking-tight text-(--blackSoft) mb-4">
                {t(getKey('statsOverviewTitle'))}
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-3 h-12 rounded-[10px] bg-(--blueLightest)">
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="2" y="3" width="7" height="14" rx="1" stroke="var(--primaryBlue)" strokeWidth="1.667" />
                      <rect x="11" y="3" width="7" height="14" rx="1" stroke="var(--primaryBlue)" strokeWidth="1.667" />
                      <path d="M9 10h2" stroke="var(--primaryBlue)" strokeWidth="1.667" strokeLinecap="round" />
                    </svg>
                    <p className="text-sm text-(--blackSoft)">{t(getKey('coursesLabel'))}</p>
                  </div>
                  <p className="font-bold text-base text-(--primaryBlue)">{formatNumber(2)}</p>
                </div>

                <div className="flex justify-between items-center px-3 h-12 rounded-[10px] bg-(--greenPale)">
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="7.5" stroke="var(--greenMedium)" strokeWidth="1.667" />
                      <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="var(--greenMedium)" strokeWidth="1.667" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm text-(--blackSoft)">{t(getKey('completedLabel'))}</p>
                  </div>
                  <p className="font-bold text-base text-(--greenMedium)">{formatNumber(6)}/{formatNumber(6)}</p>
                </div>

                <div className="flex justify-between items-center px-3 h-12 rounded-[10px] bg-(--orangePale)">
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2.5 12.5l5-5 3.5 3.5 5-6.5" stroke="var(--orangeBright)" strokeWidth="1.667" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M13.5 4.5H17.5V8.5" stroke="var(--orangeBright)" strokeWidth="1.667" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm text-(--blackSoft)">{t(getKey('inProgressLabel'))}</p>
                  </div>
                  <p className="font-bold text-base text-(--orangeBright)">{formatNumber(0)}</p>
                </div>

                <div className="border-t border-(--blackBorder) pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-(--blackSoft)">{t(getKey('completionProgressLabel'))}</p>
                    <p className="font-bold text-sm text-(--blackSoft)">{formatNumber(100)}%</p>
                  </div>
                  <Progress percent={100} showInfo={false} />
                </div>
              </div>
            </Card>

            {/* Change Password Card */}
            <Card className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]" styles={{ body: { padding: 24 } }}>
              <p className="font-semibold text-lg tracking-tight text-(--blackSoft) mb-4">
                {t(getKey('changePasswordTitle'))}
              </p>

              {!editingPw ? (
                <Button
                  block
                  onClick={() => setEditingPw(true)}
                  className="border border-(--grayBorderMedium) rounded-lg text-(--blackSoft) font-medium text-sm h-10"
                >
                  {t(getKey('changePasswordButton'))}
                </Button>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="font-medium text-sm text-(--blackSoft) mb-1.5">{t(getKey('currentPasswordLabel'))}</p>
                    <Input.Password value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-(--blackSoft) mb-1.5">{t(getKey('newPasswordLabel'))}</p>
                    <Input.Password value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-(--blackSoft) mb-1.5">{t(getKey('confirmNewPasswordLabel'))}</p>
                    <Input.Password value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="primary" className="flex-1 rounded-lg font-medium text-base h-10">{t(getKey('saveButton'))}</Button>
                    <Button onClick={() => setEditingPw(false)} className="flex-1 rounded-lg font-medium text-base h-10">{t(getKey('cancelButton'))}</Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right column */}
          <Card className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]" styles={{ body: { padding: 24 } }}>
            <p className="font-semibold text-lg tracking-tight text-(--blackSoft) mb-1.5">
              {t(getKey('courseProgressTitle'))}
            </p>
            <p className="text-(--grayMedium) mb-6">
              {t(getKey('courseProgressSubtitle'))}
            </p>

            <div className="flex flex-col gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => router.push(`/courses/${course.id}`)}
                  className="border border-(--blackBorder) rounded-[10px] p-6 cursor-pointer"
                >
                  <div className="flex gap-4 items-start">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-24 h-24 object-cover rounded-[10px] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg text-(--blackSoft) leading-7 mb-1 truncate">
                        {course.title}
                      </p>
                      <p className="text-(--grayDark) mb-3 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex justify-between items-center mb-2">
                        <p className="text-(--grayDark)">
                          {formatNumber(course.lessons.length)}/{formatNumber(course.lessons.length)} {t(getKey('lessonUnit'))}
                        </p>
                        <p className="font-medium text-sm text-(--blackSoft)">
                          {formatNumber(course.progress)}%
                        </p>
                      </div>

                      <Progress percent={course.progress} showInfo={false} className="mb-3" />

                      <div className="flex gap-2">
                        {course.lessons.map((lesson) => (
                          <div key={lesson} className="w-8 h-8 rounded-full bg-(--greenBright) flex items-center justify-center">
                            <p className="text-xs font-medium text-(--whiteColor) leading-4">
                              {formatNumber(lesson)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}

export default ProfilePage
