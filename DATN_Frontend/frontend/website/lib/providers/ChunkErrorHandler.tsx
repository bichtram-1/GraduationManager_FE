'use client'

import { useEffect } from 'react'

/**
 * Sau khi deploy bản mới lên Vercel, Next.js đổi tên các file chunk theo build ID —
 * tab đang mở từ trước lúc deploy vẫn giữ chunk map cũ, nên khi chuyển trang (không F5)
 * sẽ cố tải đúng file chunk cũ đã bị xóa khỏi server, gây lỗi "ChunkLoadError" /
 * "Failed to fetch dynamically imported module". Tự reload lại trang 1 lần khi gặp lỗi
 * này để lấy bản mới nhất — chỉ reload 1 lần/phiên (sessionStorage) để tránh lặp F5 vô
 * hạn nếu lỗi là thật (server sập...) chứ không phải do bản build cũ.
 */
const CHUNK_ERROR_PATTERN = /ChunkLoadError|Loading chunk .* failed|Failed to fetch dynamically imported module/i

export default function ChunkErrorHandler() {
  useEffect(() => {
    const flagKey = 'chunk-error-reloaded'

    const reloadOnce = () => {
      if (sessionStorage.getItem(flagKey)) return
      sessionStorage.setItem(flagKey, '1')
      window.location.reload()
    }

    const handleError = (event: ErrorEvent) => {
      if (CHUNK_ERROR_PATTERN.test(event.message || '')) {
        reloadOnce()
      }
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const message = typeof reason === 'string' ? reason : reason?.message || ''
      if (CHUNK_ERROR_PATTERN.test(message)) {
        reloadOnce()
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
