import type { BaseListParams, ListResponseType } from '@shared/types/GeneralType';
import type { ICreateClass, IDetailClass, IListClass, IUpdateClass } from '../type/ClassType';
import axiosInstance from './axiosInstance';

export const classApi = {
  getListClass: async (params?: { periodId?: string }) => {
    const response = await axiosInstance.get<ListResponseType<IListClass>>('/private/v1/classes', { params });
    return response?.data?.results?.objects;
  },

  getClassDetail: async (id: string): Promise<IDetailClass | undefined> => {
    const response = await axiosInstance.get(`/private/v1/classes/${id}`);
    return response?.data?.results?.object;
  },

  createClass: async ({ body, params }: { body: ICreateClass; params: BaseListParams }) => {
    const periodId = (params as any)?.periodId;
    const response = await axiosInstance.post('/private/v1/classes', { ...body, periodId });
    return response?.data?.results?.object;
  },

  updateClass: async ({ id, body }: { id: string; body: IUpdateClass; index: number; params: BaseListParams }) => {
    const response = await axiosInstance.patch(`/private/v1/classes/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteClass: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/private/v1/classes/${id}`);
    return response?.data;
  },

  getClassMetadata: async (): Promise<{ names: string[]; courses: string[]; majors: string[]; levels: string[] } | undefined> => {
    const response = await axiosInstance.get('/private/v1/classes-metadata');
    return response?.data?.results?.object;
  },
};
