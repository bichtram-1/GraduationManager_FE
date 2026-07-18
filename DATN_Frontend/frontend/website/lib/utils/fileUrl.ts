/**
 * Chuẩn hoá URL file trả về từ backend (storage local hoặc URL tuyệt đối) thành URL
 * xem/tải được từ trình duyệt. Nếu URL trỏ vào localhost/127.0.0.1 (dev), thay host bằng
 * NEXT_PUBLIC_API_URL hiện tại để tránh lệch cổng/host giữa các môi trường.
 */
export const getFileUrl = (url: string | null | undefined): string | null => {
  if (!url || url === '—') return null;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  if (url.startsWith('http')) {
    try {
      const urlObj = new URL(url);
      const backendUrlObj = new URL(backendUrl);
      if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
        urlObj.protocol = backendUrlObj.protocol;
        urlObj.host = backendUrlObj.host;
      }
      return urlObj.toString();
    } catch {
      return url;
    }
  }
  return `${backendUrl.replace(/\/$/, '')}/storage/${url}`;
};

// Các định dạng Office trình duyệt không tự render được (Chrome/Firefox chỉ tải về) —
// cần nhúng qua Google Docs Viewer để xem trước ngay trong trang, thay vì phải tải file
// xuống máy mới xem được. PDF/ảnh thì trình duyệt đã tự hiển thị trực tiếp, không cần bọc.
// Dùng cùng dịch vụ (Google Docs Viewer) với bên admin (TopicForm.tsx) để đồng nhất trải
// nghiệm xem file trên toàn hệ thống.
const OFFICE_PREVIEW_EXTENSIONS = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

/**
 * Trả về URL để MỞ XEM TRƯỚC file ngay trên trình duyệt (thay vì tải về hoặc phụ thuộc
 * vào tính năng "mở bằng Office" ẩn của từng trình duyệt — chỉ Edge tự làm được,
 * Chrome/Firefox thì tải file về). Dùng Google Docs Viewer cho các định dạng Word/Excel/
 * PowerPoint; các định dạng khác (PDF, ảnh...) trình duyệt tự xem được nên trả về thẳng
 * URL gốc.
 */
export const getPreviewUrl = (url: string | null | undefined): string | null => {
  const normalized = getFileUrl(url);
  if (!normalized) return null;

  const extension = normalized.split('?')[0].split('.').pop()?.toLowerCase() || '';
  if (OFFICE_PREVIEW_EXTENSIONS.includes(extension)) {
    return `https://docs.google.com/gview?url=${encodeURIComponent(normalized)}&embedded=true`;
  }

  return normalized;
};
