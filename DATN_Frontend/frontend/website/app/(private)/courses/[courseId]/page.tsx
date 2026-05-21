'use client'

import { Card, Button } from 'antd'
import { ArrowLeftOutlined, ClockCircleOutlined, LockOutlined } from '@ant-design/icons'
import { use, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createGetKey } from '@/lib/i18/getKey'
import { CheckCircleIcon } from '../../_icons/CheckCircleIcon'
import { PlayCircleIcon } from '../../_icons/PlayCircleIcon'
import { useTranslations } from 'next-intl'

type Lesson = {
  id: number
  title: string
  duration: string
  locked: boolean
}

type CourseData = {
  title: string
  lessons: Lesson[]
}

const courseData: Record<string, CourseData> = {
  '1': {
    title: 'Phong Thủy Cơ Bản',
    lessons: [
      { id: 1, title: 'Bài 1: Giới thiệu về Phong Thủy', duration: '15:30', locked: true },
      { id: 2, title: 'Bài 2: Âm Dương và Ngũ Hành', duration: '22:45', locked: true },
      { id: 3, title: 'Bài 3: Bát Quái và ý nghĩa', duration: '18:20', locked: false },
    ],
  },
  '2': {
    title: 'Phong Thủy Nhà Ở',
    lessons: [
      { id: 1, title: 'Bài 1: Nguyên tắc bố trí không gian', duration: '20:10', locked: true },
      { id: 2, title: 'Bài 2: Phòng khách và phòng ngủ', duration: '25:00', locked: true },
      { id: 3, title: 'Bài 3: Bếp và phòng tắm', duration: '17:45', locked: false },
    ],
  },
}

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params)
  const router = useRouter()
  const t = useTranslations('CoursePage')
  const getKey = createGetKey('CoursePage')
  const course = courseData[courseId] ?? courseData['1']
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  return (
    <div className="min-h-screen bg-(--grayLightest) px-4 pt-6 pb-8">
      <div className="max-w-248 mx-auto">

        {/* Back button */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          className="mb-6 px-0 font-medium text-base text-(--blackSoft) hover:underline hover:bg-transparent"
        >
          {t(getKey('backButton'))}
        </Button>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-[309px_1fr] gap-6 items-start">

          {/* Left: lesson list */}
          <Card className="rounded-[10px] border border-(--grayBorder)" styles={{ body: { padding: 24 } }}>
            <p className="mb-1.5 block text-lg font-bold tracking-tight text-(--blackSoft)">{course.title}</p>
            <p className="mb-4 block text-sm text-(--grayDark)">
              {course.lessons.length} {t(getKey('lessonCountUnit'))}
            </p>

            <div className="flex flex-col gap-2">
              {course.lessons.map((lesson) => {
                const isSelected = selectedLesson?.id === lesson.id
                return (
                  <div
                    key={lesson.id}
                    onClick={() => !lesson.locked && setSelectedLesson(lesson)}
                    className={[
                      'flex h-[107px] items-center justify-between rounded-[10px] border px-4 transition-all duration-150',
                      isSelected ? 'border-(--blueMedium) bg-(--blueLightest)' : 'border-(--blackBorder) bg-transparent',
                      lesson.locked ? 'cursor-default opacity-50' : 'cursor-pointer',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Check icon */}
                      <div className="w-9 h-9 rounded-full bg-(--greenLight) flex items-center justify-center shrink-0">
                        <CheckCircleIcon />
                      </div>

                      {/* Lesson info */}
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-lg font-medium leading-7 text-(--blackSoft)">
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <ClockCircleOutlined className="text-xs text-(--grayDark)" />
                          <span className="text-sm text-(--grayDark)">{lesson.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Lock indicator */}
                    {lesson.locked && (
                      <div className="flex flex-col items-center shrink-0 ml-2">
                        <LockOutlined className="text-xs text-(--redBright)" />
                        <span className="text-xs text-(--redBright) text-center leading-4">
                          {t(getKey('lockedLabel'))}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Right: video player */}
          <Card className="min-h-[237px] rounded-[10px] border border-(--grayBorder)" styles={{ body: { padding: 24, height: '100%' } }}>
            {selectedLesson ? (
              <div className="flex flex-col gap-4 h-full">
                <p className="text-xl font-bold leading-7 text-(--blackSoft)">{selectedLesson.title}</p>
                <div className="aspect-video w-full rounded-[10px] bg-(--grayBorder)" />
                <div className="flex justify-end">
                  <Button type="primary" className="h-10 rounded-lg text-base font-medium">
                    {t(getKey('completeVideoButton'))}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
                <PlayCircleIcon />
                <div className="text-center">
                  <p className="font-medium text-lg text-(--navyDark) leading-7">
                    {t(getKey('selectLessonTitle'))}
                  </p>
                  <p className="text-base text-(--grayDark) mt-1">
                    {t(getKey('selectLessonSubtitle'))}
                  </p>
                </div>
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  )
}
