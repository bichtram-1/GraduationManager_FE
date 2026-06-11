import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKey } from '../constants/queryKey';
import { periodApi, IPeriodListParams } from '../api/periodApi';
import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreatePeriod, IDetailPeriod, IUpdatePeriod } from '../type/PeriodType';

export const periodHooks = {
  useFetchListPeriods: (params: IPeriodListParams) => {
    return useQuery({
      queryKey: [QueryKey.periods.list, params],
      queryFn: () => periodApi.getListPeriod(params),
    });
  },

  useFetchDetailPeriod: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.periods.detail, id],
      enabled: !!id && enabled,
      queryFn: () => periodApi.getPeriodDetail(id),
    });
  },

  useCreatePeriod: () => {
    const queryClient = useQueryClient();
    return useMutation<IDetailPeriod, AxiosError, { body: ICreatePeriod; params: BaseListParams }>({
      mutationFn: periodApi.createPeriod,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.periods.list] });
      },
    });
  },

  useUpdatePeriod: () => {
    const queryClient = useQueryClient();
    return useMutation<IDetailPeriod, AxiosError, { id: string; body: IUpdatePeriod; index: number; params: BaseListParams }>({
      mutationFn: periodApi.updatePeriod,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.periods.list] });
      },
    });
  },

  useDeletePeriod: () => {
    const queryClient = useQueryClient();
    return useMutation<unknown, AxiosError, { id: string; params: BaseListParams }>({
      mutationFn: periodApi.deletePeriod,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.periods.list] });
      },
    });
  },
};
