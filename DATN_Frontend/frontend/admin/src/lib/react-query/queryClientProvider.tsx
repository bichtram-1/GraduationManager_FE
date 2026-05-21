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
      const errData = (error as AxiosError<GeneralErrorType>).response?.data;
      const customErr = ErrorCode()[errData?.error_id as keyof typeof ErrorCode];
      if (customErr) {
        notification.error({
          message: customErr,
        });
      }
      else {
        const msgError = configErr();
        notification.error(msgError);
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
