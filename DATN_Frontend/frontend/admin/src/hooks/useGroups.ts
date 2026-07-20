import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKey } from '../constants/queryKey';
import { groupApi } from '../api/groupApi';
import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateGroup, IDetailGroup, IUpdateGroup } from '../type/GroupType';

export const groupHooks = {
  useFetchListGroups: () => {
    return useQuery({
      queryKey: [QueryKey.groups.list],
      queryFn: () => groupApi.getListGroup(),
    });
  },

  useFetchDetailGroup: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.groups.detail, id],
      enabled: !!id && enabled,
      queryFn: () => groupApi.getGroupDetail(id),
    });
  },

  useCreateGroup: () => {
    const queryClient = useQueryClient();
    return useMutation<IDetailGroup, AxiosError, { body: ICreateGroup; params: BaseListParams }>({
      mutationFn: groupApi.createGroup,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.groups.list] });
      },
    });
  },

  useUpdateGroup: () => {
    const queryClient = useQueryClient();
    return useMutation<IDetailGroup, AxiosError, { id: string; body: IUpdateGroup; index: number; params: BaseListParams }>({
      mutationFn: groupApi.updateGroup,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.groups.list] });
        if (variables?.id) {
          queryClient.invalidateQueries({ queryKey: [QueryKey.groups.detail, variables.id] });
        }
        // Cập nhật nhóm có thể kèm hoán đổi thành viên (swapStudentIdA/B), ảnh hưởng tới nhóm
        // đối phương - làm mới luôn danh sách phân công để không hiển thị dữ liệu cũ.
        queryClient.invalidateQueries({ queryKey: [QueryKey.assignments.list] });
      },
    });
  },

  useDeleteGroup: () => {
    const queryClient = useQueryClient();
    return useMutation<unknown, AxiosError, { id: string; params: BaseListParams }>({
      mutationFn: groupApi.deleteGroup,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.groups.list] });
      },
    });
  },

  useApproveGroup: () => {
    const queryClient = useQueryClient();
    return useMutation<IDetailGroup, AxiosError, { id: string }>(
      {
        mutationFn: ({ id }: { id: string }) => groupApi.approveGroup({ id }),
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({ queryKey: [QueryKey.groups.list] });
          if (variables?.id) queryClient.invalidateQueries({ queryKey: [QueryKey.groups.detail, variables.id] });
        },
      }
    );
  },

  useRejectGroup: () => {
    const queryClient = useQueryClient();
    return useMutation<IDetailGroup, AxiosError, { id: string }>(
      {
        mutationFn: ({ id }: { id: string }) => groupApi.rejectGroup({ id }),
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({ queryKey: [QueryKey.groups.list] });
          if (variables?.id) queryClient.invalidateQueries({ queryKey: [QueryKey.groups.detail, variables.id] });
        },
      }
    );
  },

  useSwapMembers: () => {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean; message: string }, AxiosError, { studentIdA: string; studentIdB: string }>(
      {
        mutationFn: ({ studentIdA, studentIdB }) => groupApi.swapMembers({ studentIdA, studentIdB }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [QueryKey.groups.list] });
          queryClient.invalidateQueries({ queryKey: [QueryKey.assignments.list] });
        },
      }
    );
  },
};
