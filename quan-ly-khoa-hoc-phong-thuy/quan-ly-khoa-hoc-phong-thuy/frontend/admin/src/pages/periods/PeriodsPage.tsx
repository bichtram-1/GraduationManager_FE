import { Input, Tabs, Tag, Space } from 'antd';
import { EyeOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useMemo, useState } from 'react';
import FilterTable from '@shared/components/table/FilterTable';
import { useQuery, useMutation } from '@tanstack/react-query';

interface IPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  regDeadline: string;
  numberDN: string;
  numberSV: number;
  status: 'open' | 'published';
}

const mockRows: IPeriod[] = [
  {
    id: '1',
    name: 'TTTN HK2/2025-2026',
    startDate: '01/05/2026',
    endDate: '30/07/2026',
    regDeadline: '25/04/2026',
    numberDN: '15 DN',
    numberSV: 124,
    status: 'open',
  },
  {
    id: '2',
    name: 'TTTN HK1/2025-2026',
    startDate: '01/09/2025',
    endDate: '30/12/2025',
    regDeadline: '25/08/2025',
    numberDN: '12 DN',
    numberSV: 102,
    status: 'published',
  },
];

const useFetchListPeriods = (params: any) => {
  // simple mock using react-query v5 object form
  return useQuery({
    queryKey: ['periods', params],
    queryFn: async () => ({ rows: mockRows, total: mockRows.length }),
  });
};

const PeriodsPage: React.FC = () => {
  const [tab, setTab] = useState<'tttn' | 'datn'>('tttn');

  const columns = useMemo(() => [
    { title: 'Tên đợt', dataIndex: 'name', key: 'name' },
    { title: 'Bắt đầu', dataIndex: 'startDate', key: 'startDate' },
    { title: 'Kết thúc', dataIndex: 'endDate', key: 'endDate' },
    { title: 'Hạn ĐK', dataIndex: 'regDeadline', key: 'regDeadline' },
    { title: 'Số DN', dataIndex: 'numberDN', key: 'numberDN' },
    { title: 'Số SV', dataIndex: 'numberSV', key: 'numberSV' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        s === 'open' ? <Tag style={{ backgroundColor: '#E8F9EE', color: '#00A65A', borderRadius: 999, padding: '0 10px' }}>Đang mở</Tag>
          : <Tag style={{ backgroundColor: '#EBF4FF', color: '#2B6CB0', borderRadius: 999, padding: '0 10px' }}>Đã công bố</Tag>
      ),
    },
  ], []);

  const createMutation = useMutation(async (vars: any) => {
    console.log('create', vars);
    return vars;
  });

  const updateMutation = useMutation(async (vars: any) => {
    console.log('update', vars);
    return vars;
  });

  const deleteMutation = useMutation(async (vars: any) => {
    console.log('delete', vars);
    return vars;
  });

  return (
    <div>
      <Tabs activeKey={tab} onChange={(k) => setTab(k as any)}>
        <Tabs.TabPane tab={'Đợt Thực tập (TTTN)'} key="tttn" />
        <Tabs.TabPane tab={'Đợt Đồ án (ĐATN)'} key="datn" />
      </Tabs>

      <FilterTable<IPeriod, IPeriod, IPeriod, Partial<IPeriod>>
        pageTitle={'Quản lý đợt'}
        pageSubtitle={'Vòng đời các đợt TTTN / ĐATN'}
        title={'Danh sách đợt'}
        createButtonLabel={'+ Tạo đợt mới'}
        columns={columns}
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
