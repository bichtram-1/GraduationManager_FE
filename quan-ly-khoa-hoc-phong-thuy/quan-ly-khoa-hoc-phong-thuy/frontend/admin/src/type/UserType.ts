// ===== User Types =====
// Pattern: tách IBase (private) + IList + IDetail + ICreate + IUpdate
// → mỗi interface chỉ chứa đúng fields cần cho từng use-case
// → TypeScript bắt lỗi nếu truyền sai type vào sai chỗ

/** Dùng cho selector references: SearchSelect emit { value, label } thay raw ID */
export interface IValueLabel {
  value: string;
  label: string;
}

/** Fields chung cho tất cả user interfaces — không export (chỉ dùng làm base) */
interface IBaseUser {
  email: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
  achievement?: IValueLabel; // IValueLabel thay string ID — dùng được trực tiếp trong SearchSelect
}

/** Dùng khi fetch detail 1 user (modal edit/detail) */
export interface IDetailUser extends IBaseUser {
  id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Dùng cho table rows (list API response) */
export interface IListUser extends IBaseUser {
  id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Body gửi lên khi tạo user mới — bắt buộc có password */
export interface ICreateUser extends IBaseUser {
  password: string;
}

/** Body gửi lên khi update user — password không gửi (reset qua API riêng) */
export interface IUpdateUser extends IBaseUser {
  status?: string;
}
