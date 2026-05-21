import {
  ICreateUser,
  IDetailUser,
  IListUser,
  IUpdateUser,
} from '../type/UserType';
import {
  BaseListParams,
  DetailResponseType,
  ListResponseType,
} from '@shared/types/GeneralType';
import axiosInstance from './axiosInstance';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

export const userApi = {
  getListUser: async (params: BaseListParams) => {
    if (USE_MOCK) {
      const mockRows = [
        { id: '20520001', name: 'Nguyễn Văn A', email: '20520001@gm.uit.edu.vn', className: 'KTPM2020', phone: '0901234567', status: 'active' },
        { id: '20520002', name: 'Trần Thị B', email: '20520002@gm.uit.edu.vn', className: 'CNPM2020', phone: '0909111222', status: 'active' },
        { id: '20520003', name: 'Lê Văn C', email: '20520003@gm.uit.edu.vn', className: 'KTPM2020', phone: '0933444555', status: 'inactive' },
        { id: '20520004', name: 'Phạm Thị D', email: '20520004@gm.uit.edu.vn', className: 'HTTT2020', phone: '0911222333', status: 'active' },
      ];
      return { rows: mockRows, total: mockRows.length } as unknown as ListResponseType<IListUser>;
    }

    const response = await axiosInstance.get<ListResponseType<IListUser>>(
      '/private/v1/users',
      { params }
    );
    return response?.data?.results?.objects;
  },

  getUserDetail: async (id: string) => {
    const response = await axiosInstance.get<DetailResponseType<IDetailUser>>(
      `/private/v1/users/${id}`
    );
    return response?.data?.results?.object;
  },

  createUser: async ({
    body,
  }: {
    body: ICreateUser;
    params: BaseListParams;
  }) => {
    const response = await axiosInstance.post('/private/v1/users', body);
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
    const response = await axiosInstance.patch(`/private/v1/users/${id}`, body);
    return response.data?.results?.object;
  },

  deleteUser: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/private/v1/users/${id}`);
    return response.data;
  },

  resetUserPassword: async ({ id }: { id: string }) => {
    const response = await axiosInstance.post(
      `/private/v1/users/${id}/reset-password`
    );
    return response.data?.results?.object ?? response.data;
  },
};
