// ===== Code Types =====
// Cùng pattern IBase/IList/IDetail/ICreate/IUpdate như UserType
// userInfo và coursesInfo dùng IValueLabel thay raw ID
// → SearchSelect với labelInValue emit đúng format này, không cần convert

import { IValueLabel } from './UserType';

/** Fields chung — không export */
interface IBaseCode {
  code: string;
  userInfo?: IValueLabel;      // user được gán code: { value: userId, label: userName }
  coursesInfo: IValueLabel[];  // danh sách khóa học: [{ value: courseId, label: courseName }]
}

/** Dùng khi fetch detail 1 code */
export interface IDetailCode extends IBaseCode {
  id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Dùng cho table rows */
export interface IListCode extends IBaseCode {// Ilistcode dùng cho lấy
  id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Body tạo mới = base fields (không có id, status, timestamps) */
export type ICreateCode = IBaseCode;

/** Body update — có thể thêm status */
export interface IUpdateCode extends IBaseCode {
  status?: string;
}
