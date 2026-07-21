import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKey } from '../constants/queryKey';
import { internshipApi } from '../api/internshipApi';
import type { BaseListParams } from '@shared/types/GeneralType';
import type { IConfirmationRequest, ICreateConfirmationRequest, ICreateNoCompanyStudent, INoCompanyStudent, IUpdateConfirmationRequest, IUpdateNoCompanyStudent } from '../type/InternshipType';
import { useGlobalVariable } from './GlobalVariableProvider';

export const internshipHooks = {
  useFetchListConfirmationRequests: (params?: { periodId?: string }) => {
    return useQuery({
      queryKey: [QueryKey.internships.confirmations.list, params],
      queryFn: () => internshipApi.getListConfirmationRequest(params),
    });
  },

  useFetchListDeclarations: (params?: { periodId?: string }) => {
    return useQuery({
      queryKey: [QueryKey.internships.declarations.list, params],
      queryFn: () => internshipApi.getListDeclarations(params),
    });
  },

  useFetchDetailDeclaration: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.internships.declarations.detail, id],
      enabled: !!id && enabled,
      queryFn: () => internshipApi.getDeclarationDetail(id),
    });
  },

  useCreateDeclaration: () => {
    const queryClient = useQueryClient();
    return useMutation<IConfirmationRequest, AxiosError, { body: ICreateConfirmationRequest; params: BaseListParams }>({
      mutationFn: internshipApi.createDeclaration,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.internships.declarations.list] });
        queryClient.invalidateQueries({ queryKey: [QueryKey.internships.noCompany.list] });
      },
    });
  },

  useUpdateDeclaration: () => {
    const queryClient = useQueryClient();
    return useMutation<IConfirmationRequest | undefined, AxiosError, { id: string; body: IUpdateConfirmationRequest; index: number; params: BaseListParams }>({
      mutationFn: internshipApi.updateDeclaration,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.internships.declarations.list] });
        queryClient.invalidateQueries({ queryKey: [QueryKey.internships.noCompany.list] });
        if (variables?.id) {
          queryClient.invalidateQueries({ queryKey: [QueryKey.internships.declarations.detail, variables.id] });
        }
      },
    });
  },

  useDeleteDeclaration: () => {
    const queryClient = useQueryClient();
    return useMutation<unknown, AxiosError, { id: string; params: BaseListParams }>({
      mutationFn: internshipApi.deleteDeclaration,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.internships.declarations.list] });
        queryClient.invalidateQueries({ queryKey: [QueryKey.internships.noCompany.list] });
      },
    });
  },

  useBatchApproveDeclarations: () => {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean; message: string; updatedCount: number }, AxiosError, { ids: string[] }>({
      mutationFn: ({ ids }) => internshipApi.batchApproveDeclarations(ids),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.internships.declarations.list] });
        queryClient.invalidateQueries({ queryKey: [QueryKey.internships.noCompany.list] });
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
    const { selectedPeriod } = useGlobalVariable();
    return useQuery({
      queryKey: [QueryKey.internships.noCompany.detail, id, selectedPeriod?.id],
      enabled: !!id && enabled,
      queryFn: () => internshipApi.getNoCompanyStudentDetail(id, selectedPeriod?.id),
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
