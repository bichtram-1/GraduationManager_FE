import { Card, List, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { cn, DATE_DISPLAY_FORMAT, TIME_FORMAT } from '../../constants/commonConst';
import {
  BookOutlined,
  KeyOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import ColumnChart from '@shared/components/chart/ColumnChart';
import PieChart from '@shared/components/chart/PieChart';
import { dashboardHooks } from '../../hooks/useDashboard';
import { COLORS } from '@shared/constants/color';
import { formatNumber } from '@shared/utils/numberUtils';
import { useMemo } from 'react';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const { t } = useTranslation();
  const { selectedPeriod } = useGlobalVariable();
  const { data, isLoading } = dashboardHooks.useFetchDashboard();

  const stats = data?.stats;
  const studentsPerCourse = data?.studentsPerCourse ?? [];
  const learningProgress = data?.learningProgress ?? [];
  const recentActivities = data?.recentActivities ?? [];

  const isCompleted = (dStr?: string) => {
    if (!dStr) return false;
    const parts = dStr.split('/');
    if (parts.length === 3) {
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      return d <= new Date();
    }
    return false;
  };

  const milestones = useMemo(() => {
    const parseDate = (dStr?: string) => {
      if (!dStr || dStr === '—') return null;
      const singleDate = dStr.includes('-') ? dStr.split('-')[0].trim() : dStr;
      const parts = singleDate.split('/');
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
      return null;
    };

    let rawList: Array<{ title: string; date: string; color: 'green' | 'gray' }> = [];

    if (!selectedPeriod) {
      rawList = [
        { title: t(getKey('company_registration')), date: '01/05/2026', color: 'green' },
        { title: t(getKey('info_review')), date: '10/05/2026', color: 'green' },
        { title: t(getKey('internship_start')), date: '15/05/2026', color: 'gray' },
        { title: t(getKey('submit_final_report')), date: '30/07/2026', color: 'gray' },
      ];
    } else if (selectedPeriod.type === 'datn') {
      rawList = [
        {
          title: 'Mở đăng ký đợt học',
          date: selectedPeriod.regOpenDate || '—',
          color: isCompleted(selectedPeriod.regOpenDate) ? 'green' : 'gray',
        },
        {
          title: 'Hạn đăng ký đợt học',
          date: selectedPeriod.regDeadline || '—',
          color: isCompleted(selectedPeriod.regDeadline) ? 'green' : 'gray',
        },
        {
          title: 'Bắt đầu đợt (Đồ án tốt nghiệp)',
          date: selectedPeriod.startDate || '—',
          color: isCompleted(selectedPeriod.startDate) ? 'green' : 'gray',
        },
        {
          title: 'Hạn nộp báo cáo tiến độ',
          date: selectedPeriod.reportDeadline || '—',
          color: isCompleted(selectedPeriod.reportDeadline) ? 'green' : 'gray',
        },
        {
          title: 'Thời gian phản biện đồ án',
          date: selectedPeriod.reviewStartDate && selectedPeriod.reviewEndDate 
            ? `${selectedPeriod.reviewStartDate} - ${selectedPeriod.reviewEndDate}` 
            : '—',
          color: isCompleted(selectedPeriod.reviewEndDate) ? 'green' : 'gray',
        },
        {
          title: 'Thời gian bảo vệ đồ án',
          date: selectedPeriod.defenseStartDate && selectedPeriod.defenseEndDate 
            ? `${selectedPeriod.defenseStartDate} - ${selectedPeriod.defenseEndDate}` 
            : '—',
          color: isCompleted(selectedPeriod.defenseEndDate) ? 'green' : 'gray',
        },
        {
          title: 'Thời gian chấm điểm',
          date: selectedPeriod.gradingStartDate && selectedPeriod.gradingEndDate 
            ? `${selectedPeriod.gradingStartDate} - ${selectedPeriod.gradingEndDate}` 
            : '—',
          color: isCompleted(selectedPeriod.gradingEndDate) ? 'green' : 'gray',
        },
        {
          title: 'Kết thúc đợt học',
          date: selectedPeriod.endDate || '—',
          color: isCompleted(selectedPeriod.endDate) ? 'green' : 'gray',
        },
      ];
    } else {
      rawList = [
        {
          title: 'Mở đăng ký đợt học',
          date: selectedPeriod.regOpenDate || '—',
          color: isCompleted(selectedPeriod.regOpenDate) ? 'green' : 'gray',
        },
        {
          title: 'Hạn đăng ký đợt học',
          date: selectedPeriod.regDeadline || '—',
          color: isCompleted(selectedPeriod.regDeadline) ? 'green' : 'gray',
        },
        {
          title: 'Bắt đầu đợt (Thực tập tốt nghiệp)',
          date: selectedPeriod.startDate || '—',
          color: isCompleted(selectedPeriod.startDate) ? 'green' : 'gray',
        },
        {
          title: 'Hạn nộp báo cáo tiến độ',
          date: selectedPeriod.reportDeadline || '—',
          color: isCompleted(selectedPeriod.reportDeadline) ? 'green' : 'gray',
        },
        {
          title: 'Thời gian chấm điểm',
          date: selectedPeriod.gradingStartDate && selectedPeriod.gradingEndDate 
            ? `${selectedPeriod.gradingStartDate} - ${selectedPeriod.gradingEndDate}` 
            : '—',
          color: isCompleted(selectedPeriod.gradingEndDate) ? 'green' : 'gray',
        },
        {
          title: 'Kết thúc đợt học',
          date: selectedPeriod.endDate || '—',
          color: isCompleted(selectedPeriod.endDate) ? 'green' : 'gray',
        },
      ];
    }

    const titleOrder = [
      'Bắt đầu đợt (Đồ án tốt nghiệp)',
      'Bắt đầu đợt (Thực tập tốt nghiệp)',
      'Mở đăng ký đợt học',
      'Hạn đăng ký đợt học',
      'Hạn nộp báo cáo tiến độ',
      'Thời gian phản biện đồ án',
      'Thời gian bảo vệ đồ án',
      'Thời gian chấm điểm',
      'Kết thúc đợt học'
    ];

    return [...rawList].sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      if (!dateA) return 1;
      if (!dateB) return -1;
      const diff = dateA.getTime() - dateB.getTime();
      if (diff !== 0) return diff;

      const idxA = titleOrder.findIndex(t => a.title.includes(t));
      const idxB = titleOrder.findIndex(t => b.title.includes(t));
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
    });
  }, [selectedPeriod, t]);

  const statCards = [ 
    {
      title: t(getKey('total_users')),
      value: formatNumber(stats?.totalUsers ?? 0),
      sub: String(t(getKey('total_users_sub'), { count: formatNumber(stats?.activeUsers ?? 0) } as Record<string, unknown>)),
      icon: <TeamOutlined style={{ fontSize: 16 }} />,
      color: 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white',
    },
    {
      title: t(getKey('eligible_for_thesis')),
      value: formatNumber(stats?.totalCourses ?? 0),
      sub: '',
      icon: <BookOutlined style={{ fontSize: 16 }} />,
      color: 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white',
    },
    {
      title: t(getKey('thesis_topics')),
      value: formatNumber(stats?.totalQuestions ?? 0),
      sub: '',
      icon: <QuestionCircleOutlined style={{ fontSize: 16 }} />,
      color: 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white',
    },
    {
      title: t(getKey('total_companies')),
      value: formatNumber(stats?.totalCodes ?? 0),
      sub: '',
      icon: <KeyOutlined style={{ fontSize: 16 }} />,
      color: 'bg-gradient-to-tr from-rose-500 to-red-600 text-white',
    },
  ];

  return (
    <div className={cn('relative flex flex-col gap-6 pb-4')}>
      <div className={cn('absolute -top-10 right-0 h-44 w-44 rounded-full bg-[var(--color-blue-md)]/10 blur-3xl')} />
      <div className={cn('absolute top-24 left-8 h-32 w-32 rounded-full bg-[var(--color-green-md)]/10 blur-3xl')} />

      <div className={cn('relative overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 px-6 py-6 shadow-[0_20px_45px_rgba(15,23,42,0.06)]')}> 
        <div className={cn('flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between')}>
          <div>
            <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-md)]/10 px-3 py-1 text-xs font-medium text-[var(--color-blue-login-mid)]')}>
              <ArrowUpOutlined />
              {t(getKey('system_overview'))}
            </div>
            <Title level={2} className="!mb-1 !text-slate-900">
              {t(getKey('dashboard'))}
            </Title>
            <Text className="text-slate-500">
              {t(getKey('dashboard_subtitle'))}
            </Text>
          </div>

          <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-3')}>
            <div className={cn('rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3')}>
              <div className={cn('text-xs uppercase tracking-[0.18em] text-slate-400')}>{t(getKey('today'))}</div>
              <div className={cn('mt-1 text-sm font-semibold text-slate-900')}>{dayjs().format(DATE_DISPLAY_FORMAT)}</div>
            </div>
            <div className={cn('rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3')}>
              <div className={cn('text-xs uppercase tracking-[0.18em] text-slate-400')}>{t(getKey('total_activities'))}</div>
              <div className={cn('mt-1 text-sm font-semibold text-slate-900')}>{formatNumber(recentActivities.length)}</div>
            </div>
            <div className={cn('rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3')}>
              <div className={cn('text-xs uppercase tracking-[0.18em] text-slate-400')}>{t(getKey('usage_rate'))}</div>
              <div className={cn('mt-1 text-sm font-semibold text-slate-900')}>{formatNumber(stats?.usedCodes ?? 0)}/{formatNumber(stats?.totalCodes ?? 0)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4')}>
        {statCards?.map((card) => (
          <Card
            key={card?.title}
            className={cn('overflow-hidden !rounded-[22px] border border-slate-100/80 shadow-[0_16px_35px_rgba(15,23,42,0.04)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300')}
            loading={isLoading}
          >
            <div className={cn('flex items-start justify-between gap-4')}>
              <div>
                <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card?.title}</Text>
                <div className="mt-3">
                  <Text className="!text-3xl !font-semibold !text-slate-900">{card?.value}</Text>
                </div>
                <Text className="mt-2 block text-xs leading-5 text-slate-500">{card?.sub}</Text>
              </div>

              <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-[0_14px_28px_rgba(25,118,210,0.18)]', card?.color)}>
                {card?.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className={cn('grid grid-cols-1 gap-6 xl:grid-cols-3')}>
        <Card className={cn('overflow-hidden !rounded-[22px] border border-slate-100 shadow-[0_16px_35px_rgba(15,23,42,0.06)] xl:col-span-2')} loading={isLoading}>
          <div className={cn('mb-4 flex items-center justify-between')}>
            <div>
              <Title level={4} className="!mb-1 !text-slate-900">{t(getKey('students_per_course'))}</Title>
              <Text className="text-slate-500">{t(getKey('students_per_course_sub'))}</Text>
            </div>
            <div className={cn('hidden rounded-full bg-[var(--color-blue-md)]/10 px-3 py-1 text-xs font-medium text-[var(--color-blue-login-mid)] sm:inline-flex')}>
              {t(getKey('last_updated'))}
            </div>
          </div>
          <ColumnChart
            categories={studentsPerCourse?.map((item) => item?.courseName)}
            series={[
              {
                name: t(getKey('students_legend')),
                data: studentsPerCourse?.map((item) => item?.studentCount),
                color: COLORS.chartBarStudent,
              },
            ]}
            height={320}
            showLegend
            yLabelFormatter={(v) => formatNumber(Math.round(v))}
          />
        </Card>

        <Card className={cn('overflow-hidden !rounded-[22px] border border-slate-100 shadow-[0_16px_35px_rgba(15,23,42,0.06)]')} loading={isLoading}>
          <div className={cn('mb-4')}>
            <Title level={4} className="!mb-1 !text-slate-900">{t(getKey('learning_progress'))}</Title>
            <Text className="text-slate-500">{t(getKey('learning_progress_sub'))}</Text>
          </div>
          <PieChart
            data={learningProgress?.map((item) => ({
              label: item?.label,
              value: item?.value,
              color: item?.color,
            }))}
            height={320}
            showLegend
          />
        </Card>
      </div>

      <div className={cn('grid grid-cols-1 gap-6 xl:grid-cols-3')}>
        <Card className={cn('overflow-hidden !rounded-[22px] border border-slate-100/80 shadow-[0_16px_35px_rgba(15,23,42,0.04)] xl:col-span-2 hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] transition-all duration-300')} loading={isLoading}>
          <div className={cn('mb-4 flex items-center justify-between')}>
            <div>
              <Title level={4} className="!mb-1 !text-slate-900">{t(getKey('recent_activities'))}</Title>
              <Text className="text-slate-500">{t(getKey('recent_activities_sub'))}</Text>
            </div>
            <div className={cn('inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500')}>
              <CalendarOutlined />
              {t(getKey('chronological'))}
            </div>
          </div>
          <div className="max-h-[380px] overflow-y-auto overflow-x-auto pr-2">
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(activity) => (
                <List.Item className={cn('!px-0')}>
                  <List.Item.Meta
                    avatar={<div className={cn('flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50/50 border border-indigo-100/50')}><UserOutlined className="!text-[14px] text-indigo-500" /></div>}
                    title={<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="font-semibold text-slate-800">{activity?.userName}</div><Text className="text-xs text-slate-400 font-medium">{dayjs(activity?.date).format(TIME_FORMAT)}</Text></div>}
                    description={<div className="mt-1 flex flex-wrap items-center gap-3"><div className="text-xs text-slate-500 font-medium">{activity?.courseName}</div><Tag className="rounded-full !px-2.5 !py-[1px] !border-none !m-0" color={activity?.statusColor ?? 'blue'}>{activity?.status ?? t(getKey('info'))}</Tag></div>}
                  />
                </List.Item>
              )}
            />
          </div>
        </Card>

        <Card className={cn('overflow-hidden !rounded-[22px] border border-slate-100/80 shadow-[0_16px_35px_rgba(15,23,42,0.04)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] transition-all duration-300')} loading={isLoading}>
          <div className={cn('mb-4')}>
            <Title level={4} className="!mb-1 !text-slate-900">{t(getKey('milestones'))}</Title>
            <Text className="text-slate-500">{t(getKey('milestones_sub'))}</Text>
          </div>
          <div className="max-h-[380px] overflow-y-auto overflow-x-auto pr-2">
            <List
              dataSource={milestones}
              renderItem={(item) => (
                <List.Item className={cn('!px-0 border-b-0 py-3')}>
                  <div className="flex items-start gap-3.5">
                    <div className={cn('mt-2.5 size-2.5 shrink-0 rounded-full ring-4 ring-offset-2 transition-all', item.color === 'green' ? 'bg-emerald-500 ring-emerald-100' : 'bg-slate-300 ring-slate-100')} />
                    <div>
                      <div className="font-semibold text-slate-800 leading-snug">{item.title}</div>
                      <div className="text-xs text-slate-400 font-medium mt-1">{item.date}</div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
