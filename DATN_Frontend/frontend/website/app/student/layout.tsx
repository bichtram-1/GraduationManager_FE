'use client'

import React from 'react'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <header className="bg-gradient-to-r from-[#1976D2] via-[#2196F3] to-[#42A5F5] text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center">SV</div>
            <div>
              <div className="font-semibold">Cổng sinh viên</div>
              <div className="text-xs opacity-90">TTTN & ĐATN • UIT</div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto p-3 flex gap-2">
          <a className="px-3 py-2 rounded text-sm hover:bg-gray-50" href="/student">Home</a>
          <a className="px-3 py-2 rounded text-sm hover:bg-gray-50" href="/student/internship">Đăng ký TTTN</a>
          <a className="px-3 py-2 rounded text-sm hover:bg-gray-50" href="/student/reports">Báo cáo</a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  )
}
