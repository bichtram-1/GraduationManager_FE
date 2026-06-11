export type AssignmentStatus = 'assigned' | 'unassigned';

interface IBaseAssignment {
  studentId: string;
  name: string;
  className: string;
  topic?: string;
  supervisor?: string | null;
  assignedAt?: string | null;
  status: AssignmentStatus;
}

export type IListAssignment = IBaseAssignment & {
  id?: string;
};

export type IDetailAssignment = IBaseAssignment;

export type ICreateAssignment = Omit<IBaseAssignment, 'status' | 'assignedAt'> & {
  status?: AssignmentStatus;
  assignedAt?: string | null;
};

export type IUpdateAssignment = Partial<IBaseAssignment>;

export type AssignmentRow = IListAssignment;
