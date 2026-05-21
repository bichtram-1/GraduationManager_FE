import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { codeApi } from '../api/codeApi';
import { QueryKey } from '../constants/queryKey';
import { BaseListParams } from '@shared/types/GeneralType';
import { ICreateCode, IDetailCode, IListCode } from '../type/CodeType';
import { message } from 'antd';

export const codeHooks = {
  useFetchListCodes: (params: BaseListParams) => {
    return useQuery({
      queryKey: [QueryKey.codes.list, params],
      queryFn: () => codeApi.getListCode(params),
    });
  },

  useFetchDetailCode: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.codes.detail, id],
      enabled: !!id && enabled,
      queryFn: () => codeApi.getCodeDetail(id),
    });
  },

  useCreateCode: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailCode,
      AxiosError,
      { body: ICreateCode; params: BaseListParams }
    >({
      mutationFn: codeApi.createCode,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.codes.list] });
        message.success('Code created successfully');
      },
    });
  },

  useDeleteCode: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IListCode,
      AxiosError,
      { id: string; params: BaseListParams }
    >({
      mutationFn: codeApi.deleteCode,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.codes.list] });
        message.success('Code deleted successfully');
      },
    });
  },
};
