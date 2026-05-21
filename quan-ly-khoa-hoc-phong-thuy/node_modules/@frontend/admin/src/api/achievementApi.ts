import { IDetailAchievement, ICreateAchievementBody, IUpdateAchievementBody } from '../type/AchievementType';
import { BaseListParams } from '@shared/types/GeneralType';
import axiosInstance from './axiosInstance';

export const achievementApi = {
  getListAchievements: async (params: BaseListParams) => {
    const response = await axiosInstance.get('/private/v1/achievements', { params });
    return response?.data?.results?.objects;
  },

  getAchievementDetail: async (id: string): Promise<IDetailAchievement> => {
    const response = await axiosInstance.get(`/private/v1/achievements/${id}`);
    return response.data?.results?.object;
  },

  createAchievement: async ({ body }: { body: ICreateAchievementBody; params: BaseListParams }) => {
    const response = await axiosInstance.post('/private/v1/achievements', body);
    return response.data?.results?.object;
  },

  updateAchievement: async ({ id, body }: { id: string; body: IUpdateAchievementBody; index: number; params: BaseListParams }) => {
    const response = await axiosInstance.patch(`/private/v1/achievements/${id}`, body);
    return response.data?.results?.object;
  },

  deleteAchievement: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/private/v1/achievements/${id}`);
    return response.data;
  },
};
