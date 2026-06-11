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

    const response = await axiosInstance.post('/v1/auth/login', body);
    return response?.data;
  },
  signOut: async (body: DataLogoutType) => {
    if (USE_MOCK_AUTH) {
      await new Promise((r) => setTimeout(r, MOCK_DELAY));
      return { results: {} } as IEmptyResponse;
    }
    return await axiosInstance.post('/v1/auth/logout', body);
  },
  refreshToken(data: { refreshToken: string }) {
    if (USE_MOCK_AUTH) {
      return Promise.resolve({ results: { object: { accessToken: 'mock-access-token-new', refreshToken: 'mock-refresh-token' } } } as ISignInResponse);
    }
    return axiosInstance.post('/v1/auth/refresh-token', data);
  },
};
