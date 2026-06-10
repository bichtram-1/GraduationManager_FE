import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateTopic, IDetailTopic, IListTopic, IUpdateTopic, TopicStatus } from '../type/TopicType';

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
    const rows = filterTopics(topicStore, params);
    const page = params.page || 1;
    const limit = params.limit || rows.length || 10;
    const start = (page - 1) * limit;
    return {
      rows: rows.slice(start, start + limit),
      total: rows.length,
    };
  },

  getTopicDetail: async (id: string): Promise<IDetailTopic | undefined> => {
    return topicStore.find((row) => row.id === id);
  },

  createTopic: async ({ body, params }: { body: ICreateTopic; params: BaseListParams & { periodId?: string } }) => {
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
  },

  updateTopic: async ({ id, body }: { id: string; body: IUpdateTopic; index: number; params: BaseListParams }) => {
    const updated = topicStore.map((row) => (row.id === id ? { ...row, ...body, id, code: row.code || id } : row));
    topicStore = updated;
    return updated.find((row) => row.id === id) as IDetailTopic;
  },

  deleteTopic: async ({ id }: { id: string; params: BaseListParams }) => {
    topicStore = topicStore.filter((row) => row.id !== id);
    return { success: true, id };
  },
};

