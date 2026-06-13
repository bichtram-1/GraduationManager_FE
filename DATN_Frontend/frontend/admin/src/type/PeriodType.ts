export type BatchType = 'tttn' | 'datn';
export type BatchStatus = 'open' | 'published' | 'grading' | 'closed';

interface IBasePeriod {
  name: string;
  type: BatchType;
  startDate: string;
  endDate: string;
  regDeadline: string;
  studentListUrl?: string;
  studentListFileName?: string;
  classIds?: string[];
  numberDN?: number;
  numberSV?: number;
  numberTopics?: number;
  numberCouncils?: number;
  status: BatchStatus;
}

export interface IListPeriod extends IBasePeriod {
  id: string;
}

export interface IDetailPeriod extends IBasePeriod {
  id: string;
}

export type ICreatePeriod = IBasePeriod;

export type IUpdatePeriod = Partial<IBasePeriod>;
