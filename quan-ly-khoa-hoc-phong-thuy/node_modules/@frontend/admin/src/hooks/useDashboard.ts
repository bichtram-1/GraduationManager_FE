import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { QueryKey } from '../constants/queryKey';

export const dashboardHooks = {
  useFetchDashboard: () => {
    return useQuery({
      queryKey: [QueryKey.dashboard.data],
      queryFn: () => dashboardApi.getDashboardData(),
    });
  },
};
