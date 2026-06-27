import React, { useEffect, useState, useMemo } from 'react';
import { message, Modal } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { councilHooks } from '../../hooks/useCouncils';
import { ROUTES } from '../../constants/routers';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { formatNumber } from '@shared/utils/numberUtils';

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
};

const CouncilsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: councils = [] } = councilHooks.useFetchListCouncils();
  const deleteCouncilMutation = councilHooks.useDeleteCouncil();
  const [selectedCouncilForView, setSelectedCouncilForView] = useState<CouncilCard | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'filter'>('list');
  const [query, setQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const navigate = useNavigate();

  const councilStats = useMemo(() => [
    { value: councils.length, labelKey: 'active_councils' },
    { value: councils.reduce((acc, c) => acc + (c.topicGroups?.length ?? 0), 0), labelKey: 'eligible_groups' },
    { value: councils.reduce((acc, c) => acc + (c.rejected ?? 0), 0), labelKey: 'rejected_groups' },
    { value: councils.reduce((acc, c) => acc + (c.chair?.length ?? 0) + (c.reviewer?.length ?? 0), 0), labelKey: 'cross_assessors' },
  ], [councils]);

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

  const resetFilters = () => {
    setQuery('');
    setRoomFilter('all');
    setSessionFilter('all');
  };

  const handleDeleteCouncil = (councilId: string) => {
    const council = councils.find((item) => item.id === councilId);
    if (!council) return;
    const confirmed = window.confirm(t(getKey('confirm_delete_council'), { title: council.title }));
    if (!confirmed) return;
    deleteCouncilMutation.mutate(councilId, {
      onSuccess: () => {
        message.success(t(getKey('delete_council_success')));
      },
      onError: (err: any) => {
        message.error(err.message || t(getKey('config_error_message')));
      }
    });
  };

  const handleViewCouncil = (councilId: string) => {
    const council = councils.find((c) => c.id === councilId);
    if (!council) return;
    setSelectedCouncilForView(council);
  };

  const handleEditCouncil = (councilId: string) => {
    const council = councils.find((c) => c.id === councilId);
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
        <div className="header">
          <div>
            <h1 className="title">{t(getKey('council_management'))}</h1>
            <div className="subtitle">{t(getKey('council_management_desc'))}</div>
          </div>
          <div className="flex gap-2">
            <button className="btn btnp" onClick={() => navigate(ROUTES.COUNCILS_CREATE)}>{t(getKey('create_new_council'))}</button>
          </div>
        </div>

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

        <div className="stats">
          {councilStats.map((s) => (
            <div className="scard" key={s.labelKey}>
              <div className="sv">{formatNumber(s.value)}</div>
              <div className="mt-1.5 text-[var(--color-text-secondary)] text-xs">{t(getKey(s.labelKey as any))}</div>
            </div>
          ))}
        </div>

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
                  <div className="text-sm font-semibold">{c.title}</div>
                  <div className="text-xs text-[var(--color-text-secondary)] mt-1.5">{c.dateTime} · {c.room}</div>
                </div>
                <div className="head-actions">
                  <div className="flex gap-2 flex-wrap justify-end">
                    <span className="chip">{(t(getKey('groups_achieved'), { count: c.achieved } as any) as string)}</span>
                    <span className="chip">{(t(getKey('groups_rejected'), { count: c.rejected } as any) as string)}</span>
                  </div>
                  <div className="action-row">
                    <button className="btn btns btn-icon" onClick={() => handleViewCouncil(c.id)}>
                      <EyeOutlined /> {t(getKey('view_btn'))}
                    </button>
                    <button className="btn btns btn-icon" onClick={() => handleEditCouncil(c.id)}>
                      <EditOutlined /> {t(getKey('edit_btn'))}
                    </button>
                    <button className="btn btns btn-icon" onClick={() => handleDeleteCouncil(c.id)}>
                      <DeleteOutlined /> {t(getKey('delete_btn'))}
                    </button>
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
            title={selectedCouncilForView?.title}
            open={!!selectedCouncilForView}
            onCancel={() => setSelectedCouncilForView(null)}
            footer={null}
          >
            {selectedCouncilForView && (
              <div>
                <div className="mb-2"><strong>{selectedCouncilForView.dateTime}</strong> · {selectedCouncilForView.room}</div>
                <div className="flex gap-3 flex-wrap mb-2">
                  <div>
                    <div className="role-name">{t(getKey('advisor_short'))}</div>
                    <div className="chip-wrap">{selectedCouncilForView.chair.map((t) => <span key={t} className="chip">{t}</span>)}</div>
                  </div>
                  <div>
                    <div className="role-name">{t(getKey('reviewer_short'))}</div>
                    <div className="chip-wrap">{selectedCouncilForView.reviewer.map((t) => <span key={t} className="chip">{t}</span>)}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="role-name">{t(getKey('member_details'))}</div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div>
                      <div className="muted">{t(getKey('advisor_short'))}</div>
                      <div className="mt-1.5">{selectedCouncilForView.chair.map((t) => <div key={t} className="chip inline-block mr-1.5">{t}</div>)}</div>
                    </div>
                    <div>
                      <div className="muted">{t(getKey('reviewer_short'))}</div>
                      <div className="mt-1.5">{selectedCouncilForView.reviewer.map((t) => <div key={t} className="chip inline-block mr-1.5">{t}</div>)}</div>
                    </div>
                    <div>
                      <div className="muted">{t(getKey('member_title'))}</div>
                      <div className="mt-1.5">{selectedCouncilForView.member && selectedCouncilForView.member.length ? selectedCouncilForView.member.map((t) => <div key={t} className="chip inline-block mr-1.5">{t}</div>) : <div className="muted">{t(getKey('none'))}</div>}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="role-name">{t(getKey('topic_group'))}</div>
                  <div className="topic-list">
                    {(selectedCouncilForView.topics || selectedCouncilForView.topicGroups || []).map((topic: any) => (
                      <div key={topic.code} className="topic-item">
                        <div className="flex justify-between">
                          <div className="topic-item-title">{topic.code} - {topic.title}</div>
                          {topic.startTime && <div className="chip">{topic.startTime}</div>}
                        </div>
                        <div className="topic-item-meta">
                          {Array.isArray(topic.members)
                            ? (t(getKey('students_count_suffix'), { count: topic.members.length } as any) as string)
                            : (t(getKey('students_count_suffix'), { count: topic.members } as any) as string)}
                        </div>
                        {Array.isArray(topic.members) && topic.members.length > 0 && (
                          <div className="mt-2 text-[var(--color-text-secondary)] text-[13px]">{topic.members.join(', ')}</div>
                        )}
                        <div className="mt-2">
                          {(topic.examiners || []).map((e: string) => <span key={e} className="chip">{e}</span>)} {(topic.externalExaminers || []).map((e: string) => <span key={e} className="chip bg-[var(--color-purple-lightest)]">{e}</span>)}
                        </div>
                      </div>
                    ))}
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
