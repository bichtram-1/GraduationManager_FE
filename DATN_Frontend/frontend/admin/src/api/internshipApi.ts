import type { BaseListParams } from '@shared/types/GeneralType';
import type { ConfirmationStatus, IConfirmationRequest, ICreateConfirmationRequest, ICreateNoCompanyStudent, INoCompanyStudent, IUpdateConfirmationRequest, IUpdateNoCompanyStudent, NoCompanyStatus } from '../type/InternshipType';

import axiosInstance from './axiosInstance';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

type ConfirmationRow = IConfirmationRequest & { periodId?: string };
type NoCompanyRow = INoCompanyStudent & { periodId?: string };

const MOCK_CONFIRMATIONS: ConfirmationRow[] = [
  { id: 'CR001', studentId: '20520001', studentName: 'Nguyễn Văn A', className: 'KTPM2020', companyName: 'FPT Software', companyAddress: 'Số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội', internshipLocation: 'Tòa nhà FPT, Hà Nội', taxId: '0123456789', mentor: 'Trần Văn Mentor', regDate: '15/04/2026', status: 'pending', periodId: 'B001' },
  { id: 'CR002', studentId: '20520002', studentName: 'Trần Thị B', className: 'CNPM2020', companyName: 'VNG Corp', companyAddress: '123 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM', internshipLocation: 'VNG Campus, TP.HCM', taxId: '0987654321', mentor: 'Nguyễn Thị Guide', regDate: '16/04/2026', status: 'approved', periodId: 'B001' },
  { id: 'CR003', studentId: '20520003', studentName: 'Lê Văn C', className: 'KTPM2020', companyName: 'TMA Solutions', companyAddress: '111 Nguyễn Đình Chính, Phú Nhuận, TP.HCM', internshipLocation: 'TMA Tower, TP.HCM', taxId: '0112233445', mentor: 'Phạm Văn Hướng', regDate: '17/04/2026', status: 'pending', periodId: 'B002' },
  { id: 'CR004', studentId: '20520004', studentName: 'Phạm Thị D', className: 'HTTT2020', companyName: 'Shopee VN', companyAddress: 'Lầu 10, Tòa nhà Capital Place, Hà Nội', internshipLocation: 'Shopee Office, Hà Nội', taxId: '0556677889', mentor: 'Võ Thị Lead', regDate: '18/04/2026', status: 'rejected', periodId: 'B002' },
];

const MOCK_NO_COMPANY: NoCompanyRow[] = [
  { id: 'NC001', studentId: '20520010', studentName: 'Đinh Thị H', className: 'KTPM2020', phone: '0912000111', status: 'not_registered', periodId: 'B001' },
  { id: 'NC002', studentId: '20520011', studentName: 'Phan Văn I', className: 'CNPM2020', phone: '0912000222', status: 'searching', periodId: 'B001' },
  { id: 'NC003', studentId: '20520012', studentName: 'Trương Thị J', className: 'KTPM2020', phone: '0912000333', status: 'not_registered', periodId: 'B001' },
  { id: 'NC004', studentId: '20520013', studentName: 'Ngô Văn K', className: 'HTTT2020', phone: '0912000444', status: 'searching', periodId: 'B002' },
  { id: 'NC005', studentId: '20520014', studentName: 'Đặng Thị L', className: 'CNPM2020', phone: '0912000555', status: 'not_registered', periodId: 'B002' },
  { id: 'NC006', studentId: '20520015', studentName: 'Võ Văn M', className: 'KTPM2020', phone: '0912000666', status: 'searching', periodId: 'B002' },
  { id: 'NC007', studentId: '20520016', studentName: 'Hoàng Thị N', className: 'HTTT2020', phone: '0912000777', status: 'not_registered', periodId: 'B002' },
];

let confirmationStore = [...MOCK_CONFIRMATIONS];
let noCompanyStore = [...MOCK_NO_COMPANY];

