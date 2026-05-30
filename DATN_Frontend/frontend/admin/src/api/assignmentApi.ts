import type { BaseListParams, ListResponseType } from '@shared/types/GeneralType';
import type { AssignmentRow, AssignmentStatus, ICreateAssignment, IDetailAssignment, IUpdateAssignment } from '../type/AssignmentType';

export interface IAssignmentListParams extends BaseListParams {
  status?: AssignmentStatus | 'all';
  className?: string | 'all';
  supervisor?: string | 'all';
}

const MOCK_ASSIGNMENTS: AssignmentRow[] = [
  { studentId: '20520001', name: 'Nguyễn Văn A', className: 'KTPM2020', topic: 'DA001 - IoT giám sát nông nghiệp', supervisor: 'TS. Nguyễn Văn X', assignedAt: '10/04/2026', status: 'assigned' },
  { studentId: '20520002', name: 'Nguyễn Văn B', className: 'KTPM2020', topic: '—', supervisor: null, status: 'unassigned' },
  { studentId: '20520005', name: 'Hoàng Văn E', className: 'CNPM2020', topic: '—', supervisor: null, status: 'unassigned' },
  { studentId: '20520008', name: 'Lê Văn H', className: 'HTTT2020', topic: '—', supervisor: null, status: 'unassigned' },
  { studentId: '20520010', name: 'Lý Văn H', className: 'KTPM2020', topic: 'DA001 - IoT giám sát nông nghiệp', supervisor: 'ThS. Lê Thị Z', assignedAt: '11/04/2026', status: 'assigned' },
  { studentId: '20520012', name: 'Trương Thị J', className: 'KTPM2020', topic: '—', supervisor: null, status: 'unassigned' },
  { studentId: '20520015', name: 'Đỗ Thị M', className: 'CNPM2020', topic: '—', supervisor: null, status: 'unassigned' },
  { studentId: '20520018', name: 'Bùi Văn N', className: 'KTPM2020', topic: '—', supervisor: null, status: 'unassigned' },
];

const TEACHERS = [
  { id: 'T001', name: 'Nguyễn Văn X', degree: 'TS.', major: 'Công nghệ phần mềm', status: 'available' },
  { id: 'T002', name: 'Trần Văn Y', degree: 'TS.', major: 'Trí tuệ nhân tạo', status: 'full' },
  { id: 'T003', name: 'Lê Thị Z', degree: 'ThS.', major: 'Hệ thống thông tin', status: 'available' },
  { id: 'T004', name: 'Phạm Văn K', degree: 'TS.', major: 'An ninh mạng', status: 'available' },
];

let assignmentStore = [...MOCK_ASSIGNMENTS];

const filterAssignments = (rows: AssignmentRow[], params: IAssignmentListParams) => {
  const keyword = (params.keyword || '').trim().toLowerCase();
  return rows.filter((row) => {
    const byStatus = params.status && params.status !== 'all' ? row.status === params.status : true;
    const byClass = params.className && params.className !== 'all' ? row.className === params.className : true;
    const byTeacher = params.supervisor && params.supervisor !== 'all' ? (row.supervisor || '') === params.supervisor : true;
    const byKeyword =
      !keyword ||
      [row.studentId, row.name, row.className, row.topic, row.supervisor || '']
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    return byStatus && byClass && byTeacher && byKeyword;
  });
};

export const assignmentApi = {
  getListAssignment: async (params: IAssignmentListParams): Promise<ListResponseType<AssignmentRow>['results']['objects']> => {
    const rows = filterAssignments(assignmentStore, params);
    const page = params.page || 1;
    const limit = params.limit || rows.length || 10;
    const start = (page - 1) * limit;
    return {
      rows: rows.slice(start, start + limit),
      total: rows.length,
    };
  },

  getAssignmentDetail: async (id: string): Promise<IDetailAssignment | undefined> => {
    return assignmentStore.find((row) => row.studentId === id);
  },

  createAssignment: async ({ body }: { body: ICreateAssignment; params: BaseListParams }) => {
    const newRow: AssignmentRow = {
      studentId: body.studentId,
      name: body.name,
      className: body.className,
      topic: body.topic || '—',
      supervisor: body.supervisor || null,
      assignedAt: body.assignedAt || null,
      status: body.status || 'unassigned',
    };
    assignmentStore = [newRow, ...assignmentStore];
    return newRow;
  },

  updateAssignment: async ({ id, body }: { id: string; body: IUpdateAssignment; index: number; params: BaseListParams }) => {
    const updated = assignmentStore.map((row) => (row.studentId === id ? { ...row, ...body, studentId: id } : row));
    assignmentStore = updated;
    return updated.find((row) => row.studentId === id) as AssignmentRow;
  },

  deleteAssignment: async ({ id }: { id: string; params: BaseListParams }) => {
    assignmentStore = assignmentStore.filter((row) => row.studentId !== id);
    return { success: true, id };
  },

  getTeachers: async () => TEACHERS,
};
