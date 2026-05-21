// ===== Achievement Hooks =====
// Cùng convention với useUsers.ts:
//   - Hooks không chứa message.success
//   - useUpdateAchievement dùng setQueryData (optimistic) thay invalidateQueries

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { achievementApi } from '../api/achievementApi';
import { QueryKey } from '../constants/queryKey';
import {
  BaseListParams,
  ListResponseTypeObject,
} from '@shared/types/GeneralType';
import {
  ICreateAchievement,
  IDetailAchievement,
  IListAchievement,
  IUpdateAchievement,
} from '../type/AchievementType';

export const achievementHooks = {
  /** Lấy danh sách danh hiệu — dùng cho table và SearchSelect */
  useFetchListAchievements: (params: BaseListParams) => {
    return useQuery({
      queryKey: [QueryKey.achievements.list, params],
      queryFn: () => achievementApi.getListAchievements(params),
    });
  },

  /** Lấy chi tiết 1 danh hiệu — dùng cho modal edit/detail */
  useFetchDetailAchievement: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.achievements.detail, id],
      enabled: !!id && enabled,
      queryFn: () => achievementApi.getAchievementDetail(id),
    });
  },

  /** Tạo danh hiệu mới — invalidate list để refetch */
  useCreateAchievement: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailAchievement,
      AxiosError,
      { body: ICreateAchievement; params: BaseListParams }
    >({
      mutationFn: achievementApi.createAchievement,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QueryKey.achievements.list],
        });
      },
    });
  },

  /**
   * Cập nhật danh hiệu.
   * setQueryData: cập nhật đúng 1 row trong cache theo index
   * → không gọi lại API list, UI phản hồi ngay
   */
  useUpdateAchievement: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailAchievement,
      AxiosError,
      {
        id: string;
        body: IUpdateAchievement;
        index: number;
        params: BaseListParams;
      }
    >({
      mutationFn: achievementApi.updateAchievement,
      onSuccess: (updated, { index, params }) => {
        queryClient.setQueryData<ListResponseTypeObject<IListAchievement>>(
          [QueryKey.achievements.list, params],
          (old) => {
            if (!old?.rows?.[index]) return old;
            const rows = [...old.rows];
            rows[index] = { ...rows[index], ...updated } as IListAchievement;
            return { ...old, rows };
          }
        );
      },
    });
  },

  /** Xóa danh hiệu — invalidate để refetch list */
  useDeleteAchievement: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailAchievement,
      AxiosError,
      { id: string; params: BaseListParams }
    >({
      mutationFn: achievementApi.deleteAchievement,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QueryKey.achievements.list],
        });
      },
    });
  },
};
