import { IDashboardData } from '../type/DashboardType';
import axiosInstance from './axiosInstance';

export const dashboardApi = {
  getDashboardData: async (): Promise<IDashboardData> => {
    const response = await axiosInstance.get('/private/v1/dashboard');
    return response?.data?.results?.object || response?.data?.results?.objects || response?.data;
  },
};
