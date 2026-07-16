import { useQuery } from '@tanstack/react-query';
import { historyApi } from '../api/historyApi';

export const historyHooks = {
  useFetchAdminHistory: (params?: {
    sinh_vien_id?: string;
    ma_so_sinh_vien?: string;
    nhom_id?: string;
    action_type?: string;
    role?: string;
    keyword?: string;
  }) => {
    return useQuery({
      queryKey: ['historyList', params],
      queryFn: async () => {
        const data = await historyApi.getAdminHistory(params);
        return {
          rows: data,
          total: data.length,
        };
      },
    });
  },
};
