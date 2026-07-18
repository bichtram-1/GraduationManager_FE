import axiosInstance from './axiosInstance';
import type { BaseListParams } from '@shared/types/GeneralType';

export interface IScoreListParams extends BaseListParams {
  periodId?: string;
  mode: 'internship' | 'project';
  keyword?: string;
  className?: string;
  mentor?: string;
  status?: string;
}

export const scoreApi = {
  getScoresList: async (params: IScoreListParams) => {
    const response = await axiosInstance.get('/private/v1/student-scores', { params });
    return response?.data?.results?.objects;
  },

  getScoreDetail: async (id: string, mode: 'internship' | 'project') => {
    const response = await axiosInstance.get(`/private/v1/student-scores/${id}`, {
      params: { mode },
    });
    return response?.data?.results?.object;
  },
};
