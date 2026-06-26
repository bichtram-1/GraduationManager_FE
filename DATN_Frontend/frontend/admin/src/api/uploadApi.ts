import { FileUploadData, UploadProps } from '@shared/types/UploadType';
import axiosInstance from './axiosInstance';

export const uploadApi = {
  upload(data: UploadProps): Promise<unknown> {
    const formData = new FormData();
    if (data?.files) {
      data.files.map((item) => {
        formData.append('file', item);
      });
    }

    return axiosInstance.post('/v1/file-upload/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadSingleAndGetUrl: async (file: File, type: UploadProps['type'] = 'contents'): Promise<string> => {
    const response = await uploadApi.upload({ type, files: [file] });
    return (response as { data?: FileUploadData })?.data?.cloudFrontUrl ?? '';
  },
};
