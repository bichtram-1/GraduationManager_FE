import type { ReactNode } from 'react'
import { StudentShell } from './_components/StudentShell'

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <StudentShell>{children}</StudentShell>
}
