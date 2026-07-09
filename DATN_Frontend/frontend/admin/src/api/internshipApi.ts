import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateConfirmationRequest, ICreateNoCompanyStudent, IUpdateConfirmationRequest, IUpdateNoCompanyStudent } from '../type/InternshipType';
import axiosInstance from './axiosInstance';

export const internshipApi = {
  getListConfirmationRequest: async (params?: { periodId?: string }) => {
    const response = await axiosInstance.get('/private/v1/internships/confirmations', { params });
    return response?.data?.results?.objects;
  },

  getConfirmationRequestDetail: async (id: string) => {
    const response = await axiosInstance.get(`/private/v1/internships/confirmations/${id}`);
    return response?.data?.results?.object;
  },

  createConfirmationRequest: async ({ body, params }: { body: ICreateConfirmationRequest; params: BaseListParams & { periodId?: string } }) => {
    const response = await axiosInstance.post('/private/v1/internships/confirmations', body, { params });
    return response?.data?.results?.object;
  },

  updateConfirmationRequest: async ({ id, body }: { id: string; body: IUpdateConfirmationRequest; index: number; params: BaseListParams }) => {
    const response = await axiosInstance.patch(`/private/v1/internships/confirmations/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteConfirmationRequest: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/private/v1/internships/confirmations/${id}`);
    return response?.data;
  },

  getListDeclarations: async (params?: { periodId?: string }) => {
    const response = await axiosInstance.get('/private/v1/internships/declarations', { params });
    return response?.data?.results?.objects;
  },

  getDeclarationDetail: async (id: string) => {
    const response = await axiosInstance.get(`/private/v1/internships/declarations/${id}`);
    return response?.data?.results?.object;
  },

  createDeclaration: async ({ body, params }: { body: ICreateConfirmationRequest; params: BaseListParams & { periodId?: string } }) => {
    const response = await axiosInstance.post('/private/v1/internships/declarations', body, { params });
    return response?.data?.results?.object;
  },

  updateDeclaration: async ({ id, body }: { id: string; body: IUpdateConfirmationRequest; index: number; params: BaseListParams }) => {
    const response = await axiosInstance.patch(`/private/v1/internships/declarations/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteDeclaration: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/private/v1/internships/declarations/${id}`);
    return response?.data;
  },

  getListNoCompanyStudent: async (params?: { periodId?: string }) => {
    const response = await axiosInstance.get('/private/v1/internships/no-company', { params });
    return response?.data?.results?.objects;
  },

  getNoCompanyStudentDetail: async (id: string, periodId?: string) => {
    const response = await axiosInstance.get(`/private/v1/internships/no-company/${id}`, {
      params: { periodId }
    });
    return response?.data?.results?.object;
  },

  createNoCompanyStudent: async ({ body, params }: { body: ICreateNoCompanyStudent; params: BaseListParams & { periodId?: string } }) => {
    const response = await axiosInstance.post('/private/v1/internships/no-company', body, { params });
    return response?.data?.results?.object;
  },

  updateNoCompanyStudent: async ({ id, body, params }: { id: string; body: IUpdateNoCompanyStudent; index: number; params: BaseListParams }) => {
    const response = await axiosInstance.patch(`/private/v1/internships/no-company/${id}`, body, { params });
    return response?.data?.results?.object;
  },

  deleteNoCompanyStudent: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/private/v1/internships/no-company/${id}`);
    return response?.data;
  },
};
