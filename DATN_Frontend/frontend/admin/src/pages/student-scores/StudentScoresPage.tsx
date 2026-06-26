import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tabs,
  Row,
  Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FileDoneOutlined, SearchOutlined, TrophyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getKey, I18nKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE, cn } from '../../constants/commonConst';
import { formatNumber } from '@shared/utils/numberUtils';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import { scoreHooks } from '../../hooks/useScores';

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

const statusMeta: Record<ScoreStatus, { labelKey: keyof I18nKey; className: string }> = {
  [STATUS_CODE.DRAFT]: { labelKey: 'draft', className: '!bg-[var(--color-gold-light)] !text-[var(--color-gold-medium)]' },
  [STATUS_CODE.REVIEWING]: { labelKey: 'reviewing', className: '!bg-[var(--color-blue-light)] !text-[var(--color-blue-medium)]' },
  [STATUS_CODE.FINALIZED]: { labelKey: 'finalized', className: '!bg-[var(--color-green-light)] !text-[var(--color-green-medium)]' },
};

const scoreBand = (score: number) => {
  if (score >= 8.5) return { labelKey: 'score_excellent' as const, className: '!bg-[var(--color-green-light)] !text-[var(--color-green-medium)]' };
  if (score >= 7) return { labelKey: 'score_good' as const, className: '!bg-[var(--color-blue-light)] !text-[var(--color-blue-medium)]' };
  if (score >= 5.5) return { labelKey: 'score_average' as const, className: '!bg-[var(--color-gold-light)] !text-[var(--color-gold-medium)]' };
  return { labelKey: 'score_failed' as const, className: '!bg-[var(--color-red-light)] !text-[var(--color-red-medium)]' };
};

