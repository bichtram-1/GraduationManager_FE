import { I18nKey } from '@shared/types/I18nKeyType';
// Common
export const ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  USERS: '/users',
  COMPANIES: '/companies',
  TOPICS: '/topics',
  GROUPS: '/groups',
  GROUPS_REVIEW: '/groups/review',
  GROUPS_STUDENTS: '/groups/students',
  COUNCILS: '/councils',
  COUNCILS_CREATE: '/councils/create',
  ASSIGNMENTS: '/assignments',
  STUDENT_SCORES: '/student-scores',
  CLASSES: '/classes',
  INTERNSHIP_STUDENTS: '/internship-students',
  INTERNSHIP_STUDENTS_DECLARATIONS: '/internship-students/declarations',
  INTERNSHIP_STUDENTS_NOCOMPANY: '/internship-students/no-company',
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
  [ROUTES.GROUPS]: 'group_management',
  [ROUTES.GROUPS_REVIEW]: 'group_review',
  [ROUTES.GROUPS_STUDENTS]: 'thesis_students_management',
  [ROUTES.COUNCILS]: 'council_management',
  [ROUTES.COUNCILS_CREATE]: 'council_management',
  [ROUTES.PERIODS]: 'period_management',
  [ROUTES.ASSIGNMENTS]: 'assignment_management',
  [ROUTES.STUDENT_SCORES]: 'student_score_management',
  [ROUTES.CLASSES]: 'class_management',
  [ROUTES.INTERNSHIP_STUDENTS]: 'internship_students',
  [ROUTES.INTERNSHIP_STUDENTS_DECLARATIONS]: 'internship_students_declarations',
  [ROUTES.INTERNSHIP_STUDENTS_NOCOMPANY]: 'internship_students_nocompany',
  [ROUTES.FORGOTPW]: 'forgot_password_title',
};

export const DYNAMIC_ROUTES: string[] = [];
