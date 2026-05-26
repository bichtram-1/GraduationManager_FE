import React, { useEffect, useState } from 'react';
import { message } from 'antd';
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

const COUNCIL_STATS = [
  { value: 3, label: 'Hội đồng hoạt động' },
  { value: 21, label: 'Nhóm đủ điều kiện' },
  { value: 4, label: 'Nhóm bị loại' },
  { value: 2, label: 'GV chấm chéo' },
];

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

const CouncilsPage: React.FC = () => {
  const [externalFormCouncilId, setExternalFormCouncilId] = useState<string | null>(null);
  const navigate = useNavigate();

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
        .council-ui .page { max-width: 960px; margin: 0 auto; padding: 1.5rem 1rem; }
        .council-ui .header { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px; }
        .council-ui .title { font-size:18px; font-weight:600; color:var(--color-text-primary); margin:0 }
        .council-ui .subtitle { font-size:12px; color:var(--color-text-secondary); margin-top:6px }
        .council-ui .tabs { display:flex; gap:8px; margin-bottom:12px }
        .council-ui .tab { padding:8px 12px; background:#fff; border-radius:8px; border:1px solid var(--color-border-tertiary); color:var(--color-text-secondary); }
        .council-ui .tab.on { color:#185FA5; border-color:#185FA5; font-weight:600 }
        .council-ui .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:12px }
        .council-ui .scard { background:#fff; padding:12px; border-radius:8px; border:1px solid var(--color-border-tertiary) }
        .council-ui .sv { font-size:20px; font-weight:600 }
        .council-ui .ov-card { background:#fff; padding:14px; border-radius:10px; border:1px solid var(--color-border-tertiary); margin-bottom:10px }
        .council-ui .ov-head { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:12px }
        .council-ui .chip { display:inline-flex; align-items:center; padding:4px 8px; border-radius:16px; background: #f3f5f7; font-size:12px; white-space:nowrap }
        .council-ui .btn { padding:8px 14px; border-radius:8px; font-weight:600; cursor:pointer }
        .council-ui .btnp { background:#185FA5; color:#fff; border:none }
        .council-ui .btns { background:transparent; border:1px solid #e6e6e6 }
        .council-ui .mini-table { width:100%; border-collapse:collapse; font-size:12px; }
        .council-ui .mini-table th, .council-ui .mini-table td { border-top:1px solid var(--color-border-tertiary); padding:10px 8px; vertical-align:top }
        .council-ui .mini-table th { width:120px; color:var(--color-text-secondary); font-weight:600; text-align:left; background:#fbfbfa }
        .council-ui .mini-table td { color:var(--color-text-primary) }
        .council-ui .section-label { font-size:11px; color:var(--color-text-secondary); text-transform:uppercase; letter-spacing:.04em; margin-bottom:6px }
        .council-ui .chip-wrap { display:flex; flex-wrap:wrap; gap:6px }
        @media (max-width:700px){ .council-ui .stats{grid-template-columns:1fr 1fr} }
      `}</style>

      <div className="page">
        <div className="header">
          <div>
            <h1 className="title">Quản lý Hội đồng Bảo vệ</h1>
            <div className="subtitle">Phân công giảng viên, đề tài và lịch bảo vệ</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btnp" onClick={() => navigate(ROUTES.COUNCILS_CREATE)}>Tạo hội đồng mới</button>
          </div>
        </div>

        <div className="tabs">
          <div className="tab on">Danh sách hội đồng</div>
          <div className="tab">Bộ lọc</div>
        </div>

        <div className="stats">
          {COUNCIL_STATS.map((s) => (
            <div className="scard" key={s.label}>
              <div className="sv">{s.value}</div>
              <div style={{ marginTop: 6, color: 'var(--color-text-secondary)', fontSize: 12 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div>
          {COUNCILS.map((c) => (
            <div className="ov-card" key={c.id}>
              <div className="ov-head">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>{c.dateTime} · {c.room}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span className="chip">{c.achieved} nhóm đạt</span>
                  <span className="chip">{c.rejected} bị loại</span>
                </div>
              </div>

              <table className="mini-table">
                <tbody>
                  <tr>
                    <th>GVHD</th>
                    <td>
                      <div className="section-label">Giảng viên hướng dẫn</div>
                      <div className="chip-wrap">
                        {c.chair.map((t) => <span key={t} className="chip">{t}</span>)}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>GVPB</th>
                    <td>
                      <div className="section-label">Giảng viên phản biện</div>
                      <div className="chip-wrap">
                        {c.reviewer.map((t) => <span key={t} className="chip">{t}</span>)}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>Ủy viên</th>
                    <td>
                      <div className="section-label">Thành viên hội đồng</div>
                      <div className="chip-wrap">
                        {c.member.length ? c.member.map((t) => <span key={t} className="chip">{t}</span>) : <span style={{ color: 'var(--color-text-secondary)' }}>Chưa phân công</span>}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>GV ngoài</th>
                    <td>
                      <div className="section-label">Giảng viên ngoài hội đồng</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        {c.external?.length ? (
                          <>
                            <span className="chip" style={{ background: '#eeedfe' }}>{c.external[0].name} ({c.external[0].council})</span>
                            <button className="btn btns btn-xs" onClick={() => message.info('Đây là trạng thái mô phỏng của giao diện mẫu.')}>Xóa</button>
                          </>
                        ) : (
                          <span style={{ color: 'var(--color-text-secondary)' }}>Chưa có giảng viên ngoài</span>
                        )}
                      </div>
                      {externalFormCouncilId === c.id ? (
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
                      ) : (
                        <div style={{ marginTop: 10 }}>
                          <button className="btn btns btn-xs" onClick={() => setExternalFormCouncilId((cur) => (cur === c.id ? null : c.id))}>Thêm GV ngoài</button>
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CouncilsPage;
