export type CouponType = 'DISCOUNT' | 'VOUCHER' | 'GIFT';

export type CouponStatusType = 'ACTIVE' | 'USED' | 'EXPIRED' | 'INACTIVE';

export type CouponManageType = string;

export type CouponManageStatusType = string;

export type CouponRuleType = string;

export type CouponRuleStatus = 'ACTIVE' | 'INACTIVE';

export type CouponRuleCondition = string;

export type CouponRuleTriggerEvent = string;

export type CouponRuleUsedHistoryTypeStatus = string;

export type CouponAdministrationLogType = string;

export type CouponAdministrationLogActionType = string;

export interface CouponRuleUsedHistoryType {
  id: string;
  code: string;
  name: string;
  couponType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DetailCouponProps {
  id: string;
  code: string;
  name: string;
  couponType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
