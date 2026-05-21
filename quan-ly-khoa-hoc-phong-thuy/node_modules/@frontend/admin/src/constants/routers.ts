import { I18nKey } from '@shared/types/I18nKeyType';
// Common
export const ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  USERS: '/users',
  PERIODS: '/periods',
  COURSES: '/courses',
  CODES: '/codes',
  FORGOTPW: '/forgot-password',
  ACHIEVEMENTS: '/achievements',
};

type RoutePath = typeof ROUTES[keyof typeof ROUTES];

export const HEADER_TITLES: Record<RoutePath, keyof I18nKey> = {
  [ROUTES.DASHBOARD]: 'dashboard',
  [ROUTES.LOGIN]: 'login',
  [ROUTES.USERS]: 'user_management',
  [ROUTES.COURSES]: 'course_management',
  [ROUTES.CODES]: 'code_management',
  [ROUTES.FORGOTPW]: 'forgot_password_title',
  [ROUTES.ACHIEVEMENTS]: 'achievement_management',
};

export const DYNAMIC_ROUTES: string[] = [];
