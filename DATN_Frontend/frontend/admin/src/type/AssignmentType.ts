export type AssignmentStatus = 'assigned' | 'unassigned';

interface IBaseAssignment {
  studentId: string;
  name: string;
  className: string;
  topic?: string;
  supervisor?: string | null;
  assignedAt?: string | null;
  status: AssignmentStatus;
  groupId?: string | null;
  groupCode?: string | null;
  groupStatus?: 'no_group' | 'ineligible_member' | 'no_topic' | 'topic_rejected' | 'topic_pending' | 'valid' | null;
  hasIneligibleMember?: boolean;
  hasTopic?: boolean;
  topicStatus?: 'approved' | 'no_registration' | 'all_rejected' | 'pending_registration' | null;
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
