"use client"

import Link from 'next/link'
import { FileText, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { StudentPill, StudentSectionHeader } from '../_components/StudentShell'

type Topic = { id: string; title: string; module: string; published: boolean }

export default function ThesisRegisterPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [registered, setRegistered] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await fetch('/api/mock/teacher/topics')
        const json = await res.json()
        if (!mounted) return
        setTopics(json.topics ?? [])
      } catch (err) {
        setTopics([])
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleRegister = (id: string) => {
    setRegistered((s) => ({ ...s, [id]: true }))
  }

  const handleCancel = (id: string) => {
    setRegistered((s) => ({ ...s, [id]: false }))
  }

  return (
    <>
      <StudentSectionHeader
        title="Đăng ký ĐATN"
        description="Chọn đề tài bạn muốn đăng ký hoặc chuyển sang tạo nhóm nếu cần mời thành viên."
      />

      <section className="rounded-[12px] p-1">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Đang tải danh sách đề tài…</div>
        ) : topics.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">Không có đề tài nào.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {topics.map((t) => {
              const teacher = t.module ? `GV: ${t.module}` : 'GV: TS. Nguyễn Văn X'
              const maxSlots = 4
              const used = 0
              const hasSlot = used < maxSlots && t.published
              return (
                <div key={t.id} className="rounded-[18px] border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <a className="text-[#2196F3] font-medium text-sm">{t.id}</a>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">{t.title}</h3>
                      <div className="mt-2 text-xs text-slate-500">{teacher} • Số thành viên tối đa: {maxSlots}</div>
                    </div>
                    <div>
                      <div className={`rounded-full px-3 py-1 text-xs font-medium ${hasSlot ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {hasSlot ? 'Còn slot' : 'Hết slot'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <button className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Xem chi tiết</button>
                    {!registered[t.id] ? (
                      <button onClick={() => handleRegister(t.id)} className="flex-1 rounded-2xl bg-[#2196F3] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1976D2]">Đăng ký</button>
                    ) : (
                      <button onClick={() => handleCancel(t.id)} className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy đăng ký</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
