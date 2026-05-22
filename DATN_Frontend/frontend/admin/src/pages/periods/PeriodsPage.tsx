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
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<BatchType>('tttn');
  const [form] = Form.useForm();

  const handleTabChange = (key: string) => {
    const nextTab = key as BatchType;
    setTab(nextTab);
    setMode(nextTab);
  };

  const filteredRows = useMemo(
    () => PERIOD_ROWS.filter((row) => row.type === tab),
    [tab],
  );

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
        render: () => (
          <Space size={4}>
            <Button type="text" size="small" icon={<EyeOutlined className="text-[#2196F3]" />} className="!px-2" />
            <Button type="text" size="small" icon={<FormOutlined className="text-[#2196F3]" />} className="!px-2" />
            <Button type="text" size="small" icon={<DeleteOutlined className="text-[#F44336]" />} className="!px-2" />
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
            onClick={() => {
              setMode(tab);
              setOpen(true);
            }}
            className="!h-10 !rounded-[8px] !bg-primary !px-5 !flex !items-center !gap-2 !font-medium hover:!bg-blueDark"
          >
            <span className="text-white text-base font-medium text-center w-full">Tạo đợt mới</span>
          </Button>
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
        title={mode === 'tttn' ? 'Tạo đợt TTTN' : 'Tạo đợt ĐATN'}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        width={820}
        okText="Tạo đợt"
        cancelText="Hủy"
        okButtonProps={{ className: '!h-10 !rounded-lg !font-medium' }}
        cancelButtonProps={{ className: '!h-10 !rounded-lg !font-medium' }}
        onOk={() => {
          form.submit();
          setOpen(false);
        }}
      >
        <Form form={form} layout="vertical" className="max-h-[75vh] overflow-y-auto pr-1">
          <Form.Item label="Tên đợt" required>
            <Input placeholder={mode === 'tttn' ? 'VD: TTTN HK1/2026-2027' : 'VD: ĐATN HK1/2026-2027'} />
          </Form.Item>

          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <Form.Item label="Học kỳ">
              <Select options={[{ value: 'HK1', label: 'HK1' }, { value: 'HK2', label: 'HK2' }, { value: 'HK Hè', label: 'HK Hè' }]} />
            </Form.Item>
            <Form.Item label="Năm học">
              <Select options={[{ value: '2025-2026', label: '2025-2026' }, { value: '2026-2027', label: '2026-2027' }]} />
            </Form.Item>
            <Form.Item label="Bắt đầu đăng ký">
              <Input type="date" />
            </Form.Item>
            <Form.Item label="Hạn đăng ký">
              <Input type="date" />
            </Form.Item>
            <Form.Item label="Bắt đầu thực hiện">
              <Input type="date" />
            </Form.Item>
            <Form.Item label="Kết thúc">
              <Input type="date" />
            </Form.Item>
          </div>

          {mode === 'tttn' ? (
            <div className="mt-4 space-y-4 rounded-md border border-blue-200 bg-blue-50/40 p-4">
              <div className="text-sm text-gray-700 font-medium">Cấu hình riêng cho TTTN</div>
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <Form.Item label="Số doanh nghiệp" required>
                  <InputNumber className="!w-full" min={0} defaultValue={15} />
                </Form.Item>
                <Form.Item label="Hạn nộp báo cáo TTTN" required>
                  <Input type="date" />
                </Form.Item>
                <Form.Item label="Hạn đăng ký công ty" required>
                  <Input type="date" />
                </Form.Item>
                <Form.Item label="Thời gian cập nhật thông tin Mentor" required>
                  <Input type="date" />
                </Form.Item>
              </div>
              <Form.Item label="Số tín chỉ tối thiểu" required>
                <InputNumber className="!w-full" min={0} defaultValue={100} />
                <div className="mt-1 text-xs text-gray-500">
                  Sinh viên phải đạt đủ số tín chỉ này để được đăng ký TTTN
                </div>
              </Form.Item>
            </div>
          ) : (
            <div className="mt-4 space-y-4 rounded-md border border-green-200 bg-green-50/40 p-4">
              <div className="text-sm text-gray-700 font-medium">Cấu hình riêng cho ĐATN</div>
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <Form.Item label="Số nhóm/đề tài" required>
                  <InputNumber className="!w-full" min={0} defaultValue={28} />
                </Form.Item>
                <Form.Item label="Số hội đồng" required>
                  <InputNumber className="!w-full" min={0} defaultValue={8} />
                </Form.Item>
                <Form.Item label="Hạn nộp báo cáo ĐATN" required>
                  <Input type="date" />
                </Form.Item>
                <Form.Item label="Hạn phân công phản biện" required>
                  <Input type="date" />
                </Form.Item>
              </div>
              <Form.Item label="Số SV tối đa một nhóm" required>
                <Select defaultValue="3" options={[{ value: '1', label: '1 sinh viên' }, { value: '2', label: '2 sinh viên' }, { value: '3', label: '3 sinh viên' }, { value: '4', label: '4 sinh viên' }]} />
              </Form.Item>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default PeriodsPage;