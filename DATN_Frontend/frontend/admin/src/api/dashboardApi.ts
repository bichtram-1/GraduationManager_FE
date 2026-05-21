import { IDashboardData } from '../type/DashboardType';
import { COLORS } from '@shared/constants/color';

export const dashboardApi = {
  // TODO: Replace mock data with real API call
  getDashboardData: async (): Promise<IDashboardData> => {
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
        { courseName: 'Phong Thủy Cơ Bản', studentCount: 1 },
        { courseName: 'Phong Thủy Nhà Ở', studentCount: 2 },
        { courseName: 'Phong Thủy Kinh Doanh', studentCount: 0 },
      ],
      learningProgress: [
        { label: 'Hoàn thành', value: 100, color: COLORS.chartProgressCompleted },
        { label: 'Đang học', value: 13, color: COLORS.chartBarStudent },
        { label: 'Chưa bắt đầu', value: 0, color: COLORS.chartProgressNotStarted },
      ],
      recentActivities: [
        {
          id: '1',
          userName: 'Trần Thị B',
          courseName: 'Phong Thủy Nhà Ở',
          date: '2024-02-15',
        },
        {
          id: '2',
          userName: 'Nguyễn Văn A',
          courseName: 'Phong Thủy Nhà Ở',
          date: '2024-02-05',
        },
        {
          id: '3',
          userName: 'Nguyễn Văn A',
          courseName: 'Phong Thủy Cơ Bản',
          date: '2024-02-01',
        },
      ],
    };
    return mockData;
  },
};
