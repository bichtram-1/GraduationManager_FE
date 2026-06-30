export type GroupStatus = 'PENDING' | 'APPROVED' | 'WARNING' | 'MISSING' | 'LOCKED' | 'DISSOLVED';

export interface IGroupMember {
  id: string;
  name: string;
  code?: string;
  class?: string;
  eligible?: boolean;
  reason?: string;
}

interface IBaseGroup {
  code: string;
  title: string;
  supervisor: string;
  members: IGroupMember[];
  maxMembers: number;
  status: GroupStatus;
  registrationBatch: string;
  topicDirection?: string;
}

export interface IListGroup extends IBaseGroup {
  id: string;
}

export interface IDetailGroup extends IBaseGroup {
  id: string;
  createdAt?: string;
}

export type ICreateGroup = IBaseGroup;

export type IUpdateGroup = Partial<IBaseGroup>;
