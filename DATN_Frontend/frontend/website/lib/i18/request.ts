import ViMessages from './messages/vi';
import { getRequestConfig } from 'next-intl/server';

const DEFAULT_LOCALE = 'vi';

// Hệ thống chỉ hỗ trợ 1 locale (vi) nên không cần đọc cookie mỗi request để chọn locale —
// đọc cookie() ở đây từng khiến toàn bộ route bị ép render dynamic (không thể cache/prerender)
// dù kết quả luôn là 'vi' bất kể cookie chứa gì.
export default getRequestConfig(async () => {
  return {
    locale: DEFAULT_LOCALE,
    messages: ViMessages,
  };
});
