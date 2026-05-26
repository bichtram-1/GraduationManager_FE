import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, PlusOutlined, SearchOutlined, TeamOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Space, Tag, Typography, message, Checkbox, Select } from 'antd';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import { useTranslation } from 'react-i18next';

type CouncilStatus = 'pending' | 'ongoing' | 'done';
type CouncilModalMode = 'edit' | 'detail';

type Council = {
  id: string;
  name: string;
  date: string;
  time: string;
  room: string;
  chair: string;
  secretary: string;
  reviewers: string[];
  groups: string[];
  status: CouncilStatus;
};

const TEACHERS = [
  { id: 'GV01', name: 'TS. Nguyễn Văn X' },
  { id: 'GV02', name: 'TS. Trần Văn Y' },
  { id: 'GV03', name: 'ThS. Lê Thị Z' },
  { id: 'GV04', name: 'TS. Phạm Văn K' },
];

const INITIAL_COUNCILS: Council[] = [
  {
    id: 'HD01',
    name: 'Hội đồng 1 - ĐATN HK2/2025-2026',
    date: '15/12/2026',
    time: '08:00',
    room: 'A1.401',
    chair: 'GV01',
    secretary: 'GV02',
    reviewers: ['GV03'],
    groups: ['DA001', 'DA002'],
    status: 'pending',
  },
];

const teacherName = (id?: string) => TEACHERS.find((t) => t.id === id)?.name ?? id ?? '';

