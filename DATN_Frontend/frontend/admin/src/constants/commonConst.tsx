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
  CHO_CAP_GIAY: 'cho_cap_giay',
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

export function isPeriodClosedForAdmin(selectedPeriod: any): boolean {
  if (!selectedPeriod) return false;
  if (selectedPeriod.status !== STATUS_CODE.CLOSED) return false;

  // Nếu trạng thái là closed, nhưng chưa quá 7 ngày kể từ ngày kết thúc (endDate)
  const endDateStr = selectedPeriod.endDate;
  if (endDateStr) {
    const parts = endDateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      
      const closedDate = new Date(year, month, day);
      closedDate.setHours(23, 59, 59, 999);
      
      const gracePeriodEndDate = new Date(closedDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Thêm 7 ngày
      const today = new Date();
      
      if (today.getTime() <= gracePeriodEndDate.getTime()) {
        return false; // Chưa quá 1 tuần -> chưa disable
      }
    }
  }
  
  return true; // Quá 1 tuần -> disable
}
