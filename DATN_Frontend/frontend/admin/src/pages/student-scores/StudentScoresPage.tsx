import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  Tabs,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FileDoneOutlined, SearchOutlined, TrophyOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { getKey, I18nKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE, cn } from '../../constants/commonConst';
import { formatNumber } from '@shared/utils/numberUtils';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import { useScrollContainer } from '../../hooks/ScrollContainerProvider';
import { scoreHooks } from '../../hooks/useScores';
import { useSearchParams } from 'react-router-dom';

const STICKY_PAGINATION_HEIGHT = 57;

type ScoreMode = 'internship' | 'project';
type ScoreStatus = 'draft' | 'finalized';

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
  [STATUS_CODE.FINALIZED]: { labelKey: 'finalized', className: '!bg-[var(--color-green-light)] !text-[var(--color-green-medium)]' },
};

const scoreBand = (score: number) => {
  if (score >= 8.5) return { labelKey: 'score_excellent' as const, className: '!bg-[var(--color-green-light)] !text-[var(--color-green-medium)]' };
  if (score >= 7) return { labelKey: 'score_good' as const, className: '!bg-[var(--color-blue-light)] !text-[var(--color-blue-medium)]' };
  if (score >= 5.5) return { labelKey: 'score_average' as const, className: '!bg-[var(--color-gold-light)] !text-[var(--color-gold-medium)]' };
  return { labelKey: 'score_failed' as const, className: '!bg-[var(--color-red-light)] !text-[var(--color-red-medium)]' };
};

type Props = {
  fixedMode?: ScoreMode;
};

