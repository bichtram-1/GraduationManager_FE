import enUS from 'antd/es/locale/en_US';
import koKO from 'antd/es/locale/ko_KR';
import viVN from 'antd/es/locale/vi_VN';
import { DefaultOptionType } from 'antd/es/select';

export enum LANGUAGESUPPORT {
  en = 'en',
  ko = 'ko',
  vi = 'vi',
}

export const languageOptions: DefaultOptionType[] = [
  {
    label: (
      <div className="flex items-center gap-2">
        <span className="flex-1">English</span>
        <img
          src="/images/flag-english.png"
          alt="English"
          className="aspect-square w-4 object-cover"
        />
      </div>
    ),
    flagLabel: (
      <div className="flex items-center justify-center">
        <img
          src="/images/flag-english.png"
          alt="English"
          className="aspect-square w-4 object-cover"
        />
      </div>
    ),
    value: LANGUAGESUPPORT.en,
  },
  {
    label: (
      <div className="flex items-center gap-2">
        <span className="flex-1">Korea</span>
        <img
          src="/images/flag-korea.png"
          alt="Korea"
          className="aspect-square w-4 object-cover"
        />
      </div>
    ),
    flagLabel: (
      <div className="flex justify-center items-center">
        <img
          src="/images/flag-korea.png"
          alt="Korea"
          className="aspect-square w-4 object-cover"
        />
      </div>
    ),
    value: LANGUAGESUPPORT.ko,
  },
  {
    label: (
      <div className="flex items-center gap-2">
        <span className="flex-1">Vietnamese</span>
        <img
          src="/images/flag-vietnam.png"
          alt="Vietnamese"
          className="aspect-square w-4 object-cover"
        />
      </div>
    ),
    flagLabel: (
      <div className="flex items-center justify-center">
        <img
          src="/images/flag-vietnam.png"
          alt="Vietnamese"
          className="aspect-square w-4 object-cover"
        />
      </div>
    ),
    value: LANGUAGESUPPORT.vi,
  },
];

export const localeMappings: { [key: string]: unknown } = {
  [LANGUAGESUPPORT.en]: enUS,
  [LANGUAGESUPPORT.ko]: koKO,
  [LANGUAGESUPPORT.vi]: viVN,
};

export const languagesSupport = [
  { key: LANGUAGESUPPORT.en, label: 'English' },
  { key: LANGUAGESUPPORT.ko, label: 'Korean' },
  { key: LANGUAGESUPPORT.vi, label: 'Vietnamese' },
];

export const currencySupport = [
  {
    country: 'Korea',
    symbol: '₩',
  },
  {
    country: 'Vietnam',
    symbol: '₫',
  },
];
