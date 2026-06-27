import axiosInstance from '../axios/axios-config';

const USE_MOCK = false;

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
  companies: {
    name: string;
    field: string;
    address: string;
    slots: string;
  }[];
}

export interface ICompany {
  code: string;
  name: string;
  field: string;
  address: string;
  mentor: string;
  phone: string;
  email: string;
  slots: number;
  duration: string;
  status: string;
  highlights: string[];
}

export interface IInternshipDeclareInput {
  companyName: string;
  field?: string;
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
  updated: string;
}

export interface IDatnProgressReport {
  name: string;
  status: string;
  file: string;
  repo: string;
  note: string;
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
}

export const studentApi = {
  getDashboard: async (): Promise<IStudentDashboardData> => {
    if (USE_MOCK) {
      return {
        student: {
          id: 1,
          studentCode: '0306231001',
          name: 'Nguyễn Minh Khoa (Mock)',
          email: '0306231001@caothang.edu.vn',
          phone: '0911001001',
          className: 'CĐTH23WEBA'
        },
        tttn: {
          hasPeriod: true,
          periodName: 'TTTN HK2/2025-2026',
          status: 'Chờ phê duyệt',
          companyName: 'FPT Software',
          mentor: 'Nguyễn Văn A',
          trangThaiDangKy: 'CHO_DUYET'
        },
        datn: {
          hasPeriod: true,
          periodName: 'ĐATN HK2/2025-2026',
          status: 'Đã đăng ký',
          topicTitle: 'Hệ thống IoT giám sát nông nghiệp',
          instructor: 'TS. Nguyễn Văn X',
          groupName: 'Nhóm số #G100',
          groupId: 100
        },
        reportsCount: 3,
        expectedScore: 8.12,
        pendingTasks: [
          'Khai báo nơi thực tập trước 30/04.',
          'Nộp nhật ký tuần 3 cho GVHD.',
          'Cập nhật bản thảo chương 2 của ĐATN.'
        ],
        milestones: [
          { date: '30/04', title: 'Hết hạn đăng ký TTTN' },
          { date: '05/05', title: 'Nộp nhật ký tuần 3' },
          { date: '20/06', title: 'Công bố kết quả ĐATN' }
        ],
        companies: [
          { name: 'FPT Software', field: 'Phần mềm', address: 'Quận 9, TP.HCM', slots: '15' },
          { name: 'VNG Corp', field: 'Internet', address: 'Quận 7, TP.HCM', slots: '8' },
          { name: 'MoMo', field: 'Fintech', address: 'Quận 3, TP.HCM', slots: '5' }
        ]
      };
    }

    const response = await axiosInstance.get('/private/v1/student/dashboard');
    return response?.data?.results?.object || response?.data;
  },

  getCompanies: async (): Promise<ICompany[]> => {
    if (USE_MOCK) {
      return [
        {
          code: 'C001',
          name: 'FPT Software',
          field: 'Phần mềm',
          address: 'Quận 9, TP.HCM',
          mentor: 'Nguyễn A',
          phone: '0901234567',
          email: 'mentor.fpt@fpt.com',
          slots: 15,
          duration: '8 tuần',
          status: 'Đã duyệt',
          highlights: ['Có mentor kỹ thuật', 'Hỗ trợ onsite', 'Phù hợp backend/frontend'],
        },
        {
          code: 'C002',
          name: 'VNG Corp',
          field: 'Internet',
          address: 'Quận 7, TP.HCM',
          mentor: 'Trần B',
          phone: '0909111222',
          email: 'mentor.vng@vng.com',
          slots: 8,
          duration: '10 tuần',
          status: 'Đã duyệt',
          highlights: ['Môi trường product', 'Quy trình rõ ràng', 'Có bài test đầu vào'],
        },
        {
          code: 'C006',
          name: 'MoMo',
          field: 'Fintech',
          address: 'Quận 3, TP.HCM',
          mentor: 'Hoàng F',
          phone: '0988777666',
          email: 'mentor.momo@momo.vn',
          slots: 5,
          duration: '8 tuần',
          status: 'Còn slot',
          highlights: ['Ưu tiên ứng viên chủ động', 'Có code review', 'Thực hành với dự án thực'],
        },
      ];
    }

    const response = await axiosInstance.get('/private/v1/student/companies');
    return response?.data?.results?.objects || response?.data;
  },

  declareInternship: async (data: IInternshipDeclareInput): Promise<IInternshipDeclareResult> => {
    if (USE_MOCK) {
      return {
        id: 'CONF_MOCK',
        companyName: data.companyName,
        status: 'pending',
        confirmPaper: !!data.confirmPaper,
      };
    }

    const response = await axiosInstance.post('/private/v1/student/internships/declare', data);
    return response?.data?.results?.object || response?.data;
  },

  getMyInternshipRequest: async (): Promise<unknown> => {
    if (USE_MOCK) {
      return null;
    }

    const response = await axiosInstance.get('/private/v1/student/internships/my-request');
    return response?.data?.results?.object || response?.data;
  },

  getMyThesisRegistration: async (): Promise<IThesisRegistration | null> => {
    if (USE_MOCK) {
      return {
        topicId: '1',
        topicTitle: 'Hệ thống IoT giám sát nông nghiệp (Mock)',
        groupName: 'Nhóm Alpha (Mock)',
        batch: 'Đợt HK2/2025-2026',
        submittedAt: '23/05/2026 09:20',
        status: 'pending',
        note: 'Đã nộp hồ sơ và đang chờ giảng viên duyệt.'
      };
    }

    const response = await axiosInstance.get('/private/v1/student/thesis/my-registration');
    return response?.data?.results?.object || null;
  },

  registerThesis: async (topicId: number): Promise<IThesisRegistration> => {
    if (USE_MOCK) {
      return {
        topicId: String(topicId),
        topicTitle: 'Hệ thống IoT giám sát nông nghiệp (Mock)',
        groupName: 'Nhóm Alpha (Mock)',
        batch: 'Đợt HK2/2025-2026',
        submittedAt: new Date().toLocaleString('vi-VN'),
        status: 'pending',
        note: 'Đã nộp hồ sơ và đang chờ giảng viên duyệt.'
      };
    }

    const response = await axiosInstance.post('/private/v1/student/thesis/register', { topicId });
    return response?.data?.results?.object || response?.data;
  },

  cancelThesisRegistration: async (): Promise<unknown> => {
    if (USE_MOCK) {
      return { success: true };
    }

    const response = await axiosInstance.post('/private/v1/student/thesis/cancel');
    return response?.data;
  },

  getOutgoingInvitations: async (): Promise<IGroupInviteOutgoing[]> => {
    if (USE_MOCK) {
      return [
        { id: '20520002', status: 'pending' },
        { id: '20520003', status: 'accepted' },
        { id: '20520004', status: 'rejected' },
      ];
    }

    const response = await axiosInstance.get('/private/v1/student/thesis/invitations/outgoing');
    return response?.data?.results?.objects || response?.data?.results?.object || [];
  },

  sendInvitation: async (studentCode: string, topicId?: string | null): Promise<IGroupInviteOutgoing> => {
    if (USE_MOCK) {
      return { id: studentCode, status: 'pending' };
    }

    const response = await axiosInstance.post('/private/v1/student/thesis/invitations/send', { studentCode, topicId });
    return response?.data?.results?.object || response?.data;
  },

  getIncomingInvitations: async (): Promise<IGroupInviteIncoming[]> => {
    if (USE_MOCK) {
      return [
        { id: '20520007', from: 'Nguyễn Văn B', topic: 'DT001', status: 'pending' },
        { id: '20520009', from: 'Lê Thị C', topic: 'DT004', status: 'pending' },
      ];
    }

    const response = await axiosInstance.get('/private/v1/student/thesis/invitations/incoming');
    return response?.data?.results?.objects || response?.data?.results?.object || [];
  },

  acceptInvitation: async (id: string): Promise<unknown> => {
    if (USE_MOCK) {
      return { success: true };
    }

    const response = await axiosInstance.post(`/private/v1/student/thesis/invitations/${id}/accept`);
    return response?.data;
  },

  rejectInvitation: async (id: string): Promise<unknown> => {
    if (USE_MOCK) {
      return { success: true };
    }

    const response = await axiosInstance.post(`/private/v1/student/thesis/invitations/${id}/reject`);
    return response?.data;
  },

  getTttnReports: async (): Promise<IProgressReport[]> => {
    if (USE_MOCK) {
      return [
        { week: 1, title: 'Làm quen môi trường công ty', status: 'Đã duyệt', file: 'week1.pdf', note: 'Giới thiệu cấu trúc phòng ban', updated: '12/05/2026' },
        { week: 2, title: 'Nghiên cứu công nghệ', status: 'Đã duyệt', file: 'week2.pdf', note: 'Khảo sát stack nội bộ', updated: '19/05/2026' },
        { week: 3, title: 'Phát triển tính năng A', status: 'Nháp', file: '—', note: 'Đang viết dàn ý báo cáo', updated: '23/05/2026' },
      ];
    }

    const response = await axiosInstance.get('/private/v1/student/reports/tttn');
    return response?.data?.results?.objects || response?.data?.results?.object || [];
  },

  submitTttnReport: async (data: { week: number; title: string; note: string; file?: File | string }): Promise<IProgressReport> => {
    if (USE_MOCK) {
      return {
        week: data.week,
        title: data.title,
        status: 'Chờ duyệt',
        file: typeof data.file === 'string' ? data.file : (data.file?.name || `week${data.week}.pdf`),
        note: data.note,
        updated: new Date().toLocaleDateString('vi-VN')
      };
    }

    const formData = new FormData()
    formData.append('week', String(data.week))
    formData.append('title', data.title)
    formData.append('note', data.note)
    if (data.file) {
      formData.append('file', data.file)
    }

    const response = await axiosInstance.post('/private/v1/student/reports/tttn', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response?.data?.results?.object || response?.data;
  },

  getDatnReports: async (): Promise<IDatnProgressReport[]> => {
    if (USE_MOCK) {
      return [
        { name: 'Bản thảo Chương 1', status: 'Đã duyệt', file: 'chuong1.pdf', repo: 'github.com/user/project', note: 'Phạm vi đề tài và tổng quan', updated: '05/05/2026' },
        { name: 'Bản thảo Chương 2', status: 'Đang chấm điểm', file: 'chuong2.pdf', repo: 'github.com/user/project', note: 'Thiết kế và cơ sở lý thuyết', updated: '14/05/2026' },
        { name: 'Báo cáo chính thức', status: 'Nháp', file: '—', repo: '—', note: 'Hoàn thiện kết luận và phụ lục', updated: '23/05/2026' },
      ];
    }

    const response = await axiosInstance.get('/private/v1/student/reports/datn');
    return response?.data?.results?.objects || response?.data?.results?.object || [];
  },

  submitDatnReport: async (data: { name: string; note: string; repo?: string; file?: string }): Promise<IDatnProgressReport> => {
    if (USE_MOCK) {
      return {
        name: data.name,
        status: 'Đang chấm điểm',
        file: data.file || 'draft.pdf',
        repo: data.repo || '—',
        note: data.note,
        updated: new Date().toLocaleDateString('vi-VN')
      };
    }

    const response = await axiosInstance.post('/private/v1/student/reports/datn', data);
    return response?.data?.results?.object || response?.data;
  },

  getStudentResults: async (): Promise<IStudentResults> => {
    if (USE_MOCK) {
      return {
        tttn: {
          finalScore: '8.5',
          status: 'Hoàn thành',
          note: 'Sinh viên đã nộp đủ báo cáo tuần và hoàn thành mục tiêu thực tập.',
          records: [
            { id: 'tttn-1', label: 'Báo cáo tuần', score: '8.5', note: 'Ổn định, đầy đủ số tuần', updatedAt: 'Hôm nay' },
            { id: 'tttn-2', label: 'Nhận xét GVHD', score: '8.3', note: 'Tiến độ tốt, phản hồi nhanh', updatedAt: 'Hôm nay' },
          ]
        },
        datn: {
          reportScore: '7.8',
          defenseScore: '8.2',
          finalScore: '8.12',
          status: 'ĐẠT',
          records: [
            { id: 'datn-1', label: 'Điểm báo cáo', score: '7.8', note: 'Tài liệu rõ ràng, đúng form', updatedAt: 'Hôm nay' },
            { id: 'datn-2', label: 'Điểm bảo vệ', score: '8.2', note: 'Thuyết trình tốt, trả lời ổn', updatedAt: 'Hôm nay' },
          ]
        },
        summary: {
          tttnScore: '8.5',
          datnScore: '8.12',
          classification: 'Giỏi',
          updatedAt: 'Mới nhất'
        }
      };
    }

    const response = await axiosInstance.get('/private/v1/student/results');
    return response?.data?.results?.object || response?.data;
  }
};
