import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateCompany, IDetailCompany, IUpdateCompany } from '../type/CompanyType';
import axiosInstance from './axiosInstance';

export const companyApi = {
  getListCompany: async () => {
    const response = await axiosInstance.get('/private/v1/companies');
    return response?.data?.results?.objects;
  },

  getCompanyDetail: async (id: string): Promise<IDetailCompany> => {
    const response = await axiosInstance.get(`/private/v1/companies/${id}`);
    return response?.data?.results?.object;
  },

  createCompany: async ({ body }: { body: ICreateCompany; params: BaseListParams }) => {
    const response = await axiosInstance.post('/private/v1/companies', body);
    return response?.data?.results?.object;
  },

  updateCompany: async ({ id, body }: { id: string; body: IUpdateCompany; index: number; params: BaseListParams }) => {
    const response = await axiosInstance.patch(`/private/v1/companies/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteCompany: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/private/v1/companies/${id}`);
    return response?.data;
  },
};