const CouncilsPage: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'review' | 'list'>('review');
  const [councils, setCouncils] = useState<Council[]>(INITIAL_COUNCILS);
  const [selectedCouncil, setSelectedCouncil] = useState<string | null>(councils.length ? councils[0].id : null);
  const [openCreate, setOpenCreate] = useState(false);
  const navigate = useNavigate();
  const [published, setPublished] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'unassigned' | 'assigned'>('all');
  const [search, setSearch] = useState('');
  const [councilTopics, setCouncilTopics] = useState<Record<string, any[]>>({});
  const [editingGraders, setEditingGraders] = useState<{ councilId: string; index: number } | null>(null);
  const [tempGraders, setTempGraders] = useState<string[]>([]);

  const [reviewRows] = useState(() => [
    { topic: 'DA001', topicName: 'Hệ thống IoT giám sát nông nghiệp', advisor: 'GV01', members: ['Nguyễn A', 'Trần B'], reviewer: null },
    { topic: 'DA002', topicName: 'Ứng dụng AI nhận diện hình ảnh', advisor: 'GV02', members: ['Phạm D'], reviewer: 'GV03' },
  ] as any[]);

  const councilMembers = (c: Council) => [c.chair, c.secretary, ...(c.reviewers || [])].filter(Boolean) as string[];

  const collectTopicsForCouncil = (councilId: string) => {
    const c = councils.find(x => x.id === councilId);
    if (!c) return message.error('Hội đồng không tồn tại');
    const members = councilMembers(c);
    const collected = [
      { topic: 'DA001', topicName: 'Hệ thống IoT giám sát nông nghiệp', advisor: 'GV01', members: ['Nguyễn A', 'Trần B'], reviewer: null, graders: ['GV01'] },
      { topic: 'DA002', topicName: 'Ứng dụng AI nhận diện hình ảnh', advisor: 'GV02', members: ['Phạm D'], reviewer: null, graders: ['GV02'] },
    ].filter(g => members.includes(g.advisor));
    setCouncilTopics(s => ({ ...s, [councilId]: collected }));
    message.success(`Đã gom ${collected.length} đề tài cho ${c.name}`);
  };

  const getRowsForSelected = () => (selectedCouncil ? councilTopics[selectedCouncil] ?? [] : []);

  const assignedCount = useMemo(() => reviewRows.filter((r) => r.reviewer).length, [reviewRows]);

  const [editingMembers, setEditingMembers] = useState<{ chair: string; secretary: string; reviewers: string[]; members: string[] } | null>(null);
  const [councilModalOpen, setCouncilModalOpen] = useState(false);
  const [councilModalMode, setCouncilModalMode] = useState<CouncilModalMode>('detail');
  const [selectedCouncilDetail, setSelectedCouncilDetail] = useState<Council | null>(null);
  const [form] = Form.useForm();

  const startEditMembers = (cId: string | null) => {
    if (!cId) return setEditingMembers(null);
    const c = councils.find(x => x.id === cId);
    if (!c) return setEditingMembers(null);
    setEditingMembers({ chair: c.chair || '', secretary: c.secretary || '', reviewers: c.reviewers || [], members: [] });
  };

  const saveMembers = (cId: string) => {
    if (!editingMembers) return;
    setCouncils(prev => prev.map(c => c.id === cId ? { ...c, chair: editingMembers.chair, secretary: editingMembers.secretary, reviewers: editingMembers.reviewers } : c));
    message.success('Đã cập nhật danh sách giảng viên hội đồng');
  };

  React.useEffect(() => { startEditMembers(selectedCouncil); }, [selectedCouncil]);

  const openCouncilDetail = (record: Council) => {
    setCouncilModalMode('detail');
    setSelectedCouncilDetail(record);
    form.setFieldsValue(record);
    setCouncilModalOpen(true);
  };

  const openCouncilEdit = (record: Council) => {
    setCouncilModalMode('edit');
    setSelectedCouncilDetail(record);
    form.setFieldsValue(record);
    setCouncilModalOpen(true);
  };

  const deleteCouncil = (record: Council) => {
    Modal.confirm({
      centered: true,
      title: 'Xác nhận xóa',
      content: `Xóa ${record.id}?`,
      okText: 'Xóa',
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: { danger: true },
      onOk: () => {
        setCouncils((prev) => prev.filter((c) => c.id !== record.id));
        if (selectedCouncil === record.id) {
          setSelectedCouncil(null);
        }
        message.success('Đã xóa hội đồng');
      },
    });
  };

  const submitCouncilEdit = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedCouncilDetail) return;

      setCouncils((prev) =>
        prev.map((c) =>
          c.id === selectedCouncilDetail.id
            ? {
                ...c,
                ...values,
              }
            : c
        )
      );

      message.success('Đã cập nhật hội đồng');
      setCouncilModalOpen(false);
      setSelectedCouncilDetail(null);
      form.resetFields();
    } catch {
      // noop
    }
  };

  return (
    <div className={cn('pb-4')}>
      <div className={cn('mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5')}>
        <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[#2196F3]/10 px-3 py-1 text-xs font-medium text-[#1976d2]')}>
          <TeamOutlined />
          Phân công hội đồng
        </div>
        <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between')}>
          <div>
            <Typography.Title level={1} className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">
              {t(getKey('council_management'))}
            </Typography.Title>
            <p className={cn('mt-2 mb-0 text-[18px] leading-[26px] text-grayDark')}>{t(getKey('council_management_desc'))}</p>
          </div>
          <div>
            {published ? (
              <Space wrap>
                <Tag style={{ margin: 0, borderRadius: 999, border: 'none', backgroundColor: '#E8F9EE', color: '#00A65A' }}>Đã công bố • {published}</Tag>
                <Button danger onClick={() => { setPublished(null); message.success('Đã hủy công bố phân công'); }}>
                  Hủy công bố
                </Button>
              </Space>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  const now = new Date().toLocaleDateString('vi-VN');
                  setPublished(now);
                  message.success('Đã công bố phân công hội đồng');
                }}
                className="!h-10 !rounded-[8px] !bg-primary !px-5 !font-medium"
              >
                <span className="inline-flex items-center gap-2">
                  <SendOutlined className="text-white" />
                  Công bố phân công
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-5 border-b border-gray-200">
        {[
          { k: 'review', l: 'Danh sách giảng viên hội đồng' },
          { k: 'list', l: 'Quản lý hội đồng bảo vệ' },
        ].map((tBtn) => {
          const active = tab === tBtn.k;
          return (
            <button
              key={tBtn.k}
              onClick={() => setTab(tBtn.k as any)}
              className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition ${active ? 'border-[#2196F3] text-[#2196F3]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            >
              {tBtn.l}
            </button>
          );
        })}
      </div>

      {tab === 'review' ? (
        <Card className="pb-8">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">Chọn hội đồng trước khi phân công</div>
                <select value={selectedCouncil ?? ''} onChange={(e) => setSelectedCouncil(e.target.value || null)} className="border rounded px-2 py-1">
                  <option value="">— Chọn hội đồng —</option>
                  {councils.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <Button onClick={() => selectedCouncil && collectTopicsForCouncil(selectedCouncil)}>Gom đề tài</Button>
              </div>
            <div className="inline-flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1.5 rounded-full ${reviewFilter === 'all' ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                Tất cả ({(getRowsForSelected().length || reviewRows.length)})
              </button>
              <button
                onClick={() => setReviewFilter('unassigned')}
                className={`px-3 py-1.5 rounded-full ${reviewFilter === 'unassigned' ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                Chưa phân ({(getRowsForSelected().length || reviewRows.length) - assignedCount})
              </button>
              <button
                onClick={() => setReviewFilter('assigned')}
                className={`px-3 py-1.5 rounded-full ${reviewFilter === 'assigned' ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                Đã phân ({assignedCount})
              </button>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Đề tài</th>
                <th className="text-left px-4 py-3">GVHD</th>
                <th className="text-left px-4 py-3">Nhóm SV</th>
                <th className="text-left px-4 py-3">GV phản biện</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {(getRowsForSelected().length ? getRowsForSelected() : reviewRows)
                .filter((r) => (reviewFilter === 'all' ? true : reviewFilter === 'assigned' ? !!r.reviewer : !r.reviewer))
                .map((r, idx) => (
                <tr key={r.topic} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-[#2196F3] text-xs">{r.topic}</div>
                    <div>{r.topicName}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{teacherName(r.advisor)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{r.members.join(', ')}</td>
                  <td className="px-4 py-3">
                    <select defaultValue={r.reviewer ?? ''} className="border rounded w-64 px-2 py-1" onChange={(e) => {
                      const v = e.target.value || null;
                      if (!selectedCouncil) return message.error('Vui lòng chọn hội đồng trước');
                      const rows = councilTopics[selectedCouncil] || [];
                      rows[idx] = { ...rows[idx], reviewer: v };
                      setCouncilTopics(s => ({ ...s, [selectedCouncil]: rows }));
                      message.success('Đã chọn phản biện');
                    }}>
                      <option value="">— Chọn —</option>
                      {(selectedCouncil ? TEACHERS.filter((t) => councilMembers(councils.find(c => c.id === selectedCouncil)!).includes(t.id) && t.id !== r.advisor) : TEACHERS.filter((t) => t.id !== r.advisor)).map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>

          <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-30">
            <div className="text-sm">
              <span className="text-[#2563EB]">{assignedCount}</span>
              <span className="text-gray-500"> / {(getRowsForSelected().length || reviewRows.length)} đề tài đã được phân GV phản biện</span>
            </div>
            <Button type="primary" onClick={() => {
              if (!selectedCouncil) return message.error('Vui lòng chọn hội đồng để lưu phân công');
              const rows = councilTopics[selectedCouncil] || [];
              if (rows.length === 0) return message.error('Danh sách đề tài rỗng. Gom đề tài trước khi lưu');
              const c = councils.find(x => x.id === selectedCouncil)!;
              for (const row of rows) {
                if (!row.reviewer) return message.error(`Đề tài ${row.topic} chưa chọn GVPB`);
                if (!councilMembers(c).includes(row.reviewer)) return message.error(`GVPB của ${row.topic} không thuộc hội đồng`);
              }
              message.success('Đã lưu phân công phản biện cho hội đồng');
            }}>Lưu tất cả →</Button>
          </div>
        </Card>
      ) : (
        <Card>
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm">Hội đồng đã tạo ({councils.length})</div>
            <Button
              type="primary"
              onClick={() => navigate('/councils/create')}
              className="!h-10 !rounded-[8px] !bg-primary !px-5 !font-medium"
            >
              <span className="inline-flex items-center gap-2">
                <PlusOutlined className="text-white" />
                Tạo hội đồng mới
              </span>
            </Button>
          </div>

          <div className="px-4 py-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1 max-w-md">
                <Input allowClear prefix={<SearchOutlined />} placeholder="Tìm hội đồng..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div />
            </div>
          </div>

          {councils.filter((c) => (search ? (c.name + ' ' + c.id).toLowerCase().includes(search.toLowerCase()) : true)).length === 0 ? (
            <div className="px-4 py-16 text-center text-gray-500">Không tìm thấy hội đồng phù hợp.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">STT</th>
                  <th className="px-4 py-3">Tên hội đồng</th>
                  <th className="px-4 py-3">Chủ tịch</th>
                  <th className="px-4 py-3">Số TV</th>
                  <th className="px-4 py-3">Số nhóm</th>
                  <th className="px-4 py-3">Ngày giờ</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {councils.filter((c) => (search ? (c.name + ' ' + c.id).toLowerCase().includes(search.toLowerCase()) : true)).map((c, i) => (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3">{teacherName(c.chair)}</td>
                    <td className="px-4 py-3">{2 + c.reviewers.length}</td>
                    <td className="px-4 py-3">{c.groups.length}</td>
                    <td className="px-4 py-3">{c.date} • {c.time} • {c.room}</td>
                    <td className="px-4 py-3">{c.status}</td>
                    <td className="px-4 py-3">
                      <Space>
                        <Button type="link" onClick={() => openCouncilDetail(c)}>Xem</Button>
                        <Button type="link" onClick={() => openCouncilEdit(c)}>Chỉnh sửa</Button>
                        <Button type="link" danger onClick={() => deleteCouncil(c)}>Xóa</Button>
                      </Space>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Create page handled in a dedicated route */}
        </Card>
      )}

      <Modal
        centered
        open={councilModalOpen}
        title={councilModalMode === 'edit' ? 'Chỉnh sửa hội đồng' : 'Chi tiết hội đồng'}
        onCancel={() => {
          setCouncilModalOpen(false);
          setSelectedCouncilDetail(null);
          form.resetFields();
        }}
        okText={councilModalMode === 'edit' ? 'Cập nhật' : undefined}
        cancelText={t(getKey('cancel_btn'))}
        onOk={submitCouncilEdit}
        footer={councilModalMode === 'detail' ? null : undefined}
      >
        <Form form={form} layout="vertical" className="pt-2">
          <Form.Item label="Tên hội đồng" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên hội đồng' }]}>
            <Input disabled={councilModalMode === 'detail'} />
          </Form.Item>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Form.Item label="Ngày" name="date" rules={[{ required: true, message: 'Vui lòng nhập ngày' }]}>
              <Input disabled={councilModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="Giờ" name="time" rules={[{ required: true, message: 'Vui lòng nhập giờ' }]}>
              <Input disabled={councilModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="Phòng" name="room" rules={[{ required: true, message: 'Vui lòng nhập phòng' }]}>
              <Input disabled={councilModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
              <Select
                disabled={councilModalMode === 'detail'}
                options={[
                  { value: 'pending', label: 'Chờ bảo vệ' },
                  { value: 'ongoing', label: 'Đang bảo vệ' },
                  { value: 'done', label: 'Hoàn thành' },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CouncilsPage;
