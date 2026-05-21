import { NotAvailable } from '../constants/commonConst';
import { LANGUAGESUPPORT } from '../constants/languages';
import numeral from '../lib/numeral';

const FORMAT_PRICE_NUMBER = {
  [LANGUAGESUPPORT.en]: '$0,0[.]00',
  [LANGUAGESUPPORT.ko]: '$0,0',
  [LANGUAGESUPPORT.vi]: '0,0 $',
};

export const priceFormat = (
  number: unknown,
  language: LANGUAGESUPPORT = LANGUAGESUPPORT.en
): string | undefined => {
  if (number == null) return; // kiểm tra nếu number truyền vào là null hoặc undefined
  numeral.locale(language);
  return numeral(number).format(FORMAT_PRICE_NUMBER[language]);
};

export const formatNumber = (number: unknown): string => {
  if (number == null) return NotAvailable; // kiểm tra nếu number truyền vào là null hoặc undefined
  return numeral(number).format('0[,]0');
};