const StudentScoresPage: React.FC<Props> = ({ fixedMode }) => {
  const { t } = useTranslation();

  const { selectedPeriod } = useGlobalVariable();
  const scrollContainerRef = useScrollContainer();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = fixedMode || (searchParams.get('mode') as ScoreMode) || 'internship';
  const setMode = (newMode: ScoreMode) => {
    setSearchParams({ mode: newMode });
  };
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<ScoreRow | null>(null);
  const [keyword, setKeyword] = useState('');
  const [classFilter, setClassFilter] = useState<string | undefined>(undefined);
  const [mentorFilter, setMentorFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Fetch score data from API
  const { data: scoresData, isLoading } = scoreHooks.useFetchListScores({
    page: 1,
    limit: 1000,
    periodId: selectedPeriod?.id || '',
    mode,
    keyword,
    className: classFilter,
    mentor: mentorFilter,
    status: statusFilter,
  });

  const sourceRows = useMemo(() => (scoresData?.rows ?? []) as ScoreRow[], [scoresData]);

  const filteredRows = sourceRows;

  const handleExportExcel = () => {
    if (!selectedPeriod) {
      message.warning('Vui lòng chọn đợt tốt nghiệp/thực tập!');
      return;
    }

    const pStatus = selectedPeriod.status;
    const isGrading = pStatus === 'grading';
    const isClosed = pStatus === 'closed';

    if (!isGrading && !isClosed) {
      Modal.warning({
        title: 'Chưa đến giai đoạn chấm điểm',
        content: 'Đợt học/tốt nghiệp hiện tại chưa đến giai đoạn chấm điểm, không thể xuất bảng điểm!',
        centered: true,
      });
      return;
    }

    if (!filteredRows || filteredRows.length === 0) {
      message.warning('Không có dữ liệu để xuất Excel!');
      return;
    }

    const executeExport = (isDraft: boolean) => {
      const data = filteredRows.map((r, index) => {
        if (mode === 'internship') {
          const row = r as InternshipScoreRow;
          return {
            'STT': index + 1,
            'MSSV': row.studentId || '',
            'Họ tên': row.studentName || '',
            'Lớp': row.className || '',
            'Doanh nghiệp': row.companyName || '',
            'Giảng viên hướng dẫn': row.mentor || '',
            'Điểm tổng kết': row.finalScore !== null ? row.finalScore : '',
            'Trạng thái': row.status === 'finalized' ? 'Đã chấm xong' : 'Chưa hoàn tất',
          };
        } else {
          const row = r as ProjectScoreRow;
          return {
            'STT': index + 1,
            'MSSV': row.studentId || '',
            'Họ tên': row.studentName || '',
            'Lớp': row.className || '',
            'Tên đề tài': row.topicName || '',
            'Giảng viên hướng dẫn': row.mentor || '',
            'Điểm Thuyết trình': row.defenseScore !== null ? row.defenseScore : '',
            'Điểm Demo': row.demoScore !== null ? row.demoScore : '',
            'Điểm Vấn đáp': row.qaScore !== null ? row.qaScore : '',
            'Điểm Báo cáo': row.reportScore !== null ? row.reportScore : '',
            'Điểm tổng kết': row.finalScore !== null ? row.finalScore : '',
            'Trạng thái': row.status === 'finalized' ? 'Đã chấm xong' : 'Chưa hoàn tất',
          };
        }
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      const sheetName = mode === 'internship' ? 'Diem Thuc Tap' : 'Diem Do An';
      const suffix = isDraft ? '-du-thao' : '-chinh-thuc';
      const fileName = mode === 'internship' 
        ? `bang-diem-thuc-tap-${selectedPeriod.name || 'export'}${suffix}.xlsx` 
        : `bang-diem-do-an-${selectedPeriod.name || 'export'}${suffix}.xlsx`;

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, fileName);
      message.success(`Xuất file Excel ${isDraft ? 'dự thảo' : 'chính thức'} thành công!`);
    };

    if (isGrading) {
      const draftCount = filteredRows.filter((r) => r.status === 'draft').length;
      if (draftCount > 0) {
        Modal.confirm({
          title: 'Xác nhận xuất file điểm dự thảo',
          content: `Hiện tại vẫn còn ${draftCount} sinh viên chưa hoàn tất chấm điểm. Bạn có chắc chắn muốn xuất file bảng điểm tạm thời (dự thảo) không?`,
          okText: 'Xác nhận',
          cancelText: 'Hủy',
          centered: true,
          onOk() {
            executeExport(true);
          },
        });
        return;
      }
      executeExport(false);
    } else {
      executeExport(false);
    }
  };

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

  const availableMentors = useMemo(() => {
    const s = new Set<string>();
    sourceRows.forEach((r) => { if (r.mentor) s.add(r.mentor); });
    return Array.from(s);
  }, [sourceRows]);

  const openDetailModal = (record: ScoreRow) => { setDetailRecord(record); setDetailOpen(true); };

  const internshipColumns: ColumnsType<InternshipScoreRow> = [
    { title: t(getKey('student_id')), dataIndex: 'studentId', key: 'studentId', width: 120, fixed: 'left', render: (v) => <span className="font-medium text-primary">{v}</span> },
    { title: t(getKey('full_name')), dataIndex: 'studentName', key: 'studentName', width: 180, ellipsis: true },
    { title: t(getKey('class_name')), dataIndex: 'className', key: 'className', width: 130 },
    { title: t(getKey('company_name')), dataIndex: 'companyName', key: 'companyName', width: 220, ellipsis: true },
    { title: t(getKey('mentor')), dataIndex: 'mentor', key: 'mentor', width: 180, ellipsis: true },
    { title: t(getKey('final_score')), dataIndex: 'finalScore', key: 'finalScore', width: 120, render: (v) => <b>{typeof v === 'number' ? v.toFixed(2) : (v !== null && v !== undefined && v !== '' ? Number(v).toFixed(2) : '—')}</b> },
    { title: t(getKey('score_band')), key: 'band', width: 130, render: (_v, r) => { const meta = scoreBand(r.finalScore); return <Tag className={cn('!m-0 !rounded-full !px-2.5 !py-[2px] !border-none', meta.className)}>{t(getKey(meta.labelKey))}</Tag>; } },
    { title: t(getKey('group_status')), dataIndex: 'status', key: 'status', width: 140, render: (s: ScoreStatus) => { const meta = statusMeta[s]; return <Tag className={cn('!m-0 !rounded-full !px-2.5 !py-[2px] !border-none', meta.className)}>{t(getKey(meta.labelKey))}</Tag>; } },
    { title: t(getKey('action')), key: 'actions', fixed: 'right', width: 100, render: (_,_r) => (<Button type="link" onClick={() => openDetailModal(_r as ScoreRow)}>{t(getKey('detail'))}</Button>) },
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
    { title: t(getKey('project_final_score')), dataIndex: 'finalScore', key: 'finalScore', width: 110, render: (v) => <b>{typeof v === 'number' ? v.toFixed(2) : (v !== null && v !== undefined && v !== '' ? Number(v).toFixed(2) : '—')}</b> },
    { title: t(getKey('score_band')), key: 'band', width: 130, render: (_v, r) => { const meta = scoreBand(r.finalScore); return <Tag className={cn('!m-0 !rounded-full !px-2.5 !py-[2px] !border-none', meta.className)}>{t(getKey(meta.labelKey))}</Tag>; } },
    { title: t(getKey('action')), key: 'actions', fixed: 'right', width: 100, render: (_,_r) => (<Button type="link" onClick={() => openDetailModal(_r as ScoreRow)}>{t(getKey('detail'))}</Button>) },
  ];

  const columns = (mode === 'internship' ? internshipColumns : projectColumns) as unknown as ColumnsType<InternshipScoreRow | ProjectScoreRow>;

  const pageTitleKey = fixedMode === 'internship' ? 'internship_score_management' : fixedMode === 'project' ? 'project_score_management' : 'student_score_management';
  const pageDescKey = fixedMode === 'internship' ? 'internship_score_management_desc' : fixedMode === 'project' ? 'project_score_management_desc' : 'student_scores_desc';

  return (
    <div className="text-gray-800 pb-4">
      <div className="mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-light)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
          <FileDoneOutlined /> {t(getKey(pageTitleKey))}
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">{t(getKey(pageTitleKey))}</h1>
            <p className="mt-2 mb-0 text-[18px] leading-[26px] text-grayDark">{t(getKey(pageDescKey))}</p>
          </div>
        </div>
      </div>

      {selectedPeriod && (
        <div className={cn('mb-5 p-4 rounded-[18px] border flex items-center justify-between shadow-[0_12px_28px_rgba(15,23,42,0.02)] bg-blue-50 border-blue-200 text-blue-700')}>
          <div>
            {t(getKey('showing'))} {t(getKey(pageTitleKey))} {t(getKey('of'))}: <strong className="underline">{selectedPeriod.name}</strong>
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

      <div className="filter-table-card mb-5">
        {!fixedMode && (
          <div className="px-6 pt-6">
            <Tabs activeKey={mode} onChange={(k) => setMode(k as ScoreMode)} items={[
              { key: 'internship', label: t(getKey('internship_score_management')) },
              { key: 'project', label: t(getKey('project_score_management')) }
            ]} />
          </div>
        )}

        <div className="filter-table-header mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
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
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportExcel}
              className="rounded-xl h-10 font-medium bg-emerald-600 hover:bg-emerald-700 border-none flex items-center gap-1.5"
            >
              Xuất Excel
            </Button>
            <Select
              allowClear
              placeholder="Trạng thái chấm"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              className="!h-10 w-[180px]"
              options={[
                { label: 'Đã chấm xong', value: 'finalized' },
                { label: 'Chưa hoàn tất', value: 'draft' },
              ]}
            />
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
              placeholder={t(getKey('mentor'))}
              value={mentorFilter}
              onChange={(v) => setMentorFilter(v)}
              className="!h-10 w-[180px]"
              options={availableMentors.map((m) => ({ label: m, value: m }))}
            />
          </div>
        </div>

        <Table
          rowKey="id"
          dataSource={filteredRows}
          columns={columns}
          scroll={{ x: 1300 }}
          loading={isLoading}
          pagination={{
            position: ['bottomCenter'],
            showQuickJumper: false,
            showSizeChanger: true,
            showTotal: (total, range) => (
              <span className="pl-2">
                {`${t('showing')} ${range[0]} ${t('to')} ${range[1]} ${t('of')} ${total} ${t('entries')}`}
              </span>
            ),
          }}
          sticky={{
            offsetHeader: 0,
            offsetScroll: STICKY_PAGINATION_HEIGHT,
            getContainer: () => scrollContainerRef?.current || window,
          }}
        />
      </div>

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
            <Descriptions.Item label={t(getKey('final_score'))}><b>{typeof detailRecord.finalScore === 'number' ? detailRecord.finalScore.toFixed(2) : (detailRecord.finalScore !== null && detailRecord.finalScore !== undefined && detailRecord.finalScore !== '' ? Number(detailRecord.finalScore).toFixed(2) : '—')}</b></Descriptions.Item>
            <Descriptions.Item label={t(getKey('score_band'))}>{t(getKey(scoreBand(detailRecord.finalScore).labelKey))}</Descriptions.Item>
            <Descriptions.Item label={t(getKey('group_status'))}>{t(getKey(statusMeta[detailRecord.status].labelKey))}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default StudentScoresPage;
