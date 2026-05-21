export interface IDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalLessons: number;
  totalQuestions: number;
  totalCodes: number;
  usedCodes: number;
}

export interface IStudentsPerCourse {
  courseName: string;
  studentCount: number;
}

export interface ILearningProgress {
  label: string;
  value: number;
  color: string;
}

export interface IRecentActivity {
  id: string;
  userName: string;
  courseName: string;
  date: string;
}

export interface IDashboardData {
  stats: IDashboardStats;
  studentsPerCourse: IStudentsPerCourse[];
  learningProgress: ILearningProgress[];
  recentActivities: IRecentActivity[];
}
