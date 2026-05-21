import { Input, Tabs, Tag, Space } from 'antd';
import React, { useMemo, useState } from 'react';
import FilterTable from '@shared/components/table/FilterTable';
import { useQuery, useMutation } from '@tanstack/react-query';

interface IPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  regDeadline: string;
  numberTopics?: string;
  numberBoards?: string;
  numberCompanies?: string;
  numberStudents?: number;
  status: string;
}

const tttnRows: IPeriod[] = [
  {
    id: '1',
    name: 'TTTN HK2/2025-2026',
    startDate: '01/05/2026',
    endDate: '30/07/2026',
    regDeadline: '25/04/2026',
    numberCompanies: '15 DN',
    numberStudents: 124,
    status: 'Đang mở',
  },
  {
    id: '2',
    name: 'TTTN HK1/2025-2026',
    startDate: '01/09/2025',
    endDate: '30/12/2025',
    regDeadline: '25/08/2025',
    numberCompanies: '12 DN',
    numberStudents: 102,
    status: 'Đã công bố',
  },
];

const datnRows: IPeriod[] = [
  {
    id: '11',
    name: 'ĐATN HK2/2025-2026',
    startDate: '01/08/2026',
    endDate: '30/12/2026',
    regDeadline: '30/07/2026',
    numberTopics: '28 đề tài',
    numberBoards: '8 hội đồng',
    status: 'Chờ mở',
  },
  {
    id: '12',
    name: 'ĐATN HK1/2025-2026',
    startDate: '01/01/2026',
    endDate: '30/06/2026',
    regDeadline: '25/12/2025',
    numberTopics: '26 đề tài',
    numberBoards: '6 hội đồng',
    status: 'Chấm điểm',
  },
];

const useFetchListPeriods = (params: any) => {
  return useQuery({
    queryKey: ['periods', params],
    queryFn: async () => {
      const type = params?.type || 'tttn';
      const rows = type === 'datn' ? datnRows : tttnRows;
      return { rows, total: rows.length };
    },
  });
};

const PeriodsPage: React.FC = () => {
  const [tab, setTab] = useState<'tttn' | 'datn'>('tttn');

  const tttnCols = useMemo(() => [
    { title: 'Tên đợt', dataIndex: 'name', key: 'name' },
    { title: 'Bắt đầu', dataIndex: 'startDate', key: 'startDate' },
    { title: 'Kết thúc', dataIndex: 'endDate', key: 'endDate' },
    { title: 'Hạn ĐK', dataIndex: 'regDeadline', key: 'regDeadline' },
    { title: 'Số DN', dataIndex: 'numberCompanies', key: 'numberCompanies' },
    { title: 'Số SV', dataIndex: 'numberStudents', key: 'numberStudents' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        if (s === 'Đang mở') return <Tag style={{ backgroundColor: '#E8F9EE', color: '#00A65A', borderRadius: 999, padding: '0 10px' }}>{s}</Tag>;
        return <Tag style={{ backgroundColor: '#EBF4FF', color: '#2B6CB0', borderRadius: 999, padding: '0 10px' }}>{s}</Tag>;
      },
    },
  ], []);

  const datnCols = useMemo(() => [
    { title: 'Tên đợt', dataIndex: 'name', key: 'name' },
    { title: 'Bắt đầu', dataIndex: 'startDate', key: 'startDate' },
    { title: 'Kết thúc', dataIndex: 'endDate', key: 'endDate' },
    { title: 'Hạn ĐK', dataIndex: 'regDeadline', key: 'regDeadline' },
    { title: 'Số đề tài', dataIndex: 'numberTopics', key: 'numberTopics' },
    { title: 'Số hội đồng', dataIndex: 'numberBoards', key: 'numberBoards' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        if (s === 'Chờ mở') return <Tag style={{ backgroundColor: '#F3F4F6', color: '#6B7280', borderRadius: 999, padding: '0 10px' }}>{s}</Tag>;
        if (s === 'Chấm điểm') return <Tag style={{ backgroundColor: '#FFF7ED', color: '#D08700', borderRadius: 999, padding: '0 10px' }}>{s}</Tag>;
        return <Tag>{s}</Tag>;
      },
    },
  ], []);

  const createMutation = useMutation({ mutationFn: async (vars: any) => vars });
  const updateMutation = useMutation({ mutationFn: async (vars: any) => vars });
  const deleteMutation = useMutation({ mutationFn: async (vars: any) => vars });

  return (
    <div>
      <Tabs activeKey={tab} onChange={(k) => setTab(k as any)}>
        <Tabs.TabPane tab={'Đợt Thực tập (TTTN)'} key="tttn" />
        <Tabs.TabPane tab={'Đợt Đồ án (ĐATN)'} key="datn" />
      </Tabs>

      <FilterTable<IPeriod, IPeriod, IPeriod, Partial<IPeriod>>
        pageTitle={'Quản lý đợt'}
        pageSubtitle={'Vòng đời các đợt TTTN / ĐATN'}
        title={tab === 'datn' ? 'Danh sách đợt ĐATN' : 'Danh sách đợt TTTN'}
        createButtonLabel={'+ Tạo đợt mới'}
        columns={tab === 'datn' ? datnCols : tttnCols}
        useQueryHook={(params) => useFetchListPeriods({ ...params, type: tab })}
        paramVariables={{ page: 1, limit: 10, type: tab }}
        actions={{ isDetail: true, isEdit: true, isDelete: true }}
        deleteInfo={{ type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: deleteMutation } }}
        createInfo={{ type: 'modal', modalInfo: { modalContent: (
          <>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input name="name" placeholder="Tên đợt" />
              <Input name="startDate" placeholder="Bắt đầu (dd/mm/yyyy)" />
              <Input name="endDate" placeholder="Kết thúc (dd/mm/yyyy)" />
              <Input name="regDeadline" placeholder="Hạn đăng ký" />
            </Space>
          </>
        ), modalProps: {}, modalFunc: createMutation } }}
        updateInfo={{ type: 'modal', modalInfo: { modalContent: (
          <>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input name="name" placeholder="Tên đợt" />
              <Input name="startDate" placeholder="Bắt đầu (dd/mm/yyyy)" />
              <Input name="endDate" placeholder="Kết thúc (dd/mm/yyyy)" />
              <Input name="regDeadline" placeholder="Hạn đăng ký" />
            </Space>
          </>
        ), modalProps: {}, modalFunc: updateMutation } }}
      />
    </div>
  );
};

export default PeriodsPage;
