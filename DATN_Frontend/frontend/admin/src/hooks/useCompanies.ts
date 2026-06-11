import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKey } from '../constants/queryKey';
import { companyApi } from '../api/companyApi';
import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateCompany, IDetailCompany, IUpdateCompany } from '../type/CompanyType';

export const companyHooks = {
  useFetchListCompanies: () => {
    return useQuery({
      queryKey: [QueryKey.companies.list],
      queryFn: () => companyApi.getListCompany(),
    });
  },

  useFetchDetailCompany: (id: string, enabled: boolean = true) => {
    return useQuery<IDetailCompany, Error>({
      queryKey: [QueryKey.companies.detail, id],
      enabled: !!id && enabled,
      queryFn: () => companyApi.getCompanyDetail(id),
    });
  },

  useCreateCompany: () => {
    const queryClient = useQueryClient();
    return useMutation<IDetailCompany, AxiosError, { body: ICreateCompany; params: BaseListParams }>({
      mutationFn: companyApi.createCompany,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.companies.list] });
      },
    });
  },

  useUpdateCompany: () => {
    const queryClient = useQueryClient();
    return useMutation<IDetailCompany, AxiosError, { id: string; body: IUpdateCompany; index: number; params: BaseListParams }>({
      mutationFn: companyApi.updateCompany,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.companies.list] });
        if (variables?.id) {
          queryClient.invalidateQueries({ queryKey: [QueryKey.companies.detail, variables.id] });
        }
      },
    });
  },

  useDeleteCompany: () => {
    const queryClient = useQueryClient();
    return useMutation<unknown, AxiosError, { id: string; params: BaseListParams }>({
      mutationFn: companyApi.deleteCompany,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.companies.list] });
      },
    });
  },
};
