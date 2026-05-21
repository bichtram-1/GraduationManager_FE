import i18n from 'i18next';
import { getKey } from '@shared/types/I18nKeyType';
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BaseListParams, OptionType } from '@shared/types/GeneralType';

import {
  BulbOutlined,
  CrownOutlined,
  StarOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

export const NUMBER_FORMAT = '0,0[.]0';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATE_DISPLAY_FORMAT = 'DD/MM/YYYY';
export const TIME_FORMAT = 'HH:mm';
export const DATE_TIME_FORMAT = 'MMMM D, YYYY, h:mm:ss A';

export const DEFAULT_PASSWORD = '123456aA@';

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
    // description: getMessage(getKey.ConfigSuccessDes),
  };
};

export const configErr = () => {
  return {
    message: getMessage(getKey("config_error_message")),
    // description: getMessage(getKey.ConfigErrorDes),
  };
};

export const messRequired = () => getMessage(getKey("mess_required"));
export const messInvalid = () => getMessage(getKey("mess_invalid"));
export const messPassword = () => getMessage(getKey("mess_password"));
export const messPhone = () => getMessage(getKey("mess_phone"));
export const messPdf = () => getMessage(getKey("mess_pdf"));
export const messImage = () => getMessage(getKey("mess_image"));

export function getSelectGradeOptions() {
  return [
    {
      value: 'BRONZE',
      label: getMessage(getKey("bronze")),
      subLabel: getMessage(getKey("tier_1")),
      color: "orange",
      icon: <BulbOutlined />
    },
    {
      value: 'SILVER',
      label: getMessage(getKey("silver")),
      subLabel: getMessage(getKey("tier_2")),
      color: "silver",
      icon: <StarOutlined />
    },
    {
      value: 'GOLD',
      label: getMessage(getKey("gold")),
      subLabel: getMessage(getKey("tier_3")),
      color: "gold",
      icon: <CrownOutlined />
    },
    {
      value: 'PLATINUM',
      label: getMessage(getKey("platinum")),
      subLabel: getMessage(getKey("tier_4")),
      color: "purple",
      icon: <TrophyOutlined />
    },
  ];
}

export const AllOption = () => ({ label: getMessage(getKey("all")), value: null });

export const messVideo = 'Can only upload video files';

export const messFileSize = 'Only files not exceeding ';

export const messFileMaxCount = 'Cannot upload more than ';

export const messOrientation =
  'The uploaded file has an incorrect orientation. Please rotate it to the correct format and try again';

export const messLength = 'The characters of this field should be only';

export const messChar = 'This field must is characters';

export const WHITESPACE_ERROR_MESSAGE =
  'Invalid format - contains leading or trailing whitespace';

export const RoleAdmin = () => ({
  value: 'SUPERADMIN' as const,
  label: getMessage(getKey("admin")),
  color: "blue"
})

export const RoleBrandOwner = () => ({
  value: 'BRAND_OWNER' as const,
  label: getMessage(getKey("brand_owner")),
  color: "purple"
})

export const RoleGasStationOwner = () => ({
  value: 'GAS_STATION_OWNER' as const,
  label: getMessage(getKey("gas_station_owner")),
  color: "purple"
})

export const RoleLevel = () => ([
  RoleAdmin(),
  RoleBrandOwner(),
  RoleGasStationOwner(),
]) as const satisfies Array<{ label: string; value: UserRole; color: string }>;

export const ActiveStatus = () => ({
  label: getMessage(getKey("active")),
  value: "ACTIVE" as const,
  color: 'green',
  nextStep: () => [ ActiveStatus(), InactiveStatus() ]
})

export const InactiveStatus = () => ({
  label: getMessage(getKey("inactive")),
  value: "INACTIVE" as const,
  color: 'red',
  nextStep: () => [ InactiveStatus() , ActiveStatus() ]
})

export const PendingStatus = () => ({
  label: getMessage(getKey("blocked")),
  value: "BLOCKED" as const,
  color: 'orange',
  nextStep: () => [ PendingStatus(), ActiveStatus() ]
})

export const AccountStatusOptions = () => [
  ActiveStatus(),
  InactiveStatus(),
  PendingStatus(),
] as const satisfies Array<{ label: string; value: AccountStatus; color: string }>;

export const BrandCountryVietnam = () => ({
  label: "Vietnam",
  value: "Vietnam" as const,
})

export const BrandCountryKorea = () => ({
  label: "Korea",
  value: "Korea" as const,
})

export const BrandActiveOption = () => ({ label: getMessage(getKey("active")), value: true })
export const BrandInactiveOption = () => ({ label: getMessage(getKey("inactive")), value: false })

export const BrandStatusOptions = () => [
  BrandActiveOption(),
  BrandInactiveOption(),
]

export type UserRole = 'SUPERADMIN' | 'BRAND_OWNER' | 'GAS_STATION_OWNER';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export const CouponTypeOptions = () => [
  { label: getMessage(getKey("discount")), value: 'DISCOUNT', color: 'blue' },
  { label: getMessage(getKey("voucher")), value: 'VOUCHER', color: 'green' },
  { label: getMessage(getKey("gift")), value: 'GIFT', color: 'purple' },
];

export const CouponStatusOptions = () => [
  { label: getMessage(getKey("active")), value: 'ACTIVE', color: 'green' },
  { label: getMessage(getKey("used")), value: 'USED', color: 'blue' },
  { label: getMessage(getKey("expired")), value: 'EXPIRED', color: 'red' },
  { label: getMessage(getKey("inactive")), value: 'INACTIVE', color: 'gray' },
];

export const TransactionPaymentMethodOptions = () => [
  { label: getMessage(getKey("cash")), value: 'CASH', color: 'green' },
  { label: getMessage(getKey("card")), value: 'CARD', color: 'blue' },
  { label: getMessage(getKey("transfer")), value: 'TRANSFER', color: 'purple' },
  { label: getMessage(getKey("other")), value: 'OTHER', color: 'default' },
];

export const PointActivityOptions = () => [
  { label: getMessage(getKey("accumulate_point")), value: 'ACCUMULATE', color: 'green' },
  { label: getMessage(getKey("redeem_point")), value: 'REDEEM', color: 'orange' },
];

export const getStaffRoleOptions = () => [
  RoleAdmin(),
  RoleBrandOwner(),
  RoleGasStationOwner(),
];

export const IMAGE_FALLBACK = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTI4IDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iODAiIGZpbGw9IiNFOEVDRjAiLz48dGV4dCB4PSI2NCIgeT0iNDQiIGZvbnQtZmFtaWx5PSJJbnRlciIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzlDQTNCOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+`;

export const CenterMapDefault = {
  vi: { lat: 10.7769, lng: 106.7009 },
  ko: { lat: 37.5665, lng: 126.978 },
  en: { lat: 37.7749, lng: -122.4194 },
};

