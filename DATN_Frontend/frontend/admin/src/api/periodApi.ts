import type { BaseListParams, ListResponseType } from '@shared/types/GeneralType';
import type { BatchStatus, BatchType, ICreatePeriod, IDetailPeriod, IListPeriod, IUpdatePeriod } from '../type/PeriodType';

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
    const rows = filterPeriods(periodStore, params);
    const page = params.page || 1;
    const limit = params.limit || rows.length || 10;
    const start = (page - 1) * limit;
    const pagedRows = rows.slice(start, start + limit);

    return {
      rows: pagedRows,
      total: rows.length,
    };
  },

  getPeriodDetail: async (id: string): Promise<IDetailPeriod | undefined> => {
    return periodStore.find((row) => row.id === id);
  },

  createPeriod: async ({ body }: { body: ICreatePeriod; params: BaseListParams }) => {
    const nextId = `B${String(periodStore.length + 1).padStart(3, '0')}`;
    const newPeriod: IListPeriod = {
      id: nextId,
      ...body,
    };
    periodStore = [newPeriod, ...periodStore];
    return newPeriod as IDetailPeriod;
  },

  updatePeriod: async ({ id, body }: { id: string; body: IUpdatePeriod; index: number; params: BaseListParams }) => {
    const current = periodStore.find((row) => row.id === id);
    const updated = { ...current, ...body, id } as IListPeriod;
    periodStore = periodStore.map((row) => (row.id === id ? updated : row));
    return updated as IDetailPeriod;
  },

  deletePeriod: async ({ id }: { id: string; params: BaseListParams }) => {
    periodStore = periodStore.filter((row) => row.id !== id);
    return { success: true, id };
  },
};
