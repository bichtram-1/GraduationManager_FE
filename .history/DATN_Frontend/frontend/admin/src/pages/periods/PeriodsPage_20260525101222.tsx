import {
  DeleteOutlined,
  EyeOutlined,
  FormOutlined,
  PlusOutlined,
  ReadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

type BatchType = 'tttn' | 'datn';
type BatchStatus = 'open' | 'published' | 'grading' | 'closed';
type PeriodModalMode = 'create' | 'edit' | 'detail';

type PeriodRow = {
  id: string;
  name: string;
  type: BatchType;
  startDate: string;
  endDate: string;
  regDeadline: string;
  numberDN?: number;
  numberSV?: number;
  numberTopics?: number;
  numberCouncils?: number;
  status: BatchStatus;
};

const PERIOD_ROWS: PeriodRow[] = [
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
  const [tab, setTab] = useState<BatchType>('tttn');
  const [periodRows, setPeriodRows] = useState<PeriodRow[]>(PERIOD_ROWS);
  const [open, setOpen] = useState(false);
  const [modalMode, setModalMode] = useState<PeriodModalMode>('create');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodRow | null>(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BatchStatus>('all');
  const [form] = Form.useForm();

  const handleTabChange = (key: string) => {
    const nextTab = key as BatchType;
    setTab(nextTab);
  };

  const filteredRows = useMemo(
    () => periodRows
      .filter((row) => row.type === tab)
      .filter((row) => {
        const normalizedKeyword = keyword.trim().toLowerCase();
        const byKeyword =
          !normalizedKeyword ||
          [row.id, row.name, row.startDate, row.endDate, row.regDeadline]
            .join(' ')
            .toLowerCase()
            .includes(normalizedKeyword);
        const byStatus = statusFilter === 'all' || row.status === statusFilter;
        return byKeyword && byStatus;
      }),
    [periodRows, tab, keyword, statusFilter],
  );

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

  const handleOpenEdit = (record: PeriodRow) => {
    setModalMode('edit');
    setSelectedPeriod(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const handleOpenDetail = (record: PeriodRow) => {
    setModalMode('detail');
    setSelectedPeriod(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const handleDelete = (record: PeriodRow) => {
    Modal.confirm({
      centered: true,
      title: 'Xóa đợt?',
      content: `Bạn có chắc muốn xóa ${record.name}?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        setPeriodRows((prev) => prev.filter((item) => item.id !== record.id));
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (modalMode === 'edit' && selectedPeriod) {
        setPeriodRows((prev) =>
          prev.map((item) =>
            item.id === selectedPeriod.id
              ? {
                  ...item,
                  ...values,
                }
              : item
          )
        );
      } else {
        const nextId = `B${String(periodRows.length + 1).padStart(3, '0')}`;
        setPeriodRows((prev) => [
          {
            id: nextId,
            name: values.name,
            type: values.type,
            startDate: values.startDate,
            endDate: values.endDate,
            regDeadline: values.regDeadline,
            numberDN: values.numberDN,
            numberSV: values.numberSV,
            numberTopics: values.numberTopics,
            numberCouncils: values.numberCouncils,
            status: values.status,
          },
          ...prev,
        ]);
      }
      setOpen(false);
      setSelectedPeriod(null);
      form.resetFields();
    } catch {
      // noop
    }
  };

  const columns = useMemo<ColumnsType<PeriodRow>>(
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
        title: 'Thao tác',
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

      <Modal
        centered
        open={open}
        title={
          modalMode === 'create'
            ? tab === 'tttn'
              ? 'Tạo đợt TTTN'
              : 'Tạo đợt ĐATN'
            : modalMode === 'edit'
              ? 'Chỉnh sửa đợt'
              : 'Chi tiết đợt'
        }
        onCancel={() => {
          setOpen(false);
          setSelectedPeriod(null);
          form.resetFields();
        }}
        destroyOnHidden
        width={820}
        okText={modalMode === 'create' ? 'Tạo đợt' : modalMode === 'edit' ? 'Cập nhật' : undefined}
        cancelText="Hủy"
        okButtonProps={{ className: '!h-10 !rounded-lg !font-medium' }}
        cancelButtonProps={{ className: '!h-10 !rounded-lg !font-medium' }}
        onOk={handleSubmit}
        footer={modalMode === 'detail' ? null : undefined}
      >
        <Form form={form} layout="vertical" className="max-h-[75vh] overflow-y-auto pr-1">
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="Tên đợt" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên đợt' }]}>
            <Input disabled={modalMode === 'detail'} placeholder={tab === 'tttn' ? 'VD: TTTN HK1/2026-2027' : 'VD: ĐATN HK1/2026-2027'} />
          </Form.Item>

          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <Form.Item label="Bắt đầu" name="startDate" rules={[{ required: true, message: 'Vui lòng nhập ngày bắt đầu' }]}>
              <Input disabled={modalMode === 'detail'} placeholder="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item label="Kết thúc" name="endDate" rules={[{ required: true, message: 'Vui lòng nhập ngày kết thúc' }]}>
              <Input disabled={modalMode === 'detail'} placeholder="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item label="Hạn đăng ký" name="regDeadline" rules={[{ required: true, message: 'Vui lòng nhập hạn đăng ký' }]}>
              <Input disabled={modalMode === 'detail'} placeholder="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
              <Select
                disabled={modalMode === 'detail'}
                options={[
                  { value: 'open', label: 'Đang mở' },
                  { value: 'published', label: 'Đã công bố' },
                  { value: 'grading', label: 'Chấm điểm' },
                  { value: 'closed', label: 'Đã đóng' },
                ]}
              />
            </Form.Item>
          </div>

          {(form.getFieldValue('type') || tab) === 'tttn' ? (
            <div className="mt-4 space-y-4 rounded-md border border-blue-200 bg-blue-50/40 p-4">
              <div className="text-sm text-gray-700 font-medium">Cấu hình riêng cho TTTN</div>
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <Form.Item label="Số doanh nghiệp" name="numberDN">
                  <InputNumber disabled={modalMode === 'detail'} className="!w-full" min={0} />
                </Form.Item>
                <Form.Item label="Số sinh viên" name="numberSV">
                  <InputNumber disabled={modalMode === 'detail'} className="!w-full" min={0} />
                </Form.Item>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4 rounded-md border border-green-200 bg-green-50/40 p-4">
              <div className="text-sm text-gray-700 font-medium">Cấu hình riêng cho ĐATN</div>
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <Form.Item label="Số nhóm/đề tài" name="numberTopics">
                  <InputNumber disabled={modalMode === 'detail'} className="!w-full" min={0} />
                </Form.Item>
                <Form.Item label="Số hội đồng" name="numberCouncils">
                  <InputNumber disabled={modalMode === 'detail'} className="!w-full" min={0} />
                </Form.Item>
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default PeriodsPage;