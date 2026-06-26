import { STORAGES } from '@shared/constants/storage';
import { clearCookie, getCookie } from '@shared/utils/cookie';
import axios from 'axios';
import { ROUTES } from '../constants/routers';
const BASE_URL = import.meta.env.VITE_API_URL;

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
