import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, PlusOutlined, SearchOutlined, TeamOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Card, Input, Modal, Space, Tag, Typography, message } from 'antd';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import { useTranslation } from 'react-i18next';

type CouncilStatus = 'pending' | 'ongoing' | 'done';

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
  const [openCreate, setOpenCreate] = useState(false);
  const navigate = useNavigate();
  const [published, setPublished] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'unassigned' | 'assigned'>('all');
  const [search, setSearch] = useState('');

  const [reviewRows] = useState(() => [
    { topic: 'DA001', topicName: 'Hệ thống IoT giám sát nông nghiệp', advisor: 'GV01', members: ['Nguyễn A', 'Trần B'], reviewer: null },
    { topic: 'DA002', topicName: 'Ứng dụng AI nhận diện hình ảnh', advisor: 'GV02', members: ['Phạm D'], reviewer: 'GV03' },
  ] as any[]);

  const assignedCount = useMemo(() => reviewRows.filter((r) => r.reviewer).length, [reviewRows]);

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
          { k: 'review', l: 'Phân công phản biện' },
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
            <div className="text-sm text-gray-600">Mỗi đề tài chọn 1 GV phản biện (không phải GVHD)</div>
            <div className="inline-flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1.5 rounded-full ${reviewFilter === 'all' ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                Tất cả ({reviewRows.length})
              </button>
              <button
                onClick={() => setReviewFilter('unassigned')}
                className={`px-3 py-1.5 rounded-full ${reviewFilter === 'unassigned' ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                Chưa phân ({reviewRows.filter((r) => !r.reviewer).length})
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
              {reviewRows
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
                    <select defaultValue={r.reviewer ?? ''} className="border rounded w-64 px-2 py-1" onChange={() => message.success('Đã chọn phản biện')}>
                      <option value="">— Chọn —</option>
                      {TEACHERS.filter((t) => t.id !== r.advisor).map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {r.reviewer ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-[#D1FAE5] text-[#065F46]">Đã phân</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-500">Chưa phân</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-30">
            <div className="text-sm">
              <span className="text-[#2563EB]">{assignedCount}</span>
              <span className="text-gray-500"> / {reviewRows.length} đề tài đã được phân GV phản biện</span>
            </div>
            <Button type="primary" onClick={() => message.success('Đã lưu phân công phản biện')}>Lưu tất cả →</Button>
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
                        <Button type="link" onClick={() => message.info('Chỉnh sửa hội đồng')}>Chỉnh sửa</Button>
                        <Button type="link" danger onClick={() => Modal.confirm({ title: 'Xác nhận xóa', content: `Xóa ${c.id}?` })}>Xóa</Button>
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
    </div>
  );
};

export default CouncilsPage;
