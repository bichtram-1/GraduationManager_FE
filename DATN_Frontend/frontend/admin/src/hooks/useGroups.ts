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
};
