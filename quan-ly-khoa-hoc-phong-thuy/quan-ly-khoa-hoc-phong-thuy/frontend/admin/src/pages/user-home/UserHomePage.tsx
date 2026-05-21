import { Button, Card, Row, Col, Progress, Tag } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getKey, I18nKey } from '@shared/types/I18nKeyType';
import { COLORS } from '@shared/constants/color';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import { STORAGES } from '@shared/constants/storage';
import { clearCookie } from '@shared/utils/cookie';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routers';
import { cn } from '../../constants/commonConst';
import { formatNumber } from '@shared/utils/numberUtils';

const ACHIEVEMENT_STATUS = {
  COMPLETED: 'completed',
  CURRENT: 'current',
  PENDING: 'pending',
} as const;

const ACHIEVEMENTS: Array<{
  id: number;
  nameKey: keyof I18nKey;
  descriptionKey: keyof I18nKey;
  status: (typeof ACHIEVEMENT_STATUS)[keyof typeof ACHIEVEMENT_STATUS];
  icon: string;
  count: string;
}> = [
  {
    id: 1,
    nameKey: 'achievement_new_student_name',
    descriptionKey: 'achievement_new_student_desc',
    status: ACHIEVEMENT_STATUS.COMPLETED,
    icon: '📚',
    count: '2/1',
  },
  {
    id: 2,
    nameKey: 'achievement_expert_name',
    descriptionKey: 'achievement_expert_desc',
    status: ACHIEVEMENT_STATUS.CURRENT,
    icon: '🎓',
    count: '2/2',
  },
  {
    id: 3,
    nameKey: 'achievement_master_name',
    descriptionKey: 'achievement_master_desc',
    status: ACHIEVEMENT_STATUS.PENDING,
    icon: '👑',
    count: '2/3',
  },
];

const COURSES: Array<{
  id: number;
  titleKey: keyof I18nKey;
  descriptionKey: keyof I18nKey;
  progress: number;
}> = [
  {
    id: 1,
    titleKey: 'course_basic_fengshui_title',
    descriptionKey: 'course_basic_fengshui_desc',
    progress: 100,
  },
  {
    id: 2,
    titleKey: 'course_home_fengshui_title',
    descriptionKey: 'course_home_fengshui_desc',
    progress: 100,
  },
];

const UserHomePage = () => {
  const { t } = useTranslation();
  const { user, setUser } = useGlobalVariable();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearCookie(STORAGES.ACCESS_TOKEN);
    clearCookie(STORAGES.REFRESH_TOKEN);
    clearCookie(STORAGES.USER_LOGIN);
    setUser(undefined as never);
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className={cn('min-h-screen bg-slate-50 p-6')}>
      <div className={cn('max-w-6xl mx-auto')}>
        {/* Header */}
        <div className={cn('flex justify-between items-center mb-8')}>
          <h1 className={cn('text-2xl font-bold')}>{t(getKey('user_home_title'))}</h1>
          <div className={cn('flex gap-4 items-center')}>
            <span>{user?.email}</span>
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
              {t(getKey('logout'))}
            </Button>
          </div>
        </div>

        {/* Welcome Banner */}
        <Card
          className={cn('mb-8')}
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.chartBarStudent} 100%)`,
            borderRadius: '8px',
            color: COLORS.white,
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <div>
            <h2 className={cn('text-xl font-bold mb-2 text-white')}>
              {t(getKey('user_home_greeting'), { name: user?.email?.split('@')[0] })}
            </h2>
            <p className={cn('text-white opacity-90')}>{t(getKey('user_home_welcome_back'))}</p>
          </div>
        </Card>

        {/* Achievements Section */}
        <Card className={cn('mb-8')} title={t(getKey('achievement_system'))}>
          <p className={cn('text-gray-600 mb-4')}>
            {t(getKey('user_home_achievement_hint'))}
          </p>
          <div className={cn('space-y-3')}>
            {ACHIEVEMENTS.map((achievement) => (
              <Card
                key={achievement.id}
                size="small"
                style={{
                  borderLeft:
                    achievement.status === ACHIEVEMENT_STATUS.COMPLETED
                      ? `4px solid ${COLORS.positivePoint}`
                      : achievement.status === ACHIEVEMENT_STATUS.CURRENT
                        ? `4px solid ${COLORS.thunderBolt}`
                        : `4px solid ${COLORS.chartProgressNotStarted}`,
                  backgroundColor:
                    achievement.status === ACHIEVEMENT_STATUS.COMPLETED
                      ? COLORS.greenLight
                      : achievement.status === ACHIEVEMENT_STATUS.CURRENT
                        ? COLORS.yellowLight
                        : COLORS.grayLightest,
                }}
              >
                <div className={cn('flex justify-between items-center')}>
                  <div className={cn('flex gap-3 flex-1')}>
                    <span className={cn('text-2xl')}>{achievement.icon}</span>
                    <div className={cn('flex-1')}>
                      <p className={cn('font-bold mb-1')}>{t(getKey(achievement.nameKey))}</p>
                      <p className={cn('text-sm text-gray-600')}>{t(getKey(achievement.descriptionKey))}</p>
                    </div>
                    {achievement.status === ACHIEVEMENT_STATUS.COMPLETED && <Tag color="green">{t(getKey('achievement_status_achieved'))}</Tag>}
                    {achievement.status === ACHIEVEMENT_STATUS.CURRENT && <Tag color="orange">{t(getKey('achievement_status_current'))}</Tag>}
                  </div>
                  <span className={cn('text-gray-600 min-w-12 text-right')}>{achievement.count}</span>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Courses Section */}
        <Card title={t(getKey('your_courses'))}>
          <Row gutter={[16, 16]}>
            {COURSES.map((course) => (
              <Col xs={24} sm={12} key={course.id}>
                <Card>
                  <h4 className={cn('font-bold mb-2')}>{t(getKey(course.titleKey))}</h4>
                  <p className={cn('text-sm text-gray-600 mb-3')}>{t(getKey(course.descriptionKey))}</p>
                  <div className={cn('mb-3')}>
                    <div className={cn('flex justify-between text-sm mb-2')}>
                      <span>{t(getKey('progress_label'))}</span>
                      <span>{formatNumber(course.progress)}%</span>
                    </div>
                    <Progress percent={course.progress} />
                  </div>
                  <Button type="primary" block>
                    {t(getKey('complete_btn'))}
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default UserHomePage;
