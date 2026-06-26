import axiosInstance from '../axios/axios-config';

const USE_MOCK = false;

export const topicApi = {
  getTopics: async (params?: { periodId?: string }) => {
    if (USE_MOCK) {
      const res = await fetch('/api/mock/teacher/topics');
      const json = await res.json();
      return json.topics ?? [];
    }

    const response = await axiosInstance.get('/private/v1/topics', { params });
    const resData = response?.data?.results?.objects || response?.data?.results?.object || response?.data;
    const rawList = (resData && typeof resData === 'object' && 'rows' in resData) ? resData.rows : (Array.isArray(resData) ? resData : []);
    
    return rawList.map((t: { id?: string | number; name?: string; title?: string; teacher?: string; module?: string; status?: string; published?: boolean; slots?: string }) => ({
      id: String(t.id ?? ''),
      title: t.name || t.title || '',
      module: t.teacher || t.module || '',
      published: t.status === 'approved' || t.published || false,
      slots: t.slots || '0/4'
    }));
  },

  getTeacherTopics: async (params?: { periodId?: string }) => {
    if (USE_MOCK) {
      const res = await fetch('/api/mock/teacher/topics');
      const json = await res.json();
      return json.topics ?? [];
    }

    const response = await axiosInstance.get('/private/v1/teacher/topics', { params });
    const resData = response?.data?.results?.objects || response?.data?.results?.object || response?.data;
    const rawList = (resData && typeof resData === 'object' && 'rows' in resData) ? resData.rows : (Array.isArray(resData) ? resData : []);

    return rawList.map((t: any) => {
      const slotsStr = t.slots || '0/4';
      const parts = slotsStr.split('/');
      const registered = parseInt(parts[0] || '0', 10);
      const maxSlots = parseInt(parts[1] || '4', 10);
      const progress = maxSlots > 0 ? Math.round((registered / maxSlots) * 100) : 0;

      let statusVal: 'Đã duyệt' | 'Chờ duyệt' | 'Từ chối' = 'Chờ duyệt';
      if (t.status === 'approved') {
        statusVal = 'Đã duyệt';
      } else if (t.status === 'rejected') {
        statusVal = 'Từ chối';
      }

      return {
        id: String(t.id ?? ''),
        code: t.code || `DA${String(t.id || '').padStart(3, '0')}`,
        name: t.name || '',
        slots: slotsStr,
        status: statusVal,
        note: t.rejectReason || '',
        semester: 'HK2/2025-2026',
        summary: t.description || '',
        progress: progress,
      };
    });
  },

  createTopic: async (payload: { name: string; teacher: string; slots: string; description: string; periodId?: string }) => {
    if (USE_MOCK) {
      return { success: true };
    }
    const response = await axiosInstance.post('/private/v1/teacher/topics', payload, {
      params: { periodId: payload.periodId }
    });
    return response?.data;
  },

  updateTopic: async (id: string, payload: { name?: string; teacher?: string; slots?: string; description?: string }) => {
    if (USE_MOCK) {
      return { success: true };
    }
    const response = await axiosInstance.patch(`/private/v1/teacher/topics/${id}`, payload);
    return response?.data;
  },

  deleteTopic: async (id: string) => {
    if (USE_MOCK) {
      return { success: true };
    }
    const response = await axiosInstance.delete(`/private/v1/teacher/topics/${id}`);
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
  }
};
