import type { BaseListParams } from '@shared/types/GeneralType';
import type { CompanyReviewStatus, CompanyStatus, ICreateCompany, IDetailCompany, IListCompany, IUpdateCompany } from '../type/CompanyType';

import axiosInstance from './axiosInstance';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

type CompanyRow = IListCompany & {
  phone: string;
  email: string;
  partners: number;
  students: number;
  reviewStatus: CompanyReviewStatus;
  status: CompanyStatus;
};

const MOCK_COMPANIES: CompanyRow[] = [
  { id: 'C001', name: 'FPT Software', taxId: '0101243150', field: 'Phần mềm & công nghệ', contact: 'Nguyễn Văn Hùng', phone: '0901234567', email: 'hungnv@fpt.com', partners: 4, students: 18, status: 'active', reviewStatus: 'approved' },
  { id: 'C002', name: 'VNG Corporation', taxId: '0303010740', field: 'Công nghệ số', contact: 'Lê Thị Mai', phone: '0909111222', email: 'mai.lt@vng.com', partners: 2, students: 9, status: 'active', reviewStatus: 'approved' },
  { id: 'C003', name: 'TMA Solutions', taxId: '0309876543', field: 'Gia công phần mềm', contact: 'Trần Minh Khoa', phone: '0933444555', email: 'khoa.tm@tma.com', partners: 1, students: 5, status: 'pending', reviewStatus: 'pending' },
  { id: 'C004', name: 'Shopee Vietnam', taxId: '0315643210', field: 'Thương mại điện tử', contact: 'Phạm Thị Linh', phone: '0911222333', email: 'linh.pt@shopee.vn', partners: 3, students: 12, status: 'paused', reviewStatus: 'rejected' },
];

let companyStore = [...MOCK_COMPANIES];

export const companyApi = {
  getListCompany: async () => {
    if (USE_MOCK) {
      return {
        rows: companyStore,
        total: companyStore.length,
      };
    }

    const response = await axiosInstance.get('/private/v1/companies');
    return response?.data?.results?.objects;
  },

  getCompanyDetail: async (id: string): Promise<IDetailCompany> => {
    if (USE_MOCK) {
      const company = companyStore.find((item) => item.id === id);

      if (!company) {
        throw new Error('Company not found');
      }

      return company;
    }

    const response = await axiosInstance.get(`/private/v1/companies/${id}`);
    return response?.data?.results?.object;
  },

  createCompany: async ({ body }: { body: ICreateCompany; params: BaseListParams }) => {
    if (USE_MOCK) {
      const nextId = `C${String(companyStore.length + 1).padStart(3, '0')}`;
      const newCompany: CompanyRow = {
        id: nextId,
        name: body.name,
        taxId: body.taxId,
        field: body.field,
        contact: body.contact,
        phone: body.phone || '',
        email: body.email || '',
        partners: body.partners || 0,
        students: body.students || 0,
        status: body.status,
        reviewStatus: body.reviewStatus || 'pending',
      };
      companyStore = [newCompany, ...companyStore];
      return newCompany;
    }

    const response = await axiosInstance.post('/private/v1/companies', body);
    return response?.data?.results?.object;
  },

  updateCompany: async ({ id, body }: { id: string; body: IUpdateCompany; index: number; params: BaseListParams }) => {
    if (USE_MOCK) {
      const updated = companyStore.map((company) => (company.id === id ? { ...company, ...body, id } : company));
      companyStore = updated;
      return updated.find((company) => company.id === id) as IDetailCompany;
    }

    const response = await axiosInstance.patch(`/private/v1/companies/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteCompany: async ({ id }: { id: string; params: BaseListParams }) => {
    if (USE_MOCK) {
      companyStore = companyStore.filter((company) => company.id !== id);
      return { success: true, id };
    }

    const response = await axiosInstance.delete(`/private/v1/companies/${id}`);
    return response?.data;
  },
};
