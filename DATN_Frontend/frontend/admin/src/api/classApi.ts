import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateClass, IDetailClass, IListClass, IUpdateClass, IClassMember } from '../type/ClassType';

const sampleStudents: IClassMember[] = [
  { id: 's1', name: 'Nguyễn Văn A', code: 'SV001' },
  { id: 's2', name: 'Trần Thị B', code: 'SV002' },
  { id: 's3', name: 'Lê Văn C', code: 'SV003' },
];

const MOCK_CLASSES: IListClass[] = [
  { id: 'c01', code: 'KTPM2020', name: 'Kỹ thuật phần mềm 2020', year: '2020', supervisor: 'TS. Nguyễn Văn A', members: [sampleStudents[0], sampleStudents[1]], maxStudents: 40, status: 'ACTIVE' },
  { id: 'c02', code: 'CNPM2021', name: 'Công nghệ phần mềm 2021', year: '2021', supervisor: 'PGS. Mai Thị H', members: [sampleStudents[2]], maxStudents: 35, status: 'ACTIVE' },
];

let classStore = [...MOCK_CLASSES];

export const classApi = {
  getListClass: async () => ({ rows: classStore, total: classStore.length }),

  getClassDetail: async (id: string): Promise<IDetailClass | undefined> => classStore.find((c) => c.id === id),

  createClass: async ({ body }: { body: ICreateClass; params: BaseListParams }) => {
    const newClass: IListClass = { ...body, id: `c${String(classStore.length + 1).padStart(2, '0')}` };
    classStore = [newClass, ...classStore];
    return newClass;
  },

  updateClass: async ({ id, body }: { id: string; body: IUpdateClass; index: number; params: BaseListParams }) => {
    classStore = classStore.map((c) => (c.id === id ? { ...c, ...body, id } : c));
    return classStore.find((c) => c.id === id) as IDetailClass;
  },

  deleteClass: async ({ id }: { id: string; params: BaseListParams }) => {
    classStore = classStore.filter((c) => c.id !== id);
    return { success: true, id };
  },
};
