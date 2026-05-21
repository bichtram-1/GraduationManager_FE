import { STORAGES } from '@shared/constants/storage';
import { clearCookie, getCookie } from '@shared/utils/cookie';
import axios from 'axios';
import { ROUTES } from '../constants/routers';

const BASE_URL = import.meta.env.VITE_API_URL;
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
const MOCK_DELAY = 600;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return;
        }

        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item !== undefined && item !== null && item !== '') {
              searchParams.append(key, String(item));
            }
          });
        } else {
          searchParams.append(key, String(value));
        }
      });

      return searchParams.toString();
    },
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie(STORAGES.ACCESS_TOKEN);
    const publicUrl = config?.url?.includes('/auth');
    if (token && !publicUrl) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      handleLogoutFunction();
    }
    return Promise.reject(error);
  }
);

export const handleLogoutFunction = () => {
  const USER_LOGIN = getCookie(STORAGES.USER_LOGIN);

  if (!USER_LOGIN?.is_save) {
    clearCookie(STORAGES.USER_LOGIN);
  }
  clearCookie(STORAGES.ACCESS_TOKEN);
  clearCookie(STORAGES.REFRESH_TOKEN);
  window.location.href = ROUTES.LOGIN;
  return;
};
export default axiosInstance;

// Attach simple mock handlers when running in dev with mock flag
if (USE_MOCK_AUTH) {
  const originalRequest = (axiosInstance as any).request.bind(axiosInstance);
  (axiosInstance as any).request = async (config: any) => {
    const url: string = config?.url ?? '';
    const method: string = (config?.method ?? 'get').toLowerCase();

    // Mock sign-in
    if (url.includes('/v1/auth/login') && method === 'post') {
      await new Promise((r) => setTimeout(r, MOCK_DELAY));
      const body = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};
      return {
        data: {
          results: {
            object: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
              user: {
                id: 'u-mock-1',
                full_name: 'Admin Mock',
                email: body?.email ?? 'admin@caothang.edu.vn',
                role: 'admin',
              },
            },
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // Mock logout
    if (url.includes('/v1/auth/logout') && method === 'post') {
      await new Promise((r) => setTimeout(r, MOCK_DELAY));
      return { data: { results: {} }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // Mock refresh token
    if (url.includes('/v1/auth/refresh-token') && method === 'post') {
      await new Promise((r) => setTimeout(r, MOCK_DELAY));
      return {
        data: { results: { object: { accessToken: 'mock-access-token-new', refreshToken: 'mock-refresh-token' } } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // Mock users list and detail endpoints
    if (url.includes('/private/v1/users') && method === 'get') {
      await new Promise((r) => setTimeout(r, MOCK_DELAY));
      // simple mock list
      const mockRows = [
        { id: '20520001', name: 'Nguyễn Văn A', email: '20520001@gm.uit.edu.vn', className: 'KTPM2020', phone: '0901234567', status: 'active' },
        { id: '20520002', name: 'Trần Thị B', email: '20520002@gm.uit.edu.vn', className: 'CNPM2020', phone: '0909111222', status: 'active' },
        { id: '20520003', name: 'Lê Văn C', email: '20520003@gm.uit.edu.vn', className: 'KTPM2020', phone: '0933444555', status: 'inactive' },
        { id: '20520004', name: 'Phạm Thị D', email: '20520004@gm.uit.edu.vn', className: 'HTTT2020', phone: '0911222333', status: 'active' },
      ];
      return {
        data: { results: { objects: { rows: mockRows, total: mockRows.length } } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    if (url.match(/\/private\/v1\/users\/[^/]+/) && method === 'get') {
      await new Promise((r) => setTimeout(r, MOCK_DELAY));
      const id = url.split('/').pop();
      return {
        data: { results: { object: { id, name: `User ${id}`, email: `${id}@example.com`, status: 'active' } } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    return originalRequest(config);
  };
}
