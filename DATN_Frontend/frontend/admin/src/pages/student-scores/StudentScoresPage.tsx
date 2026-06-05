import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tabs,
  Typography,
  Row,
  Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FilterOutlined, FileDoneOutlined, SearchOutlined, TrophyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { cn } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';

type ScoreMode = 'internship' | 'project';
type ScoreStatus = 'draft' | 'reviewing' | 'finalized';

type BaseScoreRow = {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  mentor: string;
  period?: string;
  finalScore: number;
  status: ScoreStatus;
};

type InternshipScoreRow = BaseScoreRow & {
  companyName: string;
};

type ProjectScoreRow = BaseScoreRow & {
  topicName: string;
  defenseScore: number; // max 3
  demoScore: number; // max 5
  qaScore: number; // max 2
  reportScore: number;
};

type ScoreRow = InternshipScoreRow | ProjectScoreRow;

const statusMeta: Record<ScoreStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Bản nháp', color: '#D08A00', bg: '#FFF7E6' },
  reviewing: { label: 'Đang duyệt', color: '#2563EB', bg: '#E8F1FF' },
  finalized: { label: 'Đã chốt', color: '#00A65A', bg: '#E8F9EE' },
};

const scoreBand = (score: number) => {
  if (score >= 8.5) return { label: 'Xuất sắc', color: '#00A65A', bg: '#E8F9EE' };
  if (score >= 7) return { label: 'Khá', color: '#2563EB', bg: '#E8F1FF' };
  if (score >= 5.5) return { label: 'Trung bình', color: '#D08A00', bg: '#FFF7E6' };
  return { label: 'Chưa đạt', color: '#C53030', bg: '#FFEDED' };
};

const normalizeText = (v?: string) => (v ?? '').toLowerCase().trim();

const buildFinalScore = (mode: ScoreMode, values: Partial<Record<string, number>>) => {
  if (mode === 'internship') return Number((Number(values.finalScore ?? 0)).toFixed(1));
  const defense = Number(values.defenseScore ?? 0);
  const demo = Number(values.demoScore ?? 0);
  const qa = Number(values.qaScore ?? 0);
  const report = Number(values.reportScore ?? 0);
  const componentTotal = defense + demo + qa; // max 10
  const final = componentTotal * 0.8 + report * 0.2;
  return Number(final.toFixed(1));
};

const initialInternships: InternshipScoreRow[] = [
  { id: 'IS001', studentId: '20520001', studentName: 'Nguyễn Văn A', className: 'KTPM2020', mentor: 'Trần Văn Hùng', period: 'Đợt 1', companyName: 'FPT Software', finalScore: 8.7, status: 'finalized' },
  { id: 'IS002', studentId: '20520002', studentName: 'Trần Thị B', className: 'CNPM2020', mentor: 'Lê Thị Mai', period: 'Đợt 2', companyName: 'VNG Corp', finalScore: 8.0, status: 'reviewing' },
];

const initialProjects: ProjectScoreRow[] = [
  { id: 'PJ001', studentId: '20521001', studentName: 'Đặng Văn E', className: 'KTPM2021', mentor: 'Nguyễn Minh Quân', period: 'Đợt 1', topicName: 'Hệ thống quản lý học tập', defenseScore: 2.7, demoScore: 4.4, qaScore: 1.8, reportScore: 8.5, finalScore: 0, status: 'finalized' },
  { id: 'PJ002', studentId: '20521002', studentName: 'Bùi Thị F', className: 'CNPM2021', mentor: 'Trần Thị Hạnh', period: 'Đợt 2', topicName: 'Ứng dụng quản lý công việc', defenseScore: 2.3, demoScore: 3.6, qaScore: 1.9, reportScore: 8.0, finalScore: 0, status: 'reviewing' },
];
initialProjects.forEach((p) => { p.finalScore = buildFinalScore('project', p as any); });

