import i18n from 'i18next';
import { getKey } from '../types/I18nKeyType';
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BaseListParams, OptionType } from '../types/GeneralType';

export const NUMBER_FORMAT = '0,0[.]0';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm';
export const DATE_TIME_FORMAT = 'MMMM D, YYYY, h:mm:ss A';

export const initSearchParams: BaseListParams = {
  page: 1,
  limit: 10,
};

export const NotAvailable = '-';

export function getMessage(key: string): string {
  return i18n.t(key);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const findOptionObject = (
  arr: OptionType[],
  value: string | undefined
) => {
  if (!value) return;
  return arr.find((item) => item.value === value);
};

export const configSuccess = () => {
  return {
    message: getMessage(getKey('config_success_message')),
  };
};

export const configErr = () => {
  return {
    message: getMessage(getKey('config_error_message')),
  };
};

export const messRequired = () => getMessage(getKey('mess_required'));
export const messInvalid = () => getMessage(getKey('mess_invalid'));
export const messPassword = () => getMessage(getKey('mess_password'));
export const messPhone = () => getMessage(getKey('mess_phone'));
export const messPdf = () => getMessage(getKey('mess_pdf'));
export const messImage = () => getMessage(getKey('mess_image'));

export const messVideo = 'Can only upload video files';
export const messFileSize = 'Only files not exceeding ';
export const messFileMaxCount = 'Cannot upload more than ';
export const messOrientation =
  'The uploaded file has an incorrect orientation. Please rotate it to the correct format and try again';
export const messLength = 'The characters of this field should be only';
export const messChar = 'This field must is characters';
export const WHITESPACE_ERROR_MESSAGE =
  'Invalid format - contains leading or trailing whitespace';
