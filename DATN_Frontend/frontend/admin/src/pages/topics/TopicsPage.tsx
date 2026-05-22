import { BookOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, ClockCircleOutlined, SendOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Card, Input, Modal, Pagination, Space, Tag, Typography, message, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';

type TopicStatus = 'pending' | 'approved' | 'rejected';

type TopicRow = {
  id: string;
  code: string;
  name: string;
  teacher: string;
  slots: string;
  rejectReason: string;
  status: TopicStatus;
};

type StudentRow = {
  id: string;
  name: string;
  className: string;
  score: number;
};

const INITIAL_TOPICS: TopicRow[] = [
  { id: 'DA001', code: 'DA001', name: 'Hệ thống IoT giám sát nông nghiệp', teacher: 'TS. Nguyễn Văn X', slots: '3/4', rejectReason: '', status: 'pending' },
  { id: 'DA002', code: 'DA002', name: 'Ứng dụng AI nhận diện hình ảnh', teacher: 'TS. Trần Văn Y', slots: '2/3', rejectReason: '', status: 'approved' },
  { id: 'DA003', code: 'DA003', name: 'Nền tảng e-commerce micro-service', teacher: 'ThS. Lê Thị Z', slots: '0/4', rejectReason: 'Chủ đề trùng lặp với đề tài DA005', status: 'rejected' },
  { id: 'DA004', code: 'DA004', name: 'Chatbot hỗ trợ khách hàng', teacher: 'TS. Phạm Văn K', slots: '1/3', rejectReason: '', status: 'approved' },
];

const ELIGIBLE_STUDENTS: StudentRow[] = [
  { id: '20520001', name: 'Nguyễn Văn A', className: 'KTPM2020', score: 8.5 },
  { id: '20520002', name: 'Trần Thị B', className: 'KTPM2020', score: 7.2 },
  { id: '20520004', name: 'Phạm Thị D', className: 'KTPM2020', score: 9.0 },
  { id: '20520006', name: 'Vũ Thị F', className: 'KTPM2020', score: 8.0 },
  { id: '20520007', name: 'Đỗ Văn G', className: 'CNPM2020', score: 7.5 },
  { id: '20520010', name: 'Lý Văn H', className: 'KTPM2020', score: 8.2 },
  { id: '20520020', name: 'Mai Thị K', className: 'KTPM2020', score: 7.8 },
];

const topicStatusMeta: Record<TopicStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Chờ duyệt', color: '#D08A00', bg: '#FFF7E6' },
  approved: { label: 'Đã duyệt', color: '#00A65A', bg: '#E8F9EE' },
  rejected: { label: 'Từ chối', color: '#C53030', bg: '#FFEDED' },
};

