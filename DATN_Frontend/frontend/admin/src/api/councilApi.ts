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
  secretary?: string[];
  topicGroups: { code: string; title: string; members: number }[];
  accent: 'blue' | 'green';
  status?: string;
  batch?: string;
  dot_id?: string;
  topics?: {
    code?: string;
    title?: string;
    members?: number;
    examiners?: string[];
    externalExaminers?: string[];
    startTime?: string;
    reviewerId?: string;
    reviewer?: string;
    examinerIds?: string[];
    minutes?: number;
  }[];
  external?: { name: string }[];
};

export type CouncilTopicInput = {
  id: string;
  nhom_id: string;
  reviewerId?: string | null;
  examinerIds: string[];
  externalExaminers: string[];
  startTime: string;
  minutes: number;
};

export const councilApi = {
  getListCouncil: async (): Promise<CouncilRow[]> => {
    const response = await axiosInstance.get('/private/v1/councils');
    const objects: CouncilRow[] | { rows: CouncilRow[] } | undefined = response?.data?.results?.objects;
    if (objects && !Array.isArray(objects) && Array.isArray(objects.rows)) {
      return objects.rows;
    }
    return (objects as CouncilRow[]) || [];
  },

  getCouncilDetail: async (id: string): Promise<CouncilRow> => {
    const response = await axiosInstance.get(`/private/v1/councils/${id}`);
    return response?.data?.results?.object;
  },

  createCouncil: async (body: { title: string; room: string; date?: string; time?: string; members?: string[]; topics?: CouncilTopicInput[] }) => {
    const response = await axiosInstance.post('/private/v1/councils', body);
    return response?.data?.results?.object;
  },

  updateCouncil: async ({ id, body }: { id: string; body: { title?: string; room?: string; date?: string; time?: string; members?: string[]; topics?: CouncilTopicInput[]; status?: string } }) => {
    const response = await axiosInstance.patch(`/private/v1/councils/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteCouncil: async (id: string) => {
    const response = await axiosInstance.delete(`/private/v1/councils/${id}`);
    return response?.data;
  },
};
