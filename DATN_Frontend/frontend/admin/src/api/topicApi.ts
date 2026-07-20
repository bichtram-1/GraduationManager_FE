import type { BaseListParams, ListResponseType } from '@shared/types/GeneralType';
import type { ICreateTopic, IDetailTopic, IListTopic, TopicStatus, IUpdateTopic } from '../type/TopicType';
import axiosInstance from './axiosInstance';

export interface ITopicListParams extends BaseListParams {
  status?: TopicStatus | 'all';
  periodId?: string;
  teacher?: string | 'all';
}

export const topicApi = {
  getListTopic: async (params: ITopicListParams) => {
    const response = await axiosInstance.get<ListResponseType<IListTopic>>('/private/v1/topics', { params });
    return response?.data?.results?.objects;
  },

  getTopicDetail: async (id: string): Promise<IDetailTopic | undefined> => {
    const response = await axiosInstance.get(`/private/v1/topics/${id}`);
    return response?.data?.results?.object;
  },

  createTopic: async ({ body, params }: { body: ICreateTopic; params: ITopicListParams }) => {
    const response = await axiosInstance.post('/private/v1/topics', body, { params });
    return response?.data?.results?.object;
  },

  updateTopic: async ({ id, body }: { id: string; body: IUpdateTopic; index: number; params: ITopicListParams }) => {
    const response = await axiosInstance.patch(`/private/v1/topics/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteTopic: async ({ id }: { id: string; params: ITopicListParams }) => {
    const response = await axiosInstance.delete(`/private/v1/topics/${id}`);
    return response?.data;
  },

  importTopics: async (formData: FormData) => {
    const response = await axiosInstance.post('/private/v1/topics/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response?.data;
  },
};
