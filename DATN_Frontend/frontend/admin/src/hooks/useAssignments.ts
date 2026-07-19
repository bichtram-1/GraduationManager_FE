import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKey } from '../constants/queryKey';
import { assignmentApi, IAssignmentListParams } from '../api/assignmentApi';
import { useGlobalVariable } from './GlobalVariableProvider';
import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateAssignment, IDetailAssignment, IUpdateAssignment } from '../type/AssignmentType';

export const assignmentHooks = {
  useFetchListAssignments: (params: IAssignmentListParams) => {
    return useQuery({
      queryKey: [QueryKey.assignments.list, params],
      queryFn: () => assignmentApi.getListAssignment(params),
    });
  },

  // Bắt buộc phải gửi periodId của đợt đang chọn, nếu không backend
  // (PhanCongHdttController::xemChiTiet) sẽ fallback về đợt tạo gần nhất trong toàn hệ
  // thống — có thể là một đợt ĐATN — khiến modal "Chi tiết phân công" TTTN hiển thị nhầm
  // thông tin nhóm/đề tài ĐATN thay vì GVHD thực tập của sinh viên.
  useFetchDetailAssignment: (id: string, enabled: boolean = true) => {
    const { selectedPeriod } = useGlobalVariable();
    return useQuery({
      queryKey: [QueryKey.assignments.detail, id, selectedPeriod?.id],
      enabled: !!id && enabled,
      queryFn: () => assignmentApi.getAssignmentDetail(id, selectedPeriod?.id),
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

  useUpdateEligibility: () => {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean; message: string }, AxiosError, { studentId: string; eligibility: 'DAT' | 'CHUA_DAT'; periodId?: string }>({
      mutationFn: ({ studentId, eligibility, periodId }) => assignmentApi.updateEligibility(studentId, eligibility, periodId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.assignments.list] });
        queryClient.invalidateQueries({ queryKey: [QueryKey.groups.list] });
      },
    });
  },
};