const StudentScoresPage: React.FC = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ScoreMode>('internship');
  const [internshipData, setInternshipData] = useState(initialInternships);
  const [projectData, setProjectData] = useState(initialProjects);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ScoreRow | null>(null);
  const [detailRecord, setDetailRecord] = useState<ScoreRow | null>(null);
  const [editForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ScoreStatus>('all');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});
  const [periodFilter, setPeriodFilter] = useState<string | undefined>(undefined);

  const sourceRows = mode === 'internship' ? internshipData : projectData;

  const filteredRows = useMemo(() => {
    const k = normalizeText(keyword);
    return sourceRows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      const activePeriod = periodFilter ?? advancedFilters.period;
      if (activePeriod && !normalizeText(row.period).includes(normalizeText(activePeriod))) return false;
      if (advancedFilters.studentId && !row.studentId.includes(advancedFilters.studentId)) return false;
      if (advancedFilters.className && !normalizeText(row.className).includes(normalizeText(advancedFilters.className))) return false;
      if (advancedFilters.mentor && !normalizeText(row.mentor).includes(normalizeText(advancedFilters.mentor))) return false;
      if (advancedFilters.subject) {
        const subj = 'companyName' in row ? row.companyName : (row as ProjectScoreRow).topicName;
        if (!normalizeText(subj).includes(normalizeText(advancedFilters.subject))) return false;
      }
      if (advancedFilters.minScore !== undefined && row.finalScore < advancedFilters.minScore) return false;
      if (advancedFilters.maxScore !== undefined && row.finalScore > advancedFilters.maxScore) return false;
      if (k) {
        const subj = 'companyName' in row ? row.companyName : (row as ProjectScoreRow).topicName;
        return [row.studentId, row.studentName, subj].some((v) => normalizeText(String(v)).includes(k));
      }
      return true;
    });
  }, [sourceRows, keyword, statusFilter, advancedFilters]);

  const summary = useMemo(() => {
    const total = sourceRows.length;
    const average = total ? sourceRows.reduce((s, r) => s + r.finalScore, 0) / total : 0;
    const finalized = sourceRows.filter((r) => r.status === 'finalized').length;
    const excellent = sourceRows.filter((r) => r.finalScore >= 8.5).length;
    return { total, average, finalized, excellent };
  }, [sourceRows]);

  const availablePeriods = useMemo(() => {
    const s = new Set<string>();
    sourceRows.forEach((r) => { if (r.period) s.add(r.period); });
    return Array.from(s);
  }, [sourceRows]);

  const subjectLabel = mode === 'internship' ? 'Doanh nghiệp thực tập' : 'Đề tài';

  const openEditModal = (record: ScoreRow) => {
    setEditingRecord(record);
    setEditOpen(true);
    editForm.setFieldsValue({ ...record } as any);
  };

  const handleSaveEdit = async () => {
    const values = await editForm.validateFields();
    if (!editingRecord) return;
    if ('companyName' in editingRecord) {
      const nextFinal = buildFinalScore('internship', values);
      setInternshipData((prev) => prev.map((p) => (p.id === editingRecord.id ? ({ ...p, ...(values as any), finalScore: nextFinal } as InternshipScoreRow) : p)));
    } else {
      const nextFinal = buildFinalScore('project', values as any);
      setProjectData((prev) => prev.map((p) => (p.id === editingRecord.id ? ({ ...p, ...(values as any), finalScore: nextFinal } as ProjectScoreRow) : p)));
    }
    setEditOpen(false);
    setEditingRecord(null);
    editForm.resetFields();
  };

  const openDetailModal = (record: ScoreRow) => { setDetailRecord(record); setDetailOpen(true); };

  const handleApplyAdvancedFilters = async () => {
    const values = await filterForm.validateFields();
    setAdvancedFilters(values || {});
    setPeriodFilter(values?.period ?? periodFilter);
    setAdvancedFilterOpen(false);
  };

  const handleResetAdvancedFilters = () => {
    filterForm.resetFields();
    setAdvancedFilters({});
    setAdvancedFilterOpen(false);
    setPeriodFilter(undefined);
  };

  const internshipColumns: ColumnsType<InternshipScoreRow> = [
    { title: 'MSSV', dataIndex: 'studentId', key: 'studentId', width: 120, fixed: 'left', render: (v) => <span className="font-medium text-[#2563eb]">{v}</span> },
    { title: 'Họ tên', dataIndex: 'studentName', key: 'studentName', width: 180 },
    { title: 'Lớp', dataIndex: 'className', key: 'className', width: 130 },
    { title: 'Doanh nghiệp', dataIndex: 'companyName', key: 'companyName', width: 220 },
    { title: 'GVHD', dataIndex: 'mentor', key: 'mentor', width: 180 },
    { title: 'Điểm tổng', dataIndex: 'finalScore', key: 'finalScore', width: 120, render: (v) => <b>{v.toFixed(1)}</b> },
    { title: 'Xếp loại', key: 'band', width: 130, render: (_v, r) => { const meta = scoreBand(r.finalScore); return <Tag style={{ margin: 0, borderRadius: 999, padding: '0 10px', border: 'none', backgroundColor: meta.bg, color: meta.color }}>{meta.label}</Tag>; } },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140, render: (s: ScoreStatus) => <Tag style={{ margin: 0 }}>{statusMeta[s].label}</Tag> },
    { title: 'Thao tác', key: 'actions', fixed: 'right', width: 160, render: (_,_r) => (<Space><Button type="link" onClick={() => openEditModal(_r as ScoreRow)}>Sửa điểm</Button><Button type="link" onClick={() => openDetailModal(_r as ScoreRow)}>Chi tiết</Button></Space>) },
  ];

  const projectColumns: ColumnsType<ProjectScoreRow> = [
    { title: 'MSSV', dataIndex: 'studentId', key: 'studentId', width: 120, fixed: 'left', render: (v) => <span className="font-medium text-[#2563eb]">{v}</span> },
    { title: 'Họ tên', dataIndex: 'studentName', key: 'studentName', width: 180 },
    { title: 'Lớp', dataIndex: 'className', key: 'className', width: 130 },
    { title: 'Đề tài', dataIndex: 'topicName', key: 'topicName', width: 240 },
    { title: 'GVHD', dataIndex: 'mentor', key: 'mentor', width: 180 },
    { title: 'Thuyết trình', dataIndex: 'defenseScore', key: 'defenseScore', width: 110, render: (v) => v.toFixed(1) },
    { title: 'Demo', dataIndex: 'demoScore', key: 'demoScore', width: 110, render: (v) => v.toFixed(1) },
    { title: 'Vấn đáp', dataIndex: 'qaScore', key: 'qaScore', width: 100, render: (v) => v.toFixed(1) },
    { title: 'Tổng thành phần', key: 'componentTotal', width: 140, render: (_,_r) => (((_r.defenseScore ?? 0) + (_r.demoScore ?? 0) + (_r.qaScore ?? 0)).toFixed(1)) },
    { title: 'Điểm báo cáo', dataIndex: 'reportScore', key: 'reportScore', width: 110, render: (v) => v.toFixed(1) },
    { title: 'Tổng kết', dataIndex: 'finalScore', key: 'finalScore', width: 110, render: (v) => <b>{v.toFixed(1)}</b> },
    { title: 'Xếp loại', key: 'band', width: 130, render: (_v, r) => { const meta = scoreBand(r.finalScore); return <Tag style={{ margin: 0, borderRadius: 999, padding: '0 10px', border: 'none', backgroundColor: meta.bg, color: meta.color }}>{meta.label}</Tag>; } },
    { title: 'Thao tác', key: 'actions', fixed: 'right', width: 160, render: (_,_r) => (<Space><Button type="link" onClick={() => openEditModal(_r as ScoreRow)}>Sửa điểm</Button><Button type="link" onClick={() => openDetailModal(_r as ScoreRow)}>Chi tiết</Button></Space>) },
  ];

  const columns = mode === 'internship' ? internshipColumns : projectColumns;

  const renderScoreModalContent = () => {
    if (!editingRecord) return null;
    const isIntern = 'companyName' in editingRecord;
    return (
      <Form form={editForm} layout="vertical" initialValues={editingRecord as any}>
        <Row gutter={12}>
          <Col span={12}><Form.Item name="studentId" label="MSSV"><Input disabled /></Form.Item></Col>
          <Col span={12}><Form.Item name="studentName" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item></Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}><Form.Item name="className" label="Lớp" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={8}><Form.Item name="mentor" label="GV hướng dẫn" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={8}><Form.Item name="period" label="Đợt" rules={[{ required: false }]}><Input placeholder="Ví dụ: Đợt 1" /></Form.Item></Col>
          <Col span={8}><Form.Item name="companyName" noStyle /></Col>
        </Row>
        <Divider />
        {isIntern ? (
          <Row gutter={12}>
            <Col span={12}><Form.Item name="companyName" label="Doanh nghiệp" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="finalScore" label="Điểm tổng" rules={[{ required: true }]}><InputNumber min={0} max={10} step={0.1} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
        ) : (
          <>
            <Row gutter={12}>
              <Col span={8}><Form.Item name="defenseScore" label="Thuyết trình (max3)" rules={[{ required: true }]}><InputNumber min={0} max={3} step={0.1} style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={8}><Form.Item name="demoScore" label="Demo (max5)" rules={[{ required: true }]}><InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={8}><Form.Item name="qaScore" label="Vấn đáp (max2)" rules={[{ required: true }]}><InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Row gutter={12}>
              <Col span={12}><Form.Item name="reportScore" label="Điểm báo cáo" rules={[{ required: true }]}><InputNumber min={0} max={10} step={0.1} style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item shouldUpdate label="Tổng kết">{() => {
                const v = editForm.getFieldsValue(); const final = buildFinalScore('project', v as any); return <Input disabled value={final} />;
              }}</Form.Item></Col>
            </Row>
          </>
        )}
        <Row gutter={12}><Col span={12}><Form.Item name="status" label="Trạng thái"><Select options={[{ label: 'Bản nháp', value: 'draft' }, { label: 'Đang duyệt', value: 'reviewing' }, { label: 'Đã chốt', value: 'finalized' }]} /></Form.Item></Col></Row>
      </Form>
    );
  };

  const renderDetailModalContent = () => {
    if (!detailRecord) return null;
    const isIntern = 'companyName' in detailRecord;
    return (
      <Descriptions bordered column={1}>
        <Descriptions.Item label="MSSV">{detailRecord.studentId}</Descriptions.Item>
        <Descriptions.Item label="Họ tên">{detailRecord.studentName}</Descriptions.Item>
        <Descriptions.Item label="Lớp">{detailRecord.className}</Descriptions.Item>
        <Descriptions.Item label={subjectLabel}>{isIntern ? (detailRecord as InternshipScoreRow).companyName : (detailRecord as ProjectScoreRow).topicName}</Descriptions.Item>
        {isIntern ? (
          <>
            <Descriptions.Item label="Tổng kết">{detailRecord.finalScore.toFixed(1)}</Descriptions.Item>
          </>
        ) : (
          <>
            <Descriptions.Item label="Thuyết trình">{(detailRecord as ProjectScoreRow).defenseScore.toFixed(1)}</Descriptions.Item>
            <Descriptions.Item label="Demo">{(detailRecord as ProjectScoreRow).demoScore.toFixed(1)}</Descriptions.Item>
            <Descriptions.Item label="Vấn đáp">{(detailRecord as ProjectScoreRow).qaScore.toFixed(1)}</Descriptions.Item>
            <Descriptions.Item label="Tổng thành phần">{(((detailRecord as ProjectScoreRow).defenseScore ?? 0) + ((detailRecord as ProjectScoreRow).demoScore ?? 0) + ((detailRecord as ProjectScoreRow).qaScore ?? 0)).toFixed(1)}</Descriptions.Item>
            <Descriptions.Item label="Điểm báo cáo">{(detailRecord as ProjectScoreRow).reportScore.toFixed(1)}</Descriptions.Item>
            <Descriptions.Item label="Tổng kết">{detailRecord.finalScore.toFixed(1)}</Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="Trạng thái"><Tag style={{ margin: 0 }}>{statusMeta[detailRecord.status].label}</Tag></Descriptions.Item>
        <Descriptions.Item label="Xếp loại"><Tag style={{ margin: 0, backgroundColor: scoreBand(detailRecord.finalScore).bg }}>{scoreBand(detailRecord.finalScore).label}</Tag></Descriptions.Item>
      </Descriptions>
    );
  };

  return (
    <div className={cn('pb-4')}>
      <div className={cn('relative overflow-hidden rounded-[28px] border border-white/70 bg-white px-6 py-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)]')}>
        <div className={cn('absolute -top-12 right-4 h-40 w-40 rounded-full bg-[#2196F3]/10 blur-3xl')} />
        <div className={cn('absolute bottom-0 left-10 h-28 w-28 rounded-full bg-[#4CAF50]/10 blur-3xl')} />

        <div className={cn('relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between')}>
          <div>
            <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[#2196F3]/10 px-3 py-1 text-xs font-medium text-[#1976d2]')}>
              <FileDoneOutlined /> Quản lý học phần điểm
            </div>
            <Typography.Title level={2} className="!mb-1 !text-slate-900">{t(getKey('student_score_management'))}</Typography.Title>
            <Typography.Text className="text-slate-500">{t(getKey('student_score_management_desc'))}</Typography.Text>
          </div>

          <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-3')}>
            <div className={cn('rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3')}>
              <div className={cn('text-xs uppercase tracking-[0.18em] text-slate-400')}>Tổng sinh viên</div>
              <div className={cn('mt-1 text-2xl font-semibold text-slate-900')}>{summary.total}</div>
            </div>
            <div className={cn('rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3')}>
              <div className={cn('text-xs uppercase tracking-[0.18em] text-slate-400')}>Điểm trung bình</div>
              <div className={cn('mt-1 text-2xl font-semibold text-slate-900')}>{summary.average.toFixed(1)}</div>
            </div>
            <div className={cn('rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3')}>
              <div className={cn('text-xs uppercase tracking-[0.18em] text-slate-400')}>Đã chốt</div>
              <div className={cn('mt-1 text-2xl font-semibold text-slate-900')}>{summary.finalized}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <Tabs
          activeKey={mode}
          onChange={(k) => { setMode(k as ScoreMode); setStatusFilter('all'); setKeyword(''); setAdvancedFilters({}); setPeriodFilter(undefined); filterForm.resetFields(); }}
          items={[{ key: 'internship', label: t(getKey('internship_score_management')) }, { key: 'project', label: t(getKey('project_score_management')) }]}
        />
      </div>

      <Card className="mt-5 rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">{mode === 'internship' ? t(getKey('internship_score_management')) : t(getKey('project_score_management'))}</div>
            <div className="text-xs text-slate-500">{mode === 'internship' ? t(getKey('internship_score_management_desc')) : t(getKey('project_score_management_desc'))}</div>
          </div>

          <Space wrap>
            <Input allowClear value={keyword} onChange={(e) => setKeyword(e.target.value)} prefix={<SearchOutlined className="text-slate-400" />} placeholder={mode === 'internship' ? 'Tìm MSSV, tên, công ty...' : 'Tìm MSSV, tên, đề tài...'} className="!h-10 !rounded-[12px] !border-slate-300 xl:!w-[320px]" />
            <Select value={statusFilter} onChange={(v) => setStatusFilter(v)} className="!h-10 xl:!w-[180px]" options={[{ value: 'all', label: 'Tất cả trạng thái' }, { value: 'draft', label: 'Bản nháp' }, { value: 'reviewing', label: 'Đang chấm' }, { value: 'finalized', label: 'Đã chốt' }]} />
            <Select allowClear placeholder="Đợt" value={periodFilter} onChange={(v) => setPeriodFilter(v)} className="!h-10 xl:!w-[160px]" options={availablePeriods.map((p) => ({ label: p, value: p }))} />
            <Button icon={<FilterOutlined />} onClick={() => { filterForm.setFieldsValue(advancedFilters); setAdvancedFilterOpen(true); }} className={cn('!h-10 !rounded-[12px] !border-slate-300', Object.keys(advancedFilters).length ? '!border-[#2563eb] !text-[#2563eb]' : '')}>Bộ lọc nâng cao</Button>
          </Space>
        </div>

        <Table rowKey="id" columns={columns as ColumnsType<ScoreRow>} dataSource={filteredRows} pagination={{ pageSize: 6 }} scroll={{ x: 1400 }} className="score-management-table" />
      </Card>

      <Modal centered open={advancedFilterOpen} title={`Bộ lọc nâng cao - ${mode === 'internship' ? 'Điểm thực tập' : 'Điểm đồ án'}`} okText="Áp dụng" cancelText="Hủy" onCancel={() => setAdvancedFilterOpen(false)} onOk={handleApplyAdvancedFilters} width={760}>
        <Form form={filterForm} layout="vertical" className="pt-2">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Form.Item label="MSSV" name="studentId"><Input allowClear placeholder="Nhập MSSV" /></Form.Item>
            <Form.Item label="Lớp" name="className"><Input allowClear placeholder="Nhập lớp" /></Form.Item>
            <Form.Item label="GV hướng dẫn" name="mentor"><Input allowClear placeholder="Nhập tên giảng viên" /></Form.Item>
            <Form.Item label={subjectLabel} name="subject"><Input allowClear placeholder={mode === 'internship' ? 'Nhập tên doanh nghiệp' : 'Nhập tên đề tài'} /></Form.Item>
              <Form.Item label="Đợt" name="period"><Input allowClear placeholder="Nhập đợt (ví dụ: Đợt 1)" /></Form.Item>
            <Form.Item label="Điểm từ" name="minScore"><InputNumber className="!w-full" min={0} max={10} step={0.1} /></Form.Item>
            <Form.Item label="Điểm đến" name="maxScore"><InputNumber className="!w-full" min={0} max={10} step={0.1} /></Form.Item>
          </div>
        </Form>
        <div className="mt-1 flex justify-between gap-3">
          <Button danger type="link" onClick={handleResetAdvancedFilters} className="!px-0">Xóa bộ lọc</Button>
          <div className="text-xs text-slate-500">Bộ lọc áp dụng đồng thời với tìm kiếm nhanh và trạng thái.</div>
        </div>
      </Modal>

      <Modal centered open={editOpen} title={mode === 'internship' ? 'Sửa điểm thực tập' : 'Sửa điểm đồ án'} okText="Lưu" cancelText="Hủy" onCancel={() => { setEditOpen(false); setEditingRecord(null); editForm.resetFields(); }} onOk={handleSaveEdit} width={860} destroyOnClose>
        {renderScoreModalContent()}
      </Modal>

      <Modal centered open={detailOpen} title={mode === 'internship' ? 'Chi tiết điểm thực tập' : 'Chi tiết điểm đồ án'} cancelText="Đóng" onCancel={() => { setDetailOpen(false); setDetailRecord(null); }} footer={null} width={760} destroyOnClose>
        {renderDetailModalContent()}
      </Modal>
    </div>
  );
};

export default StudentScoresPage;
