import axiosInstance from './axiosInstance';

export interface IHistoryLog {
  log_id: number;
  sinh_vien_id?: number;
  ma_so_sinh_vien?: string;
  nhom_id?: number;
  role: string;
  user_name: string;
  action_type: string;
  description: string;
  details?: string;
  created_at: string;
}

export const historyApi = {
  getAdminHistory: async (params?: {
    sinh_vien_id?: string;
    ma_so_sinh_vien?: string;
    nhom_id?: string;
    action_type?: string;
    role?: string;
    keyword?: string;
  }): Promise<IHistoryLog[]> => {
    const response = await axiosInstance.get('/private/v1/admin/history', { params });
    return response?.data?.results?.objects || [];
  },
};
