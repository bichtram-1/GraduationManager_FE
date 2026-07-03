import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKey } from '../constants/queryKey';
import { assignmentApi, IAssignmentListParams } from '../api/assignmentApi';
import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateAssignment, IDetailAssignment, IUpdateAssignment } from '../type/AssignmentType';

export const assignmentHooks = {
  useFetchListAssignments: (params: IAssignmentListParams) => {
    return useQuery({
      queryKey: [QueryKey.assignments.list, params],
      queryFn: () => assignmentApi.getListAssignment(params),
    });
  },

  useFetchDetailAssignment: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.assignments.detail, id],
      enabled: !!id && enabled,
      queryFn: () => assignmentApi.getAssignmentDetail(id),
    });
  },

  useCreateAssignment: () => {
    const queryClient = useQueryClient();
    return useMutation<IDetailAssignment, AxiosError, { body: ICreateAssignment; params: BaseListParams }>({
      mutationFn: assignmentApi.createAssignment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.assignments.list] });
      },
    });
  },

  useUpdateAssignment: () => {
    const queryClient = useQueryClient();
    return useMutation<IDetailAssignment, AxiosError, { id: string; body: IUpdateAssignment; index: number; params: BaseListParams }>({
      mutationFn: assignmentApi.updateAssignment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.assignments.list] });
      },
    });
  },

  useDeleteAssignment: () => {
    const queryClient = useQueryClient();
    return useMutation<unknown, AxiosError, { id: string; params: BaseListParams }>({
      mutationFn: assignmentApi.deleteAssignment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.assignments.list] });
      },
    });
  },

  usePublishAssignments: () => {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean; message: string; results?: { publishedCount: number } }, AxiosError, string | undefined>({
      mutationFn: (periodId) => assignmentApi.publishAssignments(periodId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.assignments.list] });
      },
    });
  },

  useFetchTeachers: (periodId?: string) => {
    return useQuery({
      queryKey: ['assignmentsTeachers', periodId],
      queryFn: () => assignmentApi.getTeachers(periodId),
    });
  },
};
