import axiosInstance from '../axios/axios-config';

export interface IStudentDashboardData {
  student: {
    id: number;
    studentCode: string;
    name: string;
    email: string;
    phone: string;
    className: string;
  };
  tttn: {
    hasPeriod: boolean;
    periodName: string | null;
    status: string;
    companyName: string | null;
    mentor: string | null;
    position: string | null;
    supervisorTeacher: string | null;
    trangThaiDangKy: string | null;
  };
  datn: {
    hasPeriod: boolean;
    periodName: string | null;
    status: string;
    topicTitle: string | null;
    instructor: string | null;
    groupName: string | null;
    groupId: number | null;
  };
  reportsCount: number;
  expectedScore: number;
  pendingTasks: string[];
  milestones: {
    date: string;
    title: string;
  }[];
  companiesCount: number;
}

export interface ICompany {
  code: string;
  name: string;
  taxId?: string;
  field: string;
  address: string;
  mentor: string;
  phone: string;
  email: string;
  duration: string;
}

export interface IInternshipDeclareInput {
  companyName: string;
  taxId: string;
  field?: string;
  position?: string;
  address?: string;
  mentor?: string;
  phone?: string;
  email?: string;
  duration?: string;
  confirmPaper?: boolean;
  internshipAddress?: string;
}

export interface IInternshipDeclareResult {
  id: string;
  companyName: string;
  status: string;
  confirmPaper: boolean;
}

