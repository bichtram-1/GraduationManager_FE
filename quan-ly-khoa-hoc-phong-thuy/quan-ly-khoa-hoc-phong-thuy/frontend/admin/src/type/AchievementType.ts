// ===== Achievement Types =====
// Cùng pattern IBase/IList/IDetail/ICreate/IUpdate như UserType và CodeType

/** Fields chung — không export */
interface IBaseAchievement {
  name: string;
  requiredCourses: number; // số khóa học cần hoàn thành để đạt danh hiệu
}

/** Dùng khi fetch detail 1 danh hiệu */
export interface IDetailAchievement extends IBaseAchievement {
  id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Dùng cho table rows */
export interface IListAchievement extends IBaseAchievement {
  id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Body tạo mới = base fields */
export type ICreateAchievement = IBaseAchievement;

/** Body update — có thể thêm status */
export interface IUpdateAchievement extends IBaseAchievement {
  status?: string;
}
