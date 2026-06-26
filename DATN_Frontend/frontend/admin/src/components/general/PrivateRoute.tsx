import { App } from 'antd';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { STORAGES } from '@shared/constants/storage';
import { ROUTES } from '../../constants/routers';
import { getCookie, clearCookie } from '@shared/utils/cookie';
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
  const user = getCookie(STORAGES.USER_LOGIN);

  if (!token && !isPublicOnly) {
    notification.warning({
      message: t(getKey('please_login_required')),
    });
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Kiểm tra quyền truy cập Admin cho các tuyến đường private
  if (token && !isPublicOnly && user?.role !== 'admin') {
    notification.error({
      message: 'Từ chối truy cập: Bạn không có quyền truy cập trang quản trị!',
    });
    clearCookie(STORAGES.ACCESS_TOKEN);
    clearCookie(STORAGES.REFRESH_TOKEN);
    clearCookie(STORAGES.USER_LOGIN);
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (token && isPublicOnly) {
    return <Navigate to={ROUTES.USERS} replace />;
  }

  return children;
};

export default PrivateRoute;
