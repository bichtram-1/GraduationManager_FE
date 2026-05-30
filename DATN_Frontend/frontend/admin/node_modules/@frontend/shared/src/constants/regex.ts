export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export const USERNAME_PATTERN = /^[a-zA-Z0-9]+$/;

export const PHONE_PATTERN = /^\d{10,}$/;

export const INPUTNUMBER_FORMATER = /B(?=(\d{3})+(?!\d))/g;
// xoá tất cả các ký tự không phải số
export const INPUTNUMBER_PARSER = /D/g;

export const CHAR_PATTERN = /^[a-zA-Z]+$/;

export const COUPON_CODE_PATTERN = /^[A-Z0-9_-]{4,20}$/;
