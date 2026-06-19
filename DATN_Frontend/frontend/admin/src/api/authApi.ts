import { DataLoginType, DataLogoutType } from '../type/UserLoginType';
import { IEmptyResponse, ISignInResponse } from '../type/AuthType';
import axiosInstance from './axiosInstance';

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
const MOCK_DELAY = 400;

export const authApi = {
  signIn: async (body: DataLoginType) => {
    if (USE_MOCK_AUTH) {
      await new Promise((r) => setTimeout(r, MOCK_DELAY));
      return {
        results: {
          object: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            user: {
              id: 'u-mock-1',
              full_name: 'Admin Mock',
              email: body?.email ?? 'admin@local',
              role: 'admin',
            },
          },
        },
      } as ISignInResponse;
    }

    const response = await axiosInstance.post('/api/dang-nhap-gia-lap', body);
    const resData = response?.data;

    if (resData?.success && resData?.data) {
      const backendData = resData.data;
      let mappedRole = 'student';
      if (backendData.role === 'ADMIN') {
        mappedRole = 'admin';
      } else if (backendData.role === 'GIANG_VIEN') {
        mappedRole = 'teacher';
      }

      return {
        results: {
          object: {
            accessToken: backendData.access_token,
            refreshToken: backendData.refresh_token,
            user: {
              id: String(backendData.user?.giang_vien_id || backendData.user?.sinh_vien_id || 'u-unknown'),
              full_name: backendData.user?.ho_ten || 'Người dùng',
              email: backendData.user?.email,
              role: mappedRole,
            },
          },
        },
      } as ISignInResponse;
    }

    return resData;
  },
  signOut: async (body: DataLogoutType) => {
    if (USE_MOCK_AUTH) {
      await new Promise((r) => setTimeout(r, MOCK_DELAY));
      return { results: {} } as IEmptyResponse;
    }
    return await axiosInstance.post('/api/dang-xuat', body);
  },
  refreshToken(data: { refreshToken: string }) {
    if (USE_MOCK_AUTH) {
      return Promise.resolve({ results: { object: { accessToken: 'mock-access-token-new', refreshToken: 'mock-refresh-token' } } } as ISignInResponse);
    }
    return axiosInstance.post('/api/lam-moi-token', data);
  },
};
