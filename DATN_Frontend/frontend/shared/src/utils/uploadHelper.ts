/**
 * Dựng FormData cho việc upload file lên endpoint chung `TaiLenController::upload`
 * (dùng chung giữa admin `/v1/file-upload/upload` và website `/private/v1/upload` —
 * cả 2 route đều trỏ về cùng 1 controller method ở backend).
 */
export function buildUploadFormData(files: File[]): FormData {
  const formData = new FormData();
  files.forEach((file) => formData.append('file', file));
  return formData;
}
