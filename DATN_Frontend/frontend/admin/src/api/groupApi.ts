import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateGroup, IDetailGroup, IListGroup, IUpdateGroup } from '../type/GroupType';
import axiosInstance from './axiosInstance';

export const groupApi = {
  getListGroup: async () => {
    const response = await axiosInstance.get('/private/v1/groups');
    return response?.data?.results?.objects;
  },

  getGroupDetail: async (id: string): Promise<IDetailGroup | undefined> => {
    const response = await axiosInstance.get(`/private/v1/groups/${id}`);
    return response?.data?.results?.object;
  },

  createGroup: async ({ body }: { body: ICreateGroup; params: BaseListParams }) => {
    const response = await axiosInstance.post('/private/v1/groups', body);
    return response?.data?.results?.object;
  },

  updateGroup: async ({ id, body }: { id: string; body: IUpdateGroup; index: number; params: BaseListParams }) => {
    const response = await axiosInstance.patch(`/private/v1/groups/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteGroup: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/private/v1/groups/${id}`);
    return response?.data;
  },
  
  approveGroup: async ({ id }: { id: string }) => {
    const response = await axiosInstance.post(`/private/v1/groups/${id}/approve`);
    return response?.data?.results?.object;
  },

  rejectGroup: async ({ id }: { id: string }) => {
    const response = await axiosInstance.post(`/private/v1/groups/${id}/reject`);
    return response?.data?.results?.object;
  },
};
