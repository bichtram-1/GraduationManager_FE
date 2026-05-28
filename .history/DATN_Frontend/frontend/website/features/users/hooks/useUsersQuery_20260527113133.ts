import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios/axios-config';
import { User } from '../types';

type BaseListParams = {
  page?: number;
  limit?: number;
  [key: string]: unknown;
};

type ListResponseTypeObject<T> = {
  total: number;
  rows: T[];
};

const fetchUsers = async (params: BaseListParams): Promise<ListResponseTypeObject<User>> => {
  const response = await axiosInstance.get('https://jsonplaceholder.typicode.com/users');
  const allUsers: User[] = response.data;

  // Simulate pagination
  const start = ((params.page || 1) - 1) * (params.limit || 10);
  const end = start + (params.limit || 10);
  const rows = allUsers.slice(start, end);

  return {
    total: allUsers.length,
    rows,
  };
};

export const useUsersQuery = (params: BaseListParams) => {
  return useQuery<ListResponseTypeObject<User>, Error>({
    queryKey: ['users', params],
    queryFn: () => fetchUsers(params),
  });
};
