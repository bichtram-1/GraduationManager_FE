import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKey } from '../constants/queryKey';
import { classApi } from '../api/classApi';
import type { BaseListParams } from '@shared/types/GeneralType';
import type { ICreateClass, IDetailClass, IUpdateClass } from '../type/ClassType';

export const classHooks = {
  useFetchListClasses: () => useQuery({ queryKey: [QueryKey.classes.list], queryFn: () => classApi.getListClass() }),

  useFetchDetailClass: (id: string, enabled: boolean = true) => useQuery({ queryKey: [QueryKey.classes.detail, id], enabled: !!id && enabled, queryFn: () => classApi.getClassDetail(id) }),

  useCreateClass: () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: classApi.createClass, onSuccess: () => qc.invalidateQueries({ queryKey: [QueryKey.classes.list] }) });
  },

  useUpdateClass: () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: classApi.updateClass, onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: [QueryKey.classes.list] }); if ((v as any)?.id) qc.invalidateQueries({ queryKey: [QueryKey.classes.detail, (v as any).id] }); } });
  },

  useDeleteClass: () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: classApi.deleteClass, onSuccess: () => qc.invalidateQueries({ queryKey: [QueryKey.classes.list] }) });
  },
};
