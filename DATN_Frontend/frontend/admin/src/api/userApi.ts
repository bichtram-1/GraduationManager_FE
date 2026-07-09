import {
  ICreateUser,
  IDetailUser,
  IListUser,
  IUpdateUser,
  UserRoleType,
  UserStatusType,
} from '../type/UserType';
import {
  BaseListParams,
  DetailResponseType,
  ListResponseType,
} from '@shared/types/GeneralType';
import axiosInstance from './axiosInstance';

interface IUserListParams extends BaseListParams {
  keyword?: string;
  className?: string;
  status?: UserStatusType;
  role?: UserRoleType;
}

export const userApi = {
  getListUser: async (params: IUserListParams) => {
    const response = await axiosInstance.get<ListResponseType<IListUser>>(
      '/api/admin/users',
      { params }
    );
    return response?.data?.results?.objects;
  },

  getUserDetail: async (id: string) => {
    const response = await axiosInstance.get<DetailResponseType<IDetailUser>>(
      `/api/admin/users/${id}`
    );
    return response?.data?.results?.object;
  },

  createUser: async ({
    body,
  }: {
    body: ICreateUser;
    params: BaseListParams;
  }) => {
    const response = await axiosInstance.post('/api/admin/users', body);
    return response.data?.results?.object;
  },

  updateUser: async ({
    id,
    body,
  }: {
    id: string;
    body: IUpdateUser;
    index: number;
    params: BaseListParams;
  }) => {
    const response = await axiosInstance.patch(`/api/admin/users/${id}`, body);
    return response.data?.results?.object;
  },

  deleteUser: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/api/admin/users/${id}`);
    return response.data;
  },

  getSpecializations: async () => {
    const response = await axiosInstance.get<{ code: number; results: { objects: string[] } }>(
      '/api/admin/users/specializations'
    );
    return response.data?.results?.objects ?? [];
  },

  importStudents: async (formData: FormData) => {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      imported_count?: number;
      errors?: string[];
    }>('/api/admin/users/import-students', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
