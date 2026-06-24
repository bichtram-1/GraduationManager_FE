import type { BaseListParams, ListResponseType } from '@shared/types/GeneralType';
import type { AssignmentRow, AssignmentStatus, ICreateAssignment, IDetailAssignment, IUpdateAssignment } from '../type/AssignmentType';
import axiosInstance from './axiosInstance';

export interface IAssignmentListParams extends BaseListParams {
  status?: AssignmentStatus | 'all';
  className?: string | 'all';
  supervisor?: string | 'all';
  periodId?: string;
}

export const assignmentApi = {
  getListAssignment: async (params: IAssignmentListParams): Promise<ListResponseType<AssignmentRow>['results']['objects']> => {
    const response = await axiosInstance.get('/private/v1/assignments', { params });
    return response?.data?.results?.objects;
  },

  getAssignmentDetail: async (id: string): Promise<IDetailAssignment | undefined> => {
    const response = await axiosInstance.get(`/private/v1/assignments/${id}`);
    return response?.data?.results?.object;
  },

  createAssignment: async ({ body }: { body: ICreateAssignment; params: BaseListParams }) => {
    const response = await axiosInstance.post('/private/v1/assignments', body);
    return response?.data?.results?.object;
  },

  updateAssignment: async ({ id, body }: { id: string; body: IUpdateAssignment; index: number; params: BaseListParams }) => {
    const response = await axiosInstance.patch(`/private/v1/assignments/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteAssignment: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/private/v1/assignments/${id}`);
    return response?.data;
  },

  getTeachers: async () => {
    const response = await axiosInstance.get('/private/v1/teachers');
    return response?.data?.results?.objects || response?.data?.results?.object;
  },
};
