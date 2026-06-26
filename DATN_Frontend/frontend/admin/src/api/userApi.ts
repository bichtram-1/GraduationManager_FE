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
      '/api/admin/sinh-vien',
      { params }
    );
    return response?.data?.results?.objects;
  },

  getUserDetail: async (id: string) => {
    const response = await axiosInstance.get<DetailResponseType<IDetailUser>>(
      `/api/admin/sinh-vien/${id}`
    );
    return response?.data?.results?.object;
  },

  createUser: async ({
    body,
  }: {
    body: ICreateUser;
    params: BaseListParams;
  }) => {
    const response = await axiosInstance.post('/api/admin/sinh-vien', body);
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
    const response = await axiosInstance.patch(`/api/admin/sinh-vien/${id}`, body);
    return response.data?.results?.object;
  },

  deleteUser: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/api/admin/sinh-vien/${id}`);
    return response.data;
  },

  resetUserPassword: async ({ id }: { id: string }) => {
    const response = await axiosInstance.post(
      `/api/admin/sinh-vien/${id}/reset-password`
    );
    return response.data?.results?.object ?? response.data;
  },
};
