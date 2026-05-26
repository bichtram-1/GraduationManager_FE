import React, { useEffect, useMemo, useState } from 'react';
import { message } from 'antd';

type MainTab = 'list' | 'create';
type StepKey = 1 | 2 | 3 | 4 | 5;
type SubTab = 'sortView' | 'gvpbView';

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

type TopicItem = {
  id: string;
  bucket: string;
  title: string;
  studentCount: string;
  minutes: number;
  advisor: string;
  advisorId: string;
  selected: boolean;
  locked: boolean;
  badge: 'ok' | 'waiting';
};

const COUNCIL_STATS = [
  { value: 3, label: 'Hội đồng hoạt động' },
  { value: 21, label: 'Nhóm đủ điều kiện' },
  { value: 4, label: 'Nhóm bị loại' },
  { value: 2, label: 'GV chấm chéo' },
];

const TEACHERS = [
  { id: 'GV01', name: 'TS. Nguyễn Văn A' },
  { id: 'GV02', name: 'TS. Trần Thị B' },
  { id: 'GV03', name: 'TS. Phạm Văn D' },
  { id: 'GV04', name: 'TS. Hoàng Thị E' },
  { id: 'GV05', name: 'ThS. Nguyễn Thị F' },
  { id: 'GV06', name: 'TS. Lý Văn G' },
  { id: 'GV07', name: 'TS. Đặng Văn I' },
  { id: 'GV08', name: 'PGS. Mai Thị H' },
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

const TOPIC_BUCKETS: Array<{ advisorId: string; advisor: string; total: number; topics: TopicItem[] }> = [
  {
    advisorId: 'GV01',
    advisor: 'TS. Nguyễn Văn A',
    total: 3,
    topics: [
      { id: 'T01', bucket: 'TS. Nguyễn Văn A', title: 'Nhóm 01 — Hệ thống quản lý KTX', studentCount: '3 SV', minutes: 40, advisor: 'TS. Nguyễn Văn A', advisorId: 'GV01', selected: true, locked: false, badge: 'ok' },
      { id: 'T04', bucket: 'TS. Nguyễn Văn A', title: 'Nhóm 04 — Website TMĐT mobile', studentCount: '2 SV', minutes: 40, advisor: 'TS. Nguyễn Văn A', advisorId: 'GV01', selected: true, locked: false, badge: 'ok' },
      { id: 'T07', bucket: 'TS. Nguyễn Văn A', title: 'Nhóm 07 — Ứng dụng học tiếng Anh', studentCount: '4 SV', minutes: 40, advisor: 'TS. Nguyễn Văn A', advisorId: 'GV01', selected: false, locked: true, badge: 'waiting' },
    ],
  },
  {
    advisorId: 'GV02',
    advisor: 'TS. Trần Thị B',
    total: 4,
    topics: [
      { id: 'T02', bucket: 'TS. Trần Thị B', title: 'Nhóm 02 — App đặt xe công nghệ', studentCount: '4 SV', minutes: 40, advisor: 'TS. Trần Thị B', advisorId: 'GV02', selected: true, locked: false, badge: 'ok' },
      { id: 'T05', bucket: 'TS. Trần Thị B', title: 'Nhóm 05 — Hệ thống IoT nông nghiệp', studentCount: '3 SV', minutes: 40, advisor: 'TS. Trần Thị B', advisorId: 'GV02', selected: true, locked: false, badge: 'ok' },
      { id: 'T08', bucket: 'TS. Trần Thị B', title: 'Nhóm 08 — Chatbot hỗ trợ sinh viên', studentCount: '3 SV', minutes: 40, advisor: 'TS. Trần Thị B', advisorId: 'GV02', selected: false, locked: false, badge: 'ok' },
      { id: 'T09', bucket: 'TS. Trần Thị B', title: 'Nhóm 09 — Phần mềm quản lý phòng khám', studentCount: '2 SV', minutes: 40, advisor: 'TS. Trần Thị B', advisorId: 'GV02', selected: false, locked: true, badge: 'waiting' },
    ],
  },
];

const REVIEWER_POOL = [
  { id: 'GV03', name: 'TS. Phạm Văn D' },
  { id: 'GV04', name: 'TS. Hoàng Thị E' },
];

const INITIAL_REVIEWER_MAP: Record<string, string> = {
  T01: 'GV03',
  T02: 'GV04',
  T04: 'GV03',
  T05: 'GV04',
};

const INITIAL_ORDER = ['T01', 'T02', 'T04', 'T05'];

const getTeacherName = (id: string) => TEACHERS.find((teacher) => teacher.id === id)?.name ?? id;

const CouncilsPage: React.FC = () => {
  const [mainTab, setMainTab] = useState<MainTab>('list');
  const [activeStep, setActiveStep] = useState<StepKey>(1);
  const [subTab, setSubTab] = useState<SubTab>('sortView');
  const [externalFormCouncilId, setExternalFormCouncilId] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(INITIAL_ORDER);
  const [orderedTopics, setOrderedTopics] = useState<string[]>(INITIAL_ORDER);
  const [reviewerMap, setReviewerMap] = useState<Record<string, string>>(INITIAL_REVIEWER_MAP);
  const [saved, setSaved] = useState(false);
  const [draggingTopic, setDraggingTopic] = useState<string | null>(null);
  const [dragOverTopic, setDragOverTopic] = useState<string | null>(null);

  useEffect(() => {
    const href = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.x/tabler-icons.min.css';
    if (document.querySelector(`link[href="${href}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }, []);

  const topicMap = useMemo(() => {
    const map = new Map<string, TopicItem>();
    TOPIC_BUCKETS.forEach((bucket) => {
      bucket.topics.forEach((topic) => map.set(topic.id, topic));
    });
    return map;
  }, []);

  const selectedTopicCount = selectedTopics.length;
  const selectedMinutes = useMemo(
    () => selectedTopics.reduce((sum, topicId) => sum + (topicMap.get(topicId)?.minutes ?? 0), 0),
    [selectedTopics, topicMap]
  );
  const progressPct = Math.min(Math.round((selectedMinutes / 240) * 100), 100);

  const showTab = (tab: MainTab) => {
    setMainTab(tab);
    if (tab === 'create') {
      setActiveStep(1);
      setSubTab('sortView');
      setSaved(false);
      setExternalFormCouncilId(null);
    }
  };

  const goStep = (step: StepKey) => {
    setActiveStep(step);
    if (step === 4) {
      setSubTab('sortView');
    }
  };

  const toggleTopic = (topicId: string) => {
    const topic = topicMap.get(topicId);
    if (!topic || topic.locked) return;

    setSelectedTopics((current) => {
      const hasTopic = current.includes(topicId);
      if (hasTopic) {
        return current.filter((id) => id !== topicId);
      }

      return [...current, topicId];
    });

    setOrderedTopics((current) => {
      if (current.includes(topicId)) return current;
      return [...current, topicId];
    });
  };

  const moveTopic = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    setOrderedTopics((current) => {
      const sourceIndex = current.indexOf(sourceId);
      const targetIndex = current.indexOf(targetId);
      if (sourceIndex === -1 || targetIndex === -1) return current;

      const next = [...current];
      next.splice(sourceIndex, 1);
      next.splice(sourceIndex < targetIndex ? targetIndex - 1 : targetIndex, 0, sourceId);
      return next;
    });
  };

  const groupedSelectedTopics = TOPIC_BUCKETS.map((bucket) => ({
    ...bucket,
    topics: bucket.topics.filter((topic) => selectedTopics.includes(topic.id) || topic.locked),
  }));

  const saveCouncil = () => {
    setSaved(true);
    message.success('Đã lưu thành công. Hệ thống đã gửi thông báo đến 5 giảng viên.');
  };

  return (
    <div className="council-ui min-h-screen bg-[#f5f4f0] text-[#1a1916]">
      <style>{`
        .council-ui { --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; --color-background-primary: #ffffff; --color-background-secondary: #f5f4f0; --color-text-primary: #1a1916; --color-text-secondary: #6b6966; --color-text-tertiary: #9b9895; --color-border-tertiary: #e5e3dc; --color-border-secondary: #d0cec7; --border-radius-lg: 12px; --border-radius-md: 8px; font-family: var(--font-sans); }
        .council-ui * { box-sizing: border-box; }
        .council-ui .page { max-width: 960px; margin: 0 auto; padding: 1.5rem 1rem; }
        .council-ui .tabs { display: flex; border-bottom: 0.5px solid var(--color-border-tertiary); margin-bottom: 1.25rem; background: var(--color-background-primary); border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0; padding: 0 1rem; }
        .council-ui .tab { padding: 10px 16px; font-size: 13px; cursor: pointer; color: var(--color-text-secondary); border-bottom: 2px solid transparent; margin-bottom: -0.5px; white-space: nowrap; }
        .council-ui .tab.on { color: #185FA5; border-bottom-color: #185FA5; font-weight: 500; }
        .council-ui .panel { background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); padding: 1.25rem; margin-bottom: 10px; }
        .council-ui .ph { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; padding-bottom: .75rem; border-bottom: 0.5px solid var(--color-border-tertiary); }
        .council-ui .pico { width: 34px; height: 34px; border-radius: var(--border-radius-md); background: #E6F1FB; display: flex; align-items: center; justify-content: center; color: #185FA5; font-size: 17px; flex-shrink: 0; }
        .council-ui .pt { font-size: 14px; font-weight: 500; color: var(--color-text-primary); }
        .council-ui .ps { font-size: 12px; color: var(--color-text-secondary); margin-top: 1px; }
        .council-ui .step-bar { display: flex; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); overflow: hidden; margin-bottom: 1.25rem; background: var(--color-background-primary); }
        .council-ui .si { flex: 1; padding: 8px 6px 8px 10px; cursor: pointer; background: var(--color-background-primary); border-right: 0.5px solid var(--color-border-tertiary); transition: background .12s; }
        .council-ui .si:last-child { border-right: none; }
        .council-ui .si:hover { background: var(--color-background-secondary); }
        .council-ui .si.on { background: #E6F1FB; }
        .council-ui .si.done { background: #EAF3DE; }
        .council-ui .sn { font-size: 10px; color: var(--color-text-tertiary); font-weight: 500; letter-spacing: .03em; margin-bottom: 1px; }
        .council-ui .sl { font-size: 11px; font-weight: 500; color: var(--color-text-primary); line-height: 1.3; }
        .council-ui .si.on .sn { color: #185FA5; }
        .council-ui .si.on .sl { color: #0C447C; }
        .council-ui .si.done .sn { color: #3B6D11; }
        .council-ui .si.done .sl { color: #27500A; }
        .council-ui .tag { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 20px; font-size: 11px; font-weight: 500; white-space: nowrap; }
        .council-ui .tb { background: #E6F1FB; color: #0C447C; }
        .council-ui .tg { background: #EAF3DE; color: #27500A; }
        .council-ui .ta { background: #FAEEDA; color: #633806; }
        .council-ui .tr { background: #FCEBEB; color: #791F1F; }
        .council-ui .tgr { background: #F1EFE8; color: #444441; }
        .council-ui .tv { background: #E1F5EE; color: #085041; }
        .council-ui .tp { background: #FBEAF0; color: #72243E; }
        .council-ui .tpu { background: #EEEDFE; color: #3C3489; }
        .council-ui .notice { border-radius: var(--border-radius-md); padding: 8px 12px; font-size: 12px; display: flex; align-items: flex-start; gap: 7px; margin-bottom: 10px; }
        .council-ui .ni { background: #FAEEDA; border: 0.5px solid #EF9F27; color: #633806; }
        .council-ui .ns { background: #EAF3DE; border: 0.5px solid #97C459; color: #27500A; }
        .council-ui .nd { background: #FCEBEB; border: 0.5px solid #F09595; color: #791F1F; }
        .council-ui .nb { background: #E6F1FB; border: 0.5px solid #85B7EB; color: #0C447C; }
        .council-ui table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .council-ui th { text-align: left; font-size: 10px; font-weight: 500; color: var(--color-text-secondary); padding: 5px 8px; border-bottom: 0.5px solid var(--color-border-tertiary); text-transform: uppercase; letter-spacing: .04em; }
        .council-ui td { padding: 7px 8px; border-bottom: 0.5px solid var(--color-border-tertiary); color: var(--color-text-primary); vertical-align: middle; }
        .council-ui tr:last-child td { border-bottom: none; }
        .council-ui tr:hover td { background: var(--color-background-secondary); }
        .council-ui .chip { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 20px; font-size: 11px; border: 0.5px solid var(--color-border-tertiary); background: var(--color-background-secondary); color: var(--color-text-secondary); white-space: nowrap; }
        .council-ui .gv-rh { font-size: 11px; font-weight: 500; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 6px; padding: 4px 0; border-bottom: 0.5px solid var(--color-border-tertiary); display: flex; align-items: center; gap: 5px; }
        .council-ui .gv-list { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 6px; }
        .council-ui .add-chip { display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; border-radius: 20px; font-size: 11px; border: 0.5px dashed var(--color-border-secondary); color: var(--color-text-tertiary); cursor: pointer; background: none; }
        .council-ui .add-chip:hover { background: var(--color-background-secondary); }
        .council-ui .btn { padding: 6px 14px; border-radius: var(--border-radius-md); font-size: 12px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: opacity .1s; }
        .council-ui .btn:hover { opacity: .85; }
        .council-ui .btnp { background: #185FA5; color: #fff; border: none; }
        .council-ui .btns { background: var(--color-background-secondary); color: var(--color-text-primary); border: 0.5px solid var(--color-border-secondary); }
        .council-ui .btn-xs { padding: 3px 8px; font-size: 11px; border-radius: 6px; }
        .council-ui .acts { display: flex; gap: 7px; margin-top: 1rem; padding-top: .75rem; border-top: 0.5px solid var(--color-border-tertiary); }
        .council-ui .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 1.25rem; }
        .council-ui .scard { background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); padding: 10px 12px; }
        .council-ui .sv { font-size: 20px; font-weight: 500; color: var(--color-text-primary); }
        .council-ui .sl2 { font-size: 11px; color: var(--color-text-secondary); margin-top: 1px; }
        .council-ui .timer-bar { display: flex; align-items: center; gap: 10px; background: var(--color-background-secondary); border-radius: var(--border-radius-md); padding: 8px 12px; margin-bottom: 10px; }
        .council-ui .timer-val { font-size: 18px; font-weight: 500; color: var(--color-text-primary); }
        .council-ui .timer-lbl { font-size: 11px; color: var(--color-text-secondary); }
        .council-ui .prog-wrap { flex: 1; height: 6px; background: var(--color-border-tertiary); border-radius: 4px; overflow: hidden; }
        .council-ui .prog-fill { height: 100%; background: #185FA5; border-radius: 4px; transition: width .2s; }
        .council-ui .prog-fill.over { background: #E24B4A; }
        .council-ui .dt-group { margin-bottom: 1rem; }
        .council-ui .dt-group-head { font-size: 12px; font-weight: 500; color: var(--color-text-primary); padding: 7px 10px; background: var(--color-background-secondary); border-radius: var(--border-radius-md); margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; }
        .council-ui .cb-row { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: var(--border-radius-md); cursor: pointer; border: 0.5px solid transparent; transition: background .1s; }
        .council-ui .cb-row:hover { background: var(--color-background-secondary); }
        .council-ui .cb-row.sel { background: #E6F1FB; border-color: #B5D4F4; }
        .council-ui .cb-row.locked { opacity: .45; cursor: not-allowed; }
        .council-ui .cb-row input[type=checkbox] { accent-color: #185FA5; width: 14px; height: 14px; flex-shrink: 0; }
        .council-ui .cb-name { font-size: 12px; color: var(--color-text-primary); flex: 1; }
        .council-ui .cb-meta { font-size: 11px; color: var(--color-text-secondary); white-space: nowrap; }
        .council-ui .fg { display: flex; flex-direction: column; gap: 3px; }
        .council-ui .fg label { font-size: 11px; color: var(--color-text-secondary); font-weight: 500; text-transform: uppercase; letter-spacing: .03em; }
        .council-ui .fg input, .council-ui .fg select { font-size: 13px; padding: 5px 9px; border-radius: var(--border-radius-md); border: 0.5px solid var(--color-border-secondary); background: var(--color-background-primary); color: var(--color-text-primary); height: 32px; }
        .council-ui .sub-tabs { display: flex; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); overflow: hidden; margin-bottom: 1rem; width: fit-content; }
        .council-ui .sub-tab { padding: 6px 14px; font-size: 12px; cursor: pointer; color: var(--color-text-secondary); background: var(--color-background-primary); border-right: 0.5px solid var(--color-border-tertiary); display: flex; align-items: center; gap: 5px; }
        .council-ui .sub-tab:last-child { border-right: none; }
        .council-ui .sub-tab.on { background: #E6F1FB; color: #0C447C; font-weight: 500; }
        .council-ui .drag-list { display: flex; flex-direction: column; gap: 6px; }
        .council-ui .drag-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); cursor: grab; transition: background .1s, border-color .1s; user-select: none; }
        .council-ui .drag-item:active { cursor: grabbing; }
        .council-ui .drag-item:hover { background: var(--color-background-secondary); border-color: var(--color-border-secondary); }
        .council-ui .drag-item.dragging { opacity: .4; border: 0.5px dashed var(--color-border-secondary); }
        .council-ui .drag-item.dragover { border-color: #185FA5; background: #E6F1FB; }
        .council-ui .drag-handle { color: var(--color-text-tertiary); font-size: 16px; cursor: grab; flex-shrink: 0; }
        .council-ui .drag-num { width: 22px; height: 22px; border-radius: 50%; background: #E6F1FB; color: #0C447C; font-size: 11px; font-weight: 500; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .council-ui .drag-name { flex: 1; font-size: 12px; font-weight: 500; color: var(--color-text-primary); }
        .council-ui .drag-meta { font-size: 11px; color: var(--color-text-secondary); }
        .council-ui .drag-chips { display: flex; gap: 4px; flex-shrink: 0; flex-wrap: wrap; }
        .council-ui .gvpb-select { font-size: 11px; padding: 3px 6px; border-radius: 6px; border: 0.5px solid var(--color-border-secondary); background: var(--color-background-primary); color: var(--color-text-primary); height: 26px; }
        .council-ui .order-legend { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--color-text-secondary); margin-bottom: 8px; }
        .council-ui .ov-card { background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); padding: 1rem; margin-bottom: 8px; }
        .council-ui .ov-bottom { margin-top: 10px; padding-top: 10px; border-top: 0.5px solid var(--color-border-tertiary); display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .council-ui .hidden { display: none !important; }
        @media (max-width: 600px) {
          .council-ui .stats { grid-template-columns: 1fr 1fr; }
          .council-ui .step-bar { flex-wrap: nowrap; overflow-x: auto; }
          .council-ui .si { min-width: 80px; }
        }
      `}</style>

      <div className="page">
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Quản lý Hội đồng Bảo vệ</h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>Phân công giảng viên, đề tài và lịch bảo vệ</p>
        </div>

        <div className="tabs" id="mainTabs">
          <div className={`tab ${mainTab === 'list' ? 'on' : ''}`} onClick={() => { setExternalFormCouncilId(null); setMainTab('list'); }}>Danh sách hội đồng</div>
          <div className={`tab ${mainTab === 'create' ? 'on' : ''}`} onClick={() => showTab('create')}>Tạo / Phân công</div>
        </div>

        <div className={mainTab === 'list' ? '' : 'hidden'}>
          <div className="stats">
            {COUNCIL_STATS.map((stat) => (
              <div className="scard" key={stat.label}>
                <div className="sv">{stat.value}</div>
                <div className="sl2">{stat.label}</div>
              </div>
            ))}
          </div>

          {COUNCILS.map((council) => (
            <div className="ov-card" key={council.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: 'var(--border-radius-md)', background: council.accent === 'blue' ? '#E6F1FB' : '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', color: council.accent === 'blue' ? '#185FA5' : '#27500A', flexShrink: 0 }}>
                  <i className="ti ti-building" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{council.title}</div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <span className="tag tg">{council.achieved} nhóm đạt</span>
                      <span className="tag tr">{council.rejected} bị loại</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span><i className="ti ti-calendar" style={{ fontSize: '11px' }} /> {council.dateTime}</span>
                    <span><i className="ti ti-door" style={{ fontSize: '11px' }} /> {council.room}</span>
                  </div>
                  <div className="ov-bottom">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.03em' }}>GVHD</span>
                        {council.chair.map((teacher) => (
                          <span className="chip" key={teacher}>{teacher}</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.03em' }}>GVPB</span>
                        {council.reviewer.map((teacher) => (
                          <span className="chip" key={teacher}>{teacher}</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.03em' }}>Ủy viên</span>
                        {council.member.map((teacher) => (
                          <span className="chip" key={teacher}>{teacher}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.03em' }}>GV ngoài hội đồng {council.external?.length ? '(chấm chéo)' : ''}</span>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {council.external?.length ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #AFA9EC' }}>
                            <i className="ti ti-user-share" style={{ fontSize: '10px' }} /> {council.external[0].name} ({council.external[0].council})
                            <i className="ti ti-x" style={{ fontSize: '10px', cursor: 'pointer', marginLeft: '2px' }} onClick={() => message.info('Đây là trạng thái mô phỏng của giao diện mẫu.')} />
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Chưa có</span>
                        )}
                        <button
                          className="btn btns btn-xs"
                          onClick={() => {
                            if (council.id !== 'HD01') {
                              message.info('Màn hình mẫu chỉ minh họa thêm GV ngoài ở hội đồng 1.');
                              return;
                            }

                            setExternalFormCouncilId((current) => (current === council.id ? null : council.id));
                          }}
                        >
                          <i className="ti ti-plus" /> Thêm GV ngoài
                        </button>
                      </div>
                      <div className={externalFormCouncilId === council.id ? '' : 'hidden'} style={{ background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', padding: '10px', width: '320px', textAlign: 'left' }}>
                        <div className="notice nb" style={{ marginBottom: '8px' }}>
                          <i className="ti ti-info-circle" />
                          <span>Dùng khi GV cần chấm chéo hội đồng. Chọn từ GV đang ở hội đồng khác.</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '8px' }}>
                          <div className="fg">
                            <label>Giảng viên</label>
                            <select defaultValue="TS. Lý Văn G (HĐ2)">
                              <option>TS. Lý Văn G (HĐ2)</option>
                              <option>TS. Đặng Văn I (HĐ2)</option>
                              <option>PGS. Mai Thị H (HĐ2)</option>
                            </select>
                          </div>
                          <div className="fg">
                            <label>Ghi chú</label>
                            <input type="text" placeholder="VD: Chấm buổi chiều thay ThS. F" />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btnp btn-xs" onClick={() => setExternalFormCouncilId(null)}><i className="ti ti-check" /> Xác nhận</button>
                          <button className="btn btns btn-xs" onClick={() => setExternalFormCouncilId(null)}>Huỷ</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '10px' }}>
            <button className="btn btnp" onClick={() => showTab('create')}>
              <i className="ti ti-plus" /> Tạo hội đồng mới
            </button>
          </div>
        </div>

        <div className={mainTab === 'create' ? '' : 'hidden'}>
          <div className="step-bar">
            {[
              { step: 1, title: 'Tạo hội đồng' },
              { step: 2, title: 'Phân công GV' },
              { step: 3, title: 'Chọn đề tài' },
              { step: 4, title: 'Sắp xếp & GVPB' },
              { step: 5, title: 'Xác nhận' },
            ].map((item) => {
              const isActive = activeStep === item.step;
              const isDone = activeStep > item.step;

              return (
                <div key={item.step} className={`si ${isActive ? 'on' : ''} ${isDone ? 'done' : ''}`} onClick={() => goStep(item.step as StepKey)}>
                  <div className="sn">Bước {item.step}</div>
                  <div className="sl">{item.title}</div>
                </div>
              );
            })}
          </div>

          <div id="s1" className={activeStep === 1 ? '' : 'hidden'}>
            <div className="panel">
              <div className="ph"><div className="pico"><i className="ti ti-building" /></div><div><div className="pt">Tạo hội đồng bảo vệ</div><div className="ps">Thông tin chung, lịch và phòng thi</div></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div className="fg"><label>Tên hội đồng</label><input type="text" defaultValue="Hội đồng 1 — HK1/2024" /></div>
                <div className="fg"><label>Đợt bảo vệ</label><select defaultValue="Đợt 1 — Tháng 12/2024"><option>Đợt 1 — Tháng 12/2024</option><option>Đợt 2 — Tháng 06/2025</option></select></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div className="fg"><label>Ngày bảo vệ</label><input type="date" defaultValue="2024-12-20" /></div>
                <div className="fg"><label>Giờ bắt đầu</label><input type="time" defaultValue="08:00" /></div>
                <div className="fg"><label>Giờ kết thúc</label><input type="time" defaultValue="12:00" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="fg"><label>Phòng / địa điểm</label><select defaultValue="Phòng B1.01"><option>Phòng B1.01</option><option>Phòng B1.02</option><option>Phòng B2.05</option></select></div>
                <div className="fg"><label>Ghi chú</label><input type="text" placeholder="Tuỳ chọn..." /></div>
              </div>
              <div className="acts"><button className="btn btnp" onClick={() => goStep(2)}>Tiếp theo <i className="ti ti-arrow-right" /></button></div>
            </div>
          </div>

          <div id="s2" className={activeStep === 2 ? '' : 'hidden'}>
            <div className="panel">
              <div className="ph"><div className="pico"><i className="ti ti-users" /></div><div><div className="pt">Phân công giảng viên</div><div className="ps">Danh sách này quyết định đề tài nào được load ở Bước 3</div></div></div>
              <div style={{ marginBottom: '14px' }}>
                <div className="gv-rh"><i className="ti ti-user-star" style={{ fontSize: '12px' }} /> Giảng viên hướng dẫn (GVHD)</div>
                <div className="gv-list">
                  <span className="tag tb">TS. Nguyễn Văn A <i className="ti ti-x" style={{ fontSize: '10px', cursor: 'pointer', marginLeft: '2px' }} /></span>
                  <span className="tag tb">TS. Trần Thị B <i className="ti ti-x" style={{ fontSize: '10px', cursor: 'pointer', marginLeft: '2px' }} /></span>
                  <span className="add-chip"><i className="ti ti-plus" style={{ fontSize: '11px' }} /> Thêm GVHD</span>
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <div className="gv-rh"><i className="ti ti-user-check" style={{ fontSize: '12px' }} /> Giảng viên phản biện (GVPB)</div>
                <div className="gv-list">
                  <span className="tag tv">TS. Phạm Văn D <i className="ti ti-x" style={{ fontSize: '10px', cursor: 'pointer', marginLeft: '2px' }} /></span>
                  <span className="tag tv">TS. Hoàng Thị E <i className="ti ti-x" style={{ fontSize: '10px', cursor: 'pointer', marginLeft: '2px' }} /></span>
                  <span className="add-chip"><i className="ti ti-plus" style={{ fontSize: '11px' }} /> Thêm GVPB</span>
                </div>
              </div>
              <div>
                <div className="gv-rh"><i className="ti ti-user" style={{ fontSize: '12px' }} /> Ủy viên <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--color-text-tertiary)', marginLeft: '4px' }}>— tự động chấm toàn bộ đề tài</span></div>
                <div className="gv-list">
                  <span className="tag tp">ThS. Nguyễn Thị F <i className="ti ti-x" style={{ fontSize: '10px', cursor: 'pointer', marginLeft: '2px' }} /></span>
                  <span className="add-chip"><i className="ti ti-plus" style={{ fontSize: '11px' }} /> Thêm ủy viên</span>
                </div>
                <div className="notice nb" style={{ marginTop: '8px', marginBottom: 0 }}><i className="ti ti-info-circle" /><span>Ủy viên tự động tham gia chấm điểm tất cả đề tài trong hội đồng. Không cần phân công riêng.</span></div>
              </div>
              <div className="acts">
                <button className="btn btns" onClick={() => goStep(1)}><i className="ti ti-arrow-left" /> Quay lại</button>
                <button className="btn btnp" onClick={() => goStep(3)}>Tiếp theo — Chọn đề tài <i className="ti ti-arrow-right" /></button>
              </div>
            </div>
          </div>

          <div id="s3" className={activeStep === 3 ? '' : 'hidden'}>
            <div className="panel">
              <div className="ph"><div className="pico"><i className="ti ti-stack-2" /></div><div style={{ flex: 1 }}><div className="pt">Chọn đề tài đưa vào hội đồng</div><div className="ps">Mỗi đề tài có đúng 1 GVHD. Tick chọn và cân đối khung giờ.</div></div></div>
              <div className="timer-bar">
                <div><div className="timer-val">{selectedMinutes} phút</div><div className="timer-lbl">Đã chọn / Khung 240 phút</div></div>
                <div className="prog-wrap"><div className={`prog-fill ${progressPct > 100 ? 'over' : ''}`} style={{ width: `${progressPct}%` }} /></div>
                <div style={{ textAlign: 'right' }}><div className="timer-val">{selectedTopicCount}</div><div className="timer-lbl">Đề tài đã chọn</div></div>
              </div>

              {TOPIC_BUCKETS.map((bucket) => (
                <div className="dt-group" key={bucket.advisorId}>
                  <div className="dt-group-head"><span><span className="tag tb" style={{ marginRight: '6px' }}>GVHD</span>{bucket.advisor}</span><span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{bucket.total} đề tài</span></div>
                  {bucket.topics.map((topic) => {
                    const selected = selectedTopics.includes(topic.id);
                    return (
                      <div
                        key={topic.id}
                        className={`cb-row ${selected ? 'sel' : ''} ${topic.locked ? 'locked' : ''}`}
                        onClick={() => toggleTopic(topic.id)}
                      >
                        <input type="checkbox" checked={selected} readOnly disabled={topic.locked} />
                        <div className="cb-name">{topic.title}</div>
                        <div className="cb-meta">{topic.studentCount} · ~{topic.minutes} phút</div>
                        <span className={`tag ${topic.badge === 'ok' ? 'tg' : 'ta'}`} style={{ marginLeft: '4px' }}>{topic.badge === 'ok' ? 'GVHD đạt' : 'Chờ GVHD'}</span>
                      </div>
                    );
                  })}
                </div>
              ))}

              <div className="acts">
                <button className="btn btns" onClick={() => goStep(2)}><i className="ti ti-arrow-left" /> Quay lại</button>
                <button className="btn btnp" onClick={() => goStep(4)}>Tiếp theo — Sắp xếp & GVPB <i className="ti ti-arrow-right" /></button>
              </div>
            </div>
          </div>

          <div id="s4" className={activeStep === 4 ? '' : 'hidden'}>
            <div className="panel">
              <div className="ph"><div className="pico"><i className="ti ti-arrows-sort" /></div><div><div className="pt">Sắp xếp thứ tự & Phân công GVPB</div><div className="ps">Kéo thả để sắp xếp thứ tự bảo vệ. Mỗi đề tài chỉ có 1 GVPB.</div></div></div>

              <div className="sub-tabs" id="subTabs">
                <div className={`sub-tab ${subTab === 'sortView' ? 'on' : ''}`} onClick={() => setSubTab('sortView')}><i className="ti ti-arrows-move" style={{ fontSize: '12px' }} /> Sắp xếp thứ tự</div>
                <div className={`sub-tab ${subTab === 'gvpbView' ? 'on' : ''}`} onClick={() => setSubTab('gvpbView')}><i className="ti ti-user-check" style={{ fontSize: '12px' }} /> Phân công GVPB</div>
              </div>

              <div id="sortView" className={subTab === 'sortView' ? '' : 'hidden'}>
                <div className="notice nb"><i className="ti ti-drag-drop" /><span>Kéo thả các dòng để sắp xếp lại thứ tự bảo vệ theo ý muốn.</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                  <i className="ti ti-grip-vertical" style={{ fontSize: '14px' }} />
                  <span>Kéo tay cầm để di chuyển · Số tròn = thứ tự hiện tại</span>
                </div>
                <div className="drag-list" id="dragList">
                  {orderedTopics.map((topicId, index) => {
                    const topic = topicMap.get(topicId);
                    if (!topic) return null;
                    return (
                      <div
                        key={topic.id}
                        className={`drag-item ${draggingTopic === topic.id ? 'dragging' : ''} ${dragOverTopic === topic.id ? 'dragover' : ''}`}
                        draggable
                        onDragStart={() => setDraggingTopic(topic.id)}
                        onDragEnd={() => {
                          setDraggingTopic(null);
                          setDragOverTopic(null);
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDragEnter={() => setDragOverTopic(topic.id)}
                        onDrop={() => {
                          if (draggingTopic) moveTopic(draggingTopic, topic.id);
                        }}
                      >
                        <div className="drag-handle"><i className="ti ti-grip-vertical" /></div>
                        <div className="drag-num">{index + 1}</div>
                        <div className="drag-name">{topic.title}</div>
                        <div className="drag-chips"><span className="chip" style={{ fontSize: '10px' }}><i className="ti ti-user-star" style={{ fontSize: '10px' }} /> {topic.advisor}</span><span className="tag tg" style={{ fontSize: '10px' }}>GVHD đạt</span></div>
                        <div className="drag-meta">~{topic.minutes} phút</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div id="gvpbView" className={subTab === 'gvpbView' ? '' : 'hidden'}>
                <div className="notice ni"><i className="ti ti-info-circle" /><span>Mỗi đề tài chỉ có <strong>1 GVPB</strong>. Chọn từ danh sách GVPB trong hội đồng. GVPB không được trùng GVHD của đề tài.</span></div>
                <table>
                  <thead><tr><th style={{ width: '24px' }}>#</th><th>Đề tài</th><th>GVHD</th><th>GVPB (chọn 1)</th><th>Trạng thái</th></tr></thead>
                  <tbody>
                    {orderedTopics.map((topicId, index) => {
                      const topic = topicMap.get(topicId);
                      if (!topic) return null;
                      const reviewerId = reviewerMap[topic.id] ?? '';

                      return (
                        <tr key={topic.id}>
                          <td style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>{index + 1}</td>
                          <td><div style={{ fontWeight: 500 }}>{topic.title.replace('Nhóm ', 'Nhóm ').replace(' —', ' —')}</div></td>
                          <td><span className="chip">{topic.advisor}</span></td>
                          <td>
                            <select
                              className="gvpb-select"
                              value={reviewerId}
                              onChange={(event) => setReviewerMap((current) => ({ ...current, [topic.id]: event.target.value }))}
                            >
                              <option value="">— Chọn —</option>
                              {REVIEWER_POOL.filter((teacher) => teacher.name !== topic.advisor).map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                              ))}
                            </select>
                          </td>
                          <td><span className={`tag ${reviewerId ? 'tg' : 'ta'}`}>{reviewerId ? 'Đạt' : 'Chờ PB'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="acts">
                <button className="btn btns" onClick={() => goStep(3)}><i className="ti ti-arrow-left" /> Quay lại</button>
                <button className="btn btnp" onClick={() => goStep(5)}>Tiếp theo — Xác nhận <i className="ti ti-arrow-right" /></button>
              </div>
            </div>
          </div>

          <div id="s5" className={activeStep === 5 ? '' : 'hidden'}>
            <div className="panel">
              <div className="ph"><div className="pico" style={{ background: '#EAF3DE', color: '#27500A' }}><i className="ti ti-circle-check" /></div><div><div className="pt">Xác nhận & Lưu phân công</div><div className="ps">Kiểm tra lịch bảo vệ trước khi gửi thông báo</div></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '10px 12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: '4px' }}>Hội đồng</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>Hội đồng 1 — HK1/2024</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>20/12/2024 · 08:00–12:00 · Phòng B1.01</div>
                </div>
                <div style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '10px 12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: '5px' }}>Nhận thông báo (GV trong hội đồng)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    <span className="tag tb" style={{ fontSize: '10px' }}>TS. Nguyễn Văn A</span>
                    <span className="tag tb" style={{ fontSize: '10px' }}>TS. Trần Thị B</span>
                    <span className="tag tv" style={{ fontSize: '10px' }}>TS. Phạm Văn D</span>
                    <span className="tag tv" style={{ fontSize: '10px' }}>TS. Hoàng Thị E</span>
                    <span className="tag tp" style={{ fontSize: '10px' }}>ThS. Nguyễn Thị F</span>
                  </div>
                </div>
              </div>
              <table>
                <thead><tr><th style={{ width: '24px' }}>#</th><th>Đề tài</th><th>GVHD</th><th>GVPB (1 người)</th><th>Ủy viên</th></tr></thead>
                <tbody>
                  {orderedTopics.map((topicId, index) => {
                    const topic = topicMap.get(topicId);
                    if (!topic) return null;
                    const reviewerId = reviewerMap[topic.id] ?? '';

                    return (
                      <tr key={topic.id}>
                        <td style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>{index + 1}</td>
                        <td><div style={{ fontWeight: 500 }}>{topic.title}</div></td>
                        <td><span className="chip">{topic.advisor}</span></td>
                        <td><span className="chip">{reviewerId ? getTeacherName(reviewerId) : '—'}</span></td>
                        <td><span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>ThS. Nguyễn Thị F</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="notice nd" style={{ marginTop: '10px' }}><i className="ti ti-alert-triangle" /><span>Nếu GVHD hoặc GVPB đánh giá Không đạt sau khi lưu, hệ thống tự động xóa nhóm và dồn thứ tự. Không cần thao tác thủ công.</span></div>
              <div className="acts">
                <button className="btn btns" onClick={() => goStep(4)}><i className="ti ti-arrow-left" /> Quay lại</button>
                <button className="btn btnp" onClick={saveCouncil}><i className="ti ti-send" /> Lưu & Gửi thông báo tới giảng viên</button>
              </div>
              <div className={saved ? '' : 'hidden'} style={{ marginTop: '10px' }}>
                <div className="notice ns" style={{ marginBottom: 0 }}><i className="ti ti-circle-check" /><span>Đã lưu thành công. Hệ thống đã gửi thông báo đến <strong>5 giảng viên</strong> — không gửi cho sinh viên.</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouncilsPage;
