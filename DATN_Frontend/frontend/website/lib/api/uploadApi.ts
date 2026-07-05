import axiosInstance from '../axios/axios-config';

interface FileUploadData {
  cloudFrontUrl: string;
  s3Url: string;
  mimetype: string;
  key: string;
  originalName: string;
  size: number;
}

export const uploadApi = {
  uploadFile: async (file: File): Promise<FileUploadData> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/private/v1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response?.data;
  }
};
