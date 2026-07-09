import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKey } from '../constants/queryKey';
import { topicApi, ITopicListParams } from '../api/topicApi';
import type { ICreateTopic, IDetailTopic, IUpdateTopic } from '../type/TopicType';

export const topicHooks = {
  useFetchListTopics: (params: ITopicListParams) => {
    return useQuery({
      queryKey: [QueryKey.topics.list, params],
      queryFn: () => topicApi.getListTopic(params),
    });
  },

  useFetchDetailTopic: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.topics.detail, id],
      enabled: !!id && enabled,
      queryFn: () => topicApi.getTopicDetail(id),
    });
  },

  useCreateTopic: () => {
    const queryClient = useQueryClient();
    return useMutation<IDetailTopic, AxiosError, { body: ICreateTopic; params: ITopicListParams }>({
      mutationFn: topicApi.createTopic,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.topics.list] });
      },
    });
  },

  useUpdateTopic: () => {
    const queryClient = useQueryClient();
    return useMutation<IDetailTopic, AxiosError, { id: string; body: IUpdateTopic; index: number; params: ITopicListParams }>({
      mutationFn: topicApi.updateTopic,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.topics.list] });
      },
    });
  },

  useDeleteTopic: () => {
    const queryClient = useQueryClient();
    return useMutation<unknown, AxiosError, { id: string; params: ITopicListParams }>({
      mutationFn: topicApi.deleteTopic,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.topics.list] });
      },
    });
  },
};
