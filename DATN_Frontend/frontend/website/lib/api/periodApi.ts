import axiosInstance from '../axios/axios-config';

const USE_MOCK = false;

export interface IListPeriod {
  id: string;
  name: string;
  type: 'tttn' | 'datn';
  startDate: string;
  endDate: string;
  regDeadline: string;
  status: 'open' | 'published' | 'grading' | 'closed';
  studentListFileName?: string;
  studentListUrl?: string;
  numberDN?: number;
  numberSV?: number;
  numberTopics?: number;
  numberCouncils?: number;
}

const MOCK_PERIODS: IListPeriod[] = [
  {
    id: 'B001',
    name: 'TTTN HK2/2025-2026',
    type: 'tttn',
    startDate: '01/05/2026',
    endDate: '30/07/2026',
    regDeadline: '25/04/2026',
    studentListFileName: 'danh-sach-sinh-vien-tttn-hk2-2025-2026.xlsx',
    studentListUrl: 'https://example.com/danh-sach-sinh-vien-tttn-hk2-2025-2026.xlsx',
    numberDN: 15,
    numberSV: 124,
    status: 'open',
  },
  {
    id: 'B002',
    name: 'TTTN HK1/2025-2026',
    type: 'tttn',
    startDate: '01/09/2025',
    endDate: '30/12/2025',
    regDeadline: '25/08/2025',
    studentListFileName: 'danh-sach-sinh-vien-tttn-hk1-2025-2026.xlsx',
    studentListUrl: 'https://example.com/danh-sach-sinh-vien-tttn-hk1-2025-2026.xlsx',
    numberDN: 12,
    numberSV: 102,
    status: 'published',
  },
  {
    id: 'B003',
    name: 'ĐATN HK2/2025-2026',
    type: 'datn',
    startDate: '01/01/2026',
    endDate: '30/06/2026',
    regDeadline: '25/12/2025',
    numberTopics: 28,
    numberCouncils: 8,
    status: 'grading',
  },
  {
    id: 'B004',
    name: 'ĐATN HK1/2025-2026',
    type: 'datn',
    startDate: '01/08/2025',
    endDate: '31/12/2025',
    regDeadline: '20/07/2025',
    numberTopics: 24,
    numberCouncils: 6,
    status: 'closed',
  },
];

export const periodApi = {
  getListPeriod: async (): Promise<{ rows: IListPeriod[]; total: number }> => {
    if (USE_MOCK) {
      return {
        rows: MOCK_PERIODS,
        total: MOCK_PERIODS.length,
      };
    }

    const response = await axiosInstance.get('/private/v1/periods');
    return response?.data?.results?.objects || { rows: [], total: 0 };
  },
};
