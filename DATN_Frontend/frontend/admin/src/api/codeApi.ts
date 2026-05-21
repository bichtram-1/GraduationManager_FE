import {
  ICreateCode,
  IDetailCode,
  IListCode,
  IUpdateCode,
} from '../type/CodeType';
import {
  BaseListParams,
  DetailResponseType,
  ListResponseType,
} from '@shared/types/GeneralType';
import axiosInstance from './axiosInstance';

export const codeApi = {
  getListCode: async (params: BaseListParams) => {
    const response = await axiosInstance.get<ListResponseType<IListCode>>(
      '/private/v1/codes',
      { params }
    );
    return response?.data?.results?.objects;
  },

  getCodeDetail: async (id: string) => {
    const response = await axiosInstance.get<DetailResponseType<IDetailCode>>(
      `/private/v1/codes/${id}`
    );
    return response?.data?.results?.object;
  },

  createCode: async ({
    body,
  }: {
    body: ICreateCode;
    params: BaseListParams;
  }) => {
    const response = await axiosInstance.post('/private/v1/codes', body);
    return response.data?.results?.object;
  },

  updateCode: async ({
    id,
    body,
  }: {
    id: string;
    body: IUpdateCode;
    index: number;
    params: BaseListParams;
  }) => {
    const response = await axiosInstance.patch(`/private/v1/codes/${id}`, body);
    return response.data?.results?.object;
  },

  deleteCode: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/private/v1/codes/${id}`);
    return response.data;
  },
};
