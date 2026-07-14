import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { FileUploadData, UploadProps } from '@shared/types/UploadType';
import { useGlobalVariable } from './GlobalVariableProvider';
import { uploadApi } from '../api/uploadApi';
import { configErr, configSuccess } from '@shared/constants/commonConst';

export const useUpload = () => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const { loadingUpload, setLoadingUpload } = useGlobalVariable();

  return useMutation<
    { data?: FileUploadData },
    Error,
    {
      params: UploadProps;
      key: string;
      type: 'add' | 'replace';
      index?: number;
    }
  >({
    mutationFn: (variables) =>
      uploadApi.upload(variables.params) as Promise<{ data?: FileUploadData }>,
    onMutate: async (variables) => {
      const { key } = variables;
      if (loadingUpload) {
        setLoadingUpload({ ...loadingUpload, [key]: true });
      }
    },
    onSuccess: (
      res,
      variables
    ) => {
      const { key, type, index } = variables;
      queryClient.setQueryData(
        [key],
        (_oldData: FileUploadData[] | undefined) => {
          const currentData =
            (queryClient.getQueryData([key]) as FileUploadData[]) ?? [];
          const newValue: FileUploadData[] = res?.data ? [res.data] : [];
          if (type === 'add') {
            currentData[index ?? 0] = newValue?.[0];
            return currentData;
          } else {
            return newValue;
          }
        }
      );
      if (loadingUpload) {
        setLoadingUpload({ ...loadingUpload, [key]: false });
      }
      notification.success(configSuccess());
    },
    onError: (_, variables) => {
      const { key } = variables;
      if (loadingUpload) {
        setLoadingUpload({ ...loadingUpload, [key]: false });
      }
      notification.error(configErr());
    },
  });
};
