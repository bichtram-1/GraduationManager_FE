// src/providers/AppQueryProvider.tsx
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { AxiosError } from 'axios';
import { ReactNode } from 'react';
import { configErr, configSuccess } from '@shared/constants/commonConst';
import { ErrorCode } from '../../constants/customError';
import { GeneralErrorType } from '@shared/types/GeneralType';

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
      const customErr = ErrorCode()[errData?.error_id as keyof typeof ErrorCode];
      
      const configMsg = configErr();
      const defaultErrTitle = (configMsg && typeof configMsg.message === 'string')
        ? configMsg.message
        : 'Đã có lỗi xảy ra';

      let detailMsg = '';
      if (customErr) {
        detailMsg = customErr;
      } else if (errData && typeof errData === 'object') {
        if (typeof errData.message === 'string') {
          detailMsg = errData.message;
        } else if (typeof errData.error === 'string') {
          detailMsg = errData.error;
        } else if (errData.message && typeof errData.message === 'object') {
          detailMsg = JSON.stringify(errData.message);
        } else {
          detailMsg = JSON.stringify(errData);
        }
      } else if (typeof errData === 'string') {
        detailMsg = errData;
      } else if (error.message) {
        detailMsg = error.message;
      }

      if (detailMsg) {
        notification.error({
          message: defaultErrTitle,
          description: detailMsg,
          duration: 6,
        });
      } else {
        notification.error({
          message: defaultErrTitle,
          duration: 6,
        });
      }
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
