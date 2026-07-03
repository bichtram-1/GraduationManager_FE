export type ConfirmationStatus = 'pending' | 'approved' | 'rejected' | 'cho_cap_giay';
export type NoCompanyStatus = 'not_registered' | 'has_company';

export interface IConfirmationRequest {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  companyName: string;
  companyAddress: string;
  internshipLocation: string;
  taxId: string;
  mentor: string;
  regDate: string;
  status: ConfirmationStatus;
}

export interface INoCompanyStudent {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  phone: string;
  status: NoCompanyStatus;
  supervisor?: string | null;
  assignmentStatus?: 'assigned' | 'unassigned';
  companyName?: string;
  internshipLocation?: string;
}

export type ICreateConfirmationRequest = Omit<IConfirmationRequest, 'id'>;
export type IUpdateConfirmationRequest = Partial<Omit<IConfirmationRequest, 'id'>>;
export type ICreateNoCompanyStudent = Omit<INoCompanyStudent, 'id'>;
export type IUpdateNoCompanyStudent = Partial<Omit<INoCompanyStudent, 'id'>>;
