import axiosInstance from '../axios/axios-config';

export interface IListPeriod {
  id: string;
  name: string;
  type: 'tttn' | 'datn';
  startDate: string;
  endDate: string;
  regDeadline: string;
  regOpenDate?: string;
  status: 'open' | 'published' | 'grading' | 'closed';
  studentListFileName?: string;
  studentListUrl?: string;
  numberDN?: number;
  numberSV?: number;
  numberTopics?: number;
  numberCouncils?: number;
}

export const periodApi = {
  getListPeriod: async (): Promise<{ rows: IListPeriod[]; total: number }> => {
    const response = await axiosInstance.get('/private/v1/periods');
    return response?.data?.results?.objects || { rows: [], total: 0 };
  },
};