export const internshipApi = {
  getListConfirmationRequest: async (params?: { periodId?: string }) => {
    if (USE_MOCK) {
      const rows = params?.periodId
        ? confirmationStore.filter((row) => row.periodId === params.periodId)
        : confirmationStore;
      return { rows, total: rows.length };
    }

    const response = await axiosInstance.get('/private/v1/internships/confirmations', { params });
    return response?.data?.results?.objects;
  },

  getConfirmationRequestDetail: async (id: string) => {
    if (USE_MOCK) {
      return confirmationStore.find((row) => row.id === id);
    }

    const response = await axiosInstance.get(`/private/v1/internships/confirmations/${id}`);
    return response?.data?.results?.object;
  },

  createConfirmationRequest: async ({ body, params }: { body: ICreateConfirmationRequest; params: BaseListParams & { periodId?: string } }) => {
    if (USE_MOCK) {
      const nextId = `CR${String(confirmationStore.length + 1).padStart(3, '0')}`;
      const newRow: ConfirmationRow = { id: nextId, periodId: params?.periodId, ...body };
      confirmationStore = [newRow, ...confirmationStore];
      return newRow;
    }

    const response = await axiosInstance.post('/private/v1/internships/confirmations', body, { params });
    return response?.data?.results?.object;
  },

  updateConfirmationRequest: async ({ id, body }: { id: string; body: IUpdateConfirmationRequest; index: number; params: BaseListParams }) => {
    if (USE_MOCK) {
      confirmationStore = confirmationStore.map((row) => (row.id === id ? { ...row, ...body, id } : row));
      return confirmationStore.find((row) => row.id === id);
    }

    const response = await axiosInstance.patch(`/private/v1/internships/confirmations/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteConfirmationRequest: async ({ id }: { id: string; params: BaseListParams }) => {
    if (USE_MOCK) {
      confirmationStore = confirmationStore.filter((row) => row.id !== id);
      return { success: true, id };
    }

    const response = await axiosInstance.delete(`/private/v1/internships/confirmations/${id}`);
    return response?.data;
  },

  getListNoCompanyStudent: async (params?: { periodId?: string }) => {
    if (USE_MOCK) {
      const rows = params?.periodId
        ? noCompanyStore.filter((row) => row.periodId === params.periodId)
        : noCompanyStore;
      return { rows, total: rows.length };
    }

    const response = await axiosInstance.get('/private/v1/internships/no-company', { params });
    return response?.data?.results?.objects;
  },

  getNoCompanyStudentDetail: async (id: string) => {
    if (USE_MOCK) {
      return noCompanyStore.find((row) => row.id === id);
    }

    const response = await axiosInstance.get(`/private/v1/internships/no-company/${id}`);
    return response?.data?.results?.object;
  },

  createNoCompanyStudent: async ({ body, params }: { body: ICreateNoCompanyStudent; params: BaseListParams & { periodId?: string } }) => {
    if (USE_MOCK) {
      const nextId = `NC${String(noCompanyStore.length + 1).padStart(3, '0')}`;
      const newRow: NoCompanyRow = { id: nextId, periodId: params?.periodId, ...body };
      noCompanyStore = [newRow, ...noCompanyStore];
      return newRow;
    }

    const response = await axiosInstance.post('/private/v1/internships/no-company', body, { params });
    return response?.data?.results?.object;
  },

  updateNoCompanyStudent: async ({ id, body }: { id: string; body: IUpdateNoCompanyStudent; index: number; params: BaseListParams }) => {
    if (USE_MOCK) {
      noCompanyStore = noCompanyStore.map((row) => (row.id === id ? { ...row, ...body, id } : row));
      return noCompanyStore.find((row) => row.id === id);
    }

    const response = await axiosInstance.patch(`/private/v1/internships/no-company/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteNoCompanyStudent: async ({ id }: { id: string; params: BaseListParams }) => {
    if (USE_MOCK) {
      noCompanyStore = noCompanyStore.filter((row) => row.id !== id);
      return { success: true, id };
    }

    const response = await axiosInstance.delete(`/private/v1/internships/no-company/${id}`);
    return response?.data;
  },
};