export interface IGroupInviteOutgoing {
  id: string;
  inviteId?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface IGroupInviteIncoming {
  id: string;
  from: string;
  topic: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface IProgressReport {
  week: number;
  title: string;
  status: string;
  file: string;
  fileUrl?: string;
  note: string;
  teacherComment?: string | null;
  updated: string;
}

export interface IDatnProgressReport {
  week: number;
  name: string;
  status: string;
  file: string;
  fileUrl?: string;
  note: string;
  teacherComment?: string | null;
  updated: string;
}

export interface IStudentResults {
  tttn: {
    finalScore: string;
    status: string;
    note: string;
    records: { id: string; label: string; score: string; note: string; updatedAt: string }[];
  };
  datn: {
    reportScore: string;
    defenseScore: string;
    finalScore: string;
    status: string;
    records: { id: string; label: string; score: string; note: string; updatedAt: string }[];
  };
  summary: {
    tttnScore: string;
    datnScore: string;
    classification: string;
    updatedAt: string;
  };
}

export interface IThesisRegistration {
  topicId: string;
  topicTitle: string;
  groupName: string;
  batch: string;
  submittedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  note: string;
  instructor?: string | null;
  members?: { studentCode: string; name: string; isLeader?: boolean; isCurrent?: boolean }[];
}

export const studentApi = {
  getDashboard: async (): Promise<IStudentDashboardData> => {
    const response = await axiosInstance.get('/private/v1/student/dashboard');
    return response?.data?.results?.object || response?.data;
  },

  lookupCompanyByTaxId: async (taxId: string): Promise<{ name: string; address: string } | null> => {
    try {
      const response = await axiosInstance.get('/private/v1/student/companies/lookup-tax', { params: { taxId } });
      return response?.data?.results?.object || null;
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      throw new Error(message || 'Tra cứu mã số thuế thất bại.');
    }
  },

  getCompanies: async (periodId?: number | string): Promise<ICompany[]> => {
    const response = await axiosInstance.get('/private/v1/student/companies', { params: { periodId } });
    return response?.data?.results?.objects || response?.data;
  },

  declareInternship: async (data: IInternshipDeclareInput, periodId?: number | string): Promise<IInternshipDeclareResult> => {
    const response = await axiosInstance.post('/private/v1/student/internships/declare', data, { params: { periodId } });
    return response?.data?.results?.object || response?.data;
  },

  getMyInternshipRequest: async (periodId?: number | string): Promise<unknown> => {
    const response = await axiosInstance.get('/private/v1/student/internships/my-request', { params: { periodId } });
    return response?.data?.results?.object || response?.data;
  },

  getMyThesisRegistration: async (periodId?: number | string): Promise<IThesisRegistration | null> => {
    const response = await axiosInstance.get('/private/v1/student/thesis/my-registration', { params: { periodId } });
    return response?.data?.results?.object || null;
  },

  registerThesis: async (topicId: number): Promise<IThesisRegistration> => {
    const response = await axiosInstance.post('/private/v1/student/thesis/register', { topicId });
    return response?.data?.results?.object || response?.data;
  },

  cancelThesisRegistration: async (): Promise<unknown> => {
    const response = await axiosInstance.post('/private/v1/student/thesis/cancel');
    return response?.data;
  },

  leaveGroup: async (): Promise<unknown> => {
    const response = await axiosInstance.post('/private/v1/student/thesis/group/leave');
    return response?.data;
  },

  getOutgoingInvitations: async (periodId?: number | string): Promise<IGroupInviteOutgoing[]> => {
    const response = await axiosInstance.get('/private/v1/student/thesis/invitations/outgoing', { params: { periodId } });
    return response?.data?.results?.objects || response?.data?.results?.object || [];
  },

  sendInvitation: async (studentCode: string, topicId?: string | null): Promise<IGroupInviteOutgoing> => {
    const response = await axiosInstance.post('/private/v1/student/thesis/invitations/send', { studentCode, topicId });
    return response?.data?.results?.object || response?.data;
  },

  cancelInvitation: async (inviteId: string): Promise<unknown> => {
    const response = await axiosInstance.post(`/private/v1/student/thesis/invitations/${inviteId}/cancel`);
    return response?.data;
  },

  getIncomingInvitations: async (periodId?: number | string): Promise<IGroupInviteIncoming[]> => {
    const response = await axiosInstance.get('/private/v1/student/thesis/invitations/incoming', { params: { periodId } });
    return response?.data?.results?.objects || response?.data?.results?.object || [];
  },

  acceptInvitation: async (id: string): Promise<unknown> => {
    const response = await axiosInstance.post(`/private/v1/student/thesis/invitations/${id}/accept`);
    return response?.data;
  },

  rejectInvitation: async (id: string): Promise<unknown> => {
    const response = await axiosInstance.post(`/private/v1/student/thesis/invitations/${id}/reject`);
    return response?.data;
  },

  getTttnReports: async (): Promise<{ reports: IProgressReport[], hasGvhd?: boolean, isInternshipApproved?: boolean }> => {
    const response = await axiosInstance.get('/private/v1/student/reports/tttn');
    const objects = response?.data?.results?.objects || response?.data?.results?.object || [];
    const hasGvhd = response?.data?.results?.hasGvhd !== false;
    const isInternshipApproved = response?.data?.results?.isInternshipApproved !== false;
    return {
      reports: objects,
      hasGvhd,
      isInternshipApproved
    };
  },

  submitTttnReport: async (data: { week: number; title: string; note: string; file?: string; fileName?: string }): Promise<IProgressReport> => {
    const response = await axiosInstance.post('/private/v1/student/reports/tttn', data)
    return response?.data?.results?.object || response?.data;
  },

  getDatnReports: async (): Promise<{ reports: IDatnProgressReport[], isTopicApproved?: boolean }> => {
    const response = await axiosInstance.get('/private/v1/student/reports/datn');
    const objects = response?.data?.results?.objects || response?.data?.results?.object || [];
    const isTopicApproved = response?.data?.results?.isTopicApproved !== false;
    return {
      reports: objects,
      isTopicApproved
    };
  },

  submitDatnReport: async (data: { week: number; name: string; note: string; file?: string; fileName?: string }): Promise<IDatnProgressReport> => {
    const response = await axiosInstance.post('/private/v1/student/reports/datn', data);
    return response?.data?.results?.object || response?.data;
  },

  getStudentResults: async (): Promise<IStudentResults> => {
    const response = await axiosInstance.get('/private/v1/student/results');
    return response?.data?.results?.object || response?.data;
  },

  getHistory: async (): Promise<{ log_id: number; sinh_vien_id?: number; ma_so_sinh_vien?: string; nhom_id?: number; role: string; user_name: string; action_type: string; description: string; details?: string; created_at: string }[]> => {
    const response = await axiosInstance.get('/private/v1/student/history');
    return response?.data?.results?.objects || [];
  }
};
