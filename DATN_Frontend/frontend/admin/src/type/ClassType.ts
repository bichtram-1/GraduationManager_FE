export type ClassStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface IClassMember {
  id: string;
  name: string;
  code?: string;
}

interface IBaseClass {
  code: string;
  name: string;
  year?: string;
  supervisor?: string;
  members: IClassMember[];
  maxStudents: number;
  status: ClassStatus;
}

export interface IListClass extends IBaseClass {
  id: string;
}

export interface IDetailClass extends IBaseClass {
  id: string;
  createdAt?: string;
}

export type ICreateClass = IBaseClass;
export type IUpdateClass = Partial<IBaseClass>;
