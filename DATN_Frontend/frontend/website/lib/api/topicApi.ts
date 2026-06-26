import axiosInstance from '../axios/axios-config';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'; // default to true if not specified as 'false'

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
  }
};
