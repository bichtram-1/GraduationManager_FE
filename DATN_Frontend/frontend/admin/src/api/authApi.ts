import { DataLoginType, DataLogoutType, UserLoginType } from '../type/UserLoginType';
import { DetailResponseType } from '@shared/types/GeneralType';
import axiosInstance from './axiosInstance';

interface IBackendLoginData {
  success?: boolean;
  data?: {
    access_token?: string;
    refresh_token?: string;
    role?: string;
    user?: {
      giang_vien_id?: number | string;
      sinh_vien_id?: number | string;
      ho_ten?: string;
      email?: string;
    };
  };
}

const mapLoginResponse = (resData: unknown): DetailResponseType<UserLoginType> => {
  const data = resData as IBackendLoginData | null;
  if (data?.success && data?.data) {
    const backendData = data.data;
    let mappedRole = 'student';
    if (backendData.role === 'ADMIN') {
      mappedRole = 'admin';
    } else if (backendData.role === 'GIANG_VIEN') {
      mappedRole = 'teacher';
    }

    return {
      code: 200,
      results: {
        object: {
          access_token: backendData.access_token ?? '',
          refresh_token: backendData.refresh_token,
          user: {
            id: String(backendData.user?.giang_vien_id || backendData.user?.sinh_vien_id || 'u-unknown'),
            name: backendData.user?.ho_ten || 'Người dùng',
            email: backendData.user?.email || '',
            role: mappedRole,
          } as unknown as import('../type/UserType').IDetailUser,
        },
      },
    } as DetailResponseType<UserLoginType>;
  }

  return resData as DetailResponseType<UserLoginType>;
};

export const authApi = {
  signIn: async (body: DataLoginType) => {
    const response = await axiosInstance.post('/api/dang-nhap-gia-lap', body);
    return mapLoginResponse(response?.data);
  },
  signInWithGoogle: async (credential: string) => {
    const response = await axiosInstance.post('/api/dang-nhap-google', { credential });
    return mapLoginResponse(response?.data);
  },
  signOut: async (body: DataLogoutType) => {
    return await axiosInstance.post('/api/dang-xuat', body);
  },
  refreshToken(data: { refreshToken: string }) {
    return axiosInstance.post('/api/lam-moi-token', data);
  },
};
