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
// let failedQueue: any[] = [];

// const processQueue = (error: any, token: string | null = null) => {
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
// );

export default axiosInstance;
