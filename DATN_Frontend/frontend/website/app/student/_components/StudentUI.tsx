'use client'

import type { ReactNode } from 'react'

export function StudentCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] ${className}`}>{children}</div>
}

/**
 * Trạng thái báo cáo TTTN/ĐATN ('Đã duyệt' | 'Chờ duyệt' | 'Đang chấm điểm' | 'Bị từ chối') → tone.
 * Dùng chung cho cả 2 trang Báo cáo TTTN và ĐATN (2 trang có tập trạng thái hơi khác nhau nhưng
 * cùng ý nghĩa: đang chờ xử lý = orange).
 */
export function getReportStatusTone(status: string): 'green' | 'orange' | 'red' | 'slate' {
  if (status === 'Đã duyệt' || status === 'Đã nộp') return 'green'
  if (status === 'Bị từ chối' || status === 'Thiếu') return 'red'
  if (status === 'Chờ duyệt' || status === 'Đang chấm điểm' || status === 'Chưa nộp') return 'orange'
  return 'slate'
}

export function StudentButton({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
  onClick,
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
}) {
  const variants = {
    primary: 'bg-[#2196F3] text-white hover:bg-[#1976D2]',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function StudentField({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <div className="mt-1 text-xs text-red-500 font-medium">{error}</div>
      ) : (
        hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>
      )}
    </div>
  )
}

export function StudentInputClass(extra = '') {
  return `w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white ${extra}`
}

export function StudentToolbar({
  children,
  placeholder = 'Tìm kiếm...',
  value,
  onChange,
}: {
  children?: ReactNode
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-md">
        <input
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className={StudentInputClass('pl-4 pr-4')}
        />
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

export function StudentModal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  closeDisabled,
}: {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  closeDisabled?: boolean
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.3)]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            {description && <div className="text-xs text-slate-500">{description}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Đóng popup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export type StudentTabItem = {
  key: string
  label: string
  count: number
}

export function StudentFilterTabs({
  tabs,
  activeKey,
  onChange,
}: {
  tabs: StudentTabItem[]
  activeKey: string
  onChange: (key: string) => void
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2 rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
      {tabs.map((tab) => {
        const active = activeKey === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`inline-flex items-center gap-2 rounded-[20px] px-4 py-2.5 text-sm font-medium transition ${
              active ? 'bg-[#2196F3] text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{tab.count}</span>
          </button>
        )
      })}
    </div>
  )
}
