import type { BaseListParams, ListResponseType } from '@shared/types/GeneralType';
import type { BatchStatus, BatchType, ICreatePeriod, IDetailPeriod, IListPeriod, IUpdatePeriod } from '../type/PeriodType';

import axiosInstance from './axiosInstance';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

export interface IPeriodListParams extends BaseListParams {
  type?: BatchType | 'all';
  status?: BatchStatus | 'all';
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

let periodStore = [...MOCK_PERIODS];

const filterPeriods = (rows: IListPeriod[], params: IPeriodListParams) => {
  const keyword = (params.keyword || '').trim().toLowerCase();

  return rows.filter((row) => {
    const byType = params.type && params.type !== 'all' ? row.type === params.type : true;
    const byStatus = params.status && params.status !== 'all' ? row.status === params.status : true;
    const byKeyword =
      !keyword ||
      [row.id, row.name, row.startDate, row.endDate, row.regDeadline]
        .join(' ')
        .toLowerCase()
        .includes(keyword);

    return byType && byStatus && byKeyword;
  });
};

export const periodApi = {
  getListPeriod: async (params: IPeriodListParams): Promise<ListResponseType<IListPeriod>['results']['objects']> => {
    if (USE_MOCK) {
      const rows = filterPeriods(periodStore, params);
      const page = params.page || 1;
      const limit = params.limit || rows.length || 10;
      const start = (page - 1) * limit;
      const pagedRows = rows.slice(start, start + limit);

      return {
        rows: pagedRows,
        total: rows.length,
      };
    }

    const response = await axiosInstance.get('/private/v1/periods', { params });
    return response?.data?.results?.objects;
  },

  getPeriodDetail: async (id: string): Promise<IDetailPeriod | undefined> => {
    if (USE_MOCK) {
      return periodStore.find((row) => row.id === id);
    }

    const response = await axiosInstance.get(`/private/v1/periods/${id}`);
    return response?.data?.results?.object;
  },

  createPeriod: async ({ body }: { body: ICreatePeriod; params: BaseListParams }) => {
    if (USE_MOCK) {
      const nextId = `B${String(periodStore.length + 1).padStart(3, '0')}`;
      const newPeriod: IListPeriod = {
        id: nextId,
        ...body,
      };
      periodStore = [newPeriod, ...periodStore];
      return newPeriod as IDetailPeriod;
    }

    const response = await axiosInstance.post('/private/v1/periods', body);
    return response?.data?.results?.object;
  },

  updatePeriod: async ({ id, body }: { id: string; body: IUpdatePeriod; index: number; params: BaseListParams }) => {
    if (USE_MOCK) {
      const current = periodStore.find((row) => row.id === id);
      const updated = { ...current, ...body, id } as IListPeriod;
      periodStore = periodStore.map((row) => (row.id === id ? updated : row));
      return updated as IDetailPeriod;
    }

    const response = await axiosInstance.patch(`/private/v1/periods/${id}`, body);
    return response?.data?.results?.object;
  },

  deletePeriod: async ({ id }: { id: string; params: BaseListParams }) => {
    if (USE_MOCK) {
      periodStore = periodStore.filter((row) => row.id !== id);
      return { success: true, id };
    }

    const response = await axiosInstance.delete(`/private/v1/periods/${id}`);
    return response?.data;
  },
};
