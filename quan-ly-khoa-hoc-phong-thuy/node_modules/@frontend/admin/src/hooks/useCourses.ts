import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { message } from 'antd';
import i18n from 'i18next';
import { courseApi } from '../api/courseApi';
import { QueryKey } from '../constants/queryKey';
import {
  ICreateCourse,
  IDetailCourse,
  IDownloadTemplateResult,
  IListCourse,
  ILesson,
  ILessonInput,
  IUpdateCourse,
} from '../type/CourseType';
import {
  BaseListParams,
  ListResponseTypeObject,
} from '@shared/types/GeneralType';
import { saveBlob } from '@shared/utils/fileDownload';
import { getKey } from '@shared/types/I18nKeyType';

export const courseHooks = {
  useFetchListCourses: (params: BaseListParams) => {
    return useQuery({
      queryKey: [QueryKey.courses.list, params],
      queryFn: () => courseApi.getListCourses(params),
    });
  },

  useFetchDetailCourse: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.courses.detail, id],
      enabled: !!id && enabled,
      queryFn: () => courseApi.getCourseDetail(id),
    });
  },

  useFetchQuestionsByLesson: (lessonId: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.courses.detail, 'questions', lessonId],
      queryFn: () => courseApi.getQuestionsByLesson({ lessonId }),
      enabled: !!lessonId && enabled,
    });
  },

  useCreateCourse: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailCourse,
      AxiosError,
      { body: ICreateCourse; params: BaseListParams }
    >({
      mutationFn: courseApi.createCourse,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.courses.list] });
        message.success(i18n.t(getKey('create_course_success')));
      },
    });
  },

  useUpdateCourse: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailCourse,
      AxiosError,
      {
        id: string;
        body: IUpdateCourse;
        index: number;
        params: BaseListParams;
      }
    >({
      mutationFn: courseApi.updateCourse,
      // Patch the updated row directly into the paginated list cache
      // using the row index passed from FilterTable — avoids iterating all rows.
      onSuccess: (updated, { index, params }) => {
        queryClient.setQueryData<ListResponseTypeObject<IListCourse>>(
          [QueryKey.courses.list, params],
          (old) => {
            if (!old?.rows?.[index]) return old;
            const rows = [...old.rows];
            rows[index] = { ...rows[index], ...updated } as IListCourse;
            return { ...old, rows };
          }
        );
        message.success(i18n.t(getKey('update_course_success')));
      },
    });
  },

  useDeleteCourse: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailCourse,
      AxiosError,
      { id: string; params: BaseListParams }
    >({
      mutationFn: courseApi.deleteCourse,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.courses.list] });
        message.success(i18n.t(getKey('delete_course_success')));
      },
    });
  },

  // Create lessons (batch)
  useCreateLessons: () => {
    const queryClient = useQueryClient();
    return useMutation<
      ILesson[],
      AxiosError,
      { courseId: string; lessons: ILessonInput[]; params: BaseListParams }
    >({
      mutationFn: courseApi.createLessons,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.courses.list] });
        message.success(i18n.t(getKey('create_lesson_success')));
      },
    });
  },

  // Delete lesson
  useDeleteLesson: () => {
    const queryClient = useQueryClient();
    return useMutation<void, AxiosError, { id: string; params: BaseListParams }>({
      mutationFn: courseApi.deleteLesson,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.courses.list] });
        message.success(i18n.t(getKey('delete_lesson_success')));
      },
    });
  },

  // Download question template
  useDownloadQuestionTemplate: () => {
    return useMutation<
      IDownloadTemplateResult,
      AxiosError,
      { params: BaseListParams }
    >({
      mutationFn: courseApi.downloadQuestionTemplate,
      onSuccess: ({ blob, filename }) => {
        saveBlob(blob, filename || 'template-cau-hoi.xlsx');
      },
    });
  },

  // Import questions from file
  useImportQuestions: () => {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      AxiosError,
      { lessonId: string; file: File; params: BaseListParams }
    >({
      mutationFn: courseApi.importQuestions,
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.courses.list] });
        queryClient.invalidateQueries({
          queryKey: [QueryKey.courses.detail, 'questions', variables.lessonId],
        });
        message.success(i18n.t(getKey('import_questions_success')));
      },
    });
  },
};
