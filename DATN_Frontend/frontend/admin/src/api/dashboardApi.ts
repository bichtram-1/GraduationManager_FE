import { IDashboardData } from '../type/DashboardType';
import { COLORS } from '@shared/constants/color';
import axiosInstance from './axiosInstance';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

export const dashboardApi = {
  // TODO: Replace mock data with real API call
  getDashboardData: async (): Promise<IDashboardData> => {
    if (USE_MOCK) {
      const mockData: IDashboardData = {
        stats: {
          totalUsers: 2,
          activeUsers: 2,
          totalCourses: 3,
          totalLessons: 8,
          totalQuestions: 10,
          totalCodes: 5,
          usedCodes: 3,
        },
        studentsPerCourse: [
          { courseName: 'Lập trình Web', studentCount: 12 },
          { courseName: 'Cơ sở dữ liệu', studentCount: 8 },
          { courseName: 'Kỹ thuật phần mềm', studentCount: 5 },
        ],
        learningProgress: [
          { label: 'Hoàn thành', value: 80, color: COLORS.chartProgressCompleted },
          { label: 'Chưa bắt đầu', value: 20, color: COLORS.chartProgressNotStarted },
        ],
        recentActivities: [
          {
            id: '1',
            userName: 'Trần Thị B',
            courseName: 'Lập trình Web',
            date: '2026-05-15',
          },
          {
            id: '2',
            userName: 'Nguyễn Văn A',
            courseName: 'Cơ sở dữ liệu',
            date: '2026-05-10',
          },
          {
            id: '3',
            userName: 'Nguyễn Văn A',
            courseName: 'Kỹ thuật phần mềm',
            date: '2026-05-08',
          },
        ],
      };
      return mockData;
    }

    const response = await axiosInstance.get('/private/v1/dashboard');
    return response?.data?.results?.object || response?.data?.results?.objects || response?.data;
  },
};
