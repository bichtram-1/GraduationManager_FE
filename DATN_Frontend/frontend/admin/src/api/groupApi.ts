import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateGroup, IDetailGroup, IGroupMember, IListGroup, IUpdateGroup } from '../type/GroupType';

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
    return {
      rows: groupStore,
      total: groupStore.length,
    };
  },

  getGroupDetail: async (id: string): Promise<IDetailGroup | undefined> => {
    return groupStore.find((group) => group.id === id);
  },

  createGroup: async ({ body }: { body: ICreateGroup; params: BaseListParams }) => {
    const newGroup: IListGroup = {
      ...body,
      id: `g${String(groupStore.length + 1).padStart(2, '0')}`,
    };
    groupStore = [newGroup, ...groupStore];
    return newGroup;
  },

  updateGroup: async ({ id, body }: { id: string; body: IUpdateGroup; index: number; params: BaseListParams }) => {
    const updated = groupStore.map((group) => (group.id === id ? { ...group, ...body, id } : group));
    groupStore = updated;
    return updated.find((group) => group.id === id) as IDetailGroup;
  },

  deleteGroup: async ({ id }: { id: string; params: BaseListParams }) => {
    groupStore = groupStore.filter((group) => group.id !== id);
    return { success: true, id };
  },
  
  approveGroup: async ({ id }: { id: string }) => {
    groupStore = groupStore.map((g) => (g.id === id ? { ...g, status: 'APPROVED' } : g));
    return groupStore.find((g) => g.id === id) as IDetailGroup;
  },

  rejectGroup: async ({ id }: { id: string }) => {
    groupStore = groupStore.map((g) => (g.id === id ? { ...g, status: 'DISSOLVED' } : g));
    return groupStore.find((g) => g.id === id) as IDetailGroup;
  },
};
