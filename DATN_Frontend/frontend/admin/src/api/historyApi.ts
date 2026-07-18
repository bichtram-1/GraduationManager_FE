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
    dot_id?: string;
  }): Promise<IHistoryLog[]> => {
    const response = await axiosInstance.get('/private/v1/admin/history', { params });
    const objects = response?.data?.results?.objects;
    // axiosInstance có interceptor global tự bọc results.objects (nếu là mảng) thành
    // { rows, total } cho các API dùng chuẩn phân trang — history trả mảng thẳng nên cần
    // nhận diện cả 2 dạng, tránh trả nhầm object khiến Table.tsx (dataSource) crash.
    if (Array.isArray(objects)) {
      return objects;
    }
    if (objects && Array.isArray(objects.rows)) {
      return objects.rows;
    }
    return [];
  },
};
