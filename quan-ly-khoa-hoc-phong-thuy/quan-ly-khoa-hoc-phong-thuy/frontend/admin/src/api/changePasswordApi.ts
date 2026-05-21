import { ChangePasswordPayload } from '@shared/types/ChangePasswordType';
import axiosInstance from './axiosInstance';

export const changePasswordApi = {
  verifyEmail: async (body: { email: string }) => {
    return await axiosInstance.post('/public/v1/auth/forgot-password/request-verify', body);
  },

  verifyOtp: async (body: { email: string; code: string }) => {
    const response = await axiosInstance.post('/public/v1/auth/forgot-password/verify', body);
    return response.data;
  },
  changePassword: async (body: ChangePasswordPayload) => {
    const response = await axiosInstance.post('/public/v1/auth/forgot-password/reset', body);
    return response.data;
  },
}