const StudentScoresPage: React.FC = () => {
  const { t } = useTranslation();
  const { selectedPeriod } = useGlobalVariable();
  const [mode, setMode] = useState<ScoreMode>('internship');
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ScoreRow | null>(null);
  const [detailRecord, setDetailRecord] = useState<ScoreRow | null>(null);
  const [editForm] = Form.useForm();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ScoreStatus>('all');
  const [classFilter, setClassFilter] = useState<string | undefined>(undefined);

  const updateScoreMutation = scoreHooks.useUpdateScore();

  // Fetch score data from API
  const { data: scoresData, isLoading } = scoreHooks.useFetchListScores({
    page: 1,
    limit: 1000,
    periodId: selectedPeriod?.id || '',
    mode,
    keyword,
    className: classFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const sourceRows = useMemo(() => (scoresData?.rows ?? []) as ScoreRow[], [scoresData]);

  const filteredRows = sourceRows;

  const summary = useMemo(() => {
    const total = sourceRows.length;
    const average = total ? sourceRows.reduce((s, r) => s + r.finalScore, 0) / total : 0;
    const finalized = sourceRows.filter((r) => r.status === STATUS_CODE.FINALIZED).length;
    const excellent = sourceRows.filter((r) => r.finalScore >= 8.5).length;
    return { total, average, finalized, excellent };
  }, [sourceRows]);

  const availableClasses = useMemo(() => {
    const s = new Set<string>();
    sourceRows.forEach((r) => { if (r.className) s.add(r.className); });
    return Array.from(s);
  }, [sourceRows]);

  const openEditModal = (record: ScoreRow) => {
    setEditingRecord(record);
    setEditOpen(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editForm.setFieldsValue({ ...record } as any);
  };

  const handleSaveEdit = async () => {
    const values = await editForm.validateFields();
    if (!editingRecord) return;

    updateScoreMutation.mutate(
      {
        id: editingRecord.id,
        body: {
          mode,
          status: values.status,
          finalScore: values.finalScore,
          defenseScore: values.defenseScore,
          demoScore: values.demoScore,
          qaScore: values.qaScore,
          reportScore: values.reportScore,
          dot_id: selectedPeriod?.id ? Number(selectedPeriod.id) : undefined,
        },
      },
      {
        onSuccess: () => {
          setEditOpen(false);
          setEditingRecord(null);
          editForm.resetFields();
        },
      }
    );
  };

  const openDetailModal = (record: ScoreRow) => { setDetailRecord(record); setDetailOpen(true); };

  const internshipColumns: ColumnsType<InternshipScoreRow> = [
    { title: t(getKey('student_id')), dataIndex: 'studentId', key: 'studentId', width: 120, fixed: 'left', render: (v) => <span className="font-medium text-primary">{v}</span> },
    { title: t(getKey('full_name')), dataIndex: 'studentName', key: 'studentName', width: 180, ellipsis: true },
    { title: t(getKey('class_name')), dataIndex: 'className', key: 'className', width: 130 },
    { title: t(getKey('company_name')), dataIndex: 'companyName', key: 'companyName', width: 220, ellipsis: true },
    { title: t(getKey('mentor')), dataIndex: 'mentor', key: 'mentor', width: 180, ellipsis: true },
    { title: t(getKey('final_score')), dataIndex: 'finalScore', key: 'finalScore', width: 120, render: (v) => <b>{formatNumber(v)}</b> },
    { title: t(getKey('score_band')), key: 'band', width: 130, render: (_v, r) => { const meta = scoreBand(r.finalScore); return <Tag className={cn('!m-0 !rounded-full !px-2.5 !py-[2px] !border-none', meta.className)}>{t(getKey(meta.labelKey))}</Tag>; } },
    { title: t(getKey('group_status')), dataIndex: 'status', key: 'status', width: 140, render: (s: ScoreStatus) => { const meta = statusMeta[s]; return <Tag className={cn('!m-0 !rounded-full !px-2.5 !py-[2px] !border-none', meta.className)}>{t(getKey(meta.labelKey))}</Tag>; } },
    { title: t(getKey('action')), key: 'actions', fixed: 'right', width: 160, render: (_,_r) => (<Space><Button type="link" onClick={() => openEditModal(_r as ScoreRow)}>{t(getKey('edit_score'))}</Button><Button type="link" onClick={() => openDetailModal(_r as ScoreRow)}>{t(getKey('detail'))}</Button></Space>) },
  ];

  const projectColumns: ColumnsType<ProjectScoreRow> = [
    { title: t(getKey('student_id')), dataIndex: 'studentId', key: 'studentId', width: 120, fixed: 'left', render: (v) => <span className="font-medium text-primary">{v}</span> },
    { title: t(getKey('full_name')), dataIndex: 'studentName', key: 'studentName', width: 180, ellipsis: true },
    { title: t(getKey('class_name')), dataIndex: 'className', key: 'className', width: 130 },
    { title: t(getKey('topic_name')), dataIndex: 'topicName', key: 'topicName', width: 240, ellipsis: true },
    { title: t(getKey('mentor')), dataIndex: 'mentor', key: 'mentor', width: 180, ellipsis: true },
    { title: t(getKey('score_defense')), dataIndex: 'defenseScore', key: 'defenseScore', width: 110, render: (v) => formatNumber(v) },
    { title: t(getKey('score_demo')), dataIndex: 'demoScore', key: 'demoScore', width: 110, render: (v) => formatNumber(v) },
    { title: t(getKey('score_qa')), dataIndex: 'qaScore', key: 'qaScore', width: 100, render: (v) => formatNumber(v) },
    { title: t(getKey('score_component_total')), key: 'componentTotal', width: 140, render: (_,_r) => formatNumber((_r.defenseScore ?? 0) + (_r.demoScore ?? 0) + (_r.qaScore ?? 0)) },
    { title: t(getKey('score_report')), dataIndex: 'reportScore', key: 'reportScore', width: 110, render: (v) => formatNumber(v) },
    { title: t(getKey('project_final_score')), dataIndex: 'finalScore', key: 'finalScore', width: 110, render: (v) => <b>{formatNumber(v)}</b> },
    { title: t(getKey('score_band')), key: 'band', width: 130, render: (_v, r) => { const meta = scoreBand(r.finalScore); return <Tag className={cn('!m-0 !rounded-full !px-2.5 !py-[2px] !border-none', meta.className)}>{t(getKey(meta.labelKey))}</Tag>; } },
    { title: t(getKey('action')), key: 'actions', fixed: 'right', width: 160, render: (_,_r) => (<Space><Button type="link" onClick={() => openEditModal(_r as ScoreRow)}>{t(getKey('edit_score'))}</Button><Button type="link" onClick={() => openDetailModal(_r as ScoreRow)}>{t(getKey('detail'))}</Button></Space>) },
  ];

  const columns = (mode === 'internship' ? internshipColumns : projectColumns) as any;

  const renderScoreModalContent = () => {
    if (!editingRecord) return null;
    const isIntern = 'companyName' in editingRecord;
    return (
      <Form form={editForm} layout="vertical" initialValues={editingRecord}>
        <Row gutter={16}>
          {isIntern ? (
            <Col span={24}>
              <Form.Item name="finalScore" label={t(getKey('final_score'))} rules={[{ required: true }]}>
                <InputNumber min={0} max={10} precision={1} className="w-full" />
              </Form.Item>
            </Col>
          ) : (
            <>
              <Col span={12}>
                <Form.Item name="defenseScore" label={t(getKey('score_defense'))} rules={[{ required: true }]}>
                  <InputNumber min={0} max={3} precision={1} className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="demoScore" label={t(getKey('score_demo'))} rules={[{ required: true }]}>
                  <InputNumber min={0} max={5} precision={1} className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="qaScore" label={t(getKey('score_qa'))} rules={[{ required: true }]}>
                  <InputNumber min={0} max={2} precision={1} className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="reportScore" label={t(getKey('score_report'))} rules={[{ required: true }]}>
                  <InputNumber min={0} max={10} precision={1} className="w-full" />
                </Form.Item>
              </Col>
            </>
          )}
          <Col span={24}>
            <Form.Item name="status" label={t(getKey('group_status'))} rules={[{ required: true }]}>
              <Select options={Object.keys(statusMeta).map((k) => ({ value: k, label: t(getKey(statusMeta[k as ScoreStatus].labelKey)) }))} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };

  return (
    <div className="text-gray-800 pb-4">
      <div className="mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-light)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
          <FileDoneOutlined /> {t(getKey('student_score_management'))}
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">{t(getKey('student_scores_title'))}</h1>
            <p className="mt-2 mb-0 text-[18px] leading-[26px] text-grayDark">{t(getKey('student_scores_desc'))}</p>
          </div>
        </div>
      </div>

      {selectedPeriod && (
        <div className={cn('mb-5 p-4 rounded-[18px] border flex items-center justify-between shadow-[0_12px_28px_rgba(15,23,42,0.02)] bg-blue-50 border-blue-200 text-blue-700')}>
          <div>
            {t(getKey('showing'))} {t(getKey('student_score_management'))} {t(getKey('of'))}: <strong className="underline">{selectedPeriod.name}</strong>
          </div>
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-slate-500">{t(getKey('total_students_label'))}</div>
              <div className="mt-2 text-3xl font-bold text-navyDark">{formatNumber(summary.total)}</div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
              <FileDoneOutlined />
            </div>
          </div>
        </Card>
        <Card className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-slate-500">{t(getKey('average_score'))}</div>
              <div className="mt-2 text-3xl font-bold text-navyDark">{formatNumber(summary.average)}</div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-blue-medium)] text-white">
              <FileDoneOutlined />
            </div>
          </div>
        </Card>
        <Card className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-slate-500">{t(getKey('finalized_count'))}</div>
              <div className="mt-2 text-3xl font-bold text-navyDark">{formatNumber(summary.finalized)}</div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-green-medium)] text-white">
              <FileDoneOutlined />
            </div>
          </div>
        </Card>
        <Card className="rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-slate-500">{t(getKey('excellent_count'))}</div>
              <div className="mt-2 text-3xl font-bold text-navyDark">{formatNumber(summary.excellent)}</div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-gold-medium)] text-white">
              <TrophyOutlined />
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <Tabs activeKey={mode} onChange={(k) => setMode(k as ScoreMode)} items={[
          { key: 'internship', label: t(getKey('internship_score_management')) },
          { key: 'project', label: t(getKey('project_score_management')) }
        ]} />

        <div className="p-4">
          <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-3">
              <Input
                allowClear
                placeholder={t(getKey('search_score_placeholder'))}
                prefix={<SearchOutlined className="text-slate-400" />}
                onChange={(e) => setKeyword(e.target.value)}
                className="!h-11 max-w-md !rounded-[12px] !border-slate-300"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select
                allowClear
                placeholder={t(getKey('class_name'))}
                value={classFilter}
                onChange={(v) => setClassFilter(v)}
                className="!h-10 w-[180px]"
                options={availableClasses.map((c) => ({ label: c, value: c }))}
              />
              <Select
                allowClear
                placeholder={t(getKey('group_status'))}
                value={statusFilter}
                onChange={(v) => setStatusFilter(v || 'all')}
                className="!h-10 w-[160px]"
                options={[
                  { value: 'all', label: t(getKey('all_tab')) },
                  ...Object.keys(statusMeta).map((k) => ({ value: k, label: t(getKey(statusMeta[k as ScoreStatus].labelKey)) }))
                ]}
              />
            </div>
          </div>

          <Table rowKey="id" dataSource={filteredRows} columns={columns} scroll={{ x: 1300 }} loading={isLoading} />
        </div>
      </div>

      <Modal title={t(getKey('edit_score'))} open={editOpen} onOk={handleSaveEdit} onCancel={() => { setEditOpen(false); setEditingRecord(null); }} centered width={540}>
        {renderScoreModalContent()}
      </Modal>

      <Modal title={t(getKey('detail'))} open={detailOpen} onCancel={() => { setDetailOpen(false); setDetailRecord(null); }} footer={null} centered width={540}>
        {detailRecord && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label={t(getKey('student_id'))}>{detailRecord.studentId}</Descriptions.Item>
            <Descriptions.Item label={t(getKey('full_name'))}>{detailRecord.studentName}</Descriptions.Item>
            <Descriptions.Item label={t(getKey('class_name'))}>{detailRecord.className}</Descriptions.Item>
            <Descriptions.Item label={t(getKey('mentor'))}>{detailRecord.mentor}</Descriptions.Item>
            <Descriptions.Item label={t(getKey('period_management'))}>{detailRecord.period || '—'}</Descriptions.Item>
            {'companyName' in detailRecord ? (
              <Descriptions.Item label={t(getKey('company_name'))}>{(detailRecord as InternshipScoreRow).companyName}</Descriptions.Item>
            ) : (
              <Descriptions.Item label={t(getKey('topic_name'))}>{(detailRecord as ProjectScoreRow).topicName}</Descriptions.Item>
            )}
            {!('companyName' in detailRecord) && (
              <>
                <Descriptions.Item label={t(getKey('score_defense'))}>{formatNumber((detailRecord as ProjectScoreRow).defenseScore)}</Descriptions.Item>
                <Descriptions.Item label={t(getKey('score_demo'))}>{formatNumber((detailRecord as ProjectScoreRow).demoScore)}</Descriptions.Item>
                <Descriptions.Item label={t(getKey('score_qa'))}>{formatNumber((detailRecord as ProjectScoreRow).qaScore)}</Descriptions.Item>
                <Descriptions.Item label={t(getKey('score_component_total'))}>
                  {formatNumber(((detailRecord as ProjectScoreRow).defenseScore ?? 0) + ((detailRecord as ProjectScoreRow).demoScore ?? 0) + ((detailRecord as ProjectScoreRow).qaScore ?? 0))}
                </Descriptions.Item>
                <Descriptions.Item label={t(getKey('score_report'))}>{formatNumber((detailRecord as ProjectScoreRow).reportScore)}</Descriptions.Item>
              </>
            )}
            <Descriptions.Item label={t(getKey('final_score'))}><b>{formatNumber(detailRecord.finalScore)}</b></Descriptions.Item>
            <Descriptions.Item label={t(getKey('score_band'))}>{t(getKey(scoreBand(detailRecord.finalScore).labelKey))}</Descriptions.Item>
            <Descriptions.Item label={t(getKey('group_status'))}>{t(getKey(statusMeta[detailRecord.status].labelKey))}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default StudentScoresPage;
