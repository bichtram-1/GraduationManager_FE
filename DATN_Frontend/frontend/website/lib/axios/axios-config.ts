import { STORAGES } from '@/lib/constants/storage';
import { getCookie } from '@/lib/utils/cookie';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  let token: string | undefined

  if (typeof window === 'undefined') {
    // server-side only: dynamic import để bundler không include "next/headers" trong client bundle
    const { cookies } = await import('next/headers')
    token = await cookies().then(res => res.get(STORAGES.ACCESS_TOKEN)?.value)
  } else {
    // client-side
    token = getCookie(STORAGES.ACCESS_TOKEN)
  }

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// let isRefreshing = false;
// let failedQueue: unknown[] = [];

// const processQueue = (error: unknown, token: string | null = null) => {
//   failedQueue.forEach((prom) => {
//     if (token) {
//       prom.resolve(token);
//     } else {
//       prom.reject(error);
//     }
//   });
//   failedQueue = [];
// };

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async function (error) {
//     if (error?.response?.status === API_STATUS.UNAUTHORIZED) {
//       if (error?.response?.data?.path === '/api/public/v1/auth/refresh-token') {
//         return clearCookieLogout();
//       }
//       const originalRequest = error.config;

//       const refreshToken = getCookie(STORAGES.REFRESH_TOKEN);
//       if (!refreshToken) {
//         return clearCookieLogout();
//       }
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers['Authorization'] = `Bearer ${token}`;
//             return axiosInstance(originalRequest);
//           })
//           .catch((err) => {
//             Promise.reject(err);
//           });
//       }

//       isRefreshing = true;
//       try {
//         const response = await tokenApi.refreshToken(refreshToken);
//         const data: ApiResponse<LoginResponse> = response.data;
//         setCookieLogin(
//           data?.results?.object?.access_token,
//           data?.results?.object?.refresh_token,
//           data?.results?.object?.user,
//         );

//         processQueue(null, data.results.object.access_token);
//         // originalRequest.headers['Authorization'] = `Bearer ${data.results.object.access_token}`;
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         clearCookieLogout();
//         window.location.href = ROUTE.LOGIN;
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }
//     return Promise.reject(error);
//   },
axiosInstance.interceptors.response.use(
  (response) => response,
  async function (error) {
    if (error?.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const currentToken = getCookie(STORAGES.ACCESS_TOKEN);
        const headers = error.config?.headers;
        let authHeader: string | undefined;

        if (headers) {
          if (typeof headers.get === 'function') {
            authHeader = headers.get('Authorization') || headers.get('authorization');
          } else {
            authHeader = headers.Authorization || headers.authorization || headers['Authorization'] || headers['authorization'];
          }
        }

        const requestToken = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : '';

        if (currentToken !== requestToken) {
          // Token in cookie is different/newer/cleared (e.g. login action in another tab).
          // Do not logout! Just redirect this tab to '/' to be routed correctly.
          window.location.href = '/';
        } else {
          // Token is the same or empty, meaning the session is truly invalid.
          window.location.href = '/api/logout?from=/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
