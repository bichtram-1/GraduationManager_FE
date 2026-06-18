export type CompanyStatus = 'active' | 'pending' | 'paused';
export type CompanyReviewStatus = 'pending' | 'approved' | 'rejected';

interface IBaseCompany {
  name: string;
  taxId: string;
  field: string;
  contact: string;
  phone?: string;
  email?: string;
  partners?: number;
  students?: number;
  status: CompanyStatus;
  reviewStatus?: CompanyReviewStatus;
}

export interface IListCompany extends IBaseCompany {
  id: string;
}

export interface IDetailCompany extends IBaseCompany {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ICreateCompany = IBaseCompany;

export type IUpdateCompany = Partial<IBaseCompany>;
