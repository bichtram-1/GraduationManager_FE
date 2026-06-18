import { App } from 'antd';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { STORAGES } from '@shared/constants/storage';
import { ROUTES } from '../../constants/routers';
import { getCookie } from '@shared/utils/cookie';
import { getKey } from '@shared/types/I18nKeyType';

const PrivateRoute = ({
  children,
  isPublicOnly = false,
}: {
  children: React.ReactNode;
  isPublicOnly?: boolean;
}) => {
  const { notification } = App.useApp();
  const { t } = useTranslation();
  const token = getCookie(STORAGES.ACCESS_TOKEN);

  if (!token && !isPublicOnly) {
    notification.warning({
      message: t(getKey('please_login_required')),
    });
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (token && isPublicOnly) {
    return <Navigate to={ROUTES.USERS} replace />;
  }

  return children;
};

export default PrivateRoute;
