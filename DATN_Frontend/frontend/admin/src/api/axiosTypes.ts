import type { InternalAxiosRequestConfig } from 'axios';

export type AxiosRequestConfigWithData = InternalAxiosRequestConfig & {
  data?: string | Record<string, unknown>;
};
