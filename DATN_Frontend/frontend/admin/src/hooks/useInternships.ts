import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKey } from '../constants/queryKey';
import { internshipApi } from '../api/internshipApi';
import type { BaseListParams } from '@shared/types/GeneralType';
import type { IConfirmationRequest, ICreateConfirmationRequest, ICreateNoCompanyStudent, INoCompanyStudent, IUpdateConfirmationRequest, IUpdateNoCompanyStudent } from '../type/InternshipType';

export const internshipHooks = {
  useFetchListConfirmationRequests: (params?: { periodId?: string }) => {
    return useQuery({
      queryKey: [QueryKey.internships.confirmations.list, params],
      queryFn: () => internshipApi.getListConfirmationRequest(params),
    });
  },

  useFetchDetailConfirmationRequest: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.internships.confirmations.detail, id],
      enabled: !!id && enabled,
      queryFn: () => internshipApi.getConfirmationRequestDetail(id),
    });
  },

  useCreateConfirmationRequest: () => {
    const queryClient = useQueryClient();
    return useMutation<IConfirmationRequest, AxiosError, { body: ICreateConfirmationRequest; params: BaseListParams }>({
      mutationFn: internshipApi.createConfirmationRequest,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.internships.confirmations.list] });
      },
    });
  },

  useUpdateConfirmationRequest: () => {
    const queryClient = useQueryClient();
    return useMutation<IConfirmationRequest | undefined, AxiosError, { id: string; body: IUpdateConfirmationRequest; index: number; params: BaseListParams }>({
      mutationFn: internshipApi.updateConfirmationRequest,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.internships.confirmations.list] });
        if (variables?.id) {
          queryClient.invalidateQueries({ queryKey: [QueryKey.internships.confirmations.detail, variables.id] });
        }
      },
    });
  },

  useDeleteConfirmationRequest: () => {
    const queryClient = useQueryClient();
    return useMutation<unknown, AxiosError, { id: string; params: BaseListParams }>({
      mutationFn: internshipApi.deleteConfirmationRequest,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.internships.confirmations.list] });
      },
    });
  },

  useFetchListNoCompanyStudents: (params?: { periodId?: string }) => {
    return useQuery({
      queryKey: [QueryKey.internships.noCompany.list, params],
      queryFn: () => internshipApi.getListNoCompanyStudent(params),
    });
  },


  useFetchDetailNoCompanyStudent: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.internships.noCompany.detail, id],
      enabled: !!id && enabled,
      queryFn: () => internshipApi.getNoCompanyStudentDetail(id),
    });
  },

  useCreateNoCompanyStudent: () => {
    const queryClient = useQueryClient();
    return useMutation<INoCompanyStudent, AxiosError, { body: ICreateNoCompanyStudent; params: BaseListParams }>({
      mutationFn: internshipApi.createNoCompanyStudent,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.internships.noCompany.list] });
      },
    });
  },

  useUpdateNoCompanyStudent: () => {
    const queryClient = useQueryClient();
    return useMutation<INoCompanyStudent | undefined, AxiosError, { id: string; body: IUpdateNoCompanyStudent; index: number; params: BaseListParams }>({
      mutationFn: internshipApi.updateNoCompanyStudent,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.internships.noCompany.list] });
        if (variables?.id) {
          queryClient.invalidateQueries({ queryKey: [QueryKey.internships.noCompany.detail, variables.id] });
        }
      },
    });
  },

  useDeleteNoCompanyStudent: () => {
    const queryClient = useQueryClient();
    return useMutation<unknown, AxiosError, { id: string; params: BaseListParams }>({
      mutationFn: internshipApi.deleteNoCompanyStudent,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.internships.noCompany.list] });
      },
    });
  },
};
