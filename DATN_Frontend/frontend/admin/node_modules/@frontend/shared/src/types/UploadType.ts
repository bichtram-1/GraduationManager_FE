export type UploadType =
  | 'users'
  | 'contents'
  | 'resources'
  | 'products'
  | 'noties'
  | 'subscriptions'
  | ""; // xoá string rỗng sau khi đã sửa xong các chỗ sử dụng UploadType

export interface UploadProps {
  type: UploadType;
  files: File[];
}

export interface FileUploadData {
  cloudFrontUrl: string;
  s3Url: string;
  mimetype: string;
  key: string
  originalName: string
  size: number
}
