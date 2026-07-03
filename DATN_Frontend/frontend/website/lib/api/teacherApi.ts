import axiosInstance from '../axios/axios-config';

const USE_MOCK = false;

export const teacherApi = {
  getDashboardData: async (params?: { periodId?: string }) => {
    if (USE_MOCK) {
      return null;
    }
    const response = await axiosInstance.get('/private/v1/teacher/dashboard', { params });
    return response?.data;
  },

  getStudents: async (params?: { periodId?: string }) => {
    if (USE_MOCK) {
      return null;
    }
    const response = await axiosInstance.get('/private/v1/teacher/students', { params });
    return response?.data;
  },

  getGradingData: async (params?: { periodId?: string }) => {
    if (USE_MOCK) {
      const res = await fetch('/api/mock/teacher/grading');
      return await res.json();
    }
    const response = await axiosInstance.get('/private/v1/teacher/grading', { params });
    return response?.data?.results?.object || response?.data;
  },

  getScores: async (groupId: string) => {
    if (USE_MOCK) {
      const res = await fetch(`/api/teacher/scores?group=${encodeURIComponent(groupId)}`);
      const json = await res.json();
      return json;
    }
    const response = await axiosInstance.get(`/private/v1/teacher/scores`, { params: { group: groupId } });
    return response?.data;
  },

  saveScores: async (groupId: string, payload: unknown) => {
    if (USE_MOCK) {
      const res = await fetch('/api/teacher/scores', {
        method: 'POST',
        body: JSON.stringify({ group: groupId, rows: payload }),
        headers: { 'content-type': 'application/json' },
      });
      return await res.json();
    }
    const response = await axiosInstance.post(`/private/v1/teacher/scores`, { group: groupId, rows: payload });
    return response?.data;
  },

  saveTttnScores: async (params: { periodId?: string; scores: Array<{ id: string; score: string }> }) => {
    if (USE_MOCK) {
      return { success: true };
    }
    const response = await axiosInstance.post(`/private/v1/teacher/tttn-scores`, params);
    return response?.data;
  },

  saveReportComment: async (payload: { studentId: string; periodId?: string; comment: string; evaluation?: 'DAT' | 'CHUA_DAT'; type: 'TTTN' | 'DATN'; baoCaoId?: number }) => {
    if (USE_MOCK) {
      return { success: true };
    }
    const response = await axiosInstance.post(`/private/v1/teacher/report-comment`, payload);
    return response?.data;
  },

  getGroups: async (params?: { periodId?: string }) => {
    if (USE_MOCK) {
      const res = await fetch('/api/mock/teacher/groups');
      const json = await res.json();
      return json.groups ?? [];
    }
    const response = await axiosInstance.get('/private/v1/teacher/groups', { params });
    return response?.data?.results?.objects || response?.data;
  },

  updateGroupStatus: async (groupId: string, action: 'accept' | 'reject') => {
    if (USE_MOCK) {
      const res = await fetch('/api/mock/teacher/groups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, action }),
      });
      return await res.json();
    }
    const response = await axiosInstance.patch(`/private/v1/teacher/groups/${groupId}`, { action });
    return response?.data?.results?.object || response?.data;
  },

  getReviewGroups: async (params?: { periodId?: string }) => {
    if (USE_MOCK) {
      const res = await fetch('/api/mock/teacher/review-groups');
      const json = await res.json();
      return json;
    }
    const response = await axiosInstance.get('/private/v1/teacher/review-groups', { params });
    return response?.data?.results?.objects || response?.data;
  },

  updateReviewGroupStatus: async (groupId: string, action: 'accept' | 'reject') => {
    if (USE_MOCK) {
      const res = await fetch('/api/mock/teacher/review-groups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, action }),
      });
      return await res.json();
    }
    const response = await axiosInstance.patch(`/private/v1/teacher/review-groups/${groupId}`, { action });
    return response?.data?.results?.object || response?.data;
  },

  getProfile: async () => {
    if (USE_MOCK) {
      return null;
    }
    const response = await axiosInstance.get('/private/v1/teacher/profile');
    return response?.data;
  },

  importTopics: async (file: File, periodId?: string) => {
    if (USE_MOCK) {
      return { success: true, message: 'Mock import successful' };
    }
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
};
