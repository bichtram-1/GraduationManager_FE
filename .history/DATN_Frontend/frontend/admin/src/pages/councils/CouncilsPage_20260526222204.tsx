import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routers';

type CouncilCard = {
  id: string;
  title: string;
  dateTime: string;
  room: string;
  achieved: number;
  rejected: number;
  chair: string[];
  reviewer: string[];
  member: string[];
  external?: { name: string; council: string }[];
  accent: 'blue' | 'green';
};

type TopicGroup = {
  id: string;
  code: string;
  title: string;
  members: string[];
  councilId: string | null;
};

const COUNCILS: CouncilCard[] = [
  {
    id: 'HD01',
    title: 'Hội đồng 1 — HK1/2024',
    dateTime: '20/12/2024 · 08:00–12:00',
    room: 'Phòng B1.01',
    achieved: 8,
    rejected: 1,
    chair: ['TS. Nguyễn Văn A', 'TS. Trần Thị B'],
    reviewer: ['TS. Phạm Văn D', 'TS. Hoàng Thị E'],
    member: ['ThS. Nguyễn Thị F'],
    external: [{ name: 'TS. Lý Văn G', council: 'HĐ2' }],
    accent: 'blue',
  },
  {
    id: 'HD02',
    title: 'Hội đồng 2 — HK1/2024',
    dateTime: '20/12/2024 · 13:30–17:30',
    room: 'Phòng B1.02',
    achieved: 7,
    rejected: 2,
    chair: ['TS. Lý Văn G', 'PGS. Mai Thị H'],
    reviewer: ['TS. Đặng Văn I'],
    member: [],
    accent: 'green',
  },
];

const INITIAL_TOPICS: TopicGroup[] = [
  { id: 'N01', code: 'G01', title: 'IoT giám sát nông nghiệp', members: ['20520001', '20520002'], councilId: 'HD01' },
  { id: 'N02', code: 'G02', title: 'AI nhận diện hình ảnh', members: ['20520003'], councilId: 'HD01' },
  { id: 'N03', code: 'G03', title: 'Nền tảng e-commerce', members: ['20520004', '20520005'], councilId: 'HD02' },
  { id: 'N04', code: 'G04', title: 'Quản lý ký túc xá', members: ['20520006'], councilId: null },
  { id: 'N05', code: 'G05', title: 'Ứng dụng học tập gamification', members: ['20520007'], councilId: null },
  { id: 'N06', code: 'G06', title: 'Nền tảng đặt lịch phòng lab', members: ['20520008', '20520009'], councilId: null },
  { id: 'N07', code: 'G07', title: 'Dashboard phân tích sinh viên', members: ['20520010'], councilId: 'HD02' },
  { id: 'N08', code: 'G08', title: 'Chatbot tư vấn tuyển sinh', members: ['20520011'], councilId: null },
];

