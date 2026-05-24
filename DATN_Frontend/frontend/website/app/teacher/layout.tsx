import type { ReactNode } from 'react'
import { TeacherShell } from './_components/TeacherShell'

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return <TeacherShell>{children}</TeacherShell>
}
