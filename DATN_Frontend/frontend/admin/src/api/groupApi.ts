import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateGroup, IDetailGroup, IGroupMember, IListGroup, IUpdateGroup } from '../type/GroupType';

import axiosInstance from './axiosInstance';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

const sampleStudents: IGroupMember[] = [
  { id: 's1', name: 'Nguyễn Văn A', code: 'SV001' },
  { id: 's2', name: 'Trần Thị B', code: 'SV002' },
  { id: 's3', name: 'Lê Văn C', code: 'SV003' },
  { id: 's4', name: 'Phạm Thị D', code: 'SV004' },
  { id: 's5', name: 'Hoàng Văn E', code: 'SV005' },
];

const MOCK_GROUPS: IListGroup[] = [
  {
    id: 'g01',
    code: 'NH01',
    title: 'Hệ thống phân tích dữ liệu',
    supervisor: 'TS. Nguyễn Văn A',
    members: [sampleStudents[0], sampleStudents[2]],
    maxMembers: 4,
    status: 'WARNING',
    registrationBatch: 'HK1/2024',
  },
  {
    id: 'g02',
    code: 'NH02',
    title: 'Ứng dụng web cho doanh nghiệp',
    supervisor: 'PGS. Mai Thị H',
    members: [sampleStudents[1], sampleStudents[4]],
    maxMembers: 3,
    status: 'APPROVED',
    registrationBatch: 'HK1/2024',
  },
];

let groupStore = [...MOCK_GROUPS];

export const groupApi = {
  getListGroup: async () => {
    if (USE_MOCK) {
      return {
        rows: groupStore,
        total: groupStore.length,
      };
    }

    const response = await axiosInstance.get('/private/v1/groups');
    return response?.data?.results?.objects;
  },

  getGroupDetail: async (id: string): Promise<IDetailGroup | undefined> => {
    if (USE_MOCK) {
      return groupStore.find((group) => group.id === id);
    }

    const response = await axiosInstance.get(`/private/v1/groups/${id}`);
    return response?.data?.results?.object;
  },

  createGroup: async ({ body }: { body: ICreateGroup; params: BaseListParams }) => {
    if (USE_MOCK) {
      const newGroup: IListGroup = {
        ...body,
        id: `g${String(groupStore.length + 1).padStart(2, '0')}`,
      };
      groupStore = [newGroup, ...groupStore];
      return newGroup;
    }

    const response = await axiosInstance.post('/private/v1/groups', body);
    return response?.data?.results?.object;
  },

  updateGroup: async ({ id, body }: { id: string; body: IUpdateGroup; index: number; params: BaseListParams }) => {
    if (USE_MOCK) {
      const updated = groupStore.map((group) => (group.id === id ? { ...group, ...body, id } : group));
      groupStore = updated;
      return updated.find((group) => group.id === id) as IDetailGroup;
    }

    const response = await axiosInstance.patch(`/private/v1/groups/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteGroup: async ({ id }: { id: string; params: BaseListParams }) => {
    if (USE_MOCK) {
      groupStore = groupStore.filter((group) => group.id !== id);
      return { success: true, id };
    }

    const response = await axiosInstance.delete(`/private/v1/groups/${id}`);
    return response?.data;
  },
  
  approveGroup: async ({ id }: { id: string }) => {
    if (USE_MOCK) {
      groupStore = groupStore.map((g) => (g.id === id ? { ...g, status: 'APPROVED' } : g));
      return groupStore.find((g) => g.id === id) as IDetailGroup;
    }

    const response = await axiosInstance.post(`/private/v1/groups/${id}/approve`);
    return response?.data?.results?.object;
  },

  rejectGroup: async ({ id }: { id: string }) => {
    if (USE_MOCK) {
      groupStore = groupStore.map((g) => (g.id === id ? { ...g, status: 'DISSOLVED' } : g));
      return groupStore.find((g) => g.id === id) as IDetailGroup;
    }

    const response = await axiosInstance.post(`/private/v1/groups/${id}/reject`);
    return response?.data?.results?.object;
  },
};
