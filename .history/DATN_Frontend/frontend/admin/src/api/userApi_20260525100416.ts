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
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

interface IUserListParams extends BaseListParams {
  keyword?: string;
  className?: string;
  status?: UserStatusType;
  role?: UserRoleType;
}

const mockRows: IListUser[] = [
  {
    id: '20520001',
    name: 'Nguyen Van A',
    email: '20520001@gm.uit.edu.vn',
    className: 'KTPM2020',
    phone: '0901234567',
    role: 'student',
    status: 'active',
  },
  {
    id: '20520002',
    name: 'Tran Thi B',
    email: '20520002@gm.uit.edu.vn',
    className: 'CNPM2020',
    phone: '0909111222',
    role: 'student',
    status: 'active',
  },
  {
    id: '20520003',
    name: 'Le Van C',
    email: '20520003@gm.uit.edu.vn',
    className: 'KTPM2020',
    phone: '0933444555',
    role: 'student',
    status: 'inactive',
  },
  {
    id: '20520004',
    name: 'Pham Thi D',
    email: '20520004@gm.uit.edu.vn',
    className: 'HTTT2020',
    phone: '0911222333',
    role: 'student',
    status: 'deleted',
  },
  {
    id: 'GV0001',
    name: 'Nguyen Van Giang Vien',
    email: 'gv01@uit.edu.vn',
    className: 'Khoa CNPM',
    phone: '0905666777',
    role: 'teacher',
    status: 'active',
  },
  {
    id: 'GV0002',
    name: 'Tran Thi Giang Vien',
    email: 'gv02@uit.edu.vn',
    className: 'Khoa HTTT',
    phone: '0908777666',
    role: 'teacher',
    status: 'inactive',
  },
];

const normalizeKeyword = (value?: string) => (value || '').trim().toLowerCase();

const applyMockFilter = (rows: IListUser[], params: IUserListParams) => {
  const keyword = normalizeKeyword(params.keyword);

  return rows.filter((row) => {
    const byRole = params.role ? row.role === params.role : true;
    const byStatus = params.status ? row.status === params.status : true;
    const byClassName = params.className ? row.className === params.className : true;

    const byKeyword =
      !keyword ||
      row.id.toLowerCase().includes(keyword) ||
      row.name.toLowerCase().includes(keyword) ||
      row.email.toLowerCase().includes(keyword) ||
      (row.className || '').toLowerCase().includes(keyword);

    return byRole && byStatus && byClassName && byKeyword;
  });
};

export const userApi = {
  getListUser: async (params: IUserListParams) => {
    if (USE_MOCK) {
      const filteredRows = applyMockFilter(mockRows, params);
      const page = params.page || 1;
      const limit = params.limit || 10;
      const start = (page - 1) * limit;
      const pagedRows = filteredRows.slice(start, start + limit);

      return {
        rows: pagedRows,
        total: filteredRows.length,
      } as unknown as ListResponseType<IListUser>;
    }

    const response = await axiosInstance.get<ListResponseType<IListUser>>(
      '/private/v1/users',
      { params }
    );
    return response?.data?.results?.objects;
  },

  getUserDetail: async (id: string) => {
    if (USE_MOCK) {
      const detail = mockRows.find((row) => row.id === id);
      return detail as IDetailUser;
    }

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
    if (USE_MOCK) {
      return {
        ...body,
        id: body.id || `USER_${Date.now()}`,
        status: body.status || 'active',
      } as IDetailUser;
    }

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
    if (USE_MOCK) {
      const existed = mockRows.find((row) => row.id === id);
      return { ...existed, ...body, id } as IDetailUser;
    }

    const response = await axiosInstance.patch(`/private/v1/users/${id}`, body);
    return response.data?.results?.object;
  },

  deleteUser: async ({ id }: { id: string; params: BaseListParams }) => {
    if (USE_MOCK) {
      return { success: true, id };
    }

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
