import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryKey } from '../constants/queryKey';
import { classApi } from '../api/classApi';

export const classHooks = {
  useFetchListClasses: (params?: { periodId?: string }) => useQuery({ queryKey: [QueryKey.classes.list, params], queryFn: () => classApi.getListClass(params) }),

  useFetchDetailClass: (id: string, enabled: boolean = true) => useQuery({ queryKey: [QueryKey.classes.detail, id], enabled: !!id && enabled, queryFn: () => classApi.getClassDetail(id) }),

  useCreateClass: () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: classApi.createClass, onSuccess: () => qc.invalidateQueries({ queryKey: [QueryKey.classes.list] }) });
  },

  useUpdateClass: () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: classApi.updateClass, onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: [QueryKey.classes.list] }); if (v?.id) qc.invalidateQueries({ queryKey: [QueryKey.classes.detail, v.id] }); } });
  },

  useDeleteClass: () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: classApi.deleteClass, onSuccess: () => qc.invalidateQueries({ queryKey: [QueryKey.classes.list] }) });
  },
  useFetchClassMetadata: () => useQuery({ queryKey: [QueryKey.classes.list, 'metadata'], queryFn: () => classApi.getClassMetadata() }),
};
