import axios, { AxiosRequestConfig } from 'axios';

export const fetcher = async <T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const res = await axios.request<T>({ url, ...config });
  return res.data;
};

export default fetcher;
