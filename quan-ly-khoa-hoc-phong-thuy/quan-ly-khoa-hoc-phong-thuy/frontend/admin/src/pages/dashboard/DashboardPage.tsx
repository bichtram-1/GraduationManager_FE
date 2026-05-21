import { Card, Flex, Typography, Tag, List } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { cn, DATE_DISPLAY_FORMAT } from '../../constants/commonConst';
import {
  BookOutlined,
  KeyOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  UserOutlined,
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
      color: 'text-blue-500 bg-blue-50',
    },
    {
      title: t(getKey('total_courses')),
      value: formatNumber(stats?.totalCourses ?? 0),
      sub: String(t(getKey('total_courses_sub'), { count: formatNumber(stats?.totalLessons ?? 0) } as Record<string, unknown>)),
      icon: <BookOutlined style={{ fontSize: 16 }} />,
      color: 'text-green-500 bg-green-50',
    },
    {
      title: t(getKey('total_questions')),
      value: formatNumber(stats?.totalQuestions ?? 0),
      sub: t(getKey('total_questions_sub')),
      icon: <QuestionCircleOutlined style={{ fontSize: 16 }} />,
      color: 'text-orange-500 bg-orange-50',
    },
    {
      title: t(getKey('total_activation_codes')),
      value: formatNumber(stats?.totalCodes ?? 0),
      sub: String(t(getKey('total_activation_codes_sub'), { count: formatNumber(stats?.usedCodes ?? 0) } as Record<string, unknown>)),
      icon: <KeyOutlined style={{ fontSize: 16 }} />,
      color: 'text-red-500 bg-red-50',
    },
  ];

  return (
    <div className={cn('flex flex-col gap-8')}>
      {/* Page Header */}
      <div>
        <Title level={2} className="!mb-1">
          {t(getKey('dashboard'))}
        </Title>
        <Text className="text-gray-500">
          {t(getKey('dashboard_subtitle'))}
        </Text>
      </div>

      {/* Stat Cards - single row responsive */}
      <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4')}>
        {statCards?.map((card) => (
          <Card
            key={card?.title}
            className={cn('!rounded-[10px] border border-gray-200 shadow-sm p-5')}
            loading={isLoading}
          >
            <div className={cn('flex items-center justify-between')}>
              <div>
                <Text className="text-xs font-medium text-gray-500">{card?.title}</Text>
                <div className="mt-2">
                  <Text className="!text-3xl !font-bold">{card?.value}</Text>
                </div>
                <Text className="text-xs text-gray-400">{card?.sub}</Text>
              </div>

              <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', card?.color)}>
                {card?.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts and main content */}
      <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-3')}>
        {/* Bar Chart */}
        <Card className={cn('!rounded-[10px] border border-gray-200 shadow-sm lg:col-span-2')} loading={isLoading}>
          <ColumnChart
            title={t(getKey('students_per_course'))}
            categories={studentsPerCourse?.map((item) => item?.courseName)}
            series={[
              {
                name: t(getKey('students_legend')),
                data: studentsPerCourse?.map((item) => item?.studentCount),
                color: COLORS.chartBarStudent,
              },
            ]}
            height={300}
            showLegend
            yLabelFormatter={(v) => formatNumber(Math.round(v))}
          />
        </Card>

        {/* Pie Chart */}
        <Card className={cn('!rounded-[10px] border border-gray-200 shadow-sm')} loading={isLoading}>
          <PieChart
            title={t(getKey('learning_progress'))}
            data={learningProgress?.map((item) => ({
              label: item?.label,
              value: item?.value,
              color: item?.color,
            }))}
            height={300}
            showLegend
          />
        </Card>
      </div>
      {/* Recent Activities + Timeline */}
      <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-3 mt-6')}>
        <Card className={cn('!rounded-[10px] border border-gray-200 shadow-sm lg:col-span-2')} loading={isLoading}>
          <Title level={4} className="!mb-4">{t(getKey('recent_activities'))}</Title>
          <List
            itemLayout="horizontal"
            dataSource={recentActivities}
            renderItem={(activity) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<div className={cn('flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100')}><UserOutlined style={{ fontSize: 14 }} className="text-blue-500" /></div>}
                  title={<div className="flex justify-between items-center w-full"><div className="font-medium">{activity?.userName}</div><Text className="text-sm text-gray-400">{dayjs(activity?.date).fromNow ? dayjs(activity?.date).format('HH:mm') : dayjs(activity?.date).format(DATE_DISPLAY_FORMAT)}</Text></div>}
                  description={<div className="flex items-center gap-3"><div className="text-sm text-gray-500">{activity?.courseName}</div><Tag color={activity?.statusColor ?? 'blue'}>{activity?.status ?? t(getKey('info'))}</Tag></div>}
                />
              </List.Item>
            )}
          />
        </Card>

        <Card className={cn('!rounded-[10px] border border-gray-200 shadow-sm')} loading={isLoading}>
          <Title level={4} className="!mb-4">Mốc thời gian đợt</Title>
          <List dataSource={[
            { title: 'Đăng ký công ty', date: '01/05/2026', color: 'green' },
            { title: 'Duyệt thông tin', date: '10/05/2026', color: 'green' },
            { title: 'Bắt đầu thực tập', date: '15/05/2026', color: 'gray' },
            { title: 'Nộp báo cáo cuối kỳ', date: '30/07/2026', color: 'gray' },
          ]} renderItem={(item) => (
            <List.Item>
              <div className="flex items-start gap-3">
                <div className={cn('w-3 h-3 rounded-full mt-1', item.color === 'green' ? 'bg-green-500' : 'bg-gray-300')} />
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.date}</div>
                </div>
              </div>
            </List.Item>
          )} />
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
