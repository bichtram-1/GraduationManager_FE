// ===== User Hooks =====
// Tất cả React Query hooks liên quan đến User.
// Convention:
//   - useFetch* → useQuery (đọc data)
//   - useCreate/Update/Delete/Reset* → useMutation (ghi data)
//   - Hooks không chứa message.success/error — UI side effect thuộc về component

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { userApi } from '../api/userApi';
import { QueryKey } from '../constants/queryKey';
import {
  BaseListParams,
} from '@shared/types/GeneralType';
import {
  ICreateUser,
  IDetailUser,
  IUpdateUser,
} from 'src/type/UserType';

export const userHooks = {
  /** Lấy danh sách user (phân trang, filter) — dùng cho table */
  useFetchListUsers: (params: any) => {
    return useQuery({
      queryKey: [QueryKey.users.list, params],
      queryFn: () => userApi.getListUser(params),
    });
  },

  /** Lấy chi tiết 1 user — dùng cho modal edit/detail */
  useFetchDetailUser: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.users.detail, id],
      enabled: !!id && enabled, // chỉ fetch khi có id và được phép
      queryFn: () => userApi.getUserDetail(id),
    });
  },

  /** Tạo user mới — sau khi thành công invalidate list để refetch */
  useCreateUser: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailUser,
      AxiosError,
      { body: ICreateUser; params: BaseListParams }
    >({
      mutationFn: userApi.createUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.users.list] });
        queryClient.invalidateQueries({ queryKey: [QueryKey.classes.list] });
      },
    });
  },

  /**
   * Cập nhật user.
   * Dùng setQueryData (optimistic update) thay invalidateQueries:
   * → không gọi lại API list, cập nhật trực tiếp 1 row trong cache → UI mượt hơn
   */
  useUpdateUser: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailUser,
      AxiosError,
      { id: string; body: IUpdateUser; index: number; params: BaseListParams }
    >({
      mutationFn: userApi.updateUser,
      onSuccess: (updated, { id }) => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.users.list] });
        if (id) {
          queryClient.invalidateQueries({ queryKey: [QueryKey.users.detail, id] });
        }
        queryClient.invalidateQueries({ queryKey: [QueryKey.classes.list] });
      },
    });
  },

  /** Xóa user — invalidate để refetch list */
  useDeleteUser: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailUser,
      AxiosError,
      { id: string; params: BaseListParams }
    >({
      mutationFn: userApi.deleteUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.users.list] });
        queryClient.invalidateQueries({ queryKey: [QueryKey.classes.list] });
      },
    });
  },

  useFetchSpecializations: () => {
    return useQuery({
      queryKey: [QueryKey.users.list, 'specializations'],
      queryFn: () => userApi.getSpecializations(),
    });
  },

  useImportStudents: () => {
    const queryClient = useQueryClient();
    return useMutation<
      {
        success: boolean;
        message: string;
        imported_count?: number;
        errors?: string[];
      },
      AxiosError,
      FormData
    >({
      mutationFn: userApi.importStudents,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.users.list] });
        queryClient.invalidateQueries({ queryKey: [QueryKey.classes.list] });
      },
    });
  },
};
