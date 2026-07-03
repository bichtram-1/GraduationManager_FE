export type TopicStatus = 'pending' | 'approved' | 'rejected';

interface IBaseTopic {
  code?: string;
  name: string;
  teacher: string;
  slots: string;
  rejectReason?: string;
  status: TopicStatus;
  fileUrl?: string;
}

export interface IListTopic extends IBaseTopic {
  id: string;
}

export interface IDetailTopic extends IBaseTopic {
  id: string;
}

export type ICreateTopic = IBaseTopic;

export type IUpdateTopic = Partial<IBaseTopic>;
