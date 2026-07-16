import axiosInstance from '../axios/axios-config';

export const teacherApi = {
  getDashboardData: async (params?: { periodId?: string }) => {
    const response = await axiosInstance.get('/private/v1/teacher/dashboard', { params });
    return response?.data;
  },

  getStudents: async (params?: { periodId?: string }) => {
    const response = await axiosInstance.get('/private/v1/teacher/students', { params });
    return response?.data;
  },

  getGradingData: async (params?: { periodId?: string }) => {
    const response = await axiosInstance.get('/private/v1/teacher/grading', { params });
    return response?.data?.results?.object || response?.data;
  },

  getScores: async (groupId: string) => {
    const response = await axiosInstance.get(`/private/v1/teacher/scores`, { params: { group: groupId } });
    return response?.data;
  },

  saveScores: async (groupId: string, payload: unknown) => {
    const response = await axiosInstance.post(`/private/v1/teacher/scores`, { group: groupId, rows: payload });
    return response?.data;
  },

  saveTttnScores: async (params: { periodId?: string; scores: Array<{ id: string; score: string }> }) => {
    const response = await axiosInstance.post(`/private/v1/teacher/tttn-scores`, params);
    return response?.data;
  },

  saveReportComment: async (payload: { studentId: string; periodId?: string; comment: string; evaluation?: 'DAT' | 'CHUA_DAT'; type: 'TTTN' | 'DATN'; baoCaoId?: number }) => {
    const response = await axiosInstance.post(`/private/v1/teacher/report-comment`, payload);
    return response?.data;
  },

  getGroups: async (params?: { periodId?: string }) => {
    const response = await axiosInstance.get('/private/v1/teacher/groups', { params });
    return response?.data?.results?.objects || response?.data;
  },

  updateGroupStatus: async (groupId: string, action: 'accept' | 'reject') => {
    const response = await axiosInstance.patch(`/private/v1/teacher/groups/${groupId}`, { action });
    return response?.data?.results?.object || response?.data;
  },

  getReviewGroups: async (params?: { periodId?: string }) => {
    const response = await axiosInstance.get('/private/v1/teacher/review-groups', { params });
    return response?.data?.results?.objects || response?.data;
  },

  updateReviewGroupStatus: async (groupId: string, action: 'accept' | 'reject') => {
    const response = await axiosInstance.patch(`/private/v1/teacher/review-groups/${groupId}`, { action });
    return response?.data?.results?.object || response?.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/private/v1/teacher/profile');
    return response?.data;
  },

  importTopics: async (file: File, periodId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/private/v1/teacher/topics/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { periodId }
    });
    return response?.data;
  },

  getHistory: async (limit?: number): Promise<any[]> => {
    const response = await axiosInstance.get('/private/v1/teacher/history', { params: limit ? { limit } : undefined });
    return response?.data?.results?.objects || [];
  },
};
