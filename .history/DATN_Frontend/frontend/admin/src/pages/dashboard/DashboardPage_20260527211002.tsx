import { Card, List, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { cn, DATE_DISPLAY_FORMAT } from '../../constants/commonConst';
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
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const { t } = useTranslation();
  const { data, isLoading } = dashboardHooks.useFetchDashboard();

  const stats = data?.stats;
  const studentsPerCourse = data?.studentsPerCourse ?? [];
  const learningProgress = data?.learningProgress ?? [];
  const recentActivities = data?.recentActivities ?? [];

  const statCards = [ 
    {
      title: t(getKey('total_users')),
      value: formatNumber(stats?.totalUsers ?? 0),
      sub: String(t(getKey('total_users_sub'), { count: formatNumber(stats?.activeUsers ?? 0) } as Record<string, unknown>)),
      icon: <TeamOutlined style={{ fontSize: 16 }} />,
      color: 'bg-[#2196F3] text-white',
    },
    {
      title: 'Đủ điều kiện ĐATN',
      value: formatNumber(stats?.totalCourses ?? 0),
      sub: '',
      icon: <BookOutlined style={{ fontSize: 16 }} />,
      color: 'bg-[#4CAF50] text-white',
    },
    {
      title: 'Đề tài ĐATN',
      value: formatNumber(stats?.totalQuestions ?? 0),
      sub: '',
      icon: <QuestionCircleOutlined style={{ fontSize: 16 }} />,
      color: 'bg-[#FFC107] text-white',
    },
    {
      title: 'Tổng Doanh nghiệp',
      value: formatNumber(stats?.totalCodes ?? 0),
      sub: '',
      icon: <KeyOutlined style={{ fontSize: 16 }} />,
      color: 'bg-[#F44336] text-white',
    },
  ];

  return (
    <div className={cn('relative flex flex-col gap-6 pb-4')}>
      <div className={cn('absolute -top-10 right-0 h-44 w-44 rounded-full bg-[#2196F3]/10 blur-3xl')} />
      <div className={cn('absolute top-24 left-8 h-32 w-32 rounded-full bg-[#4CAF50]/10 blur-3xl')} />

      <div className={cn('relative overflow-hidden rounded-[28px] border border-white/70 bg-white px-6 py-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)]')}> 
        <div className={cn('flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between')}>
          <div>
            <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[#2196F3]/10 px-3 py-1 text-xs font-medium text-[#1976d2]')}>
              <ArrowUpOutlined />
              Tổng quan hệ thống
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
              <div className={cn('text-xs uppercase tracking-[0.18em] text-slate-400')}>Hôm nay</div>
              <div className={cn('mt-1 text-sm font-semibold text-slate-900')}>{dayjs().format(DATE_DISPLAY_FORMAT)}</div>
            </div>
            <div className={cn('rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3')}>
              <div className={cn('text-xs uppercase tracking-[0.18em] text-slate-400')}>Tổng số hoạt động</div>
              <div className={cn('mt-1 text-sm font-semibold text-slate-900')}>{formatNumber(recentActivities.length)}</div>
            </div>
            <div className={cn('rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3')}>
              <div className={cn('text-xs uppercase tracking-[0.18em] text-slate-400')}>Tỷ lệ sử dụng</div>
              <div className={cn('mt-1 text-sm font-semibold text-slate-900')}>{formatNumber(stats?.usedCodes ?? 0)}/{formatNumber(stats?.totalCodes ?? 0)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4')}>
        {statCards?.map((card) => (
          <Card
            key={card?.title}
            className={cn('overflow-hidden !rounded-[22px] border border-slate-100 shadow-[0_16px_35px_rgba(15,23,42,0.06)]')}
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
              <Text className="text-slate-500">Biểu đồ số lượng sinh viên theo khóa học</Text>
            </div>
            <div className={cn('hidden rounded-full bg-[#2196F3]/10 px-3 py-1 text-xs font-medium text-[#1976d2] sm:inline-flex')}>
              Cập nhật gần nhất
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
            <Text className="text-slate-500">Phân bổ tiến độ học tập</Text>
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
        <Card className={cn('overflow-hidden !rounded-[22px] border border-slate-100 shadow-[0_16px_35px_rgba(15,23,42,0.06)] xl:col-span-2')} loading={isLoading}>
          <div className={cn('mb-4 flex items-center justify-between')}>
            <div>
              <Title level={4} className="!mb-1 !text-slate-900">{t(getKey('recent_activities'))}</Title>
              <Text className="text-slate-500">Các hoạt động gần đây trên hệ thống</Text>
            </div>
            <div className={cn('inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500')}>
              <CalendarOutlined />
              Theo thời gian
            </div>
          </div>
          <List
            itemLayout="horizontal"
            dataSource={recentActivities}
            renderItem={(activity) => (
              <List.Item className={cn('!px-0')}>
                <List.Item.Meta
                  avatar={<div className={cn('flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#2196F3]/10')}><UserOutlined style={{ fontSize: 14 }} className="text-[#1976d2]" /></div>}
                  title={<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="font-medium text-slate-900">{activity?.userName}</div><Text className="text-sm text-slate-400">{dayjs(activity?.date).format('HH:mm')}</Text></div>}
                  description={<div className="mt-1 flex flex-wrap items-center gap-3"><div className="text-sm text-slate-500">{activity?.courseName}</div><Tag color={activity?.statusColor ?? 'blue'}>{activity?.status ?? t(getKey('info'))}</Tag></div>}
                />
              </List.Item>
            )}
          />
        </Card>

        <Card className={cn('overflow-hidden !rounded-[22px] border border-slate-100 shadow-[0_16px_35px_rgba(15,23,42,0.06)]')} loading={isLoading}>
          <div className={cn('mb-4')}>
            <Title level={4} className="!mb-1 !text-slate-900">Mốc thời gian đợt</Title>
            <Text className="text-slate-500">Các cột mốc chính của kỳ hiện tại</Text>
          </div>
          <List
            dataSource={[
            { title: 'Đăng ký công ty', date: '01/05/2026', color: 'green' },
            { title: 'Duyệt thông tin', date: '10/05/2026', color: 'green' },
            { title: 'Bắt đầu thực tập', date: '15/05/2026', color: 'gray' },
            { title: 'Nộp báo cáo cuối kỳ', date: '30/07/2026', color: 'gray' },
          ]}
            renderItem={(item) => (
              <List.Item className={cn('!px-0')}>
                <div className="flex items-start gap-3">
                  <div className={cn('mt-1 size-3 rounded-full', item.color === 'green' ? 'bg-[#4CAF50]' : 'bg-slate-300')} />
                  <div>
                    <div className="font-medium text-slate-900">{item.title}</div>
                    <div className="text-sm text-slate-500">{item.date}</div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
