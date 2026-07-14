// src/providers/AppQueryProvider.tsx
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { AxiosError } from 'axios';
import { ReactNode } from 'react';
import { configErr, configSuccess } from '../../constants/commonConst';
import { ErrorCode } from '../../constants/customError';
import { GeneralErrorType } from '../../types/GeneralType';

export default function AppQueryProvider({ children }: { children: ReactNode }) {
  // Lấy notification từ AntD thông qua App.useApp() — phải nằm trong <App> của antd
  const { notification } = App.useApp();

  // Tạo MutationCache dùng notification toàn cục
  const mutationCache = new MutationCache({
    onSuccess: () => {
      const defaultSuccessMess = configSuccess();
      notification.success(defaultSuccessMess);
    },
    onError: (error) => {
      const errData = (error as AxiosError<any>).response?.data;
      console.log('Global Mutation Error:', error, 'errData:', errData);

      const customErr = ErrorCode()[errData?.error_id as keyof typeof ErrorCode];
      
      let errMsg = '';
      if (customErr) {
        errMsg = customErr;
      } else if (errData && typeof errData === 'object' && typeof errData.message === 'string') {
        errMsg = errData.message;
      } else if (typeof errData === 'string') {
        errMsg = errData;
      } else if (error.message) {
        errMsg = error.message;
      } else {
        const configMsg = configErr();
        errMsg = (configMsg && typeof configMsg.message === 'string') ? configMsg.message : 'Đã có lỗi xảy ra';
      }

      notification.error({
        message: errMsg,
        duration: 6,
      });
    },
  });

  // Tạo QueryClient với defaultOptions và caches đã định nghĩa
  const queryClient = new QueryClient({
    // queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60,   // cache 60 phút
        retry: 2,
        refetchOnWindowFocus: true,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
