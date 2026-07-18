import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { councilApi, CouncilRow, CouncilTopicInput } from '../api/councilApi';

export const councilHooks = {
  useFetchListCouncils: () => {
    return useQuery<CouncilRow[], Error>({
      queryKey: ['councilsList'],
      queryFn: councilApi.getListCouncil,
    });
  },

  useFetchDetailCouncil: (id: string, enabled: boolean = true) => {
    return useQuery<CouncilRow, Error>({
      queryKey: ['councilDetail', id],
      enabled: !!id && enabled,
      queryFn: () => councilApi.getCouncilDetail(id),
    });
  },

  useCreateCouncil: () => {
    const queryClient = useQueryClient();
    return useMutation<CouncilRow, AxiosError, { title: string; room: string; date?: string; time?: string; members?: string[]; topics?: CouncilTopicInput[] }>({
      mutationFn: councilApi.createCouncil,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['councilsList'] });
      },
    });
  },

  useUpdateCouncil: () => {
    const queryClient = useQueryClient();
    return useMutation<CouncilRow, AxiosError, { id: string; body: { title?: string; room?: string; date?: string; time?: string; members?: string[]; topics?: CouncilTopicInput[]; status?: string } }>({
      mutationFn: councilApi.updateCouncil,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['councilsList'] });
      },
    });
  },

  useDeleteCouncil: () => {
    const queryClient = useQueryClient();
    return useMutation<unknown, AxiosError, string>({
      mutationFn: councilApi.deleteCouncil,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['councilsList'] });
      },
    });
  },

  usePublishAllCouncils: () => {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean; message: string; results?: { publishedCount: number } }, AxiosError, string | undefined>({
      mutationFn: (periodId) => councilApi.publishAllCouncils(periodId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['councilsList'] });
      },
    });
  },
};
