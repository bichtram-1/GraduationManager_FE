import axiosInstance from '../axios/axios-config';

export interface ITopicDirection {
  id: string;
  name: string;
}

export const topicApi = {
  getDirections: async (): Promise<ITopicDirection[]> => {
    const response = await axiosInstance.get('/private/v1/topic-directions');
    return response?.data?.results?.objects || [];
  },

  getTopics: async (params?: { periodId?: string; page?: number; limit?: number; direction?: string; keyword?: string; teacher?: string }) => {
    const response = await axiosInstance.get('/private/v1/topics', { params });
    const resData = response?.data?.results?.objects || response?.data?.results?.object || response?.data;
    const rawList = (resData && typeof resData === 'object' && 'rows' in resData) ? resData.rows : (Array.isArray(resData) ? resData : []);
    const pagination = response?.data?.pagination || { total: rawList.length, totalPages: 1, limit: params?.limit || 10 };

    const rows = rawList.map((t: any) => ({
      id: String(t.id ?? ''),
      code: t.code || `DA${String(t.id || '').padStart(3, '0')}`,
      title: t.name || t.title || '',
      module: t.teacher || t.module || '',
      published: t.status === 'approved' || t.status === 'DA_DUYET' || t.published === true,
      slots: t.slots || '0/4',
      approvedStudents: t.approved_students || 'chưa có',
      description: t.description || '',
      direction: t.direction || '',
      fileUrl: t.fileUrl || '',
    }));

    return {
      rows,
      pagination
    };
  },

  getTeacherTopics: async (params?: { periodId?: string }) => {
    const response = await axiosInstance.get('/private/v1/teacher/topics', { params });
    const resData = response?.data?.results?.objects || response?.data?.results?.object || response?.data;
    const rawList = (resData && typeof resData === 'object' && 'rows' in resData) ? resData.rows : (Array.isArray(resData) ? resData : []);

    return rawList.map((t: {
      id?: string | number;
      code?: string;
      name?: string;
      slots?: string;
      approved_students?: string;
      status?: string;
      rejectReason?: string;
      period?: string;
      batch?: string;
      description?: string;
      direction?: string;
      fileUrl?: string;
    }) => {
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
        approvedStudents: t.approved_students || 'chưa có',
        status: statusVal,
        note: t.rejectReason || '',
        semester: t.period || t.batch || '',
        summary: t.description || '',
        progress: progress,
        direction: t.direction || '',
        fileUrl: t.fileUrl || '',
      };
    });
  },

  createTopic: async (payload: { name: string; teacher: string; slots: string; description: string; direction?: string; fileUrl?: string; periodId?: string }) => {
    const response = await axiosInstance.post('/private/v1/teacher/topics', payload, {
      params: { periodId: payload.periodId }
    });
    return response?.data;
  },

  updateTopic: async (id: string, payload: { name?: string; teacher?: string; slots?: string; description?: string; direction?: string; fileUrl?: string }) => {
    const response = await axiosInstance.patch(`/private/v1/teacher/topics/${id}`, payload);
    return response?.data;
  },

  deleteTopic: async (id: string) => {
    const response = await axiosInstance.delete(`/private/v1/teacher/topics/${id}`);
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

  uploadFile: async (file: File): Promise<{ cloudFrontUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/private/v1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response?.data;
  }
};
