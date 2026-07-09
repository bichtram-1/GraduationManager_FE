import React, { useEffect, useState, useMemo } from 'react';
import { message, Modal, Button, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, SolutionOutlined, ExclamationCircleFilled, SendOutlined, LockOutlined, UndoOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { councilHooks } from '../../hooks/useCouncils';
import { ROUTES } from '../../constants/routers';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { formatNumber } from '@shared/utils/numberUtils';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import { STATUS_CODE } from '../../constants/commonConst';

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
  topicGroups: { code: string; title: string; members: number }[];
  external?: { name: string; council?: string }[];
  // per-topic assignments (optional)
  topics?: {
    code?: string;
    title?: string;
    members?: number;
    examiners?: string[]; // internal examiners
    externalExaminers?: string[];
    startTime?: string; // hh:mm
  }[];
  accent: 'blue' | 'green';
  status?: string;
};

const CouncilsPage: React.FC = () => {
  const { t } = useTranslation();
  const { selectedPeriod } = useGlobalVariable();
  const { data: councils = [] } = councilHooks.useFetchListCouncils();
  const deleteCouncilMutation = councilHooks.useDeleteCouncil();
  const updateCouncilMutation = councilHooks.useUpdateCouncil();
  const [selectedCouncilForView, setSelectedCouncilForView] = useState<CouncilCard | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'filter'>('list');
  const [query, setQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const navigate = useNavigate();
  const isPeriodClosed = selectedPeriod?.status === STATUS_CODE.CLOSED;

  const handleUpdateStatus = (councilId: string, status: string, statusName: string) => {
    if (isPeriodClosed) return;
    Modal.confirm({
      centered: true,
      title: null,
      icon: null,
      content: (
        <div className="text-center">
          <ExclamationCircleFilled className="text-[40px] leading-none text-blue-500 mb-3 inline-block" />
          <div className="font-bold text-xl mb-2">
            Xác nhận thay đổi trạng thái
          </div>
          <div className="text-sm text-slate-500">
            Bạn có chắc chắn muốn chuyển trạng thái hội đồng thành <strong>&quot;{statusName}&quot;</strong>?
          </div>
        </div>
      ),
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk() {
        updateCouncilMutation.mutate({ id: councilId, body: { status } }, {
          onSuccess: () => {
            message.success('Cập nhật trạng thái hội đồng thành công!');
          },
          onError: (err: any) => {
            message.error(err?.response?.data?.message || err.message || 'Có lỗi xảy ra!');
          }
        });
      }
    });
  };

  const councilsInPeriod = useMemo(() => {
    if (!selectedPeriod) return councils;
    return councils.filter((c: any) => c.dot_id === String(selectedPeriod.id) || c.batch === selectedPeriod.name);
  }, [councils, selectedPeriod]);

  const totalCouncils = useMemo(() => councilsInPeriod.length, [councilsInPeriod]);
  const totalEligible = useMemo(() => councilsInPeriod.reduce((acc, c) => acc + (c.topicGroups?.length ?? 0), 0), [councilsInPeriod]);
  const totalRejected = useMemo(() => councilsInPeriod.reduce((acc, c) => acc + (c.rejected ?? 0), 0), [councilsInPeriod]);
  const totalAssessors = useMemo(() => councilsInPeriod.reduce((acc, c) => acc + (c.chair?.length ?? 0) + (c.reviewer?.length ?? 0), 0), [councilsInPeriod]);

  const getSession = (dateTime: string) => {
    const matched = dateTime.match(/(\d{2}):(\d{2})/);
    if (!matched) return 'unknown';
    const hour = Number(matched[1]);
    return hour < 12 ? 'morning' : 'afternoon';
  };

  const rooms = Array.from(new Set(councilsInPeriod.map((item) => item.room)));

  const filteredCouncils = councilsInPeriod.filter((item) => {
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

  const resetFilters = () => {
    setQuery('');
    setRoomFilter('all');
    setSessionFilter('all');
  };

  const handleDeleteCouncil = (councilId: string) => {
    if (isPeriodClosed) return;
    const council = councilsInPeriod.find((item) => item.id === councilId);
    if (!council) return;

    Modal.confirm({
      centered: true,
      title: null,
      icon: null,
      content: (
        <div className="text-center">
          <ExclamationCircleFilled className="text-[40px] leading-none text-red-500 mb-3 inline-block" />
          <div className="font-bold text-xl mb-2">
            Xác nhận xóa hội đồng
          </div>
          <div className="text-sm text-slate-500">
            Bạn có chắc chắn muốn xóa hội đồng <strong>&quot;{council.title}&quot;</strong>? Hành động này không thể hoàn tác.
          </div>
        </div>
      ),
      okText: t(getKey('delete_btn')) || 'Xóa',
      okButtonProps: { type: 'primary', danger: true },
      cancelButtonProps: { type: 'default' },
      cancelText: t(getKey('cancel_btn')) || 'Hủy',
      onOk() {
        deleteCouncilMutation.mutate(councilId, {
          onSuccess: () => {
            message.success(t(getKey('delete_council_success')));
          },
          onError: (err: any) => {
            message.error(err.message || t(getKey('config_error_message')));
          }
        });
      },
    });
  };

  const handleViewCouncil = (councilId: string) => {
    const council = councilsInPeriod.find((c) => c.id === councilId);
    if (!council) return;
    setSelectedCouncilForView(council);
  };

  const handleEditCouncil = (councilId: string) => {
    if (isPeriodClosed) return;
    const council = councilsInPeriod.find((c) => c.id === councilId);
    // navigate to create page with state for editing (CreateCouncilPage can read history.state later)
    navigate(ROUTES.COUNCILS_CREATE, { state: { council } });
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
    <div className="council-ui min-h-screen bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
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
        .council-ui .ov-card { background:#fff; padding:18px; border-radius:10px; border:1px solid var(--color-border-tertiary); margin-bottom:12px }
        .council-ui .ov-head { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:12px }
        .council-ui .head-actions { display:flex; flex-direction:column; gap:8px; align-items:flex-end; }
        .council-ui .action-row { display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
        .council-ui .btn-icon { display:inline-flex; align-items:center; gap:6px; }
        .council-ui .chip { display:inline-flex; align-items:center; padding:4px 8px; border-radius:16px; background:#f3f5f7; font-size:12px; white-space:nowrap }
        .council-ui .btn { padding:8px 14px; border-radius:8px; font-weight:600; cursor:pointer }
        .council-ui .btnp { background:#185FA5; color:#fff; border:none }
        .council-ui .btns { background:transparent; border:1px solid #e6e6e6 }
        .council-ui .council-body { display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr 1.4fr; gap:14px; border-top:1px solid var(--color-border-tertiary); padding-top:14px }
        .council-ui .role-col { min-width:0; display:flex; flex-direction:column; gap:8px; padding:0 8px }
        .council-ui .role-col .btn { flex-shrink:0 }
        .council-ui .role-name { font-size:12px; font-weight:700; color:var(--color-text-secondary); text-transform:uppercase; letter-spacing:.04em }
        .council-ui .role-title { font-size:13px; font-weight:600; color:var(--color-text-primary) }
        .council-ui .chip-wrap { display:flex; flex-wrap:wrap; gap:6px }
        .council-ui .topic-list { display:flex; flex-direction:column; gap:8px }
        .council-ui .topic-item { border:1px solid var(--color-border-tertiary); border-radius:8px; background:#fbfaf7; padding:8px 10px }
        .council-ui .topic-item-title { font-size:12px; color:var(--color-text-primary); line-height:1.4 }
        .council-ui .topic-item-meta { font-size:11px; color:var(--color-text-secondary); margin-top:4px }
        .council-ui .muted { color:var(--color-text-secondary); font-size:12px }
        @media (max-width:1100px){ .council-ui .council-body{grid-template-columns:1fr 1fr 1fr} }
        @media (max-width:900px){ .council-ui .filter-panel{grid-template-columns:1fr 1fr} .council-ui .council-body{grid-template-columns:1fr 1fr} }
        @media (max-width:700px){ .council-ui .filter-panel{grid-template-columns:1fr} .council-ui .stats{grid-template-columns:1fr 1fr} .council-ui .council-body{grid-template-columns:1fr} }
      `}</style>

      <div className="page">
        <div className="mb-5 flex items-center justify-between rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-md)]/10 px-3 py-1 text-xs font-medium text-[var(--color-blue-login-mid)]">
              <CalendarOutlined />
              {t(getKey('council_management'))}
            </div>
            <h1 className="m-0 text-[34px] font-bold leading-[40px] text-navyDark">{t(getKey('council_management'))}</h1>
            <p className="mt-2 mb-0 text-[18px] leading-[26px] text-grayDark">{t(getKey('council_management_desc'))}</p>
          </div>
          <div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={isPeriodClosed}
              onClick={() => navigate(ROUTES.COUNCILS_CREATE)}
              className="rounded-xl h-[46px] px-6 font-semibold shadow-md flex items-center gap-1.5 bg-[var(--color-primary)] border-none text-white hover:opacity-90"
            >
              {t(getKey('create_new_council'))}
            </Button>
          </div>
        </div>

        {selectedPeriod && (
          <div className={`mb-5 p-4 rounded-[18px] border flex items-center justify-between shadow-[0_12px_28px_rgba(15,23,42,0.02)] ${
            isPeriodClosed ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <div>
              {t(getKey('showing'))} {t(getKey('council_management'))} {t(getKey('of'))}: <strong className="underline">{selectedPeriod.name}</strong>
              {isPeriodClosed && ` (${t(getKey('read_only_data_locked'))})`}
            </div>
            {isPeriodClosed && <Tag color="error">{t(getKey('read_only_tag'))}</Tag>}
          </div>
        )}

        <div className="tabs">
          <button className={`tab ${activeTab === 'list' ? 'on' : ''}`} onClick={() => setActiveTab('list')}>{t(getKey('council_list_tab'))}</button>
          <button className={`tab ${activeTab === 'filter' ? 'on' : ''}`} onClick={() => setActiveTab('filter')}>{t(getKey('filter_tab'))}</button>
        </div>

        {activeTab === 'filter' && (
          <div className="filter-panel">
            <input
              className="filter-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t(getKey('search_council_placeholder'))}
            />
            <select className="filter-input" value={roomFilter} onChange={(event) => setRoomFilter(event.target.value)}>
              <option value="all">{t(getKey('all_rooms'))}</option>
              {rooms.map((room) => (
                <option value={room} key={room}>{room}</option>
              ))}
            </select>
            <select className="filter-input" value={sessionFilter} onChange={(event) => setSessionFilter(event.target.value as 'all' | 'morning' | 'afternoon')}>
              <option value="all">{t(getKey('all_sessions'))}</option>
              <option value="morning">{t(getKey('morning_session'))}</option>
              <option value="afternoon">{t(getKey('afternoon_session'))}</option>
            </select>
            <button className="btn btns" onClick={resetFilters}>{t(getKey('reset_filters'))}</button>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Active Councils */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] flex justify-between items-start">
              <div>
                <div className="text-sm text-slate-500">{t(getKey('active_councils'))}</div>
                <div className="mt-1 text-[32px] font-bold leading-[38px] text-slate-900">{formatNumber(totalCouncils)}</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <CalendarOutlined style={{ fontSize: 20 }} />
              </div>
            </div>

            {/* Eligible Groups */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] flex justify-between items-start">
              <div>
                <div className="text-sm text-emerald-700">{t(getKey('eligible_groups'))}</div>
                <div className="mt-1 text-[32px] font-bold leading-[38px] text-emerald-700">{formatNumber(totalEligible)}</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircleOutlined style={{ fontSize: 20 }} />
              </div>
            </div>

            {/* Rejected Groups */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] flex justify-between items-start">
              <div>
                <div className="text-sm text-rose-700">{t(getKey('rejected_groups'))}</div>
                <div className="mt-1 text-[32px] font-bold leading-[38px] text-rose-700">{formatNumber(totalRejected)}</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <CloseCircleOutlined style={{ fontSize: 20 }} />
              </div>
            </div>

            {/* Cross Assessors */}
            <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] flex justify-between items-start">
              <div>
                <div className="text-sm text-sky-700">{t(getKey('cross_assessors'))}</div>
                <div className="mt-1 text-[32px] font-bold leading-[38px] text-sky-700">{formatNumber(totalAssessors)}</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <SolutionOutlined style={{ fontSize: 20 }} />
              </div>
            </div>
          </div>
        )}

        <div>
          {filteredCouncils.map((c) => {
            const internSet = new Set<string>();
            const extSet = new Set<string>();
            if (c.topics) {
              c.topics.forEach((t) => {
                (t.examiners || []).forEach((e) => internSet.add(e));
                (t.externalExaminers || []).forEach((e) => extSet.add(e));
              });
            }
            const aggregatedInternal = Array.from(internSet);
            const aggregatedExternal = Array.from(extSet);

            return (
            <div className="ov-card" key={c.id}>
              <div className="ov-head">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{c.title}</span>
                    {c.status === 'DA_CONG_BO' ? (
                      <Tag color="success" className="m-0 text-xs px-2 py-0.5 rounded-full font-medium">Đã công bố</Tag>
                    ) : c.status === 'DA_KET_THUC' ? (
                      <Tag color="processing" className="m-0 text-xs px-2 py-0.5 rounded-full font-medium">Đã kết thúc</Tag>
                    ) : (
                      <Tag color="default" className="m-0 text-xs px-2 py-0.5 rounded-full font-medium">Bản nháp</Tag>
                    )}
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)] mt-1.5">{c.dateTime} · {c.room}</div>
                </div>
                <div className="head-actions">
                  <div className="flex gap-2 flex-wrap justify-end">
                    <span className="chip">{(t(getKey('groups_achieved'), { count: c.achieved } as any) as string)}</span>
                    <span className="chip">{(t(getKey('groups_rejected'), { count: c.rejected } as any) as string)}</span>
                  </div>
                  <div className="action-row">
                    {!isPeriodClosed && (!c.status || c.status === 'NHAP') && (
                      <button className="btn btns btn-icon text-emerald-600 hover:text-emerald-700 font-semibold" onClick={() => handleUpdateStatus(c.id, 'DA_CONG_BO', 'Đã công bố')}>
                        <SendOutlined /> Công bố
                      </button>
                    )}
                    {!isPeriodClosed && c.status === 'DA_CONG_BO' && (
                      <>
                        <button className="btn btns btn-icon text-sky-600 hover:text-sky-700 font-semibold" onClick={() => handleUpdateStatus(c.id, 'DA_KET_THUC', 'Đã kết thúc')}>
                          <LockOutlined /> Kết thúc
                        </button>
                        <button className="btn btns btn-icon text-amber-600 hover:text-amber-700 font-semibold" onClick={() => handleUpdateStatus(c.id, 'NHAP', 'Bản nháp')}>
                          <UndoOutlined /> Hủy công bố
                        </button>
                      </>
                    )}
                    {!isPeriodClosed && c.status === 'DA_KET_THUC' && (
                      <button className="btn btns btn-icon text-amber-600 hover:text-amber-700 font-semibold" onClick={() => handleUpdateStatus(c.id, 'DA_CONG_BO', 'Đã công bố')}>
                        <UndoOutlined /> Mở lại
                      </button>
                    )}
                    <button className="btn btns btn-icon" onClick={() => handleViewCouncil(c.id)}>
                      <EyeOutlined /> {t(getKey('view_btn'))}
                    </button>
                    {!isPeriodClosed && (
                      <button className="btn btns btn-icon" onClick={() => handleEditCouncil(c.id)}>
                        <EditOutlined /> {t(getKey('edit_btn'))}
                      </button>
                    )}
                    {!isPeriodClosed && (
                      <button className="btn btns btn-icon" onClick={() => handleDeleteCouncil(c.id)}>
                        <DeleteOutlined /> {t(getKey('delete_btn'))}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="council-body">
                <div className="role-col">
                  <div className="role-name">{t(getKey('advisor_short'))}</div>
                  <div className="role-title">{t(getKey('advisor_full'))}</div>
                  <div className="chip-wrap">
                    {c.chair.map((t) => <span key={t} className="chip">{t}</span>)}
                  </div>
                </div>

                <div className="role-col">
                  <div className="role-name">{t(getKey('reviewer_short'))}</div>
                  <div className="role-title">{t(getKey('reviewer_full'))}</div>
                  <div className="chip-wrap">
                    {c.reviewer.map((t) => <span key={t} className="chip">{t}</span>)}
                  </div>
                </div>

                <div className="role-col">
                  <div className="role-name">{t(getKey('examiner_title'))}</div>
                  <div className="role-title">{t(getKey('examiner_list'))}</div>
                  <div className="chip-wrap">
                    {aggregatedInternal.length || aggregatedExternal.length ? (
                      <>
                        {aggregatedInternal.map((t) => <span key={t} className="chip">{t}</span>)}
                        {aggregatedExternal.map((t) => <span key={t} className="chip bg-[var(--color-purple-lightest)]">{t}</span>)}
                      </>
                    ) : (
                      <span className="muted">{t(getKey('not_assigned'))}</span>
                    )}
                  </div>
                </div>

                <div className="role-col">
                  <div className="role-name">{t(getKey('topic_group'))}</div>
                  <div className="role-title">{t(getKey('assigned_topic_groups_list'))}</div>
                  {c.topicGroups.length ? (
                    <div className="topic-list">
                      {c.topics && c.topics.length ? (
                        c.topics.map((topic) => (
                          <div className="topic-item" key={topic.code}>
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="topic-item-title">{topic.code} - {topic.title}</div>
                                <div className="topic-item-meta">
                                  {Array.isArray((topic as any).members)
                                    ? (t(getKey('students_count_suffix'), { count: (topic as any).members.length } as any) as string)
                                    : (t(getKey('students_count_suffix'), { count: topic.members } as any) as string)}
                                </div>
                              </div>
                              {topic.startTime && <div className="chip">{topic.startTime}</div>}
                            </div>
                            {Array.isArray((topic as any).members) && (topic as any).members.length > 0 && (
                              <div className="mt-2 text-[var(--color-text-secondary)] text-[13px]">{(topic as any).members.join(', ')}</div>
                            )}
                            <div className="mt-2" />
                          </div>
                        ))
                      ) : (
                        c.topicGroups.map((topic) => (
                          <div className="topic-item" key={topic.code}>
                            <div className="topic-item-title">{topic.code} - {topic.title}</div>
                            <div className="topic-item-meta">
                              {Array.isArray((topic as any).members)
                                ? (t(getKey('students_count_suffix'), { count: (topic as any).members.length } as any) as string)
                                : (t(getKey('students_count_suffix'), { count: topic.members } as any) as string)}
                            </div>
                            {Array.isArray((topic as any).members) && (topic as any).members.length > 0 && (
                              <div className="mt-2 text-[var(--color-text-secondary)] text-[13px]">{(topic as any).members.join(', ')}</div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <span className="muted">{t(getKey('not_assigned_topic_groups'))}</span>
                  )}
                </div>

                <div className="role-col">
                  <div className="role-name">{t(getKey('external_teachers_short'))}</div>
                  <div className="role-title">{t(getKey('external_teachers_title'))}</div>
                  <div className="chip-wrap">
                    {c.external && c.external.length ? c.external.map((e) => <span key={e.name} className="chip">{e.name}</span>) : <span className="muted">{t(getKey('no_external_teachers'))}</span>}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
          <Modal
            title={<span className="text-lg font-bold text-slate-800">Chi tiết thông tin hội đồng</span>}
            open={!!selectedCouncilForView}
            onCancel={() => setSelectedCouncilForView(null)}
            centered
            footer={[
              <Button key="close" onClick={() => setSelectedCouncilForView(null)}>
                Đóng
              </Button>
            ]}
            width={800}
          >
            {selectedCouncilForView && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">Tên hội đồng</div>
                    <div className="text-sm font-medium text-slate-800">{selectedCouncilForView.title || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">Phòng bảo vệ</div>
                    <div className="text-sm font-medium text-slate-800">{selectedCouncilForView.room || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">Ngày bảo vệ</div>
                    <div className="text-sm font-medium text-slate-800">
                      {(() => {
                        const parts = selectedCouncilForView.dateTime ? selectedCouncilForView.dateTime.split(' · ') : [];
                        return parts.length > 0 ? parts[0] : '—';
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">Giờ bảo vệ</div>
                    <div className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                      {(() => {
                        const parts = selectedCouncilForView.dateTime ? selectedCouncilForView.dateTime.split(' · ') : [];
                        const timeVal = parts.length > 1 ? parts[1] : '';
                        if (!timeVal) return '—';
                        const matched = timeVal.match(/(\d{2}):(\d{2})/);
                        const isMorning = matched ? Number(matched[1]) < 12 : true;
                        return (
                          <>
                            {timeVal}{' '}
                            <Tag color={isMorning ? 'orange' : 'blue'} className="m-0 text-[10px] py-0 px-1.5 rounded">
                              {isMorning ? 'Buổi sáng' : 'Buổi chiều'}
                            </Tag>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">Thành viên hội đồng:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCouncilForView.chair.map((name) => (
                      <Tag color="gold" key={name} className="px-2.5 py-1 text-xs">
                        Chủ tịch: {name}
                      </Tag>
                    ))}
                    {selectedCouncilForView.reviewer.map((name) => (
                      <Tag color="orange" key={name} className="px-2.5 py-1 text-xs">
                        Phản biện: {name}
                      </Tag>
                    ))}
                    {selectedCouncilForView.member.map((name) => (
                      <Tag color="blue" key={name} className="px-2.5 py-1 text-xs">
                        Ủy viên: {name}
                      </Tag>
                    ))}
                    {selectedCouncilForView.chair.length === 0 &&
                     selectedCouncilForView.reviewer.length === 0 &&
                     selectedCouncilForView.member.length === 0 && (
                      <span className="text-xs text-slate-400 italic">Chưa có thành viên</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">Danh sách bảo vệ & Sắp xếp ({(selectedCouncilForView.topics || selectedCouncilForView.topicGroups || []).length}):</div>
                  <div className="overflow-hidden rounded-lg border border-slate-100">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="px-3 py-2">STT</th>
                          <th className="px-3 py-2">Đề tài / Sinh viên</th>
                          <th className="px-3 py-2">GVHD</th>
                          <th className="px-3 py-2">GVPB</th>
                          <th className="px-3 py-2">Ủy viên (Người chấm)</th>
                          <th className="px-3 py-2">Giờ bảo vệ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {(selectedCouncilForView.topics || selectedCouncilForView.topicGroups || []).map((topic: any, index: number) => (
                          <tr key={topic.code || topic.topicCode || index} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2 font-medium text-slate-700">{index + 1}</td>
                            <td className="px-3 py-2 max-w-[200px]">
                              <div className="font-semibold text-slate-800 truncate">{topic.topicName || topic.title}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {Array.isArray(topic.members) ? topic.members.join(', ') : topic.members}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-slate-600">{topic.advisorName || '—'}</td>
                            <td className="px-3 py-2 text-slate-600 font-medium">{topic.reviewer || '—'}</td>
                            <td className="px-3 py-2 text-slate-600">
                              <div className="flex flex-col gap-0.5">
                                {(topic.examiners || []).map((name: string) => (
                                  <span key={name}>{name}</span>
                                ))}
                                {(topic.externalExaminers || []).map((name: string) => (
                                  <span key={name} className="text-purple-600 font-medium">{name} (Ngoài trường)</span>
                                ))}
                                {(!topic.examiners?.length && !topic.externalExaminers?.length) && '—'}
                              </div>
                            </td>
                            <td className="px-3 py-2 font-semibold text-[var(--color-primary)]">
                              {topic.startTime || '—'}
                            </td>
                          </tr>
                        ))}
                        {(selectedCouncilForView.topics || selectedCouncilForView.topicGroups || []).length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-3 py-6 text-center text-slate-400 italic">Chưa có đề tài nào được chọn bảo vệ</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </Modal>

          {filteredCouncils.length === 0 && (
            <div className="ov-card text-center text-[var(--color-text-secondary)]">
              {t(getKey('no_matching_council'))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouncilsPage;