const CouncilsPage: React.FC = () => {
  const [externalFormCouncilId, setExternalFormCouncilId] = useState<string | null>(null);
  const [manageTopicsCouncilId, setManageTopicsCouncilId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'filter'>('list');
  const [query, setQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [councils, setCouncils] = useState<CouncilCard[]>(COUNCILS);
  const [topics, setTopics] = useState<TopicGroup[]>(INITIAL_TOPICS);
  const navigate = useNavigate();

  const getSession = (dateTime: string) => {
    const matched = dateTime.match(/(\d{2}):(\d{2})/);
    if (!matched) return 'unknown';
    const hour = Number(matched[1]);
    return hour < 12 ? 'morning' : 'afternoon';
  };

  const rooms = Array.from(new Set(councils.map((item) => item.room)));

  const filteredCouncils = councils.filter((item) => {
    const normalizedQuery = query.trim().toLowerCase();
    const byQuery =
      !normalizedQuery ||
      [item.id, item.title, item.room, item.dateTime]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    const byRoom = roomFilter === 'all' || item.room === roomFilter;
    const bySession = sessionFilter === 'all' || getSession(item.dateTime) === sessionFilter;
    return byQuery && byRoom && bySession;
  });

  const totalTopics = topics.length;
  const assignedTopicsCount = topics.filter((topic) => topic.councilId).length;
  const unassignedTopicsCount = totalTopics - assignedTopicsCount;
  const assignmentProgressPercent = totalTopics === 0 ? 0 : Math.round((assignedTopicsCount / totalTopics) * 100);

  const councilStats = [
    { value: councils.length, label: 'Hội đồng hoạt động' },
    { value: assignedTopicsCount, label: 'Đề tài đã phân hội đồng' },
    { value: unassignedTopicsCount, label: 'Đề tài chưa phân công' },
    { value: councils.reduce((sum, council) => sum + (council.external?.length || 0), 0), label: 'GV chấm chéo' },
  ];

  const getTopicsByCouncil = (councilId: string) => topics.filter((topic) => topic.councilId === councilId);
  const unassignedTopics = topics.filter((topic) => !topic.councilId);

  const resetFilters = () => {
    setQuery('');
    setRoomFilter('all');
    setSessionFilter('all');
  };

  const handleDeleteCouncil = (councilId: string) => {
    const council = councils.find((item) => item.id === councilId);
    if (!council) return;
    const confirmed = window.confirm(`Bạn có chắc muốn xóa ${council.title}?`);
    if (!confirmed) return;
    setCouncils((prev) => prev.filter((item) => item.id !== councilId));
    setTopics((prev) => prev.map((topic) => (topic.councilId === councilId ? { ...topic, councilId: null } : topic)));
    setExternalFormCouncilId((current) => (current === councilId ? null : current));
    setManageTopicsCouncilId((current) => (current === councilId ? null : current));
    message.success('Đã xóa hội đồng');
  };

  const assignTopicToCouncil = (topicId: string, councilId: string) => {
    setTopics((prev) => prev.map((topic) => (topic.id === topicId ? { ...topic, councilId } : topic)));
    message.success('Đã phân đề tài vào hội đồng');
  };

  const removeTopicFromCouncil = (topicId: string) => {
    setTopics((prev) => prev.map((topic) => (topic.id === topicId ? { ...topic, councilId: null } : topic)));
    message.success('Đã gỡ đề tài khỏi hội đồng');
  };

  const publishAssignments = () => {
    if (unassignedTopicsCount > 0) {
      message.warning(`Còn ${unassignedTopicsCount} đề tài chưa phân công. Vui lòng phân hết trước khi công bố.`);
      return;
    }
    message.success('Đã công bố phân công hội đồng');
  };

  useEffect(() => {
    const href = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.x/tabler-icons.min.css';
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }, []);

  return (
    <div className="council-ui min-h-screen bg-[#f5f4f0] text-[#1a1916]">
      <style>{`
        .council-ui { --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; --color-background-primary: #ffffff; --color-background-secondary: #f5f4f0; --color-text-primary: #1a1916; --color-text-secondary: #6b6966; --color-border-tertiary: #e5e3dc; --border-radius-md: 8px; font-family: var(--font-sans); }
        .council-ui .page { max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem; }
        .council-ui .header { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px; }
        .council-ui .title { font-size:18px; font-weight:600; color:var(--color-text-primary); margin:0 }
        .council-ui .subtitle { font-size:12px; color:var(--color-text-secondary); margin-top:6px }
        .council-ui .tabs { display:flex; gap:8px; margin-bottom:12px }
        .council-ui .tab { padding:8px 12px; background:#fff; border-radius:8px; border:1px solid var(--color-border-tertiary); color:var(--color-text-secondary); }
        .council-ui .tab { cursor:pointer; }
        .council-ui .tab.on { color:#185FA5; border-color:#185FA5; font-weight:600 }
        .council-ui .filter-panel { display:grid; grid-template-columns: 1.4fr 1fr 1fr auto; gap:10px; margin-bottom:12px; background:#fff; border:1px solid var(--color-border-tertiary); border-radius:10px; padding:12px; }
        .council-ui .filter-input { width:100%; border:1px solid var(--color-border-tertiary); border-radius:8px; padding:8px 10px; font-size:13px; }
        .council-ui .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:12px }
        .council-ui .scard { background:#fff; padding:12px; border-radius:8px; border:1px solid var(--color-border-tertiary) }
        .council-ui .sv { font-size:20px; font-weight:600 }
        .council-ui .progress-wrap { background:#fff; border:1px solid var(--color-border-tertiary); border-radius:10px; padding:12px; margin-bottom:12px; }
        .council-ui .progress-track { height:10px; border-radius:999px; background:#ece9df; overflow:hidden; }
        .council-ui .progress-fill { height:100%; background:linear-gradient(90deg,#185FA5,#2e7cc8); transition:width .2s ease; }
        .council-ui .ov-card { background:#fff; padding:18px; border-radius:10px; border:1px solid var(--color-border-tertiary); margin-bottom:12px }
        .council-ui .ov-head { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:12px }
        .council-ui .head-actions { display:flex; flex-direction:column; gap:8px; align-items:flex-end; }
        .council-ui .action-row { display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
        .council-ui .btn-icon { display:inline-flex; align-items:center; gap:6px; }
        .council-ui .chip { display:inline-flex; align-items:center; padding:4px 8px; border-radius:16px; background:#f3f5f7; font-size:12px; white-space:nowrap }
        .council-ui .btn { padding:8px 14px; border-radius:8px; font-weight:600; cursor:pointer }
        .council-ui .btn:disabled { opacity:.55; cursor:not-allowed; }
        .council-ui .btnp { background:#185FA5; color:#fff; border:none }
        .council-ui .btns { background:transparent; border:1px solid #e6e6e6 }
        .council-ui .council-body { display:grid; grid-template-columns:1.6fr 1fr 1fr 1fr; gap:14px; border-top:1px solid var(--color-border-tertiary); padding-top:14px }
        .council-ui .role-col { min-width:0; display:flex; flex-direction:column; gap:8px; padding:0 8px }
        .council-ui .role-col .btn { flex-shrink:0 }
        .council-ui .role-name { font-size:12px; font-weight:700; color:var(--color-text-secondary); text-transform:uppercase; letter-spacing:.04em }
        .council-ui .role-title { font-size:13px; font-weight:600; color:var(--color-text-primary) }
        .council-ui .chip-wrap { display:flex; flex-wrap:wrap; gap:6px }
        .council-ui .topic-summary { margin-top:14px; border-top:1px dashed var(--color-border-tertiary); padding-top:12px; display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
        .council-ui .topic-board { margin-top:10px; border:1px solid var(--color-border-tertiary); border-radius:8px; padding:12px; background:#faf9f5; display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .council-ui .topic-col { min-width:0; }
        .council-ui .topic-col h4 { margin:0 0 8px; font-size:13px; }
        .council-ui .topic-list { display:flex; flex-direction:column; gap:8px; }
        .council-ui .topic-item { border:1px solid #e7e2d6; border-radius:8px; background:#fff; padding:8px; display:flex; justify-content:space-between; gap:8px; align-items:flex-start; }
        .council-ui .topic-title { font-size:12px; color:#1a1916; }
        .council-ui .topic-meta { font-size:11px; color:var(--color-text-secondary); margin-top:4px; }
        .council-ui .muted { color:var(--color-text-secondary); font-size:12px }
        @media (max-width:900px){ .council-ui .filter-panel{grid-template-columns:1fr 1fr} .council-ui .council-body{grid-template-columns:1fr 1fr} .council-ui .topic-board{grid-template-columns:1fr} }
        @media (max-width:700px){ .council-ui .filter-panel{grid-template-columns:1fr} .council-ui .stats{grid-template-columns:1fr 1fr} .council-ui .council-body{grid-template-columns:1fr} }
      `}</style>

      <div className="page">
        <div className="header">
          <div>
            <h1 className="title">Quản lý Hội đồng Bảo vệ</h1>
            <div className="subtitle">Phân công giảng viên, đề tài và lịch bảo vệ</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btns" onClick={publishAssignments} disabled={unassignedTopicsCount > 0}>Công bố phân công</button>
            <button className="btn btnp" onClick={() => navigate(ROUTES.COUNCILS_CREATE)}>Tạo hội đồng mới</button>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${activeTab === 'list' ? 'on' : ''}`} onClick={() => setActiveTab('list')}>Danh sách hội đồng</button>
          <button className={`tab ${activeTab === 'filter' ? 'on' : ''}`} onClick={() => setActiveTab('filter')}>Bộ lọc</button>
        </div>

        {activeTab === 'filter' && (
          <div className="filter-panel">
            <input
              className="filter-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo mã, tên hội đồng, phòng..."
            />
            <select className="filter-input" value={roomFilter} onChange={(event) => setRoomFilter(event.target.value)}>
              <option value="all">Tất cả phòng</option>
              {rooms.map((room) => (
                <option value={room} key={room}>{room}</option>
              ))}
            </select>
            <select className="filter-input" value={sessionFilter} onChange={(event) => setSessionFilter(event.target.value as 'all' | 'morning' | 'afternoon')}>
              <option value="all">Tất cả buổi</option>
              <option value="morning">Buổi sáng</option>
              <option value="afternoon">Buổi chiều</option>
            </select>
            <button className="btn btns" onClick={resetFilters}>Đặt lại</button>
          </div>
        )}

        <div className="progress-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <strong>Tiến độ phân công đề tài: {assignedTopicsCount}/{totalTopics}</strong>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
              {unassignedTopicsCount === 0 ? 'Đã phân hết đề tài, có thể công bố.' : `Còn ${unassignedTopicsCount} đề tài chưa phân công`}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${assignmentProgressPercent}%` }} />
          </div>
        </div>

        <div className="stats">
          {councilStats.map((s) => (
            <div className="scard" key={s.label}>
              <div className="sv">{s.value}</div>
              <div style={{ marginTop: 6, color: 'var(--color-text-secondary)', fontSize: 12 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div>
          {filteredCouncils.map((c) => (
            <div className="ov-card" key={c.id}>
              {(() => {
                const topicsOfCouncil = getTopicsByCouncil(c.id);
                const topicCodes = topicsOfCouncil.map((topic) => topic.code);
                return (
                  <>
              <div className="ov-head">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>{c.dateTime} · {c.room}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>
                    Đề tài đã phân: {topicsOfCouncil.length} {topicCodes.length > 0 ? `(${topicCodes.join(', ')})` : ''}
                  </div>
                </div>
                <div className="head-actions">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span className="chip">{c.achieved} nhóm đạt</span>
                    <span className="chip">{c.rejected} bị loại</span>
                  </div>
                  <div className="action-row">
                    <button className="btn btns btn-icon" onClick={() => message.info(`Xem chi tiết ${c.id} (mô phỏng)`) }>
                      <EyeOutlined /> Xem
                    </button>
                    <button className="btn btns btn-icon" onClick={() => message.info(`Mở chỉnh sửa ${c.id} (mô phỏng)`) }>
                      <EditOutlined /> Sửa
                    </button>
                    <button className="btn btns btn-icon" onClick={() => handleDeleteCouncil(c.id)}>
                      <DeleteOutlined /> Xóa
                    </button>
                    <button
                      className="btn btnp btn-icon"
                      onClick={() => setExternalFormCouncilId((cur) => (cur === c.id ? null : c.id))}
                    >
                      <PlusOutlined />
                      {externalFormCouncilId === c.id ? 'Đóng thêm GV ngoài' : 'Thêm GV ngoài'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="council-body">
                <div className="role-col">
                  <div className="role-name">GVHD</div>
                  <div className="role-title">Giảng viên hướng dẫn</div>
                  <div className="chip-wrap">
                    {c.chair.map((t) => <span key={t} className="chip">{t}</span>)}
                  </div>
                </div>

                <div className="role-col">
                  <div className="role-name">GVPB</div>
                  <div className="role-title">Giảng viên phản biện</div>
                  <div className="chip-wrap">
                    {c.reviewer.map((t) => <span key={t} className="chip">{t}</span>)}
                  </div>
                </div>

                <div className="role-col">
                  <div className="role-name">Ủy viên</div>
                  <div className="role-title">Thành viên hội đồng</div>
                  <div className="chip-wrap">
                    {c.member.length ? c.member.map((t) => <span key={t} className="chip">{t}</span>) : <span className="muted">Chưa phân công</span>}
                  </div>
                </div>

                <div className="role-col">
                  <div className="role-name">GV ngoài</div>
                  <div className="role-title">Giảng viên ngoài hội đồng</div>
                  <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 8, alignItems: 'center', overflowX: 'auto' }}>
                    {c.external?.length ? (
                      <>
                        <span className="chip" style={{ background: '#eeedfe' }}>{c.external[0].name} ({c.external[0].council})</span>
                        <button className="btn btns btn-xs" onClick={() => message.info('Đây là trạng thái mô phỏng của giao diện mẫu.')}> <DeleteOutlined /> </button>
                      </>
                    ) : (
                      <span className="muted">Chưa có giảng viên ngoài</span>
                    )}
                  </div>

                  {externalFormCouncilId === c.id && (
                    <div style={{ marginTop: 10, padding: 12, borderRadius: 8, background: '#fafafa', border: '1px solid var(--color-border-tertiary)' }}>
                      <div style={{ marginBottom: 8, color: 'var(--color-text-secondary)' }}>Thêm giảng viên chấm chéo</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <select style={{ flex: 1, minWidth: 220 }} defaultValue="TS. Lý Văn G (HĐ2)">
                          <option>TS. Lý Văn G (HĐ2)</option>
                          <option>TS. Đặng Văn I (HĐ2)</option>
                        </select>
                        <button className="btn btnp" onClick={() => { setExternalFormCouncilId(null); message.success('Đã thêm GV ngoài (mô phỏng)'); }}>Xác nhận</button>
                        <button className="btn btns" onClick={() => setExternalFormCouncilId(null)}>Hủy</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="topic-summary">
                <div className="chip-wrap">
                  <span className="chip">Nhóm đề tài: {topicsOfCouncil.length}</span>
                  {topicsOfCouncil.length === 0 && <span className="muted">Hội đồng này chưa có đề tài</span>}
                </div>
                <button
                  className="btn btns"
                  onClick={() => setManageTopicsCouncilId((current) => (current === c.id ? null : c.id))}
                >
                  {manageTopicsCouncilId === c.id ? 'Đóng quản lý đề tài' : 'Quản lý nhóm đề tài'}
                </button>
              </div>

              {manageTopicsCouncilId === c.id && (
                <div className="topic-board">
                  <div className="topic-col">
                    <h4>Đề tài chưa phân công ({unassignedTopics.length})</h4>
                    <div className="topic-list">
                      {unassignedTopics.length > 0 ? (
                        unassignedTopics.map((topic) => (
                          <div className="topic-item" key={topic.id}>
                            <div>
                              <div className="topic-title">{topic.code} - {topic.title}</div>
                              <div className="topic-meta">{topic.members.length} SV</div>
                            </div>
                            <button className="btn btns" onClick={() => assignTopicToCouncil(topic.id, c.id)}>Phân vào HĐ</button>
                          </div>
                        ))
                      ) : (
                        <div className="muted">Không còn đề tài chưa phân công.</div>
                      )}
                    </div>
                  </div>

                  <div className="topic-col">
                    <h4>Đề tài của hội đồng ({topicsOfCouncil.length})</h4>
                    <div className="topic-list">
                      {topicsOfCouncil.length > 0 ? (
                        topicsOfCouncil.map((topic) => (
                          <div className="topic-item" key={topic.id}>
                            <div>
                              <div className="topic-title">{topic.code} - {topic.title}</div>
                              <div className="topic-meta">{topic.members.length} SV</div>
                            </div>
                            <button className="btn btns" onClick={() => removeTopicFromCouncil(topic.id)}>Gỡ</button>
                          </div>
                        ))
                      ) : (
                        <div className="muted">Chưa có đề tài trong hội đồng này.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
                  </>
                );
              })()}
            </div>
          ))}

          {filteredCouncils.length === 0 && (
            <div className="ov-card" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Không có hội đồng phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouncilsPage;
