import { I18nKey } from '@shared/types/I18nKeyType';
// Common
export const ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  USERS: '/users',
  COMPANIES: '/companies',
  TOPICS: '/topics',
  COUNCILS: '/councils',
  COUNCILS_CREATE: '/councils/create',
  ASSIGNMENTS: '/assignments',
  INTERNSHIP_STUDENTS: '/internship-students',
  PERIODS: '/periods',
  FORGOTPW: '/forgot-password',
};

type RoutePath = typeof ROUTES[keyof typeof ROUTES];

export const HEADER_TITLES: Record<RoutePath, keyof I18nKey> = {
  [ROUTES.DASHBOARD]: 'dashboard',
  [ROUTES.LOGIN]: 'login',
  [ROUTES.USERS]: 'user_management',
  [ROUTES.COMPANIES]: 'company_management',
  [ROUTES.TOPICS]: 'topic_management',
  [ROUTES.COUNCILS]: 'council_management',
  [ROUTES.PERIODS]: 'period_management',
  [ROUTES.ASSIGNMENTS]: 'assignment_management',
  [ROUTES.INTERNSHIP_STUDENTS]: 'internship_students',
  [ROUTES.FORGOTPW]: 'forgot_password_title',
};

export const DYNAMIC_ROUTES: string[] = [];
