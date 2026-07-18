import { App as AntdApp } from 'antd';
import ReactDOM from 'react-dom/client';
import App from './App';
import LocaleProvider from '@shared/components/provider/LocaleProvider';
import { GlobalVariableProvider } from './hooks/GlobalVariableProvider';
import AppQueryProvider from '@shared/lib/react-query/queryClientProvider';
import '@shared/translation/i18-config';

// Sau khi deploy bản mới, Vite đổi hash tên file cho các trang lazy-load (VD:
// UsersPage-xxx.js) — tab đang mở từ trước lúc deploy vẫn giữ index.html cũ, nên khi
// chuyển trang (không F5) sẽ cố tải đúng file hash cũ đã bị Vercel xóa, gây lỗi
// "Failed to fetch dynamically imported module". Tự reload lại trang 1 lần khi gặp lỗi
// này để lấy index.html mới nhất, người dùng không thấy màn hình lỗi nữa.
// Chỉ reload 1 lần/session (dùng sessionStorage đánh dấu) — tránh lặp F5 vô hạn nếu
// lỗi là thật (server sập...) chứ không phải do bản build cũ.
window.addEventListener('vite:preloadError', () => {
  const flagKey = 'vite-preload-reloaded';
  if (sessionStorage.getItem(flagKey)) return;
  sessionStorage.setItem(flagKey, '1');
  window.location.reload();
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
    <GlobalVariableProvider>
      <LocaleProvider>
        <AntdApp 
          notification={{ 
            maxCount: 1, 
            duration: 3, 
            showProgress: true,
          }}
        >
          <AppQueryProvider>
            <App />
          </AppQueryProvider>
        </AntdApp>
      </LocaleProvider>
    </GlobalVariableProvider>
);
