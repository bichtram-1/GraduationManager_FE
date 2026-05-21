export interface IQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface ILesson {
  id: string;
  name: string;
  duration: string;
  questionCount: number;
}

// Input khi thêm bài học mới (chưa có id, questionCount)
export interface ILessonInput {
  name: string;
  youtubeUrl: string;
  duration: string;
}

export interface IDownloadTemplateResult {
  blob: Blob;
  filename?: string;
}

interface IBaseCourse {
  name: string;
  description: string;
  image: string;
}

export interface IDetailCourse extends IBaseCourse {
  id: string;
  lessons: ILesson[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IListCourse extends IBaseCourse {
  id: string;
  lessons?: ILesson[];
  createdAt?: string;
  updatedAt?: string;
}

export type ICreateCourse = IBaseCourse;

export type IUpdateCourse = Partial<IBaseCourse>;

/** @deprecated Use `IDetailCourse` instead. Kept for backwards compat. */
export type ICourseDetail = IDetailCourse;
