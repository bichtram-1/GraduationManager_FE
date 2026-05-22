'use client'

import React from 'react'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-blue-500 text-white flex items-center justify-center">GV</div>
            <div>
              <div className="font-semibold">Cổng giảng viên</div>
              <div className="text-xs text-gray-500">TTTN & ĐATN</div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto flex gap-2 p-3">
          <a className="px-3 py-2 rounded text-sm hover:bg-gray-100" href="/teacher">Home</a>
          <a className="px-3 py-2 rounded text-sm hover:bg-gray-100" href="/teacher/students">Students</a>
          <a className="px-3 py-2 rounded text-sm hover:bg-gray-100" href="/teacher/grading">Grading</a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  )
}
