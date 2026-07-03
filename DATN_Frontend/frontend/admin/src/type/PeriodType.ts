export type BatchType = 'tttn' | 'datn';
export type BatchStatus = 'open' | 'published' | 'grading' | 'closed';

export type Semester = '1' | '2' | 'HE';

interface IBasePeriod {
  name: string;
  type: BatchType;
  startDate: string;
  endDate: string;
  regDeadline: string;
  regOpenDate?: string;
  reportDeadline?: string;
  gradingStartDate?: string;
  gradingEndDate?: string;
  semester?: Semester;
  schoolYear?: string;
  studentListUrl?: string;
  studentListFileName?: string;
  classIds?: string[];
  externalStudentIds?: string[];
  externalStudents?: any[];
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
