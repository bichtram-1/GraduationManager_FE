import { Menu, MenuProps, Button, Flex } from 'antd';
import {
  BankOutlined,
  CrownOutlined,
  BookOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SolutionOutlined,
  UserOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routers';
import { cn } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import { clearCookie } from '@shared/utils/cookie';
import { STORAGES } from '@shared/constants/storage';

type TMenuItem = Required<MenuProps>['items'][number];

type TMenuNode = {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: TMenuNode[];
  visible?: boolean;
};

interface IDefaultNavigate {
  collapsed: boolean;
  onToggle: () => void;
}

const DefaultNavigate = ({ collapsed, onToggle }: IDefaultNavigate) => {
  const [selectItem, setSelectItem] = useState<string>('');
  const navigate = useNavigate();
  const pathname = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (!pathname) return;
    setSelectItem(pathname?.pathname);
  }, [pathname]);

  const handleLogout = () => {
    clearCookie(STORAGES.ACCESS_TOKEN);
    clearCookie(STORAGES.REFRESH_TOKEN);
    clearCookie(STORAGES.USER_LOGIN);
    navigate(ROUTES.LOGIN);
  };

  const menuConfig: TMenuNode[] = [
    // {
    //   key: ROUTES.DASHBOARD,
    //   label: t(getKey("dashboard")),
    //   icon: <MdOutlineSpaceDashboard size={20} />,
    // },
    {
      key: ROUTES.DASHBOARD,
      label: t(getKey('dashboard')),
      icon: <DashboardOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: ROUTES.PERIODS,
      label: t(getKey('period_management')),
      icon: <DashboardOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: ROUTES.USERS,
      label: t(getKey('user_management')),
      icon: <UserOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: ROUTES.CLASSES,
      label: 'Quản lý lớp',
      icon: <BookOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: ROUTES.COMPANIES,
      label: t(getKey('company_management')),
      icon: <BankOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: ROUTES.TOPICS,
      label: t(getKey('topic_management')),
      icon: <BookOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: ROUTES.ASSIGNMENTS,
      label: t(getKey('assignment_management')),
      icon: <CrownOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: ROUTES.COUNCILS,
      label: t(getKey('council_management')),
      icon: <TeamOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: ROUTES.INTERNSHIP_STUDENTS,
      label: t(getKey('internship_students')),
      icon: <SolutionOutlined style={{ fontSize: 20 }} />,
      children: [
        { key: ROUTES.INTERNSHIP_STUDENTS_DECLARATIONS, label: t(getKey('internship_students_declarations')) },
        { key: ROUTES.INTERNSHIP_STUDENTS_NOCOMPANY, label: t(getKey('internship_students_nocompany')) },
        { key: ROUTES.INTERNSHIP_STUDENTS_SCORES, label: t(getKey('internship_score_management')) },
      ],
    },
    {
      key: 'group_management_parent',
      label: t(getKey('group_management')),
      icon: <TeamOutlined style={{ fontSize: 20 }} />,
      children: [
        { key: ROUTES.GROUPS, label: t(getKey('group_list')) },
        { key: ROUTES.GROUPS_REVIEW, label: t(getKey('group_review')) },
        { key: ROUTES.GROUPS_STUDENTS, label: t(getKey('thesis_students_management')) || 'Danh sách sinh viên ĐATN' },
        { key: ROUTES.GROUPS_SCORES, label: t(getKey('project_score_management')) },
      ],
    },
    // Courses menu removed
    // Achievements menu removed
  ];

  const items: TMenuItem[] = menuConfig.map((item) => {
    if (item.visible === false) return null;
    const filterChildren = item.children?.filter(
      (child) => child.visible !== false
    );
    return {
      key: item.key,
      label: item.label,
      icon: item.icon,
      children: filterChildren,
      onClick: (info) => {
        const route = info?.keyPath?.[0];
        navigate(route);
      },
    };
  });

  return (
    <div className={cn('flex h-full flex-col bg-white')}>
      {/* Header */}
      <Flex
        gap={16}
        align="center"
        justify="space-between"
        className={cn('relative p-6')}
      >
        {!collapsed && (
          <Flex vertical>
            <div className={cn('text-xl font-bold leading-7 text-navyDark')}>
              {t(getKey('admin_panel'))}
            </div>
            <div className={cn('text-base leading-5 text-grayDark')}>
              {t(getKey('admin'))}
            </div>
          </Flex>
        )}

        <Button
          type="text"
          size="large"
          onClick={onToggle}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          className={cn(
            'h-8 w-8 px-2 items-center justify-center rounded-lg text-blackSoft hover:bg-bgAdvanceSection'
          )}
        />
      </Flex>

      {/* Navigation */}
      <div className={cn('flex-1 overflow-y-auto px-4 pt-4')}>
        <Menu
          mode="inline"
          items={items}
          selectedKeys={[selectItem]}
          className={cn('sidebar-light-menu border-none')}
          inlineCollapsed={collapsed}
        />
      </div>

      {/* Logout button */}
      <div className={cn('border-t border-blackLight p-4')}>
        <Button
          type="text"
          danger
          icon={<LogoutOutlined className={cn('text-xl')} />}
          onClick={handleLogout}
          className={cn(
            'flex h-10 w-full items-center justify-start gap-3 rounded-lg pl-4 text-base font-medium'
          )}
        >
          {!collapsed && t(getKey('logout'))}
        </Button>
      </div>
    </div>
  );
};

export default React.memo(DefaultNavigate);
