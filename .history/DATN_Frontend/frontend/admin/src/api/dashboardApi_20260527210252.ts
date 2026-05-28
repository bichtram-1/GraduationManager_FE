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
        { courseName: 'Lập trình Web', studentCount: 12 },
        { courseName: 'Cơ sở dữ liệu', studentCount: 8 },
        { courseName: 'Kỹ thuật phần mềm', studentCount: 5 },
      ],
      learningProgress: [
        { label: 'Hoàn thành', value: 70, color: COLORS.chartProgressCompleted },
        { label: 'Đang học', value: 25, color: COLORS.chartBarStudent },
        { label: 'Chưa bắt đầu', value: 5, color: COLORS.chartProgressNotStarted },
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
  },
};
