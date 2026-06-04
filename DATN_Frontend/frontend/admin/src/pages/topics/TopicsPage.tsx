import { BookOutlined, SearchOutlined } from '@ant-design/icons';
import { Card, Tag, Input, Space, Button, Form, Select } from 'antd';
import FilterTable from '../../components/shared/table/FilterTable';
import TopicForm from './components/TopicForm';
import type { IListTopic, ICreateTopic, IUpdateTopic } from '../../type/TopicType';
import { topicHooks } from '../../hooks/useTopics';
import { useMemo } from 'react';

const topicStatusMeta = {
  pending: { label: 'Chờ duyệt', color: '#D08A00', bg: '#FFF7E6' },
  approved: { label: 'Đã duyệt', color: '#00A65A', bg: '#E8F9EE' },
  rejected: { label: 'Từ chối', color: '#C53030', bg: '#FFEDED' },
} as const;

const TopicsPage = () => {
  const { data: topicList } = topicHooks.useFetchListTopics({ page: 1, limit: 1000 });
  const createTopicMutation = topicHooks.useCreateTopic();
  const updateTopicMutation = topicHooks.useUpdateTopic();
  const deleteTopicMutation = topicHooks.useDeleteTopic();

  const rows = topicList?.rows ?? [];

  const columns = [
    { title: 'Mã', dataIndex: 'code', key: 'code', render: (v: string) => <span className="text-[#2563eb] font-medium">{v}</span> },
    { title: 'Tên đề tài', dataIndex: 'name', key: 'name' },
    { title: 'GV đề xuất', dataIndex: 'teacher', key: 'teacher', width: 200, render: (v: string) => <span className="text-slate-600">{v}</span> },
    { title: 'Slot', dataIndex: 'slots', key: 'slots', width: 120 },
    {
      title: 'Trạng thái', key: 'status', width: 160, render: (_: unknown, record: IListTopic) => {
        const meta = topicStatusMeta[record.status];
        return <Tag style={{ margin: 0, borderRadius: 999, padding: '0 10px', border: 'none', backgroundColor: meta.bg, color: meta.color }}>{meta.label}</Tag>;
      }
    },
    { title: 'Lý do từ chối', dataIndex: 'rejectReason', key: 'rejectReason', render: (v: string) => v || '—' },
  ];

  return (
    <div className="pb-4">
      <div className="mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#2196F3]/10 px-3 py-1 text-xs font-medium text-[#1976d2]">
          <BookOutlined /> Danh mục đề tài
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">Quản lý đề tài</h1>
            <p className="mt-2 mb-0 text-[18px] leading-[26px] text-grayDark">Duyệt đề tài do giảng viên tạo</p>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {useMemo(() => [
          { label: 'Tổng đề tài', value: rows.length, color: 'bg-[#2196F3]' },
          { label: 'Chờ duyệt', value: rows.filter((r) => r.status === 'pending').length, color: 'bg-[#D08A00]' },
          { label: 'Đã duyệt', value: rows.filter((r) => r.status === 'approved').length, color: 'bg-[#00A65A]' },
          { label: 'Bị từ chối', value: rows.filter((r) => r.status === 'rejected').length, color: 'bg-[#C53030]' },
        ], [rows]).map((item) => (
          <Card key={item.label} className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="mt-2 text-3xl font-bold text-navyDark">{item.value}</div>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${item.color}`}>
                <BookOutlined />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <FilterTable<IListTopic, IListTopic, ICreateTopic, IUpdateTopic>
          title="Danh sách đề tài"
          columns={columns}
          useQueryHook={topicHooks.useFetchListTopics}
          createInfo={{
            type: 'modal',
            modalInfo: {
              modalContent: <TopicForm />,
              modalProps: { centered: true, width: 640, title: 'Thêm đề tài' },
              modalFunc: createTopicMutation,
            },
          }}
          updateInfo={{
            type: 'modal',
            modalInfo: {
              modalContent: <TopicForm />,
              modalProps: { centered: true, width: 640, title: 'Chỉnh sửa đề tài' },
              modalFunc: updateTopicMutation,
            },
          }}
          deleteInfo={{
            type: 'modal',
            modalInfo: {
              modalContent: null,
              modalProps: {},
              modalFunc: deleteTopicMutation,
            },
          }}
          detailInfo={{
            type: 'modal',
            modalInfo: {
              modalContent: <TopicForm disabled />,
              modalProps: { centered: true, width: 640, title: 'Chi tiết đề tài', footer: null },
              modalFunc: topicHooks.useFetchDetailTopic,
            },
          }}
          formatInitialValues={(detail: IListTopic) => ({
            name: detail.name,
            teacher: detail.teacher,
            slots: detail.slots,
            status: detail.status,
            rejectReason: detail.rejectReason || '',
          })}
          formatFormValues={(values: Record<string, unknown>) => values as ICreateTopic | IUpdateTopic}
          filterRender={() => (
            <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-12">
              <Form.Item name="keyword" className="xl:col-span-8 !mb-0">
                <Input
                  allowClear
                  prefix={<SearchOutlined className="text-slate-400" />}
                  placeholder="Tìm theo mã, tên, giảng viên..."
                  className="!h-11 !rounded-[12px] !border-slate-300"
                />
              </Form.Item>

              <Form.Item name="status" className="xl:col-span-4 !mb-0">
                <Select
                  allowClear
                  placeholder="Trạng thái"
                  className="!h-11 !w-full"
                  options={[
                    { value: 'all', label: 'Tất cả' },
                    { value: 'pending', label: 'Chờ duyệt' },
                    { value: 'approved', label: 'Đã duyệt' },
                    { value: 'rejected', label: 'Từ chối' },
                  ]}
                />
              </Form.Item>
            </div>
          )}
        />
      </Card>
    </div>
  );
};

export default TopicsPage;
