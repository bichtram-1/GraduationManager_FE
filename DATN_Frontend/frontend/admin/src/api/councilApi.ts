import axiosInstance from './axiosInstance';

export type CouncilRow = {
  id: string;
  title: string;
  dateTime: string;
  room: string;
  achieved: number;
  rejected: number;
  chair: string[];
  reviewer: string[];
  member: string[];
  topicGroups: { code: string; title: string; members: number }[];
  accent: 'blue' | 'green';
};

export const councilApi = {
  getListCouncil: async (): Promise<CouncilRow[]> => {
    const response = await axiosInstance.get('/private/v1/councils');
    return response?.data?.results?.objects || [];
  },

  getCouncilDetail: async (id: string): Promise<CouncilRow> => {
    const response = await axiosInstance.get(`/private/v1/councils/${id}`);
    return response?.data?.results?.object;
  },

  createCouncil: async (body: { title: string; room: string; date?: string; time?: string; members?: string[]; topics?: any[] }) => {
    const response = await axiosInstance.post('/private/v1/councils', body);
    return response?.data?.results?.object;
  },

  updateCouncil: async ({ id, body }: { id: string; body: { title?: string; room?: string; date?: string; time?: string; members?: string[]; topics?: any[] } }) => {
    const response = await axiosInstance.patch(`/private/v1/councils/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteCouncil: async (id: string) => {
    const response = await axiosInstance.delete(`/private/v1/councils/${id}`);
    return response?.data;
  },
};
