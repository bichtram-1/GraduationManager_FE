import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateClass, IDetailClass, IListClass, IUpdateClass, IClassMember } from '../type/ClassType';

import axiosInstance from './axiosInstance';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

const sampleStudents: IClassMember[] = [
  { id: 's1', name: 'Nguyễn Văn A', code: 'SV001' },
  { id: 's2', name: 'Trần Thị B', code: 'SV002' },
  { id: 's3', name: 'Lê Văn C', code: 'SV003' },
];

const MOCK_CLASSES: IListClass[] = [
  { id: 'c01', code: 'KTPM2020', name: 'Kỹ thuật phần mềm 2020', level: 'Đại học chính quy', course: 'Khóa 2020', major: 'Kỹ thuật phần mềm', supervisor: 'TS. Nguyễn Văn A', members: [sampleStudents[0], sampleStudents[1]], maxStudents: 40, status: 'ACTIVE' },
  { id: 'c02', code: 'CNPM2021', name: 'Công nghệ phần mềm 2021', level: 'Đại học chính quy', course: 'Khóa 2021', major: 'Công nghệ phần mềm', supervisor: 'PGS. Mai Thị H', members: [sampleStudents[2]], maxStudents: 35, status: 'ACTIVE' },
];

let classStore = [...MOCK_CLASSES];

export const classApi = {
  getListClass: async () => {
    if (USE_MOCK) {
      return { rows: classStore, total: classStore.length };
    }

    const response = await axiosInstance.get('/private/v1/classes');
    return response?.data?.results?.objects;
  },

  getClassDetail: async (id: string): Promise<IDetailClass | undefined> => {
    if (USE_MOCK) {
      return classStore.find((c) => c.id === id);
    }

    const response = await axiosInstance.get(`/private/v1/classes/${id}`);
    return response?.data?.results?.object;
  },

  createClass: async ({ body }: { body: ICreateClass; params: BaseListParams }) => {
    if (USE_MOCK) {
      const newClass: IListClass = { ...body, id: `c${String(classStore.length + 1).padStart(2, '0')}` };
      classStore = [newClass, ...classStore];
      return newClass;
    }

    const response = await axiosInstance.post('/private/v1/classes', body);
    return response?.data?.results?.object;
  },

  updateClass: async ({ id, body }: { id: string; body: IUpdateClass; index: number; params: BaseListParams }) => {
    if (USE_MOCK) {
      classStore = classStore.map((c) => (c.id === id ? { ...c, ...body, id } : c));
      return classStore.find((c) => c.id === id) as IDetailClass;
    }

    const response = await axiosInstance.patch(`/private/v1/classes/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteClass: async ({ id }: { id: string; params: BaseListParams }) => {
    if (USE_MOCK) {
      classStore = classStore.filter((c) => c.id !== id);
      return { success: true, id };
    }

    const response = await axiosInstance.delete(`/private/v1/classes/${id}`);
    return response?.data;
  },
};
