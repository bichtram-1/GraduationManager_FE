import { IDashboardData } from '../type/DashboardType';
import axiosInstance from './axiosInstance';

export interface IPublicSummary {
  totalStudents: number;
  totalTeachers: number;
  totalTopics: number;
}

export const dashboardApi = {
  getDashboardData: async (): Promise<IDashboardData> => {
    const response = await axiosInstance.get('/private/v1/dashboard');
    return response?.data?.results?.object || response?.data?.results?.objects || response?.data;
  },
  getPublicSummary: async (): Promise<IPublicSummary> => {
    const response = await axiosInstance.get('/private/v1/public/thong-ke-tong-quan');
    return response?.data?.results?.object;
  },
};
