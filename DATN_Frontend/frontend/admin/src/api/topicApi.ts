import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateTopic, IDetailTopic, IListTopic, IUpdateTopic, TopicStatus } from '../type/TopicType';

import axiosInstance from './axiosInstance';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

export interface ITopicListParams extends BaseListParams {
  status?: TopicStatus | 'all';
  periodId?: string;
}

const MOCK_TOPICS: (IListTopic & { periodId?: string })[] = [
  { id: 'DA001', code: 'DA001', name: 'Hệ thống IoT giám sát nông nghiệp', teacher: 'TS. Nguyễn Văn X', slots: '3/4', rejectReason: '', status: 'pending', periodId: 'B003' },
  { id: 'DA002', code: 'DA002', name: 'Ứng dụng AI nhận diện hình ảnh', teacher: 'TS. Trần Văn Y', slots: '2/3', rejectReason: '', status: 'approved', periodId: 'B003' },
  { id: 'DA003', code: 'DA003', name: 'Nền tảng e-commerce micro-service', teacher: 'ThS. Lê Thị Z', slots: '0/4', rejectReason: 'Chủ đề trùng lặp với đề tài DA005', status: 'rejected', periodId: 'B004' },
  { id: 'DA004', code: 'DA004', name: 'Chatbot hỗ trợ khách hàng', teacher: 'TS. Phạm Văn K', slots: '1/3', rejectReason: '', status: 'approved', periodId: 'B004' },
];

let topicStore = [...MOCK_TOPICS];

const filterTopics = (rows: (IListTopic & { periodId?: string })[], params: ITopicListParams) => {
  const keyword = (params.keyword || '').trim().toLowerCase();
  return rows.filter((row) => {
    const byStatus = params.status && params.status !== 'all' ? row.status === params.status : true;
    const byPeriod = params.periodId ? row.periodId === params.periodId : true;
    const byKeyword =
      !keyword ||
      [row.id, row.code, row.name, row.teacher, row.slots, row.rejectReason || '']
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    return byStatus && byPeriod && byKeyword;
  });
};

export const topicApi = {
  getListTopic: async (params: ITopicListParams) => {
    if (USE_MOCK) {
      const rows = filterTopics(topicStore, params);
      const page = params.page || 1;
      const limit = params.limit || rows.length || 10;
      const start = (page - 1) * limit;
      return {
        rows: rows.slice(start, start + limit),
        total: rows.length,
      };
    }

    const response = await axiosInstance.get('/private/v1/topics', { params });
    return response?.data?.results?.objects;
  },

  getTopicDetail: async (id: string): Promise<IDetailTopic | undefined> => {
    if (USE_MOCK) {
      return topicStore.find((row) => row.id === id);
    }

    const response = await axiosInstance.get(`/private/v1/topics/${id}`);
    return response?.data?.results?.object;
  },

  createTopic: async ({ body, params }: { body: ICreateTopic; params: BaseListParams & { periodId?: string } }) => {
    if (USE_MOCK) {
      const nextNumber = topicStore.length + 1;
      const code = `DA${String(nextNumber).padStart(3, '0')}`;
      const newTopic: IListTopic & { periodId?: string } = {
        id: code,
        code,
        periodId: params?.periodId,
        ...body,
      };
      topicStore = [newTopic, ...topicStore];
      return newTopic;
    }

    const response = await axiosInstance.post('/private/v1/topics', body, { params });
    return response?.data?.results?.object;
  },

  updateTopic: async ({ id, body }: { id: string; body: IUpdateTopic; index: number; params: BaseListParams }) => {
    if (USE_MOCK) {
      const updated = topicStore.map((row) => (row.id === id ? { ...row, ...body, id, code: row.code || id } : row));
      topicStore = updated;
      return updated.find((row) => row.id === id) as IDetailTopic;
    }

    const response = await axiosInstance.patch(`/private/v1/topics/${id}`, body);
    return response?.data?.results?.object;
  },

  deleteTopic: async ({ id }: { id: string; params: BaseListParams }) => {
    if (USE_MOCK) {
      topicStore = topicStore.filter((row) => row.id !== id);
      return { success: true, id };
    }

    const response = await axiosInstance.delete(`/private/v1/topics/${id}`);
    return response?.data;
  },
};

