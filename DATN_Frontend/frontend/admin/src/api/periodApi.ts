import type { BaseListParams, ListResponseType } from '@shared/types/GeneralType';
import type { BatchStatus, BatchType, ICreatePeriod, IDetailPeriod, IListPeriod, IUpdatePeriod } from '../type/PeriodType';
import axiosInstance from './axiosInstance';

export interface IPeriodListParams extends BaseListParams {
  type?: BatchType | 'all';
  status?: BatchStatus | 'all';
}

export const periodApi = {
  getListPeriod: async (params: IPeriodListParams): Promise<ListResponseType<IListPeriod>['results']['objects']> => {
    const response = await axiosInstance.get('/private/v1/periods', { params });
    return response?.data?.results?.objects;
  },

  getPeriodDetail: async (id: string): Promise<IDetailPeriod | undefined> => {
    const response = await axiosInstance.get(`/private/v1/periods/${id}`);
    return response?.data?.results?.object;
  },

  createPeriod: async ({ body }: { body: ICreatePeriod; params: BaseListParams }) => {
    const response = await axiosInstance.post('/private/v1/periods', body);
    return response?.data?.results?.object;
  },

  updatePeriod: async ({ id, body }: { id: string; body: IUpdatePeriod; index: number; params: BaseListParams }) => {
    const response = await axiosInstance.patch(`/private/v1/periods/${id}`, body);
    return response?.data?.results?.object;
  },

  deletePeriod: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/private/v1/periods/${id}`);
    return response?.data;
  },

  addStudentToPeriods: async (body: { studentId: string; periodIds: string[] }) => {
    const response = await axiosInstance.post('/private/v1/periods/add-student', body);
    return response?.data;
  },
};
