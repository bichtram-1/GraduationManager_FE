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
    return response?.data?.results?.objects || response?.data?.results?.object || response?.data;
  }
};
