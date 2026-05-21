import { Input, Tag, Space, Button } from 'antd';
import React, { useMemo } from 'react';
import FilterTable from '@shared/components/table/FilterTable';
import { useQuery, useMutation } from '@tanstack/react-query';

interface ICompany {
  id: string;
  code: string;
  name: string;
  address: string;
  field: string;
  contact: string;
  slot: number;
  status: string;
}

const mockRows: ICompany[] = [
  { id: 'c1', code: 'C001', name: 'FPT Software', address: 'Quận 9, TP.HCM', field: 'Phần mềm', contact: 'Nguyễn A • 0901234567', slot: 15, status: 'Đã duyệt' },
  { id: 'c2', code: 'C002', name: 'VNG Corp', address: 'Quận 7, TP.HCM', field: 'Internet', contact: 'Trần B • 0909111222', slot: 8, status: 'Đã duyệt' },
  { id: 'c3', code: 'c003', name: 'TMA Solutions', address: 'Quận 12, TP.HCM', field: 'Outsourcing', contact: 'Lê C • 0933444555', slot: 10, status: 'Đã duyệt' },
  { id: 'c4', code: 'C004', name: 'KMS Technology', address: 'Quận 1, TP.HCM', field: 'Phần mềm', contact: 'Phạm D • 0911222333', slot: 6, status: 'Chờ duyệt' },
];

const useFetchCompanies = (params: any) => {
  return useQuery({ queryKey: ['companies', params], queryFn: async () => ({ rows: mockRows, total: mockRows.length }) });
};

const CompaniesPage: React.FC = () => {
  const columns = useMemo(() => [
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 80 },
    { title: 'Tên công ty', dataIndex: 'name', key: 'name' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
    { title: 'Lĩnh vực', dataIndex: 'field', key: 'field' },
    { title: 'Liên hệ', dataIndex: 'contact', key: 'contact' },
    { title: 'Slot', dataIndex: 'slot', key: 'slot', width: 80 },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (s: string) => s === 'Đã duyệt' ? <Tag style={{ backgroundColor: '#E8F9EE', color: '#00A65A', borderRadius: 999, padding: '0 10px' }}>{s}</Tag> : <Tag style={{ backgroundColor: '#FFF7ED', color: '#D08700', borderRadius: 999, padding: '0 10px' }}>{s}</Tag>
    },
  ], []);

  const createMutation = useMutation({ mutationFn: async (vars: any) => vars });
  const updateMutation = useMutation({ mutationFn: async (vars: any) => vars });
  const deleteMutation = useMutation({ mutationFn: async (vars: any) => vars });

  const handlePublish = () => {
    // mock action
    alert('Công bố danh sách (mock)');
  };

  const handleOpenCreate = () => {
    // try to find the inner create button rendered by FilterTable and click it
    const buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
    const btn = buttons.find(b => b.innerText && b.innerText.includes('Thêm công ty'));
    if (btn) {
      btn.click();
      return;
    }
    // fallback: focus card
    const card = document.querySelector('.filter-table-card');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-navyDark">Quản lý công ty</h1>
          <p className="text-base text-grayDark mt-1">Danh sách công ty đối tác tiếp nhận sinh viên thực tập</p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="primary" style={{ backgroundColor: '#22C55E', borderColor: '#16A34A' }} onClick={handlePublish}>Công bố danh sách</Button>
          <Button type="primary" onClick={handleOpenCreate}>+ Thêm công ty</Button>
        </div>
      </div>

      <FilterTable<ICompany, ICompany, ICompany, Partial<ICompany>>
        title={'Danh sách công ty'}
        createButtonLabel={'+ Thêm công ty'}
        columns={columns}
        useQueryHook={(params) => useFetchCompanies(params)}
        paramVariables={{ page: 1, limit: 10 }}
        actions={{ isDetail: true, isEdit: true, isDelete: true }}
        deleteInfo={{ type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: deleteMutation } }}
        createInfo={{ type: 'modal', modalInfo: { modalContent: (
          <>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input name="code" placeholder="Mã công ty" />
              <Input name="name" placeholder="Tên công ty" />
              <Input name="address" placeholder="Địa chỉ" />
              <Input name="field" placeholder="Lĩnh vực" />
            </Space>
          </>
        ), modalProps: {}, modalFunc: createMutation } }}
        updateInfo={{ type: 'modal', modalInfo: { modalContent: (
          <>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input name="code" placeholder="Mã công ty" />
              <Input name="name" placeholder="Tên công ty" />
              <Input name="address" placeholder="Địa chỉ" />
              <Input name="field" placeholder="Lĩnh vực" />
            </Space>
          </>
        ), modalProps: {}, modalFunc: updateMutation } }}
      />
    </div>
  );
};

export default CompaniesPage;
