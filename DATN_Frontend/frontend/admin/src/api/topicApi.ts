import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateTopic, IDetailTopic, TopicStatus, IUpdateTopic } from '../type/TopicType';
import axiosInstance from './axiosInstance';

export interface ITopicListParams extends BaseListParams {
  status?: TopicStatus | 'all';
  periodId?: string;
}

export const topicApi = {
  getListTopic: async (params: ITopicListParams) => {
    const response = await axiosInstance.get('/private/v1/topics', { params });
    return response?.data?.results?.objects;
  },

  getTopicDetail: async (id: string): Promise<IDetailTopic | undefined> => {
    const response = await axiosInstance.get(`/private/v1/topics/${id}`);
    return response?.data?.results?.object;
  },

  createTopic: async ({ body, params }: { body: ICreateTopic; params: BaseListParams & { periodId?: string } }) => {
    const response = await axiosInstance.post('/private/v1/topics', body, { params });
    return response?.data?.results?.object;
  },

  updateTopic: async ({ id, body }: { id: string; body: IUpdateTopic; index: number; params: BaseListParams }) => {
    const response = await axiosInstance.patch(`/private/v1/topics/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteTopic: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/private/v1/topics/${id}`);
    return response?.data;
  },
};
