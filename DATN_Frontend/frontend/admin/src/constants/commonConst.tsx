import i18n from 'i18next';
import { getKey } from '@shared/types/I18nKeyType';
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BaseListParams, OptionType } from '@shared/types/GeneralType';




export const NUMBER_FORMAT = '0,0[.]0';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATE_DISPLAY_FORMAT = 'DD/MM/YYYY';
export const TIME_FORMAT = 'HH:mm';
export const DATE_TIME_FORMAT = 'MMMM D, YYYY, h:mm:ss A';

export const DEFAULT_PASSWORD = '123456aA@';

export const STATUS_CODE = {
  ACTIVE: 'active',
  ACTIVE_UP: 'ACTIVE',
  INACTIVE: 'inactive',
  DELETED: 'deleted',
  DRAFT: 'draft',
  PENDING: 'pending',
  PENDING_UP: 'PENDING',
  APPROVED: 'approved',
  APPROVED_UP: 'APPROVED',
  REJECTED: 'rejected',
  PAUSED: 'paused',
  USED: 'used',
  SUCCESS: 'success',
  OPEN: 'open',
  PUBLISHED: 'published',
  GRADING: 'grading',
  CLOSED: 'closed',
  FINALIZED: 'finalized',
  REVIEWING: 'reviewing',
  DISSOLVED: 'DISSOLVED',
  WARNING: 'WARNING',
  MISSING: 'MISSING',
  LOCKED: 'LOCKED',
  NOT_REGISTERED: 'not_registered',
  SEARCHING: 'searching',
  HAS_COMPANY: 'has_company',
  ASSIGNED: 'assigned',
  UNASSIGNED: 'unassigned',
  AVAILABLE: 'available',
  FULL: 'full',
} as const;

export const USER_ROLE = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

export const initSearchParams: BaseListParams = {
  page: 1,
  limit: 100,
};

export const NotAvailable = "-";

export function getMessage(key: string): string {
  return i18n.t(key);
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const findOptionObject = (arr: OptionType[], value : string | undefined) => {
  if (!value) return;
  return arr.find(item => item.value === value);
}

export const configSuccess = () => {
  return {
    message: getMessage(getKey("config_success_message")),
  };
};

export const configErr = () => {
  return {
    message: getMessage(getKey("config_error_message")),
  };
};

export const messRequired = () => getMessage(getKey("mess_required"));
export const messInvalid = () => getMessage(getKey("mess_invalid"));
export const messPassword = () => getMessage(getKey("mess_password"));
export const messPhone = () => getMessage(getKey("mess_phone"));
export const messPdf = () => getMessage(getKey("mess_pdf"));
export const messImage = () => getMessage(getKey("mess_image"));

export const RoleLevel = () => [
  { value: USER_ROLE.ADMIN, label: getMessage(getKey('admin')) },
  { value: USER_ROLE.TEACHER, label: getMessage(getKey('teacher_role')) },
  { value: USER_ROLE.STUDENT, label: getMessage(getKey('student_role')) },
];

export const BrandCountryKorea = () => ({ value: 'KR', label: 'Korea' });
export const BrandCountryVietnam = () => ({ value: 'VN', label: 'Vietnam' });



