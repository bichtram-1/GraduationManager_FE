import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { scoreApi, IScoreListParams } from '../api/scoreApi';

export const scoreHooks = {
  useFetchListScores: (params: IScoreListParams) => {
    return useQuery({
      queryKey: ['scores', 'list', params],
      queryFn: () => scoreApi.getScoresList(params),
    });
  },

  useFetchDetailScore: (id: string, mode: 'internship' | 'project', enabled: boolean = true) => {
    return useQuery({
      queryKey: ['scores', 'detail', id, mode],
      enabled: !!id && enabled,
      queryFn: () => scoreApi.getScoreDetail(id, mode),
    });
  },

  useUpdateScore: () => {
    const queryClient = useQueryClient();
    return useMutation<
      any,
      AxiosError,
      {
        id: string;
        body: {
          mode: 'internship' | 'project';
          status?: string;
          finalScore?: number;
          defenseScore?: number;
          demoScore?: number;
          qaScore?: number;
          reportScore?: number;
          dot_id?: number;
        };
      }
    >({
      mutationFn: scoreApi.updateScore,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['scores'] });
      },
    });
  },
};
