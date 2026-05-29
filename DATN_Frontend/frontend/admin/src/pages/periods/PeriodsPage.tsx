import {
  DeleteOutlined,
  EyeOutlined,
  FormOutlined,
  PlusOutlined,
  ReadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tag, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import PeriodModal from './components/PeriodModal';
import { periodHooks } from '../../hooks/usePeriods';
import type { BatchStatus, BatchType, ICreatePeriod, IUpdatePeriod, IListPeriod } from '../../type/PeriodType';

type PeriodModalMode = 'create' | 'edit' | 'detail';

const statusMap: Record<BatchStatus, { label: string; color: string; background: string }> = {
  open: { label: 'Đang mở', color: '#00A65A', background: '#E8F9EE' },
  published: { label: 'Đã công bố', color: '#2B6CB0', background: '#EBF4FF' },
  grading: { label: 'Chấm điểm', color: '#D08A00', background: '#FFF7E6' },
  closed: { label: 'Đã đóng', color: '#C53030', background: '#FFEDED' },
};

const batchTabs: Array<{ key: BatchType; label: string; icon: JSX.Element }> = [
  { key: 'tttn', label: 'Đợt Thực tập (TTTN)', icon: <TeamOutlined /> },
  { key: 'datn', label: 'Đợt Đồ án (ĐATN)', icon: <ReadOutlined /> },
];

const PeriodsPage = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<BatchType>('tttn');
  const [open, setOpen] = useState(false);
  const [modalMode, setModalMode] = useState<PeriodModalMode>('create');
  const [selectedPeriod, setSelectedPeriod] = useState<IListPeriod | null>(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BatchStatus>('all');
  const [form] = Form.useForm();
  const listParams = { page: 1, limit: 1000, type: tab, status: statusFilter, keyword };
  const { data: periodList } = periodHooks.useFetchListPeriods(listParams);
  const createPeriodMutation = periodHooks.useCreatePeriod();
  const updatePeriodMutation = periodHooks.useUpdatePeriod();
  const deletePeriodMutation = periodHooks.useDeletePeriod();

  const handleTabChange = (key: string) => {
    const nextTab = key as BatchType;
    setTab(nextTab);
  };

  const filteredRows = periodList?.rows ?? [];

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedPeriod(null);
    form.resetFields();
    form.setFieldsValue({
      type: tab,
      status: 'open',
    });
    setOpen(true);
  };

  const handleOpenEdit = (record: IListPeriod) => {
    setModalMode('edit');
    setSelectedPeriod(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const handleOpenDetail = (record: IListPeriod) => {
    setModalMode('detail');
    setSelectedPeriod(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const handleDelete = (record: IListPeriod) => {
    Modal.confirm({
      centered: true,
      title: 'Xóa đợt?',
      content: `Bạn có chắc muốn xóa ${record.name}?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => deletePeriodMutation.mutate({ id: record.id, params: { page: 1, limit: 10 } }),
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (modalMode === 'edit' && selectedPeriod) {
        await updatePeriodMutation.mutateAsync({
          id: selectedPeriod.id,
          body: values as IUpdatePeriod,
          index: 0,
          params: { page: 1, limit: 10 },
        });
      } else {
        await createPeriodMutation.mutateAsync({
          body: values as ICreatePeriod,
          params: { page: 1, limit: 10 },
        });
      }
      setOpen(false);
      setSelectedPeriod(null);
      form.resetFields();
    } catch {
      // noop
    }
  };

  const columns = useMemo<ColumnsType<IListPeriod>>(
    () => [
      {
        title: 'Tên đợt',
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => <span className="font-medium text-[#2563eb]">{name}</span>,
      },
      {
        title: 'Bắt đầu',
        dataIndex: 'startDate',
        key: 'startDate',
        render: (value: string) => <span className="text-slate-600">{value}</span>,
      },
      {
        title: 'Kết thúc',
        dataIndex: 'endDate',
        key: 'endDate',
        render: (value: string) => <span className="text-slate-600">{value}</span>,
      },
      {
        title: 'Hạn ĐK',
        dataIndex: 'regDeadline',
        key: 'regDeadline',
        render: (value: string) => <span className="text-slate-600">{value}</span>,
      },
      ...(tab === 'tttn'
        ? [
            {
              title: 'Số DN',
              dataIndex: 'numberDN',
              key: 'numberDN',
              render: (value?: number) => <span>{value ?? '-'}</span>,
            },
            {
              title: 'Số SV',
              dataIndex: 'numberSV',
              key: 'numberSV',
              render: (value?: number) => <span>{value ?? '-'}</span>,
            },
          ]
        : [
            {
              title: 'Số đề tài',
              dataIndex: 'numberTopics',
              key: 'numberTopics',
              render: (value?: number) => <span>{value ?? '-'}</span>,
            },
            {
              title: 'Số hội đồng',
              dataIndex: 'numberCouncils',
              key: 'numberCouncils',
              render: (value?: number) => <span>{value ?? '-'}</span>,
            },
          ]),
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (value: BatchStatus) => {
          const badge = statusMap[value];
          return (
            <Tag
              style={{
                margin: 0,
                borderRadius: 999,
                padding: '0 10px',
                border: 'none',
                backgroundColor: badge.background,
                color: badge.color,
              }}
            >
              {badge.label}
            </Tag>
          );
        },
      },
      {
        title: t(getKey('action')),
        key: 'actions',
        align: 'right',
        render: (_: unknown, record) => (
          <Space size={4}>
            <Button type="text" size="small" icon={<EyeOutlined className="text-[#2196F3]" />} className="!px-2" onClick={() => handleOpenDetail(record)} />
            <Button type="text" size="small" icon={<FormOutlined className="text-[#2196F3]" />} className="!px-2" onClick={() => handleOpenEdit(record)} />
            <Button type="text" size="small" icon={<DeleteOutlined className="text-[#F44336]" />} className="!px-2" onClick={() => handleDelete(record)} />
          </Space>
        ),
      },
    ],
    [tab],
  );

  return (
    <div className="pb-4">
      <div className="mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#2196F3]/10 px-3 py-1 text-xs font-medium text-[#1976d2]">
          <TeamOutlined />
          Danh mục đợt
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="m-0 text-[34px] font-bold leading-[40px] text-navyDark">Quản lý đợt</h1>
            <p className="mt-2 mb-0 text-[18px] leading-[26px] text-grayDark">Vòng đời các đợt TTTN / ĐATN</p>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <Tabs
          activeKey={tab}
          onChange={handleTabChange}
          items={batchTabs.map((item) => ({
            key: item.key,
            label: (
              <span className="flex items-center gap-2 text-sm font-medium">
                {item.icon}
                {item.label}
              </span>
            ),
          }))}
          className="batch-tabs"
        />
      </div>

      <Card className="overflow-hidden rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="text-[18px] font-bold text-navyDark">Danh sách đợt</span>
          <Button
            type="primary"
            icon={<PlusOutlined className="text-white" />}
            onClick={handleOpenCreate}
            className="!h-10 !rounded-[8px] !bg-primary !px-5 !flex !items-center !gap-2 !font-medium hover:!bg-blueDark"
          >
            <span className="text-white text-base font-medium text-center w-full">Tạo đợt mới</span>
          </Button>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <Input
              allowClear
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên đợt, mã đợt, thời gian..."
              className="!h-11 !rounded-[12px] !border-slate-300"
            />
          </div>
          <div className="xl:col-span-4">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="!h-11 !w-full"
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'open', label: 'Đang mở' },
                { value: 'published', label: 'Đã công bố' },
                { value: 'grading', label: 'Chấm điểm' },
                { value: 'closed', label: 'Đã đóng' },
              ]}
            />
          </div>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredRows}
          pagination={{
            total: filteredRows.length,
            pageSize: 10,
            position: ['bottomCenter'],
            showQuickJumper: false,
            showTotal(total, range) {
              return <span className="pl-2">Hiển thị {range[0]} đến {range[1]} trong {total} mục</span>;
            },
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <PeriodModal open={open} modalMode={modalMode} tab={tab} form={form} onCancel={() => { setOpen(false); setSelectedPeriod(null); form.resetFields(); }} onOk={handleSubmit} />
    </div>
  );
};

export default PeriodsPage;