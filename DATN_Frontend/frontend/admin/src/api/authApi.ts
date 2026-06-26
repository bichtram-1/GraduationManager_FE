import { DataLoginType, DataLogoutType } from '../type/UserLoginType';
import { ISignInResponse } from '../type/AuthType';
import axiosInstance from './axiosInstance';

export const authApi = {
  signIn: async (body: DataLoginType) => {
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
            access_token: backendData.access_token,
            refresh_token: backendData.refresh_token,
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
    return await axiosInstance.post('/api/dang-xuat', body);
  },
  refreshToken(data: { refreshToken: string }) {
    return axiosInstance.post('/api/lam-moi-token', data);
  },
};