const TopicsPage = () => {
  const { t } = useTranslation();
  const [topicRows, setTopicRows] = useState(INITIAL_TOPICS);
  const [published, setPublished] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const totalTopics = topicRows.length;
  const pendingTopics = topicRows.filter((item) => item.status === 'pending').length;
  const approvedTopics = topicRows.filter((item) => item.status === 'approved').length;
  const rejectedTopics = topicRows.filter((item) => item.status === 'rejected').length;
  const [tab, setTab] = useState<'all' | TopicStatus | 'all'>('all');

  const filteredTopicRows = useMemo(() => (tab === 'all' ? topicRows : topicRows.filter((r) => r.status === tab)), [topicRows, tab]);

  const unassignedStudents = useMemo(
    () => ELIGIBLE_STUDENTS.filter((student) => {
      const value = [student.id, student.name, student.className].join(' ').toLowerCase();
      return !search || value.includes(search.toLowerCase());
    }),
    [search],
  );

  const changeTopicStatus = (topicId: string, status: TopicStatus) => {
    setTopicRows((prev) => prev.map((row) => (row.id === topicId ? { ...row, status } : row)));
  };

  const confirmTopicChange = (record: TopicRow, status: TopicStatus) => {
    const label = topicStatusMeta[status].label.toLowerCase();
    Modal.confirm({
      centered: true,
      title: `Chuyển ${record.code} sang ${label}?`,
      content:
        status === 'approved'
          ? 'Đề tài sẽ được duyệt để sinh viên có thể đăng ký.'
          : status === 'rejected'
            ? 'Đề tài sẽ bị từ chối và ẩn khỏi danh sách đăng ký.'
            : 'Đề tài sẽ được đưa về trạng thái chờ duyệt để xem xét lại.',
      okText: 'Xác nhận',
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: status === 'rejected' ? { danger: true } : undefined,
      onOk: () => {
        changeTopicStatus(record.id, status);
        message.success(`Đã cập nhật đề tài ${record.code} sang ${label}`);
      },
    });
  };

  const remindAll = () => {
    message.success('Đã gửi nhắc nhở cho toàn bộ sinh viên chưa có đề tài');
  };

  const columns: ColumnsType<TopicRow> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 110,
      render: (value: string) => <span className="text-[#2563eb] font-medium">{value}</span>,
    },
    {
      title: 'Tên đề tài',
      dataIndex: 'name',
      key: 'name',
      render: (value: string, record) => (
        <div>
          <div className="font-medium text-navyDark">{value}</div>
          <div className="text-xs text-slate-500">GVHD: {record.teacher}</div>
        </div>
      ),
    },
    { title: 'GV đề xuất', dataIndex: 'teacher', key: 'teacher', width: 180 },
    { title: 'Slot', dataIndex: 'slots', key: 'slots', width: 90 },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: TopicStatus) => {
        const meta = topicStatusMeta[status];
        return (
          <Tag style={{ margin: 0, borderRadius: 999, padding: '0 10px', border: 'none', backgroundColor: meta.bg, color: meta.color }}>
            {meta.label}
          </Tag>
        );
      },
    },
    {
      title: 'Lý do từ chối',
      dataIndex: 'rejectReason',
      key: 'rejectReason',
      render: (value: string) => <span className="text-xs text-slate-500">{value || '—'}</span>,
    },
    {
      title: t(getKey('action')),
      key: 'actions',
      align: 'right',
      width: 150,
      render: (_: unknown, record) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            className="!h-8 !rounded-[8px] !px-2 !font-medium !text-[#00A65A] hover:!bg-[#ecfdf3]"
            onClick={() => confirmTopicChange(record, 'approved')}
          >
            <CheckCircleOutlined />
          </Button>
          <Button
            type="text"
            size="small"
            className="!h-8 !rounded-[8px] !px-2 !font-medium !text-[#C53030] hover:!bg-[#ffecec]"
            onClick={() => confirmTopicChange(record, 'rejected')}
          >
            <CloseCircleOutlined />
          </Button>
          <Button
            type="text"
            size="small"
            className="!h-8 !rounded-[8px] !px-2 !font-medium !text-[#2563eb] hover:!bg-[#eff6ff]"
            onClick={() => message.info(`Đang xem chi tiết đề tài ${record.code}`)}
          >
            <EyeOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={cn('pb-4')}>
      <div className={cn('mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]')}>
        <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[#2196F3]/10 px-3 py-1 text-xs font-medium text-[#1976d2]')}>
          <BookOutlined />
          Danh mục đề tài
        </div>
        <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between')}>
          <div>
            <Typography.Title level={1} className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">
              {t(getKey('topic_management'))}
            </Typography.Title>
            <p className={cn('mt-2 mb-0 text-[18px] leading-[26px] text-grayDark')}>{t(getKey('topic_management_desc'))}</p>
          </div>
          {published ? (
            <Space wrap>
              <Tag style={{ margin: 0, borderRadius: 999, border: 'none', backgroundColor: '#E8F9EE', color: '#00A65A' }}>
                Đã công bố • {published}
              </Tag>
              <Button danger onClick={() => { setPublished(null); message.success('Đã hủy công bố danh sách đề tài'); }}>
                Hủy công bố
              </Button>
            </Space>
          ) : (
            <Button
              type="primary"
              onClick={() => {
                const now = new Date().toLocaleDateString('vi-VN');
                setPublished(now);
                message.success('Đã công bố danh sách đề tài');
              }}
              className="!h-10 !rounded-[8px] !bg-primary !px-5 !font-medium hover:!bg-blueDark"
            >
              <span className="inline-flex items-center gap-2">
                <SendOutlined className="text-white" />
                Công bố danh sách
              </span>
            </Button>
          )}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Tổng đề tài', value: totalTopics, color: 'bg-[#2196F3]' },
          { label: 'Chờ duyệt', value: pendingTopics, color: 'bg-[#D08A00]' },
          { label: 'Đã duyệt', value: approvedTopics, color: 'bg-[#00A65A]' },
          { label: 'Bị từ chối', value: rejectedTopics, color: 'bg-[#C53030]' },
        ].map((item) => (
          <Card key={item.label} className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="mt-2 text-3xl font-bold text-navyDark">{item.value}</div>
              </div>
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl text-white', item.color)}>
                <BookOutlined />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <Tabs
          activeKey={tab}
          onChange={(key) => setTab(key as any)}
          items={[
            { key: 'all', label: `Tất cả (${totalTopics})`, icon: <BookOutlined /> },
            { key: 'approved', label: `Đã duyệt (${approvedTopics})`, icon: <CheckCircleOutlined /> },
            { key: 'pending', label: `Chờ duyệt (${pendingTopics})`, icon: <ClockCircleOutlined /> },
            { key: 'rejected', label: `Bị từ chối (${rejectedTopics})`, icon: <CloseCircleOutlined /> },
          ]}
          className="batch-tabs"
        />
      </div>

      <Card className="overflow-hidden rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
          <div className="text-base font-semibold text-navyDark">Danh sách đề tài</div>
          <div className="mt-1 text-sm text-slate-500">Duyệt đề tài ĐATN do giảng viên tạo</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Mã</th>
                <th className="px-4 py-3 text-left">Tên đề tài</th>
                <th className="px-4 py-3 text-left">GV đề xuất</th>
                <th className="px-4 py-3 text-left">Slot</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Lý do từ chối</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopicRows.map((record) => (
                <tr key={record.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-[#2563eb] font-medium">{record.code}</td>
                  <td className="px-4 py-3">{record.name}</td>
                  <td className="px-4 py-3 text-slate-600">{record.teacher}</td>
                  <td className="px-4 py-3">{record.slots}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      const meta = topicStatusMeta[record.status];
                      return (
                        <Tag style={{ margin: 0, borderRadius: 999, padding: '0 10px', border: 'none', backgroundColor: meta.bg, color: meta.color }}>
                          {meta.label}
                        </Tag>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{record.rejectReason || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => confirmTopicChange(record, 'approved')}
                        className="rounded p-1.5 text-[#00A65A] hover:bg-green-50"
                        title="Duyệt"
                      >
                        <CheckCircleOutlined />
                      </button>
                      <button
                        onClick={() => confirmTopicChange(record, 'rejected')}
                        className="rounded p-1.5 text-[#F44336] hover:bg-red-50"
                        title="Từ chối"
                      >
                        <CloseCircleOutlined />
                      </button>
                      <button
                        onClick={() => message.info(`Đang xem chi tiết đề tài ${record.code}`)}
                        className="rounded p-1.5 text-[#2196F3] hover:bg-blue-50"
                        title="Xem"
                      >
                        <EyeOutlined />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-600">
          Hiển thị {filteredTopicRows.length} đề tài
        </div>
      </Card>

      <Card className="mt-5 overflow-hidden rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-base font-semibold text-navyDark">Sinh viên chưa có đề tài ĐATN</div>
            <div className="mt-1 text-sm text-slate-500">
              SV đủ điều kiện nhưng chưa đăng ký vào đề tài nào — cần nhắc nhở hoặc phân công
            </div>
          </div>
          <Space wrap>
            <Tag style={{ margin: 0, borderRadius: 999, border: 'none', backgroundColor: unassignedStudents.length === 0 ? '#E8F9EE' : '#FFF7E6', color: unassignedStudents.length === 0 ? '#00A65A' : '#D08A00' }}>
              {unassignedStudents.length} sinh viên
            </Tag>
            <Button type="primary" onClick={remindAll} className="!h-10 !rounded-[8px] !bg-primary !px-5 !font-medium hover:!bg-blueDark">
              Nhắc nhở tất cả
            </Button>
          </Space>
        </div>

        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
          <div className="relative max-w-sm">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              allowClear
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm MSSV, họ tên, lớp..."
              className="!h-11 !rounded-[12px] !border-slate-300 !pl-9"
            />
          </div>
        </div>

        {unassignedStudents.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-slate-500">Không tìm thấy sinh viên phù hợp</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">MSSV</th>
                  <th className="px-4 py-3 text-left">Họ tên</th>
                  <th className="px-4 py-3 text-left">Lớp</th>
                  <th className="px-4 py-3 text-left">Điểm TTTN</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {unassignedStudents.map((student) => (
                  <tr key={student.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-[#2563eb] font-medium">{student.id}</td>
                    <td className="px-4 py-3">{student.name}</td>
                    <td className="px-4 py-3 text-slate-600">{student.className}</td>
                    <td className="px-4 py-3 text-[#00A65A] font-medium">{student.score.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => message.success(`Đã mở luồng phân công cho ${student.name}`)}
                        className="text-xs font-medium text-[#2196F3] hover:underline"
                      >
                        Phân công đề tài
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-600">
          Hiển thị {unassignedStudents.length} sinh viên
        </div>
      </Card>

      <div className="mt-4 flex justify-end">
        <Pagination current={1} total={1} pageSize={10} showSizeChanger={false} />
      </div>
    </div>
  );
};

export default TopicsPage;