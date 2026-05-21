import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export const isPhoneValid = (phone: string) => {
  try {
    return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
  } catch {
    return false;
  }
};

export function formatPhone(raw?: string, region: string = 'VN') {
  if (!raw) return '';
  try {
    const n = phoneUtil.parseAndKeepRawInput(raw, region);
    return phoneUtil.format(n, PhoneNumberFormat.INTERNATIONAL); // "+84 90 123 4567"
  } catch {
    return raw;
  }
}
