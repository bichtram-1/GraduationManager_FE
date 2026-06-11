import dayjs, { Dayjs } from 'dayjs';
import { DATE_FORMAT } from '../constants/commonConst';

export const stringToDatePicker = (
  dateString?: string | null
): Dayjs | undefined => {
  if (!dateString) return undefined;
  return dayjs(dateString);
};

export const datePickerToString = (date?: Dayjs | null): string | undefined => {
  if (!date) return undefined;
  return date.format(DATE_FORMAT);
};

export const prepareFormDataForSubmission = (formData: unknown) => {
  const prepared = { ...formData };

  if (prepared.startDate && dayjs.isDayjs(prepared.startDate)) {
    prepared.startDate = datePickerToString(prepared.startDate);
  }

  if (prepared.endDate && dayjs.isDayjs(prepared.endDate)) {
    prepared.endDate = datePickerToString(prepared.endDate);
  }

  return prepared;
};

export const prepareDetailDataForForm = (detail: unknown) => {
  if (!detail) return detail;

  const prepared = { ...detail };

  if (prepared.startDate && typeof prepared.startDate === 'string') {
    prepared.startDate = stringToDatePicker(prepared.startDate);
  }

  if (prepared.endDate && typeof prepared.endDate === 'string') {
    prepared.endDate = stringToDatePicker(prepared.endDate);
  }

  return prepared;
};

export const formatDate = (
  dateString?: string | null,
  format = DATE_FORMAT
): string | undefined => {
  if (!dateString) return undefined;
  return dayjs(dateString).format(format);
};

export function formatSecondsToMMSS(
  totalSeconds: number | string | null | undefined
): string {
  const s = Number(totalSeconds);
  if (!Number.isFinite(s) || s < 0) return '00:00';

  const minutes = Math.floor(s / 60);
  const seconds = Math.floor(s % 60); // bỏ phần thập phân nếu có

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

export const toMinutes = (hhmm?: string) => {
  if (!hhmm) return NaN;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
