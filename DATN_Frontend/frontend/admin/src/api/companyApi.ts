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

  publishCompanies: async (): Promise<{ success: boolean; message: string; results?: { publishedCount: number } }> => {
    const response = await axiosInstance.post('/private/v1/companies/publish');
    return response?.data;
  },

  lookupCompanyByTaxId: async (taxId: string): Promise<{ name: string; address: string } | null> => {
    try {
      const response = await axiosInstance.get('/private/v1/companies/lookup-tax', { params: { taxId } });
      return response?.data?.results?.object || null;
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      throw new Error(message || 'Tra cứu mã số thuế thất bại.');
    }
  },
};
