import { useQuery } from '@tanstack/react-query';
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
};
