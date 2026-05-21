import { IDownloadTemplateResult, ICourseDetail, ILesson, ILessonInput, IQuestion } from '../type/CourseType';
import { BaseListParams } from '@shared/types/GeneralType';
import axiosInstance from './axiosInstance';
import { getFilenameFromContentDisposition } from '@shared/utils/fileDownload';

export const courseApi = {
  getListCourses: async (params: BaseListParams): Promise<{ rows: ICourseDetail[]; total: number }> => {
    const response = await axiosInstance.get('/private/v1/courses', { params });
    const rows = response.data?.results?.objects?.rows;
    const total = response.data?.results?.objects?.total;
    return {
      rows: Array.isArray(rows) ? rows : [],
      total: Number(total) || 0,
    };
  },

  getCourseDetail: async (id: string): Promise<ICourseDetail> => {
    const response = await axiosInstance.get(`/private/v1/courses/${id}`);
    return response.data?.results?.object;
  },

  createCourse: async ({ body }: { body: Partial<ICourseDetail>; params: BaseListParams }): Promise<ICourseDetail> => {
    const response = await axiosInstance.post('/private/v1/courses', body);
    return response.data?.results?.object;
  },

  updateCourse: async ({ id, body }: { id: string; body: Partial<ICourseDetail>; params: BaseListParams }): Promise<ICourseDetail> => {
    if (USE_MOCK_COURSE_API) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ id, ...body } as ICourseDetail), MOCK_DELAY);
      });
    }

    const response = await axiosInstance.patch(`/private/v1/courses/${id}`, body);
    return response.data?.results?.object;
  },

  deleteCourse: async ({ id }: { id: string; params: BaseListParams }): Promise<ICourseDetail> => {
    const response = await axiosInstance.delete(`/private/v1/courses/${id}`);
    return response.data;
  },

  createLessons: async ({ courseId, lessons }: { courseId: string; lessons: ILessonInput[]; params: BaseListParams }): Promise<ILesson[]> => {
    const response = await axiosInstance.post(`/private/v1/courses/${courseId}/lessons`, { lessons });
    const createdLessons = response.data?.results?.objects?.rows || response.data?.results?.object;
    return Array.isArray(createdLessons) ? createdLessons : [];
  },

  getQuestionsByLesson: async ({ lessonId }: { lessonId: string }): Promise<IQuestion[]> => {
    const response = await axiosInstance.get(`/private/v1/lessons/${lessonId}/questions`);
    const questions =
      response.data?.results?.objects?.rows ||
      response.data?.results?.objects?.object ||
      response.data?.results?.object;
    return Array.isArray(questions) ? questions : [];
  },

  deleteLesson: async ({ id }: { id: string; params: BaseListParams }): Promise<void> => {
    await axiosInstance.delete(`/private/v1/lessons/${id}`);
  },

  downloadQuestionTemplate: async ({
    params: _params,
  }: {
    params: BaseListParams;
  }): Promise<Blob> => {
    if (USE_MOCK_COURSE_API) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(new Blob([COURSE_TEMPLATE_CSV], { type: 'text/csv' })), MOCK_DELAY);
      });
    }

    const response = await axiosInstance.get('/private/v1/questions/template/download', { responseType: 'blob' });
    return response.data;
  },
};
