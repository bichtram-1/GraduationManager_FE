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
