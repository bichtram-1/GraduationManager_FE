import { Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { matchPath, useLocation } from 'react-router-dom';
import { DYNAMIC_ROUTES, HEADER_TITLES } from '../../constants/routers';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import { getKey } from '@shared/types/I18nKeyType';
import {
  findOptionObject,
  NotAvailable,
  RoleLevel,
} from '../../constants/commonConst';
import { useMemo } from 'react';

const DefaultHeader = () => {
  const { user } = useGlobalVariable();
  const pathname = useLocation();
  const { t } = useTranslation();

  const roleUser = useMemo(
    () => findOptionObject(RoleLevel(), user?.role ?? ''),
    [user?.role]
  );

  const handleDynamicRouteTitle = () => {
    const matched = DYNAMIC_ROUTES.find((route) =>
      matchPath(route, pathname.pathname)
    );
    return matched ? HEADER_TITLES[matched] : t(getKey('unknown_page'));
  };

  const title = HEADER_TITLES[pathname.pathname] ?? handleDynamicRouteTitle();

  return (
    <div className="flex justify-center items-center w-full gap-4">
      <div className="flex-1 flex justify-between items-center border-none">
        <Flex align="center" gap={55}>
          <Typography.Title level={3} className="!mb-0">
            {t(getKey(title))}
          </Typography.Title>
        </Flex>

        <Flex align="center" gap={13}>
          {/* <LanguageSelect className='min-w-[200px]' /> */}
          <Flex vertical align="start" className="max-w-[150px] text-base">
            <p className="font-bold mb-0">{roleUser?.label || NotAvailable}</p>
            <p className="text-gray-500">{user?.name || NotAvailable}</p>
          </Flex>
        </Flex>
      </div>
    </div>
  );
};

export default DefaultHeader;
